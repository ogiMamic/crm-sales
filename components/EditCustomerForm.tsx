'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  company: string
}

type EditCustomerFormProps = {
  customer: Customer
  onCustomerUpdated: () => void
  onCancel: () => void
}

export function EditCustomerForm({ customer, onCustomerUpdated, onCancel }: EditCustomerFormProps) {
  const [formData, setFormData] = useState<Customer>(customer)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update customer')
      }

      onCustomerUpdated()
    } catch (error) {
      console.error('Error updating customer:', error)
      setError('Failed to update customer. Please try again.')
    }finally{
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
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
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="text-primary">Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Editing...' : 'Update Customer'}</Button>
      </div>
    </form>
  )
}