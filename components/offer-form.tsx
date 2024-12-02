'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { CalendarIcon, Plus, X, FileText, FileDown } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn, formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  defaultPrice: number;
  priceType: 'FIXED' | 'HOURLY';
}

interface OfferService {
  serviceId: string;
  quantity: number;
  unitPrice: number;
}

interface OfferFormData {
  id?: string;
  customerId: string;
  date: Date;
  services: OfferService[];
  taxPercentage: number;
  discountPercentage: number | null;
}

interface OfferFormProps {
  customers: Customer[];
  services: Service[];
  initialData?: any;
  onClose: () => void;
}

export function OfferForm({ customers, services, initialData, onClose }: OfferFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<OfferFormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      customerId: initialData?.customerId || '',
      date: initialData?.date || new Date(),
      services: initialData?.offerServices || [],
      taxPercentage: initialData?.taxPercentage || 19,
      discountPercentage: initialData?.discountPercentage || 0,
    }
  })

  const onSubmit = async (data: OfferFormData) => {
    setLoading(true)
    try {
      const url = data.id
        ? `/api/offers/${data.id}`
        : '/api/offers'
      
      await fetch(url, {
        method: data.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error saving offer:', error)
    } finally {
      setLoading(false)
    }
  }

  const addService = () => {
    const currentServices = form.getValues('services')
    form.setValue('services', [
      ...currentServices,
      { serviceId: '', quantity: 1, unitPrice: 0 }
    ])
  }

  const removeService = (index: number) => {
    const currentServices = form.getValues('services')
    form.setValue('services', currentServices.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const currentServices = form.getValues('services')
    const subtotal = currentServices.reduce((sum: number, service: OfferService) => 
      sum + (service.quantity * service.unitPrice), 0)
    const discountPercentage = form.getValues('discountPercentage') || 0
    const discount = (subtotal * discountPercentage) / 100
    const taxableAmount = subtotal - discount
    const taxPercentage = form.getValues('taxPercentage')
    const tax = (taxableAmount * taxPercentage) / 100
    const total = taxableAmount + tax

    return { subtotal, discount, tax, total }
  }

  const totals = calculateTotals()

  const handleGeneratePDF = async () => {
    const offerId = form.getValues('id');
    if (offerId) {
      try {
        const response = await fetch(`/api/offers/${offerId}/pdf`, {
          method: 'GET',
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Angebot_${offerId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          console.error('Failed to generate PDF');
          alert('Failed to generate PDF. Please try again.');
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF. Please try again.');
      }
    } else {
      alert('Cannot generate PDF: Offer ID is not available');
    }
  }

  const handleGenerateInvoice = () => {
    alert('Converting to invoice...')
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {initialData ? 'Edit Offer' : 'Create New Offer'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Customer</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Services</h3>
                <Button type="button" onClick={addService} variant="outline" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-700">
                      <TableHead className="text-gray-900 dark:text-gray-100">Service</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Quantity</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Unit Price</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Price Type</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch('services').map((service: OfferService, index: number) => (
                      <TableRow key={index} className="bg-white dark:bg-gray-800">
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`services.${index}.serviceId`}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const selectedService = services.find(s => s.id === value);
                                  if (selectedService) {
                                    form.setValue(`services.${index}.unitPrice`, selectedService.defaultPrice);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    <SelectValue placeholder="Select service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id}>
                                      {service.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`services.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={e => {
                                      field.onChange(parseInt(e.target.value))
                                      form.trigger('services')
                                    }}
                                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`services.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...field}
                                    onChange={e => {
                                      field.onChange(parseFloat(e.target.value))
                                      form.trigger('services')
                                    }}
                                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {services.find(s => s.id === service.serviceId)?.priceType || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeService(index)}
                            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="taxPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Tax Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={e => {
                          field.onChange(parseFloat(e.target.value))
                          form.trigger('taxPercentage')
                        }}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Discount Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value);
                          field.onChange(value);
                          form.trigger('discountPercentage');
                        }}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 text-right text-gray-900 dark:text-gray-100">
              <div className="text-sm">
                Subtotal: {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totals.subtotal)}
              </div>
              {totals.discount > 0 && (
                <div className="text-sm">
                  Discount: {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(totals.discount)}
                </div>
              )}
              <div className="text-sm">
                Tax: {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totals.tax)}
              </div>
              <div className="text-lg font-bold">
                Total: {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(totals.total)}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePDF}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateInvoice}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Invoice
                </Button>
              </div>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Saving...' : 'Save Offer'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

