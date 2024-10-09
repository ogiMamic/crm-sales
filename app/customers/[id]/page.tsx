'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from "@clerk/nextjs";

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  notes: string
}

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { getToken } = useAuth();

  useEffect(() => {
    fetchCustomerData()
  }, [id])

  const fetchCustomerData = async () => {
    try {
      const token = await getToken({ template: 'supabase' })
      const response = await fetch(`/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch customer')
      const data = await response.json()
      setCustomer(data)
    } catch (error) {
      console.error('Error fetching customer:', error)
    }
  }

  const handleSave = async () => {
    try {
      const token = await getToken({ template: 'supabase' })
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customer),
      })
      if (!response.ok) throw new Error('Failed to update customer')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  if (!customer) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Link href="/customers" className="flex items-center text-blue-500 hover:text-blue-700 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
                className="col-span-3"
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={customer.email}
                onChange={(e) => setCustomer({...customer, email: e.target.value})}
                className="col-span-3"
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={customer.phone}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                className="col-span-3"
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                value={customer.company}
                onChange={(e) => setCustomer({...customer, company: e.target.value})}
                className="col-span-3"
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={customer.notes}
                onChange={(e) => setCustomer({...customer, notes: e.target.value})}
                className="col-span-3"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            {isEditing ? (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Customer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}