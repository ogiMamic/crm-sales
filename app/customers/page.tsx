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
  address: string
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
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['name', 'email', 'phone', 'company','address', 'createdAt'])
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
        throw new Error('Fehler beim Abrufen der Kunden. Bitte versuchen Sie es später erneut.')
      }
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Fehler beim Abrufen der Kunden. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerAdded = () => {
    fetchCustomers()
    setIsAddDialogOpen(false)
    toast({
      title: "Kunde hinzugefügt",
      description: "Neuer Kunde wurde erfolgreich hinzugefügt.",
    })
  }

  const handleCustomerUpdated = () => {
    fetchCustomers()
    setIsEditDialogOpen(false)
    toast({
      title: "Kunde aktualisiert",
      description: "Kundeninformationen wurden erfolgreich aktualisiert.",
    })
  }

  const handleDeleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Kunden. Bitte versuchen Sie es erneut.')
      }
      fetchCustomers()
      toast({
        title: "Kunde gelöscht",
        description: "Kunde wurde erfolgreich entfernt.",
      })
    } catch (error) {
      console.error('Error deleting customer:', error)
      setError('Fehler beim Löschen des Kunden. Bitte versuchen Sie es erneut.')
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
        throw new Error('Fehler beim Aktualisieren des Kunden. Bitte versuchen Sie es erneut.')
      }
      fetchCustomers()
      setEditingCustomer(null)
      toast({
        title: "Kunde aktualisiert",
        description: "Kundeninformationen wurden erfolgreich aktualisiert.",
      })
    } catch (error) {
      console.error('Error updating customer:', error)
      setError('Fehler beim Aktualisieren des Kunden. Bitte versuchen Sie es erneut.')
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
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())

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
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>Bitte melden Sie sich an, um auf das Kundenverwaltungssystem zuzugreifen.</CardDescription>
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
        <h1 className="text-3xl font-bold text-gray-600">Kunden</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Kunde hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className='text-primary'>Neuen Kunden hinzufügen</DialogTitle>
              <DialogDescription>
                Geben Sie unten die Details des neuen Kunden ein.
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
          <CardTitle>Kundenliste</CardTitle>
          <CardDescription>Verwalten und betrachten Sie hier alle Ihre Kunden.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Kunden suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Nach Zeit filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Letzte 7 Tage</SelectItem>
                  <SelectItem value="30days">Letzte 30 Tage</SelectItem>
                  <SelectItem value="90days">Letzte 90 Tage</SelectItem>
                  <SelectItem value="all">Alle Zeit</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Spalten umschalten</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedColumns.includes('name')}
                    onCheckedChange={() => {
                      setSelectedColumns(prev => 
                        prev.includes('name') 
                          ? prev.filter(col => col !== 'name')
                          : [...prev, 'name']
                      )
                    }}
                  >
                    Name
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedColumns.includes('email')}
                    onCheckedChange={() => {
                      setSelectedColumns(prev => 
                        prev.includes('email') 
                          ? prev.filter(col => col !== 'email')
                          : [...prev, 'email']
                      )
                    }}
                  >
                    E-Mail
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedColumns.includes('phone')}
                    onCheckedChange={() => {
                      setSelectedColumns(prev => 
                        prev.includes('phone') 
                          ? prev.filter(col => col !== 'phone')
                          : [...prev, 'phone']
                      )
                    }}
                  >
                    Telefon
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedColumns.includes('company')}
                    onCheckedChange={() => {
                      setSelectedColumns(prev => 
                        prev.includes('company') 
                          ? prev.filter(col => col !== 'company')
                          : [...prev, 'company']
                      )
                    }}
                  >
                    Unternehmen
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedColumns.includes('address')}
                    onCheckedChange={() => {
                      setSelectedColumns(prev => 
                        prev.includes('address') 
                          ? prev.filter(col => col !== 'address')
                          : [...prev, 'address']
                      )
                    }}
                  >
                    Adresse
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedColumns.includes('createdAt')}
                    onCheckedChange={() => {
                      setSelectedColumns(prev => 
                        prev.includes('createdAt') 
                          ? prev.filter(col => col !== 'createdAt')
                          : [...prev, 'createdAt']
                      )
                    }}
                  >
                    Erstellt am
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
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
                    {selectedColumns.includes('email') && <TableHead>E-Mail</TableHead>}
                    {selectedColumns.includes('phone') && <TableHead>Telefon</TableHead>}
                    {selectedColumns.includes('company') && <TableHead>Unternehmen</TableHead>}
                    {selectedColumns.includes('address') && <TableHead>Adresse</TableHead>}
                    {selectedColumns.includes('createdAt') && <TableHead>Erstellt am</TableHead>}
                    <TableHead className="text-right">Aktionen</TableHead>
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
                      {selectedColumns.includes('address') && (
                        <TableCell>
                          {editingCustomer === customer.id ? (
                            <Input 
                              name="address" 
                              value={editForm.address || ''} 
                              onChange={handleEditChange}
                            />
                          ) : (
                            customer.address
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
                                <span className="sr-only">Menü öffnen</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditClick(customer)}>
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)}>
                                Löschen
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

