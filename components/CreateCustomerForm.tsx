'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from "@clerk/nextjs";

type CustomerFormData = {
  name: string
  email: string
  phone: string
  company: string
}

type CreateCustomerFormProps = {
  onCustomerAdded: () => void
  onCancel: () => void
}

export function CreateCustomerForm({ onCustomerAdded, onCancel }: CreateCustomerFormProps) {
  const { userId, getToken } = useAuth();
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      const token = await getToken({ template: 'supabase' })
      if (!token) {
        throw new Error('Failed to get authentication token')
      }
  
      const supabase = createSupabaseClient(token)
      
      const { data, error: supabaseError } = await supabase
        .from('Customers')
        .insert([{ ...formData, user_id: userId }])
      
      if (supabaseError) throw supabaseError
  
      onCustomerAdded()
    } catch (error) {
      console.error('Error adding customer:', error)
      setError('Failed to add customer. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Add Customer</Button>
      </div>
    </form>
  )
}