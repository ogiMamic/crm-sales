'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateOfferDialog } from '@/components/CreateOfferDialog'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function OffersPage() {
  const [offers, setOffers] = useState([
    { id: 1, number: 'A001', customer: '1', date: '2023-06-01', status: 'Gesendet', amount: 5000, product: 'Website erstellen' },
    { id: 2, number: 'A002', customer: '2', date: '2023-06-05', status: 'Angenommen', amount: 7500, product: 'App erstellen' },
    { id: 3, number: 'A003', customer: '3', date: '2023-06-10', status: 'Abgelehnt', amount: 3000, product: 'SEO Optimierung' },
  ])

  const [customers] = useState([
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'Beta Inc' },
    { id: '3', name: 'Gamma LLC' },
    { id: '4', name: 'Delta Co' },
    { id: '5', name: 'Epsilon GmbH' },
  ])

  const handleCreateOffer = (newOffer) => {
    setOffers([...offers, { ...newOffer, id: offers.length + 1 }])
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Entwurf':
        return <Badge variant="outline">Entwurf</Badge>
      case 'Gesendet':
        return <Badge variant="default">Gesendet</Badge>
      case 'Aufgenommen':
        return <Badge variant="secondary">Aufgenommen</Badge>
      case 'Angenommen':
        return <Badge variant="success">Angenommen</Badge>
      case 'Abgelehnt':
        return <Badge variant="destructive">Abgelehnt</Badge>
      case 'In Bearbeitung':
        return <Badge variant="warning">In Bearbeitung</Badge>
      case 'Abgeschlossen':
        return <Badge variant="info">Abgeschlossen</Badge>
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
            customers={customers} 
            lastOfferNumber={offers[offers.length - 1].number}
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
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.number}</TableCell>
                  <TableCell>{customers.find(c => c.id === offer.customer)?.name || offer.customer}</TableCell>
                  <TableCell>{offer.date}</TableCell>
                  <TableCell>{getStatusBadge(offer.status)}</TableCell>
                  <TableCell>{offer.product}</TableCell>
                  <TableCell className="text-right">{offer.amount.toFixed(2)} €</TableCell>
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