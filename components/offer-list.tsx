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
import { FileSignature, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ConfirmationDialog } from './ConfirmationDialog'

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
  newOffer: Offer | null;
}

export function OfferList({ onEditOffer, newOffer }: OfferListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchOffers = async () => {
      const response = await fetch('/api/offers')
      const data = await response.json()
      setOffers(data)
    }

    fetchOffers()
  }, [])

  useEffect(() => {
    if (newOffer) {
      setOffers(prevOffers => [newOffer, ...prevOffers.filter(offer => offer.id !== newOffer.id)])
    }
  }, [newOffer])

  const handleDeleteClick = (id: string) => {
    setOfferToDelete(id)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return
    
    setLoading(offerToDelete)
    try {
      await fetch(`/api/offers/${offerToDelete}`, {
        method: 'DELETE',
      })
      setOffers(offers.filter(offer => offer.id !== offerToDelete))
    } catch (error) {
      console.error('Error deleting offer:', error)
    } finally {
      setLoading(null)
      setOfferToDelete(null)
      setIsConfirmOpen(false)
    }
  }

  return (
    <>
      <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-700">
              <TableHead className="text-gray-900 dark:text-gray-100">Number</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Customer</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100 text-right">Total Amount</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="text-gray-900 dark:text-gray-100">{offer.number}</TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100">{offer.customer.name}</TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100">{formatDate(new Date(offer.date))}</TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100">{offer.status}</TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100 text-right">
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
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                      <FileSignature className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      disabled={loading === offer.id}
                      onClick={() => handleDeleteClick(offer.id)}
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
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Offer"
        description="Are you sure you want to delete this offer? This action cannot be undone."
      />
    </>
  )
}

