import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Today's appointments
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELED' },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: { date: 'asc' },
    })

    // Revenue calculations
    const dailyRevenue = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amount: true },
    })

    const weeklyRevenue = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: { gte: weekStart, lte: weekEnd },
      },
      _sum: { amount: true },
    })

    const monthlyRevenue = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    })

    // Total clients
    const totalClients = await prisma.client.count()

    // Appointments by status today
    const pendingCount = todayAppointments.filter(a => a.status === 'PENDING').length
    const confirmedCount = todayAppointments.filter(a => a.status === 'CONFIRMED').length
    const completedCount = todayAppointments.filter(a => a.status === 'COMPLETED').length

    // Recent transactions (last 5)
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
    })

    // Active goals
    const goals = await prisma.goal.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })

    // Revenue chart data (last 7 days)
    const chartData = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      const dayStart = startOfDay(day)
      const dayEnd = endOfDay(day)
      const income = await prisma.transaction.aggregate({
        where: { type: 'INCOME', date: { gte: dayStart, lte: dayEnd } },
        _sum: { amount: true },
      })
      const expense = await prisma.transaction.aggregate({
        where: { type: 'EXPENSE', date: { gte: dayStart, lte: dayEnd } },
        _sum: { amount: true },
      })
      chartData.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        income: income._sum.amount ?? 0,
        expense: expense._sum.amount ?? 0,
      })
    }

    return NextResponse.json({
      todayAppointments,
      revenue: {
        daily: dailyRevenue._sum.amount ?? 0,
        weekly: weeklyRevenue._sum.amount ?? 0,
        monthly: monthlyRevenue._sum.amount ?? 0,
      },
      totalClients,
      appointmentStats: {
        total: todayAppointments.length,
        pending: pendingCount,
        confirmed: confirmedCount,
        completed: completedCount,
      },
      recentTransactions,
      goals,
      chartData,
    })
  } catch (error) {
    console.error('[Dashboard API]', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
