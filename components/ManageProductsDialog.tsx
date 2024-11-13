'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: string
  productName: string
  priceType: string
  amount: number
}

type ManageProductsDialogProps = {
  onProductsChanged: () => void
  children: React.ReactNode
}

export function ManageProductsDialog({ onProductsChanged, children }: ManageProductsDialogProps) {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    productName: '',
    priceType: 'fixed',
    amount: 0
  })

  useEffect(() => {
    fetchProducts()
  }, [])

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
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })
      if (!response.ok) {
        throw new Error('Failed to create product')
      }
      await fetchProducts()
      onProductsChanged()
      setNewProduct({ productName: '', priceType: 'fixed', amount: 0 })
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      await fetchProducts()
      onProductsChanged()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Produkte verwalten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productName">Produktname</Label>
            <Input
              id="productName"
              value={newProduct.productName}
              onChange={(e) => setNewProduct(prev => ({ ...prev, productName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="priceType">Preistyp</Label>
            <Select
              value={newProduct.priceType}
              onValueChange={(value) => setNewProduct(prev => ({ ...prev, priceType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie einen Preistyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Pauschal</SelectItem>
                <SelectItem value="hourly">Pro Stunde</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Betrag</Label>
            <Input
              id="amount"
              type="number"
              value={newProduct.amount}
              onChange={(e) => setNewProduct(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              required
            />
          </div>
          <Button type="submit">Produkt hinzufügen</Button>
        </form>
        <div className="mt-4">
          <h3 className="font-semibold">Produktliste</h3>
          <ul className="space-y-2">
            {products.map((product) => (
              <li key={product.id} className="flex justify-between items-center">
                <span>{product.productName} - {product.priceType === 'fixed' ? 'Pauschal' : 'Pro Stunde'} - {product.amount}€</span>
                <Button variant="destructive" onClick={() => handleDelete(product.id)}>Löschen</Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}