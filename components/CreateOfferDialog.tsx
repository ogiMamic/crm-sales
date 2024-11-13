'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ManageProductsDialog } from './ManageProductsDialog'
import { Settings } from 'lucide-react'

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

type NewOffer = {
  number: string
  customerId: string
  customer: string
  date: string
  status: string
  amount: number
  product: string
  productName: string
  pricingType: string
}

type CreateOfferDialogProps = {
  onCreateOffer: (offer: NewOffer) => Promise<void>
  lastOfferNumber: string
}

export function CreateOfferDialog({ onCreateOffer, lastOfferNumber }: CreateOfferDialogProps) {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [offer, setOffer] = useState<NewOffer>({
    number: '',
    customerId: '',
    customer: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Entwurf',
    amount: 0,
    product: '',
    productName: '',
    pricingType: 'fixed'
  })

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  useEffect(() => {
    const lastNumber = parseInt(lastOfferNumber.slice(1))
    const nextNumber = `A${String(lastNumber + 1).padStart(3, '0')}`
    setOffer(prev => ({ ...prev, number: nextNumber }))
  }, [lastOfferNumber])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCreateOffer(offer)
    setOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setOffer(prev => ({ ...prev, [name]: value }))
  }

  const handleCustomerChange = (value: string) => {
    const selectedCustomer = customers.find(c => c.id === value)
    setOffer(prev => ({
      ...prev,
      customerId: value,
      customer: selectedCustomer ? selectedCustomer.name : ''
    }))
  }

  const handleProductChange = (value: string) => {
    const selectedProduct = products.find(p => p.id === value)
    if (selectedProduct) {
      setOffer(prev => ({
        ...prev,
        product: selectedProduct.id,
        productName: selectedProduct.productName,
        pricingType: selectedProduct.priceType,
        amount: selectedProduct.amount
      }))
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Neues Angebot</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Neues Angebot erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="number">Angebotsnummer</Label>
            <Input id="number" name="number" value={offer.number} readOnly />
          </div>
          <div>
            <Label htmlFor="customerId">Kunde</Label>
            <Select name="customerId" value={offer.customerId} onValueChange={handleCustomerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie einen Kunden" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Datum</Label>
            <Input id="date" name="date" type="date" value={offer.date} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" value={offer.status} onValueChange={(value) => setOffer(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie einen Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entwurf">Entwurf</SelectItem>
                <SelectItem value="Gesendet">Gesendet</SelectItem>
                <SelectItem value="Angenommen">Angenommen</SelectItem>
                <SelectItem value="Abgelehnt">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Label htmlFor="product">Produkt</Label>
            <div className="flex items-center">
              <div className="flex-grow">
                <Select name="product" value={offer.product} onValueChange={handleProductChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {offer.productName || "Wählen Sie ein Produkt"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>{product.productName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ManageProductsDialog onProductsChanged={fetchProducts}>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Produkte verwalten</span>
                </Button>
              </ManageProductsDialog>
            </div>
          </div>
          <div>
            <Label htmlFor="pricingType">Preistyp</Label>
            <Input id="pricingType" name="pricingType" value={offer.pricingType === 'fixed' ? 'Pauschal' : 'Pro Stunde'} readOnly />
          </div>
          <div>
            <Label htmlFor="amount">Betrag</Label>
            <Input id="amount" name="amount" type="number" value={offer.amount} onChange={handleChange} required />
          </div>
          <Button type="submit">Angebot erstellen</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}