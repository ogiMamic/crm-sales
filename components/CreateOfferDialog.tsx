import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  company: string
}

type OfferFormData = {
  number: string
  customer: string
  date: Date
  status: string
  amount: number
  product: string
}

type CreateOfferDialogProps = {
  onCreateOffer: (offer: OfferFormData) => void
  lastOfferNumber: string
}

const products = [
  { value: 'website', label: 'Website erstellen', price: 5000 },
  { value: 'app', label: 'App erstellen', price: 10000 },
  { value: 'seo', label: 'SEO Optimierung', price: 2000 },
  { value: 'marketing', label: 'Online Marketing', price: 3000 },
]

const offerStatuses = [
  'Entwurf',
  'Gesendet',
  'Aufgenommen',
  'Angenommen',
  'Abgelehnt',
  'In Bearbeitung',
  'Abgeschlossen',
]

export function CreateOfferDialog({ onCreateOffer, lastOfferNumber }: CreateOfferDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState<OfferFormData>({
    number: '',
    customer: '',
    date: new Date(),
    status: 'Entwurf',
    amount: 0,
    product: '',
  })

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers')
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }
        const data = await response.json()
        setCustomers(data)
      } catch (error) {
        console.error('Error fetching customers:', error)
        setCustomers([])
      }
    }

    fetchCustomers()
  }, [])

  useEffect(() => {
    if (isOpen) {
      const nextNumber = parseInt(lastOfferNumber.slice(1)) + 1
      setFormData(prev => ({
        ...prev,
        number: `A${String(nextNumber).padStart(3, '0')}`,
        date: new Date(),
        status: 'Entwurf',
      }))
    }
  }, [isOpen, lastOfferNumber])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateOffer(formData)
    setIsOpen(false)
  }

  const handleProductChange = (value: string) => {
    const selectedProduct = products.find(p => p.value === value)
    setFormData(prev => ({
      ...prev,
      product: value,
      amount: selectedProduct ? selectedProduct.price : 0
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Neues Angebot</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Neues Angebot erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Nummer</Label>
            <Input
              id="number"
              name="number"
              value={formData.number}
              readOnly
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer">Kunde</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isOpen}
                  className="w-full justify-between"
                >
                  {formData.customer
                    ? customers.find((customer) => customer.id === formData.customer)?.name
                    : "Kunde auswählen"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Kunde suchen..." />
                  <CommandEmpty>Kein Kunde gefunden.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        onSelect={() => {
                          setFormData(prev => ({ ...prev, customer: customer.id }))
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.customer === customer.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {customer.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Datum auswählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Status wählen" />
              </SelectTrigger>
              <SelectContent>
                {offerStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Produkt/Dienstleistung</Label>
            <Select
              value={formData.product}
              onValueChange={handleProductChange}
            >
              <SelectTrigger id="product" className="w-full">
                <SelectValue placeholder="Produkt wählen" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.value} value={product.value}>
                    {product.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Betrag</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              required
              className="w-full"
              placeholder="Betrag eingeben"
            />
          </div>
          <Button type="submit" className="w-full">Angebot erstellen</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}