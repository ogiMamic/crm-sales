'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { PlusCircle, Search, MoreHorizontal, Loader2, Filter, Check, X } from 'lucide-react'
import { CreateCustomerForm } from '@/components/CreateCustomerForm'
import { EditCustomerForm } from '@/components/EditCustomerForm'
import { useUser, SignIn } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast, useToast } from "@/hooks/use-toast"

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
  updatedAt: string
  userId: string
}

type TimeFilter = '7days' | '30days' | '90days' | 'all'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['name', 'email', 'phone', 'company', 'createdAt'])
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (isSignedIn && user) {
      fetchCustomers()
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, user])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customers. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerAdded = () => {
    fetchCustomers()
    setIsAddDialogOpen(false)
    toast({
      title: "Customer Added",
      description: "New customer has been successfully added.",
    })
  }

  const handleCustomerUpdated = () => {
    fetchCustomers()
    setIsEditDialogOpen(false)
    toast({
      title: "Customer Updated",
      description: "Customer information has been successfully updated.",
    })
  }

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete customer')
        }
        fetchCustomers()
        toast({
          title: "Customer Deleted",
          description: "Customer has been successfully removed.",
        })
      } catch (error) {
        console.error('Error deleting customer:', error)
        setError('Failed to delete customer. Please try again.')
      }
    }
  }

  const [editingCustomer, setEditingCustomer] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Customer>>({})

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer.id)
    setEditForm(customer)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`/api/customers/${editingCustomer}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) {
        throw new Error('Failed to update customer')
      }
      fetchCustomers()
      setEditingCustomer(null)
      toast({
        title: "Customer Updated",
        description: "Customer information has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating customer:', error)
      setError('Failed to update customer. Please try again.')
    }
  }

  const handleEditCancel = () => {
    setEditingCustomer(null)
    setEditForm({})
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase())

    const customerDate = new Date(customer.createdAt)
    const now = new Date()
    const daysDifference = (now.getTime() - customerDate.getTime()) / (1000 * 3600 * 24)

    switch (timeFilter) {
      case '7days':
        return matchesSearch && daysDifference <= 7
      case '30days':
        return matchesSearch && daysDifference <= 30
      case '90days':
        return matchesSearch && daysDifference <= 90
      default:
        return matchesSearch
    }
  })

  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Please sign in to access the customer management system.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-600">Customers</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className='text-primary'>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the details of the new customer below.
              </DialogDescription>
            </DialogHeader>
            <CreateCustomerForm onCustomerAdded={handleCustomerAdded} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

<Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>Manage and view all your customers here.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* ... (search i filter kontrole ostaju iste) */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedColumns.includes('name') && <TableHead>Name</TableHead>}
                    {selectedColumns.includes('email') && <TableHead>Email</TableHead>}
                    {selectedColumns.includes('phone') && <TableHead>Phone</TableHead>}
                    {selectedColumns.includes('company') && <TableHead>Company</TableHead>}
                    {selectedColumns.includes('createdAt') && <TableHead>Created At</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      {selectedColumns.includes('name') && (
                        <TableCell className="font-medium">
                          {editingCustomer === customer.id ? (
                            <Input 
                              name="name" 
                              value={editForm.name || ''} 
                              onChange={handleEditChange}
                            />
                          ) : (
                            customer.name
                          )}
                        </TableCell>
                      )}
                      {selectedColumns.includes('email') && (
                        <TableCell>
                          {editingCustomer === customer.id ? (
                            <Input 
                              name="email" 
                              value={editForm.email || ''} 
                              onChange={handleEditChange}
                            />
                          ) : (
                            customer.email
                          )}
                        </TableCell>
                      )}
                      {selectedColumns.includes('phone') && (
                        <TableCell>
                          {editingCustomer === customer.id ? (
                            <Input 
                              name="phone" 
                              value={editForm.phone || ''} 
                              onChange={handleEditChange}
                            />
                          ) : (
                            customer.phone
                          )}
                        </TableCell>
                      )}
                      {selectedColumns.includes('company') && (
                        <TableCell>
                          {editingCustomer === customer.id ? (
                            <Input 
                              name="company" 
                              value={editForm.company || ''} 
                              onChange={handleEditChange}
                            />
                          ) : (
                            customer.company
                          )}
                        </TableCell>
                      )}
                      {selectedColumns.includes('createdAt') && (
                        <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                      )}
                      <TableCell className="text-right">
                        {editingCustomer === customer.id ? (
                          <div className="flex justify-end space-x-2">
                            <Button onClick={handleEditSubmit} size="sm">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button onClick={handleEditCancel} size="sm" variant="outline">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditClick(customer)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}