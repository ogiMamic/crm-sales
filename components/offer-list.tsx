'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Offer {
  id: string;
  number: string;
  customer: { name: string };
  customerId: string;
  date: string;
  status: string;
  totalAmount: number;
  services: Array<{
    serviceId: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxPercentage: number;
  discountPercentage: number | null;
}

interface OfferListProps {
  onEditOffer: (offer: Offer) => void;
}

export function OfferList({ onEditOffer }: OfferListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    const fetchOffers = async () => {
      const response = await fetch('/api/offers')
      const data = await response.json()
      setOffers(data)
    }

    fetchOffers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return
    
    setLoading(id)
    try {
      await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
      })
      setOffers(offers.filter(offer => offer.id !== id))
    } catch (error) {
      console.error('Error deleting offer:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((offer) => (
            <TableRow key={offer.id}>
              <TableCell>{offer.number}</TableCell>
              <TableCell>{offer.customer.name}</TableCell>
              <TableCell>{formatDate(new Date(offer.date))}</TableCell>
              <TableCell>{offer.status}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(offer.totalAmount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEditOffer(offer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    disabled={loading === offer.id}
                    onClick={() => handleDelete(offer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

