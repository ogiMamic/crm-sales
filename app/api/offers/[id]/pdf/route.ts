import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    
    // Fetch offer data from the database using the existing Prisma client
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        customer: true,
        offerServices: {
          include: {
            service: true
          }
        }
      }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.276, 841.890]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add logo
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
    const logoImage = await fs.readFile(logoPath);
    const logoImagePdf = await pdfDoc.embedPng(logoImage);
    const logoDims = logoImagePdf.scale(0.7);
    page.drawImage(logoImagePdf, {
      x: width - logoDims.width - 40,
      y: height - logoDims.height - 40,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Add company details
    let yOffset = height - 40;
    page.drawText('ogiX-digital UG (haftungsbeschränkt)', { x: 40, y: yOffset, size: 12, font: boldFont });
    yOffset -= 20;
    page.drawText('Alt-Griesheim 88a', { x: 40, y: yOffset, size: 10, font });
    yOffset -= 15;
    page.drawText('D-65933 Frankfurt am Main', { x: 40, y: yOffset, size: 10, font });

    // Add offer details
    yOffset -= 40;
    page.drawText(`Angebot Nr. ${offer.number}`, { x: 40, y: yOffset, size: 14, font: boldFont });
    yOffset -= 20;
    page.drawText(`Datum: ${offer.date.toLocaleDateString('de-DE')}`, { x: 40, y: yOffset, size: 10, font });

    // Add customer details
    yOffset = height - 150;
    page.drawText('Kunde:', { x: 300, y: yOffset, size: 12, font: boldFont });
    yOffset -= 20;
    page.drawText(offer.customer.name, { x: 300, y: yOffset, size: 10, font });
    yOffset -= 15;
    if (offer.customer.address) {
      page.drawText(offer.customer.address, { x: 300, y: yOffset, size: 10, font });
      yOffset -= 15;
    }
    
    // Add services table
    yOffset = height - 250;
    page.drawText('Pos.', { x: 40, y: yOffset, size: 10, font: boldFont });
    page.drawText('Beschreibung', { x: 80, y: yOffset, size: 10, font: boldFont });
    page.drawText('Menge', { x: 300, y: yOffset, size: 10, font: boldFont });
    page.drawText('Einzelpreis', { x: 380, y: yOffset, size: 10, font: boldFont });
    page.drawText('Gesamtpreis', { x: 480, y: yOffset, size: 10, font: boldFont });

    yOffset -= 20;
    offer.offerServices.forEach((item, index) => {
      page.drawText(`${index + 1}`, { x: 40, y: yOffset, size: 10, font });
      page.drawText(item.service.name, { x: 80, y: yOffset, size: 10, font });
      page.drawText(item.quantity.toString(), { x: 300, y: yOffset, size: 10, font });
      page.drawText(`${item.unitPrice.toFixed(2)} €`, { x: 380, y: yOffset, size: 10, font });
      page.drawText(`${(item.quantity * item.unitPrice).toFixed(2)} €`, { x: 480, y: yOffset, size: 10, font });
      yOffset -= 20;
    });

    // Add totals
    const subtotal = offer.offerServices.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = subtotal * (offer.discountPercentage || 0) / 100;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * offer.taxPercentage / 100;
    const total = taxableAmount + tax;

    yOffset -= 20;
    page.drawText(`Zwischensumme:`, { x: 380, y: yOffset, size: 10, font: boldFont });
    page.drawText(`${subtotal.toFixed(2)} €`, { x: 480, y: yOffset, size: 10, font });
    if (discount > 0) {
      yOffset -= 20;
      page.drawText(`Rabatt (${offer.discountPercentage}%):`, { x: 380, y: yOffset, size: 10, font });
      page.drawText(`${discount.toFixed(2)} €`, { x: 480, y: yOffset, size: 10, font });
    }
    yOffset -= 20;
    page.drawText(`MwSt. (${offer.taxPercentage}%):`, { x: 380, y: yOffset, size: 10, font });
    page.drawText(`${tax.toFixed(2)} €`, { x: 480, y: yOffset, size: 10, font });
    yOffset -= 20;
    page.drawText(`Gesamtbetrag:`, { x: 380, y: yOffset, size: 12, font: boldFont });
    page.drawText(`${total.toFixed(2)} €`, { x: 480, y: yOffset, size: 12, font: boldFont });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Angebot_${offer.number}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

