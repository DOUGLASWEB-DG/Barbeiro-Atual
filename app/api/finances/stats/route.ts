import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const months = parseInt(searchParams.get('months') || '6')
    const now = new Date()

    // ─── Stats mensais (últimos N meses) ──────────────────────────────
    const monthlyData = []
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)

      const income = await prisma.transaction.aggregate({
        where: { type: 'INCOME', date: { gte: start, lte: end } },
        _sum: { amount: true },
      })
      const expense = await prisma.transaction.aggregate({
        where: { type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
      })

      const incomeVal = income._sum.amount ?? 0
      const expenseVal = expense._sum.amount ?? 0

      monthlyData.push({
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        monthFull: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        receitas: incomeVal,
        despesas: expenseVal,
        saldo: incomeVal - expenseVal,
      })
    }

    // ─── Mês atual ────────────────────────────────────────────────────
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)

    const currentIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME', date: { gte: currentMonthStart, lte: currentMonthEnd } },
      _sum: { amount: true },
    })
    const currentExpense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE', date: { gte: currentMonthStart, lte: currentMonthEnd } },
      _sum: { amount: true },
    })

    const incomeTotal = currentIncome._sum.amount ?? 0
    const expenseTotal = currentExpense._sum.amount ?? 0
    const profit = incomeTotal - expenseTotal
    const profitMargin = incomeTotal > 0 ? (profit / incomeTotal) * 100 : 0

    // ─── Mês anterior (comparação) ────────────────────────────────────
    const prevMonthStart = startOfMonth(subMonths(now, 1))
    const prevMonthEnd = endOfMonth(subMonths(now, 1))

    const prevIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME', date: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    })
    const prevExpense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE', date: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    })

    const prevIncomeVal = prevIncome._sum.amount ?? 0
    const prevExpenseVal = prevExpense._sum.amount ?? 0

    const expenseTrend = prevExpenseVal > 0
      ? ((expenseTotal - prevExpenseVal) / prevExpenseVal) * 100
      : 0
    const incomeTrend = prevIncomeVal > 0
      ? ((incomeTotal - prevIncomeVal) / prevIncomeVal) * 100
      : 0

    // ─── Breakdown por categoria (mês atual) ──────────────────────────
    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'EXPENSE',
        date: { gte: currentMonthStart, lte: currentMonthEnd },
        categoryId: { not: null },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    })

    // Buscar nomes das categorias
    const categoryIds = categoryBreakdown
      .map(c => c.categoryId)
      .filter((id): id is string => id !== null)

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    })

    const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

    const categoryData = categoryBreakdown.map(c => ({
      id: c.categoryId,
      name: catMap[c.categoryId!]?.name ?? 'Outros',
      color: catMap[c.categoryId!]?.color ?? '#6b7280',
      icon: catMap[c.categoryId!]?.icon ?? 'CircleDollarSign',
      value: c._sum.amount ?? 0,
    }))

    // ─── Totais gerais ────────────────────────────────────────────────
    const allTimeIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true },
    })
    const allTimeExpense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true },
    })

    return NextResponse.json({
      currentMonth: {
        income: incomeTotal,
        expense: expenseTotal,
        profit,
        profitMargin,
      },
      trends: {
        expense: expenseTrend,
        income: incomeTrend,
      },
      monthlyData,
      categoryBreakdown: categoryData,
      allTime: {
        income: allTimeIncome._sum.amount ?? 0,
        expense: allTimeExpense._sum.amount ?? 0,
        balance: (allTimeIncome._sum.amount ?? 0) - (allTimeExpense._sum.amount ?? 0),
      },
    })
  } catch (error) {
    console.error('[Finance Stats GET]', error)
    return NextResponse.json({ error: 'Failed to fetch finance stats' }, { status: 500 })
  }
}
