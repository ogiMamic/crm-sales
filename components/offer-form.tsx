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
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { format, addDays } from 'date-fns'

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
  onOfferCreated?: (offer: any) => void;
}

export function OfferForm({ customers, services, initialData, onClose, onOfferCreated }: OfferFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [shouldReloadOffer, setShouldReloadOffer] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    dueDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
    notes: ''
  })

  const defaultDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now

  const form = useForm<OfferFormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      customerId: initialData?.customerId || '',
      date: initialData?.date || defaultDate,
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
    
      const response = await fetch(url, {
        method: data.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const savedOffer = await response.json()
        if (onOfferCreated) {
          onOfferCreated(savedOffer)
        }
        router.refresh()
        onClose()
      } else {
        console.error('Fehler beim Speichern des Angebots:', await response.text())
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Angebots:', error)
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
        setPdfLoading(true);
        const response = await fetch(`/api/offers/${offerId}/pdf`, {
          method: 'GET',
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || `Angebot_${offerId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          console.error('PDF-Generierung fehlgeschlagen');
          alert('PDF-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
        }
      } catch (error) {
        console.error('Fehler bei der PDF-Generierung:', error);
        alert('Bei der PDF-Generierung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
      } finally {
        setPdfLoading(false);
      }
    } else {
      alert('PDF kann nicht generiert werden: Angebots-ID ist nicht verfügbar');
    }
  }

  const handleGenerateInvoice = () => {
    setIsInvoiceDialogOpen(true)
  }

  const handleInvoiceSubmit = async () => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: form.getValues('id'),
          dueDate: invoiceData.dueDate,
          notes: invoiceData.notes,
        }),
      })

      if (response.ok) {
        const invoice = await response.json()
        alert('Rechnung erfolgreich erstellt!')
        setIsInvoiceDialogOpen(false)
        // Optionally, you can update the UI or redirect to the invoice page
      } else {
        console.error('Fehler beim Erstellen der Rechnung:', await response.text())
        alert('Fehler beim Erstellen der Rechnung. Bitte versuchen Sie es erneut.')
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Rechnung:', error)
      alert('Beim Erstellen der Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')
    }
  }

  useEffect(() => {
    if (shouldReloadOffer) {
      const reloadOffer = async () => {
        try {
          const response = await fetch(`/api/offers/${form.getValues('id')}`)
          if (response.ok) {
            const updatedOffer = await response.json()
            form.reset(updatedOffer)
          }
        } catch (error) {
          console.error('Fehler beim Neuladen des Angebots:', error)
        } finally {
          setShouldReloadOffer(false)
        }
      }

      reloadOffer()
    }
  }, [shouldReloadOffer, form])

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {initialData ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Kunde</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Kunde auswählen" />
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Datum</FormLabel>
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
                                <span>Datum auswählen</span>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dienstleistungen</h3>
                  <Button type="button" onClick={addService} variant="outline" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <Plus className="h-4 w-4 mr-2" />
                    Dienstleistung hinzufügen
                  </Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 dark:bg-gray-700">
                        <TableHead className="text-gray-900 dark:text-gray-100">Dienstleistung</TableHead>
                        <TableHead className="text-gray-900 dark:text-gray-100">Menge</TableHead>
                        <TableHead className="text-gray-900 dark:text-gray-100">Einzelpreis</TableHead>
                        <TableHead className="text-gray-900 dark:text-gray-100">Preistyp</TableHead>
                        <TableHead className="text-gray-900 dark:text-gray-100">Aktionen</TableHead>
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
                                      <SelectValue placeholder="Dienstleistung auswählen" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {services
                                      .filter(s => 
                                        !form.getValues('services').some(
                                          (selectedService, i) => 
                                            i !== index && selectedService.serviceId === s.id
                                        )
                                      )
                                      .map((service) => (
                                        <SelectItem key={service.id} value={service.id}>
                                          {service.name}
                                        </SelectItem>
                                      ))
                                    }
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
                            {services.find(s => s.id === service.serviceId)?.priceType === 'FIXED' ? 'Fest' : 'Stündlich'}
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Mehrwertsteuersatz</FormLabel>
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
                      <FormLabel className="text-gray-700 dark:text-gray-300">Rabatt in Prozent</FormLabel>
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
                  Zwischensumme: {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(totals.subtotal)}
                </div>
                {totals.discount > 0 && (
                  <div className="text-sm">
                    Rabatt: {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(totals.discount)}
                  </div>
                )}
                <div className="text-sm">
                  Mehrwertsteuer: {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(totals.tax)}
                </div>
                <div className="text-lg font-bold">
                  Gesamtsumme: {new Intl.NumberFormat('de-DE', {
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
                    disabled={pdfLoading}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {pdfLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Generiere...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        PDF generieren
                      </>
                    )}
                  </Button>
                  {initialData?.status === 'DRAFT' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateInvoice}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Rechnung erstellen
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    Abbrechen
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Speichere...' : 'Angebot speichern'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Rechnung erstellen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right text-sm font-medium">
                Fälligkeitsdatum
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right text-sm font-medium">
                Notizen
              </Label>
              <Input
                id="notes"
                className="col-span-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleInvoiceSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Rechnung erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

