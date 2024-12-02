'use client'

import { useState, useEffect, ChangeEvent } from 'react'
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
import { CreateServiceForm } from '@/components/CreateServiceForm'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company: string
  createdAt: string
  updatedAt: string
  userId: string
}

type Service = {
  id: string
  name: string
  description: string
  defaultPrice: number
  priceType: 'FIXED' | 'HOURLY'
  createdAt: string
  updatedAt: string
}

type TimeFilter = '7days' | '30days' | '90days' | 'all'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['name', 'description', 'defaultPrice', 'priceType', 'createdAt'])
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (isSignedIn && user) {
      fetchServices()
    } else {
      setIsLoading(false)
    }
  }, [isSignedIn, user])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/dienstleistungen')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customers. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceAdded = () => {
    fetchServices()
    setIsAddDialogOpen(false)
    toast({
      title: "Service Added",
      description: "New service has been successfully added.",
    })
  }

  const handleCustomerUpdated = () => {
    fetchServices()
    setIsEditDialogOpen(false)
    toast({
      title: "Service Updated",
      description: "Service information has been successfully updated.",
    })
  }

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`/api/dienstleistungen/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete service')
        }
        fetchServices()
        toast({
          title: "Service Deleted",
          description: "Service has been successfully removed.",
        })
      } catch (error) {
        console.error('Error deleting service:', error)
        setError('Failed to delete service. Please try again.')
      }
    }
  }

  const [editingService, setEditingService] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Service>>({})

  const handleEditClick = (service: Service) => {
    setEditingService(service.id)
    setEditForm(service)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`/api/dienstleistungen/${editingService}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) {
        throw new Error('Failed to update service')
      }
      fetchServices()
      setEditingService(null)
      toast({
        title: "Service Updated",
        description: "Service information has been successfully updated.",
      })
    } catch (error) {
      console.error('Error updating service:', error)
      setError('Failed to update service. Please try again.')
    }
  }

  const handleEditCancel = () => {
    setEditingService(null)
    setEditForm({})
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.priceType.toString().includes(searchTerm.toLowerCase())

    const serviceDate = new Date(service.createdAt)
    const now = new Date()
    const daysDifference = (now.getTime() - serviceDate.getTime()) / (1000 * 3600 * 24)

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
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className='text-primary'>Add New Service</DialogTitle>
              <DialogDescription>
                Enter the details of the new service below.
              </DialogDescription>
            </DialogHeader>
            <CreateServiceForm onServiceAdded={handleServiceAdded} onCancel={() => setIsAddDialogOpen(false)} />
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
          <CardTitle>Service List</CardTitle>
          <CardDescription>Manage and view all your services here.</CardDescription>
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
                    {selectedColumns.includes('description') && <TableHead>Description</TableHead>}
                    {selectedColumns.includes('defaultPrice') && <TableHead>Default Price</TableHead>}
                    {selectedColumns.includes('priceType') && <TableHead>Price Type</TableHead>}
                    {selectedColumns.includes('createdAt') && <TableHead>Created At</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      {selectedColumns.includes('name') && (
                        <TableCell className="font-medium">
                          {editingService === service.id ? (
                            <Input
                              name="name"
                              value={editForm.name || ''}
                              onChange={handleEditChange}
                            />
                          ) : (
                            service.name
                          )}
                        </TableCell>
                      )}
                      {selectedColumns.includes('description') && (
                        <TableCell>
                          {editingService === service.id ? (
                            <Input
                              name="description"
                              value={editForm.description || ''}
                              onChange={handleEditChange}
                            />
                          ) : (
                            service.description
                          )}
                        </TableCell>
                      )}
                      {selectedColumns.includes('defaultPrice') && (
                        <TableCell>
                          {editingService === service.id ? (
                            <Input
                              name="defaultPrice"
                              type="number"
                              step="0.01"
                              value={editForm.defaultPrice || ''}
                              onChange={handleEditChange}
                            />
                          ) : (
                            service.defaultPrice
                          )}
                        </TableCell>
                      )}
                      {selectedColumns.includes('priceType') && (
                        <TableCell>
                          {editingService === service.id ? (
                            <Select
                              value={editForm.priceType || ''}
                              onValueChange={(value) =>
                                handleEditChange({
                                  target: { name: 'priceType', value } as ChangeEvent<HTMLInputElement>['target'],
                                } as ChangeEvent<HTMLInputElement>)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Price Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FIXED">FIXED</SelectItem>
                                <SelectItem value="HOURLY">HOURLY</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            service.priceType
                          )}
                        </TableCell>
                      )}

                      {selectedColumns.includes('createdAt') && (
                        <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                      )}
                      <TableCell className="text-right">
                        {editingService === service.id ? (
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
                              <DropdownMenuItem onClick={() => handleEditClick(service)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteCustomer(service.id)}>
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