import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, grayscale } from 'pdf-lib';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    
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

    const user = await currentUser();
    const userName = user ? `${user.firstName} ${user.lastName}` : 'ogiX-digital Team';

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
    if (offer.customer.email) {
      page.drawText(offer.customer.email, { x: 300, y: yOffset, size: 10, font });
      yOffset -= 15;
    }

    // Add new text before services list
    yOffset = height - 250;
    const newText = 'Vielen Dank für Ihr Vertrauen in die ogiX-digital UG (haftungsbeschränkt).\nWir stellen Ihnen hiermit folgende Leistung im Angebot:';
    const lines = newText.split('\n');
    lines.forEach((line) => {
      page.drawText(line, { x: 40, y: yOffset, size: 10, font });
      yOffset -= 20;
    });

    // Add services table
    yOffset -= 20;
    const tableTop = yOffset;
    const tableLeft = 40;
    const columnWidths = [30, 200, 60, 80, 80, 65];
    const rowHeight = 25;

    // Draw table header
    page.drawRectangle({
      x: tableLeft,
      y: yOffset - rowHeight,
      width: columnWidths.reduce((a, b) => a + b),
      height: rowHeight,
      color: rgb(0.9, 0.9, 0.9),
    });

    const headers = ['Pos.', 'Beschreibung', 'Menge', 'Einzelpreis', 'Gesamtpreis', 'Preistyp'];
    let xOffset = tableLeft;
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xOffset + 5,
        y: yOffset - 15,
        size: 10,
        font: boldFont,
      });
      xOffset += columnWidths[index];
    });

    yOffset -= rowHeight;

    // Draw table rows
    offer.offerServices.forEach((item, index) => {
      xOffset = tableLeft;
      page.drawLine({
        start: { x: tableLeft, y: yOffset },
        end: { x: tableLeft + columnWidths.reduce((a, b) => a + b), y: yOffset },
        color: rgb(0.9, 0.9, 0.9),
      });

      page.drawText(`${index + 1}`, { x: xOffset + 5, y: yOffset - 15, size: 10, font });
      xOffset += columnWidths[0];

      page.drawText(item.service.name, { x: xOffset + 5, y: yOffset - 15, size: 10, font });
      xOffset += columnWidths[1];

      page.drawText(item.quantity.toString(), { x: xOffset + 5, y: yOffset - 15, size: 10, font });
      xOffset += columnWidths[2];

      page.drawText(`${item.unitPrice.toFixed(2)} €`, { x: xOffset + 5, y: yOffset - 15, size: 10, font });
      xOffset += columnWidths[3];

      page.drawText(`${(item.quantity * item.unitPrice).toFixed(2)} €`, { x: xOffset + 5, y: yOffset - 15, size: 10, font });
      xOffset += columnWidths[4];

      page.drawText(item.service.priceType, { x: xOffset + 5, y: yOffset - 15, size: 10, font });

      yOffset -= rowHeight;
    });

    // Draw table bottom line
    page.drawLine({
      start: { x: tableLeft, y: yOffset },
      end: { x: tableLeft + columnWidths.reduce((a, b) => a + b), y: yOffset },
      color: rgb(0.9, 0.9, 0.9),
    });

    // Draw table side lines
    let currentX = tableLeft;
    for (let i = 0; i <= columnWidths.length; i++) {
      page.drawLine({
        start: { x: currentX, y: tableTop },
        end: { x: currentX, y: yOffset },
        color: rgb(0.9, 0.9, 0.9),
      });
      currentX += columnWidths[i] || 0;
    }

    // Add totals
    yOffset -= 60;
    const subtotal = offer.offerServices.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = subtotal * (offer.discountPercentage || 0) / 100;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * offer.taxPercentage / 100;
    const total = taxableAmount + tax;

    yOffset -= 30;
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

    // Add closing text
    yOffset -= 40;
    page.drawText('Mit freundlichen Grüßen', { x: 40, y: yOffset, size: 10, font });
    yOffset -= 20;
    page.drawText(userName, { x: 40, y: yOffset, size: 10, font: boldFont });

    // Add footer
    const footerY = 30;
    const footerColor = grayscale(0.5); // Grayish color

    // Left column
    page.drawText('ogiX-digital UG (haftungsbeschränkt)', { x: 40, y: footerY + 40, size: 8, font, color: footerColor });
    page.drawText('Alt-Griesheim 88a', { x: 40, y: footerY + 20, size: 8, font, color: footerColor });
    page.drawText('D-65933 Frankfurt am Main', { x: 40, y: footerY, size: 8, font, color: footerColor });

    // Middle column
    page.drawText('Bankverbindung:', { x: 250, y: footerY + 40, size: 8, font, color: footerColor });
    page.drawText('IBAN DE92 5005 0201 0200 7974 09', { x: 250, y: footerY + 20, size: 8, font, color: footerColor });
    page.drawText('BIC HELADEF1822', { x: 250, y: footerY, size: 8, font, color: footerColor });

    // Right column
    page.drawText('AG Frankfurt a.M.HRB 132217', { x: 460, y: footerY + 40, size: 8, font, color: footerColor });
    page.drawText('Geschäftsführer:', { x: 460, y: footerY + 20, size: 8, font, color: footerColor });
    page.drawText('Roman Schanz', { x: 460, y: footerY, size: 8, font, color: footerColor });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Angebot_${offer.number || offer.id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

