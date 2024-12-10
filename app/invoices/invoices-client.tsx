"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EuroIcon, MoreHorizontal } from 'lucide-react'
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Filter } from 'lucide-react'
import { InvoiceDetailsDialog } from './invoice-details-dialog'

export type Invoice = {
  id: string
  number: string
  status: string
  issueDate: Date
  dueDate: Date
  paymentDate: Date | null
  subtotalAmount: number
  taxPercentage: number
  taxAmount: number
  discountAmount: number | null
  totalAmount: number
  notes: string | null
  offer: {
    customer: {
      id: string
      createdAt: Date
      updatedAt: Date
      name: string
      address: string
      email: string
      phone: string | null
      company: string | null
      userId: string
    }
    offerServices?: Array<{
      id: string
      quantity: number
      unitPrice: number
      service: {
        name: string
      }
    }>
  }
}

type InvoicesClientProps = {
  initialInvoices: Invoice[]
}

type TimeFilter = '7days' | '30days' | '90days' | 'all'

export default function InvoicesClient({ initialInvoices }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch('/api/invoices')
        if (!response.ok) {
          throw new Error('Failed to fetch invoices')
        }
        const data = await response.json()
        setInvoices(data)
      } catch (error) {
        console.error('Error fetching invoices:', error)
      }
    }

    fetchInvoices()
  }, [])

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.offer.customer.name.toLowerCase().includes(searchTerm.toLowerCase())

      const invoiceDate = new Date(invoice.issueDate)
      const now = new Date()
      const daysDifference = (now.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24)

      const matchesTimeFilter = 
        timeFilter === 'all' ? true :
        timeFilter === '7days' ? daysDifference <= 7 :
        timeFilter === '30days' ? daysDifference <= 30 :
        timeFilter === '90days' ? daysDifference <= 90 : true;

      const matchesStatusFilter = 
        statusFilter === 'all' ? true :
        invoice.status === statusFilter;

      return matchesSearch && matchesTimeFilter && matchesStatusFilter;
    })
  }, [invoices, searchTerm, timeFilter, statusFilter])

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

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Rechnung löschen möchten?')) {
      try {
        const response = await fetch(`/api/invoices/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setInvoices(invoices.filter(inv => inv.id !== id));
        } else {
          console.error('Fehler beim Löschen der Rechnung');
        }
      } catch (error) {
        console.error('Fehler beim Löschen der Rechnung:', error);
      }
    }
  };

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
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px] text-black border-gray-300">
              <SelectValue placeholder="Nach Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-black">Alle Status</SelectItem>
              <SelectItem value="PAID" className="text-black">Bezahlt</SelectItem>
              <SelectItem value="PENDING" className="text-black">Ausstehend</SelectItem>
              <SelectItem value="OVERDUE" className="text-black">Überfällig</SelectItem>
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
              {visibleColumns.issueDate && <TableCell className="text-black">{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>}
              {visibleColumns.dueDate && <TableCell className="text-black">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-black" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                        Details
                      </DropdownMenuItem>
                      {invoice.status !== "PAID" && (
                        <DropdownMenuItem onClick={() => handlePaymentUpdate(invoice.id, new Date())}>
                          Bezahlen
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id)}>
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedInvoice && (
        <InvoiceDetailsDialog
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}

