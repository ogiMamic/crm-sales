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
import { Button } from "@/components/ui/button"
import { useState } from 'react'

interface InvoiceDetailsDialogProps {
  invoice: Invoice
  onClose: () => void
}

export function InvoiceDetailsDialog({ invoice, onClose }: InvoiceDetailsDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Generieren der PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Rechnung_${invoice.number || invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError('Fehler beim Generieren der PDF. Bitte versuchen Sie es später erneut.');
    }
  };

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
                  <TableHead className="text-gray-700 text-right">Menge</TableHead>
                  <TableHead className="text-gray-700 text-right">Einzelpreis</TableHead>
                  <TableHead className="text-gray-700 text-right">Gesamtpreis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.offer.offerServices.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-800">{item.service.name}</TableCell>
                    <TableCell className="text-gray-800 text-right">{item.quantity}</TableCell>
                    <TableCell className="text-gray-800 text-right">{item.unitPrice.toFixed(2)} €</TableCell>
                    <TableCell className="text-gray-800 text-right">{(item.quantity * item.unitPrice).toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-800">Keine Rechnungsposten verfügbar.</p>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-black mb-2">Rechnungszusammenfassung</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-800">Zwischensumme:</span>
              <span className="text-gray-800 ml-4">{invoice.subtotalAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800">Mehrwertsteuer ({invoice.taxPercentage}%):</span>
              <span className="text-gray-800 ml-4">{invoice.taxAmount.toFixed(2)} €</span>
            </div>
            {invoice.discountAmount !== null && invoice.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-800">Rabatt:</span>
                <span className="text-gray-800 ml-4">{invoice.discountAmount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-black">Gesamtbetrag:</span>
              <span className="font-bold text-black ml-4">{invoice.totalAmount.toFixed(2)} €</span>
            </div>
          </div>
        </div>
        {invoice.notes && invoice.notes.trim() !== '' && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-black mb-2">Anmerkungen</h3>
            <div className="text-gray-800 whitespace-pre-wrap">{invoice.notes}</div>
          </div>
        )}
        <div className="mt-6">
          <Button onClick={handleGeneratePDF}>PDF generieren</Button>
        </div>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}

