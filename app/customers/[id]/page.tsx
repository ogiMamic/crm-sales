"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

// Mock function to fetch customer data
const fetchCustomerData = (id: string) => {
  // In a real application, this would be an API call
  return Promise.resolve({
    id: parseInt(id),
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "123-456-7890",
    company: "Tech Co",
    notes: "VIP customer, prefers email communication"
  })
}

export default function CustomerDetailsPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchCustomerData(id as string).then(setCustomer)
  }, [id])

  const handleSave = () => {
    // In a real application, this would be an API call to update the customer data
    console.log("Saving customer data:", customer)
    setIsEditing(false)
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