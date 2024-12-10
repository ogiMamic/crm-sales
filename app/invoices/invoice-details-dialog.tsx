import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Invoice } from './invoices-client'

interface InvoiceDetailsDialogProps {
  invoice: Invoice
  onClose: () => void
}

export function InvoiceDetailsDialog({ invoice, onClose }: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-black">Rechnungsdetails</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-black">Rechnungsposten</h3>
          {invoice.offer.offerServices && invoice.offer.offerServices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700">Dienstleistung</TableHead>
                  <TableHead className="text-gray-700">Menge</TableHead>
                  <TableHead className="text-gray-700">Einzelpreis</TableHead>
                  <TableHead className="text-gray-700">Gesamtpreis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.offer.offerServices.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-800">{item.service.name}</TableCell>
                    <TableCell className="text-gray-800">{item.quantity}</TableCell>
                    <TableCell className="text-gray-800">{item.unitPrice.toFixed(2)} €</TableCell>
                    <TableCell className="text-gray-800">{(item.quantity * item.unitPrice).toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-800">Keine Rechnungsposten verfügbar.</p>
          )}
        </div>
        {invoice.notes && invoice.notes.trim() !== '' && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-black mb-2">Anmerkungen</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-black mb-2">Rechnungszusammenfassung</h3>
          <div className="space-y-2">
            <p className="text-gray-800">Zwischensumme: {invoice.subtotalAmount.toFixed(2)} €</p>
            <p className="text-gray-800">Mehrwertsteuer ({invoice.taxPercentage}%): {invoice.taxAmount.toFixed(2)} €</p>
            {invoice.discountAmount !== null && invoice.discountAmount > 0 && (
              <p className="text-gray-800">Rabatt: {invoice.discountAmount.toFixed(2)} €</p>
            )}
            <p className="font-bold text-black">Gesamtbetrag: {invoice.totalAmount.toFixed(2)} €</p>
          </div>
        </div>
        
      </DialogContent>
    </Dialog>
  )
}

