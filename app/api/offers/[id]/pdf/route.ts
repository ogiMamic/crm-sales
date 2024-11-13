import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'

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
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const doc = new PDFDocument({ autoFirstPage: false })
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
              'Content-Disposition': `attachment; filename="offer_${offer.number}.pdf"`,
            },
          })
        )
      })
      doc.on('error', (err) => {
        reject(new NextResponse(JSON.stringify({ error: 'Error generating PDF' }), { status: 500 }))
      })

      // Add a new page (since we disabled autoFirstPage)
      doc.addPage()

      // Add content to the PDF
      doc.fontSize(18).text('Angebot', { align: 'center' })
      doc.moveDown()
      doc.fontSize(12)
      doc.text(`Angebotsnummer: ${offer.number}`)
      doc.text(`Kunde: ${offer.customer.name}`)
      doc.text(`Datum: ${new Date(offer.date).toLocaleDateString()}`)
      doc.text(`Status: ${offer.status}`)
      doc.text(`Produkt: ${offer.product}`)
      doc.text(`Preistyp: ${offer.pricingType === 'fixed' ? 'Pauschal' : 'Pro Stunde'}`)
      doc.text(`Betrag: ${offer.amount.toFixed(2)} €`)

      doc.end()
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}