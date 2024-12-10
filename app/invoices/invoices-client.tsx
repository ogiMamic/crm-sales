"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EuroIcon } from 'lucide-react'
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Filter } from 'lucide-react'

type Invoice = {
  id: string
  number: string
  status: string
  issueDate: Date
  dueDate: Date
  paymentDate: Date | null
  totalAmount: number
  offer: {
    customer: {
      name: string
    }
  }
}

type InvoicesClientProps = {
  initialInvoices: Invoice[]
}

type TimeFilter = '7days' | '30days' | '90days' | 'all'

export default function InvoicesClient({ initialInvoices }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [visibleColumns, setVisibleColumns] = useState({
    number: true,
    client: true,
    amount: true,
    issueDate: true,
    dueDate: true,
    status: true,
    actions: true
  })

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.offer.customer.name.toLowerCase().includes(searchTerm.toLowerCase())

      const invoiceDate = new Date(invoice.issueDate)
      const now = new Date()
      const daysDifference = (now.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24)

      switch (timeFilter) {
        case '7days':
          return matchesSearch && daysDifference <= 7
        case '30days':
          return matchesSearch && daysDifference <= 30
        case '90days':
          return matchesSearch && daysDifference <= 90
        default:
          return matchesSearch
      }
    })
  }, [invoices, searchTerm, timeFilter])

  const totalUnpaid = useMemo(() => {
    return invoices
      .filter(inv => inv.status === "PENDING" || inv.status === "OVERDUE")
      .reduce((sum, inv) => sum + inv.totalAmount, 0)
  }, [invoices])

  const handlePaymentUpdate = async (id: string, paymentDate: Date) => {
    try {
      const response = await fetch("/api/invoices/update-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentDate: paymentDate.toISOString() })
      })

      if (response.ok) {
        setInvoices(invoices.map(inv => 
          inv.id === id ? { ...inv, status: "PAID", paymentDate: paymentDate } : inv
        ))
      } else {
        console.error("Failed to update invoice payment")
      }
    } catch (error) {
      console.error("Error updating invoice payment:", error)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Rechnungen</h1>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Rechnungsübersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold text-black">Bezahlte Rechnungen</h3>
                <p className="text-2xl text-black">{invoices.filter(i => i.status === "PAID").length}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="font-semibold text-black">Unbezahlte Rechnungen</h3>
                <p className="text-2xl text-black">{invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").length}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <EuroIcon className="h-5 w-5 text-black" />
                  <h3 className="font-semibold text-black">Gesamtbetrag unbezahlt</h3>
                </div>
                <p className="text-2xl text-black">{totalUnpaid.toLocaleString()}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechnungen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm text-black placeholder-gray-500 border-gray-300"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-[180px] text-black border-gray-300">
              <SelectValue placeholder="Nach Zeit filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days" className="text-black">Letzte 7 Tage</SelectItem>
              <SelectItem value="30days" className="text-black">Letzte 30 Tage</SelectItem>
              <SelectItem value="90days" className="text-black">Letzte 90 Tage</SelectItem>
              <SelectItem value="all" className="text-black">Alle Zeit</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="text-black border-gray-300">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel className="text-black">Spalten anzeigen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(visibleColumns).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setVisibleColumns(prev => ({ ...prev, [key]: checked }))
                  }
                  className="text-black"
                >
                  {key === 'number' && 'Rechnungsnummer'}
                  {key === 'client' && 'Kunde'}
                  {key === 'amount' && 'Betrag'}
                  {key === 'issueDate' && 'Ausstellungsdatum'}
                  {key === 'dueDate' && 'Fälligkeitsdatum'}
                  {key === 'status' && 'Status'}
                  {key === 'actions' && 'Aktionen'}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.number && <TableHead className="text-black">Rechnungsnummer</TableHead>}
            {visibleColumns.client && <TableHead className="text-black">Kunde</TableHead>}
            {visibleColumns.amount && <TableHead className="text-black">Betrag</TableHead>}
            {visibleColumns.issueDate && <TableHead className="text-black">Ausstellungsdatum</TableHead>}
            {visibleColumns.dueDate && <TableHead className="text-black">Fälligkeitsdatum</TableHead>}
            {visibleColumns.status && <TableHead className="text-black">Status</TableHead>}
            {visibleColumns.actions && <TableHead className="text-black">Aktionen</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              {visibleColumns.number && <TableCell className="text-black">{invoice.number}</TableCell>}
              {visibleColumns.client && <TableCell className="text-black">{invoice.offer.customer.name}</TableCell>}
              {visibleColumns.amount && <TableCell className="text-black">{invoice.totalAmount.toLocaleString()}€</TableCell>}
              {visibleColumns.issueDate && <TableCell className="text-black">{invoice.issueDate.toLocaleDateString()}</TableCell>}
              {visibleColumns.dueDate && <TableCell className="text-black">{invoice.dueDate.toLocaleDateString()}</TableCell>}
              {visibleColumns.status && (
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    invoice.status === "PAID" ? "bg-green-100 text-green-800" :
                    invoice.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {invoice.status === "PAID" ? "BEZAHLT" :
                     invoice.status === "PENDING" ? "AUSSTEHEND" :
                     "ÜBERFÄLLIG"}
                  </span>
                </TableCell>
              )}
              {visibleColumns.actions && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/racuni/${invoice.id}`}>
                      <Button variant="outline" size="sm" className="text-black">Details</Button>
                    </Link>
                    {invoice.status !== "PAID" && (
                      <DatePicker onSelect={(date) => date && handlePaymentUpdate(invoice.id, date)} />
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

