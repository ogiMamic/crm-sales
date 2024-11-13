import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: { customer: true },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 })
    }

    const fontPath = path.join(process.cwd(), 'app', 'public', 'fonts', 'Roboto-Regular.ttf')
    const boldFontPath = path.join(process.cwd(), 'app', 'public', 'fonts', 'Roboto-Bold.ttf')
    
    if (!fs.existsSync(fontPath) || !fs.existsSync(boldFontPath)) {
      console.error('Font files not found')
      return NextResponse.json({ error: 'Font files not found' }, { status: 500 })
    }

    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 50,
      autoFirstPage: false,
      font: '' // Prevent default font initialization
    })

    doc.registerFont('Roboto', fontPath)
    doc.registerFont('Roboto-Bold', boldFontPath)

    const chunks: Buffer[] = []

    return new Promise<NextResponse>((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="angebot_${offer.number}.pdf"`,
            },
          })
        )
      })
      doc.on('error', (err) => {
        console.error('Fehler beim Generieren des PDFs:', err)
        reject(new NextResponse(JSON.stringify({ error: 'Fehler beim Generieren des PDFs' }), { status: 500 }))
      })

      // Add the first page
      doc.addPage()

      // Header
      doc.font('Roboto-Bold').fontSize(24).text('CRM Sales', { align: 'center' })
      doc.moveDown(0.5)
      doc.font('Roboto').fontSize(14).text('Ihr vertrauenswürdiger Partner für Vertriebslösungen', { align: 'center' })
      doc.moveDown(1)

      // Horizontal line
      doc.moveTo(50, 150).lineTo(545, 150).stroke()
      doc.moveDown(3)

      // Offer title
      doc.font('Roboto-Bold').fontSize(20).text('Angebot', { align: 'center' })
      doc.moveDown(1)

      // Offer details table
      const tableTop = 230
      const tableLeft = 50
      const tableRight = 545
      const rowHeight = 25

      doc.font('Roboto-Bold').fontSize(12)
      drawTableRow(doc, tableTop, tableLeft, tableRight, rowHeight, ['Angebotsnummer:', offer.number])
      drawTableRow(doc, tableTop + rowHeight, tableLeft, tableRight, rowHeight, ['Kunde:', offer.customer.name])
      drawTableRow(doc, tableTop + rowHeight * 2, tableLeft, tableRight, rowHeight, ['Datum:', new Date(offer.date).toLocaleDateString('de-DE')])
      drawTableRow(doc, tableTop + rowHeight * 3, tableLeft, tableRight, rowHeight, ['Status:', offer.status])
      drawTableRow(doc, tableTop + rowHeight * 4, tableLeft, tableRight, rowHeight, ['Produkt:', offer.product])
      drawTableRow(doc, tableTop + rowHeight * 5, tableLeft, tableRight, rowHeight, ['Preistyp:', offer.pricingType === 'fixed' ? 'Pauschal' : 'Pro Stunde'])
      drawTableRow(doc, tableTop + rowHeight * 6, tableLeft, tableRight, rowHeight, ['Betrag:', `${offer.amount.toFixed(2)} €`])

      // Border around the table
      doc.rect(tableLeft, tableTop, tableRight - tableLeft, rowHeight * 7).stroke()

      // Thank you message
      doc.moveDown(4)
      doc.font('Roboto').fontSize(12).fillColor('gray')
        .text('Vielen Dank, dass Sie unser Angebot gewählt haben.', { align: 'center' })

      // Footer
      const footerText = 'CRM Sales GmbH • Musterstraße 123 • 12345 Musterstadt'
      const footerFontSize = 10
      doc.font('Roboto').fontSize(footerFontSize)
      
      const footerWidth = doc.widthOfString(footerText)
      const footerHeight = doc.currentLineHeight()

      doc.page.margins.bottom = 0;

      doc.on('pageAdded', () => {
        const pageHeight = doc.page.height
        const footerY = pageHeight - footerHeight - 20 // 20 is the margin from the bottom

        doc.text(footerText, (doc.page.width - footerWidth) / 2, footerY, {
          width: footerWidth,
          align: 'center'
        })
      })

      // Trigger the 'pageAdded' event for the first page
      doc.emit('pageAdded')

      doc.end()
    })
  } catch (error) {
    console.error('Fehler beim Generieren des PDFs:', error)
    return NextResponse.json({ error: 'Fehler beim Generieren des PDFs' }, { status: 500 })
  }
}

function drawTableRow(doc: PDFKit.PDFDocument, y: number, left: number, right: number, height: number, texts: string[]) {
  const middle = left + (right - left) / 2

  doc.rect(left, y, right - left, height).stroke()
  doc.font('Roboto-Bold').text(texts[0], left + 5, y + 7, { width: middle - left - 10 })
  doc.font('Roboto').text(texts[1], middle + 5, y + 7, { width: right - middle - 10 })
}