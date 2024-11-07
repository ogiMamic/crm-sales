'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

type CustomerFormData = {
  name: string
  email: string
  phone: string
  company: string
  notes: string
}

type CreateCustomerFormProps = {
  onCustomerAdded: () => void
  onCancel: () => void
}

export function CreateCustomerForm({ onCustomerAdded, onCancel }: CreateCustomerFormProps) {
  const { userId, getToken } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      const token = await getToken()
      if (!token) {
        throw new Error('Failed to get authentication token')
      }
  
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, userId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add customer')
      }
  
      toast({
        title: "Success",
        description: "Customer added successfully",
      })
      onCustomerAdded()
    } catch (error) {
      console.error('Error adding customer:', error)
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-primary">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full text-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-primary">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full text-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-primary">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full text-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company" className="text-primary">Company</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full text-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-primary">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full text-primary"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" className="text-primary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Customer'}
        </Button>
      </div>
    </form>
  )
}