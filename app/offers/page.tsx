'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OfferList, Offer } from '../../components/offer-list'
import { Button } from '@/components/ui/button'
import { OfferForm } from '../../components/offer-form'

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  defaultPrice: number;
  priceType: 'FIXED' | 'HOURLY';
}

export default function OffersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const [customersData, servicesData] = await Promise.all([
        fetch('/api/customers').then(res => res.json()),
        fetch('/api/dienstleistungen').then(res => res.json())
      ])

      setCustomers(customersData)
      setServices(servicesData)
    }

    fetchData()
  }, [])

  const handleCreateOffer = () => {
    setEditingOffer(null)
    setIsDialogOpen(true)
  }

  const handleEditOffer = async (offer: Offer) => {
    setEditingOffer(offer)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    
    setIsDialogOpen(false)
    setEditingOffer(null)
    router.refresh()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Offers</h1>
        <Button onClick={handleCreateOffer}>Create New Offer</Button>
      </div>
      <OfferList onEditOffer={handleEditOffer} />
      {isDialogOpen && (
        <OfferForm
          customers={customers}
          services={services}
          initialData={editingOffer}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  )
}

