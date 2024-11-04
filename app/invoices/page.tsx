'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EuroIcon } from "lucide-react"
import { createUser } from '@/lib/test'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([
    { id: 1, number: "INV-2024-001", client: "ABC Corp", amount: 1500, status: "Plaćeno", dueDate: "2024-02-15" },
    { id: 2, number: "INV-2024-002", client: "XYZ Inc", amount: 2500, status: "Neplaćeno", dueDate: "2024-02-28" },
    { id: 3, number: "INV-2024-003", client: "123 Ltd", amount: 3500, status: "Kasni", dueDate: "2024-01-31" },
  ])
  const [searchTerm, setSearchTerm] = useState("")

  const handleCreateUser = async () => {
    for (let i = 0; i < 10000; i++) {

      try {

        const result = await createUser()

        if (result.success) {
          console.log('User created successfully')
        } else {
          console.log(result.error)
        }
      } catch (error) {
        console.error('Failed to create user', error)
      }
    }
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalUnpaid = invoices
    .filter(inv => inv.status === "Neplaćeno" || inv.status === "Kasni")
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Računi</h1>
        <Button onClick={handleCreateUser}>Novi Račun</Button>
      </div>

      {/* Rest of your component remains the same */}
      <div className="mb-4">
        <Input
          placeholder="Pretraži račune..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pregled Računa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold">Plaćeni Računi</h3>
                <p className="text-2xl">{invoices.filter(i => i.status === "Plaćeno").length}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="font-semibold">Neplaćeni Računi</h3>
                <p className="text-2xl">{invoices.filter(i => i.status === "Neplaćeno").length}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <EuroIcon className="h-5 w-5" />
                  <h3 className="font-semibold">Ukupno Neplaćeno</h3>
                </div>
                <p className="text-2xl">{totalUnpaid.toLocaleString()}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Broj Računa</TableHead>
            <TableHead>Klijent</TableHead>
            <TableHead>Iznos</TableHead>
            <TableHead>Rok Plaćanja</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Akcije</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.number}</TableCell>
              <TableCell>{invoice.client}</TableCell>
              <TableCell>{invoice.amount.toLocaleString()}€</TableCell>
              <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${invoice.status === "Plaćeno" ? "bg-green-100 text-green-800" :
                    invoice.status === "Neplaćeno" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                  }`}>
                  {invoice.status}
                </span>
              </TableCell>
              <TableCell>
                <Link href={`/racuni/${invoice.id}`}>
                  <Button variant="outline" size="sm">Detalji</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}