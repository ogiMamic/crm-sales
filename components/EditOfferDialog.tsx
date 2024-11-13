'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Settings } from 'lucide-react'
import { ManageProductsDialog } from './ManageProductsDialog'

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

type EditOfferDialogProps = {
    offer: Offer
    onEditOffer: (editedOffer: Offer) => Promise<void>
    customers: Customer[]
    products: Product[]
}

export function EditOfferDialog({ offer, onEditOffer, customers, products }: EditOfferDialogProps) {
    const [open, setOpen] = useState(false)
    const [editedOffer, setEditedOffer] = useState<Offer>(offer)

    useEffect(() => {
        if (open) {
            setEditedOffer(offer)
        }
    }, [open, offer])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onEditOffer(editedOffer)
        setOpen(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setEditedOffer(prev => ({ ...prev, [name]: value }))
    }

    const handleCustomerChange = (value: string) => {
        const selectedCustomer = customers.find(c => c.id === value)
        setEditedOffer(prev => ({
            ...prev,
            customerId: value,
            customer: selectedCustomer || prev.customer
        }))
    }

    const handleProductChange = (value: string) => {
        const selectedProduct = products.find(p => p.id === value)
        if (selectedProduct) {
            setEditedOffer(prev => ({
                ...prev,
                product: selectedProduct.productName,
                pricingType: selectedProduct.priceType,
                amount: selectedProduct.amount
            }))
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products')
            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            const data = await response.json()
            // You might want to update the products state here
            // or pass this data to a parent component
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Bearbeiten</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Angebot bearbeiten</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="number">Angebotsnummer</Label>
                        <Input id="number" name="number" value={editedOffer.number} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="customerId">Kunde</Label>
                        <Select name="customerId" value={editedOffer.customerId} onValueChange={handleCustomerChange}>
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
                        <Input id="date" name="date" type="date" value={editedOffer.date.split('T')[0]} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" value={editedOffer.status} onValueChange={(value) => setEditedOffer(prev => ({ ...prev, status: value }))}>
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
                                <Select name="product" value={editedOffer.product} onValueChange={handleProductChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue>
                                            {editedOffer.product || "Wählen Sie ein Produkt"}
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
                        <Input id="pricingType" name="pricingType" value={editedOffer.pricingType === 'fixed' ? 'Pauschal' : 'Pro Stunde'} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="amount">Betrag</Label>
                        <Input id="amount" name="amount" type="number" value={editedOffer.amount} onChange={handleChange} required />
                    </div>
                    <Button type="submit">Änderungen speichern</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}