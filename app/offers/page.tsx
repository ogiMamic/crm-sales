'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateOfferDialog } from '@/components/CreateOfferDialog'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Customer = {
  id: string
  name: string
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

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    const response = await fetch('/api/offers')
    const data = await response.json()
    setOffers(data)
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
            lastOfferNumber={offers.length > 0 ? offers[offers.length - 1].number : 'A000'}
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
                    <Button variant="outline" size="sm">Bearbeiten</Button>
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