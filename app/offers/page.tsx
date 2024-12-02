'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateOfferDialog } from '@/components/CreateOfferDialog'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash, FileText } from 'lucide-react'
import { EditOfferDialog } from '@/components/EditOfferDialog'

type Customer = {
  id: string
  name: string
}

type Product = {
  id: string
  productName: string
  priceType: string
  amount: number
}

type Offer = {
  id: string
  number: string
  customerId: string
  customer: Customer
  date: string
  status: string
  amount: number
  product: string
  pricingType: string
}

type NewOffer = Omit<Offer, 'id' | 'customer'> & { customer: string }

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchOffers()
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchOffers = async () => {
    const response = await fetch('/api/offers')
    const data = await response.json()
    setOffers(data)
  }

  const fetchCustomers = async () => {
    const response = await fetch('/api/customers')
    const data = await response.json()
    setCustomers(data)
  }

  const fetchProducts = async () => {
    const response = await fetch('/api/products')
    const data = await response.json()
    setProducts(data)
  }

  const handleCreateOffer = async (newOffer: NewOffer) => {
    const response = await fetch('/api/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newOffer),
    })
    if (response.ok) {
      fetchOffers()
    }
  }

  const handleEditOffer = async (editedOffer: Offer) => {
    const response = await fetch(`/api/offers/${editedOffer.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedOffer),
    })
    if (response.ok) {
      fetchOffers()
    }
  }

  const handleDeleteOffer = async (offerId: string) => {
    const response = await fetch(`/api/offers/${offerId}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      fetchOffers()
    }
  }

  const handleGeneratePDF = (offerId: string) => {
    window.open(`/api/offers/${offerId}/pdf`, '_blank')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Entwurf':
        return <Badge variant="outline">Entwurf</Badge>
      case 'Gesendet':
        return <Badge variant="default">Gesendet</Badge>
      case 'Aufgenommen':
        return <Badge variant="secondary">Aufgenommen</Badge>
      case 'Angenommen':
        return <Badge variant="secondary">Angenommen</Badge>
      case 'Abgelehnt':
        return <Badge variant="destructive">Abgelehnt</Badge>
      case 'In Bearbeitung':
        return <Badge variant="outline">In Bearbeitung</Badge>
      case 'Abgeschlossen':
        return <Badge variant="secondary">Abgeschlossen</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Angebote</CardTitle>
          <CreateOfferDialog
            onCreateOffer={handleCreateOffer}
            lastOfferNumber={
              offers.length > 0
                ? offers.reduce((max, offer) => {
                  const currentNum = parseInt(offer.number.slice(1), 10); // Ekstrakcija numeričkog dela
                  const maxNum = parseInt(max.slice(1), 10);
                  return currentNum > maxNum ? offer.number : max;
                }, 'A000') // Početna vrednost je 'A000'
                : 'A000'
            }
          />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Verwalten Sie hier Ihre Angebote und deren Status.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nummer</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead>Preistyp</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.number}</TableCell>
                  <TableCell>{offer.customer.name}</TableCell>
                  <TableCell>{new Date(offer.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(offer.status)}</TableCell>
                  <TableCell>{offer.product}</TableCell>
                  <TableCell>{offer.pricingType === 'hourly' ? 'Pro Stunde' : 'Pauschal'}</TableCell>
                  <TableCell className="text-right">
                    {offer.amount.toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Aktionen öffnen</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EditOfferDialog
                          offer={offer}
                          onEditOffer={handleEditOffer}
                          customers={customers}
                          products={products}
                        />
                        <DropdownMenuItem onClick={() => handleDeleteOffer(offer.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Löschen</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGeneratePDF(offer.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>PDF generieren</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}