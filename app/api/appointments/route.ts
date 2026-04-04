import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED']).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')
    const status = searchParams.get('status')

    const where: any = {}

    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number)
      if (!year || !month || !day) {
        return NextResponse.json({ error: 'Invalid date param. Expected yyyy-MM-dd' }, { status: 400 })
      }

      // Interpreta como data local (consistente com /api/book)
      const start = new Date(year, month - 1, day, 0, 0, 0, 0)
      const end = new Date(year, month - 1, day, 23, 59, 59, 999)
      where.date = { gte: start, lte: end }
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { client: true, service: true },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('[Appointments GET]', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSchema.parse(body)

    const appointment = await prisma.appointment.create({
      data: {
        clientId: parsed.clientId,
        serviceId: parsed.serviceId,
        date: new Date(parsed.date),
        notes: parsed.notes,
        status: parsed.status ?? 'PENDING',
      },
      include: { client: true, service: true },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('[Appointments POST]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
