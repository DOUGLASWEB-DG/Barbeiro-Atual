import { PrismaClient, AppointmentStatus, TransactionType, GoalType, CategoryType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ─── Seed Categorias Financeiras ────────────────────────────────────
  const categoriesData = [
    // Receitas
    { id: 'cat-servico',   name: 'Serviço',        icon: 'Scissors',          color: '#00c896', type: CategoryType.INCOME },
    { id: 'cat-produto',   name: 'Produto',         icon: 'Package',           color: '#3b82f6', type: CategoryType.INCOME },
    { id: 'cat-gorjeta',   name: 'Gorjeta',         icon: 'Heart',             color: '#f59e0b', type: CategoryType.INCOME },
    { id: 'cat-outros-r',  name: 'Outros (Receita)',icon: 'MoreHorizontal',    color: '#8b5cf6', type: CategoryType.INCOME },
    // Despesas
    { id: 'cat-materiais', name: 'Materiais',       icon: 'Package',           color: '#ef4444', type: CategoryType.EXPENSE },
    { id: 'cat-aluguel',   name: 'Aluguel',         icon: 'Home',              color: '#06b6d4', type: CategoryType.EXPENSE },
    { id: 'cat-equipamentos', name: 'Equipamentos', icon: 'Wrench',            color: '#f59e0b', type: CategoryType.EXPENSE },
    { id: 'cat-marketing', name: 'Marketing',       icon: 'Megaphone',         color: '#8b5cf6', type: CategoryType.EXPENSE },
    { id: 'cat-salarios',  name: 'Salários',        icon: 'Users',             color: '#3b82f6', type: CategoryType.EXPENSE },
    { id: 'cat-utilidades',name: 'Utilidades',       icon: 'Zap',              color: '#10b981', type: CategoryType.EXPENSE },
    { id: 'cat-impostos',  name: 'Impostos',        icon: 'FileText',          color: '#ef4444', type: CategoryType.EXPENSE },
    { id: 'cat-manutencao',name: 'Manutenção',      icon: 'Settings',          color: '#06b6d4', type: CategoryType.EXPENSE },
    { id: 'cat-transporte',name: 'Transporte',      icon: 'Car',              color: '#3b82f6', type: CategoryType.EXPENSE },
    { id: 'cat-alimentacao',name: 'Alimentação',    icon: 'UtensilsCrossed',   color: '#f59e0b', type: CategoryType.EXPENSE },
    { id: 'cat-outros-d',  name: 'Outros (Despesa)',icon: 'MoreHorizontal',    color: '#6b7280', type: CategoryType.EXPENSE },
  ]

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }

  // Seed Usuário Admin
  const hashedPassword = await bcrypt.hash('admin@administrador', 10)
  await prisma.user.upsert({
    where: { email: 'admin@administrador.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      id: 'user-admin',
      name: 'Administrador',
      email: 'admin@administrador.com',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Seed Serviços
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'svc-1' },
      update: {},
      create: {
        id: 'svc-1',
        name: 'Corte Clássico',
        description: 'Corte tradicional com tesoura ou máquina',
        price: 35,
        durationMins: 30,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'svc-2' },
      update: {},
      create: {
        id: 'svc-2',
        name: 'Barba',
        description: 'Aparar e modelar a barba',
        price: 20,
        durationMins: 20,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'svc-3' },
      update: {},
      create: {
        id: 'svc-3',
        name: 'Corte + Barba',
        description: 'Pacote completo de cuidados',
        price: 50,
        durationMins: 50,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'svc-4' },
      update: {},
      create: {
        id: 'svc-4',
        name: 'Barboterapia',
        description: 'Barba com toalha quente e navalha',
        price: 40,
        durationMins: 40,
        active: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'svc-5' },
      update: {},
      create: {
        id: 'svc-5',
        name: 'Corte Infantil',
        description: 'Para crianças até 12 anos',
        price: 25,
        durationMins: 25,
        active: true,
      },
    }),
  ])

  // Seed Clientes
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { phone: '69999990101' },
      update: {},
      create: {
        id: 'cli-1',
        name: 'João Silva',
        phone: '69999990101',
        email: 'joao.silva@email.com',
        notes: 'Prefere degradê nas laterais',
      },
    }),
    prisma.client.upsert({
      where: { phone: '69999990102' },
      update: {},
      create: {
        id: 'cli-2',
        name: 'Carlos Oliveira',
        phone: '69999990102',
        notes: 'Vem a cada 2 semanas',
      },
    }),
    prisma.client.upsert({
      where: { phone: '69999990103' },
      update: {},
      create: {
        id: 'cli-3',
        name: 'Pedro Santos',
        phone: '69999990103',
        email: 'pedro.s@email.com',
        notes: 'Alérgico a certos produtos',
      },
    }),
    prisma.client.upsert({
      where: { phone: '69999990104' },
      update: {},
      create: {
        id: 'cli-4',
        name: 'Marcos Souza',
        phone: '69999990104',
        notes: 'Cliente fixo de sábado',
      },
    }),
    prisma.client.upsert({
      where: { phone: '69999990105' },
      update: {},
      create: {
        id: 'cli-5',
        name: 'Rafael Costa',
        phone: '69999990105',
        email: 'rafael.c@email.com',
      },
    }),
  ])

  // Seed Agendamentos (hoje + esta semana)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const appt1 = await prisma.appointment.upsert({
    where: { id: 'appt-1' },
    update: {},
    create: {
      id: 'appt-1',
      clientId: 'cli-1',
      serviceId: 'svc-3',
      date: new Date(today.getTime() + 9 * 60 * 60 * 1000),
      status: AppointmentStatus.CONFIRMED,
    },
  })

  const appt2 = await prisma.appointment.upsert({
    where: { id: 'appt-2' },
    update: {},
    create: {
      id: 'appt-2',
      clientId: 'cli-2',
      serviceId: 'svc-1',
      date: new Date(today.getTime() + 10 * 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED,
    },
  })

  const appt3 = await prisma.appointment.upsert({
    where: { id: 'appt-3' },
    update: {},
    create: {
      id: 'appt-3',
      clientId: 'cli-3',
      serviceId: 'svc-2',
      date: new Date(today.getTime() + 11 * 60 * 60 * 1000),
      status: AppointmentStatus.PENDING,
    },
  })

  const appt4 = await prisma.appointment.upsert({
    where: { id: 'appt-4' },
    update: {},
    create: {
      id: 'appt-4',
      clientId: 'cli-4',
      serviceId: 'svc-4',
      date: new Date(today.getTime() + 14 * 60 * 60 * 1000),
      status: AppointmentStatus.CONFIRMED,
    },
  })

  // Seed Transações (com categoryId vinculado)
  await prisma.transaction.upsert({
    where: { id: 'txn-1' },
    update: {},
    create: {
      id: 'txn-1',
      type: TransactionType.INCOME,
      amount: 35,
      description: 'Corte Clássico - Carlos Oliveira',
      category: 'Serviço',
      categoryId: 'cat-servico',
      appointmentId: 'appt-2',
      date: new Date(today.getTime() + 10.5 * 60 * 60 * 1000),
    },
  })

  await prisma.transaction.upsert({
    where: { id: 'txn-2' },
    update: {},
    create: {
      id: 'txn-2',
      type: TransactionType.EXPENSE,
      amount: 80,
      description: 'Materiais - óleo de máquina, pentes',
      category: 'Materiais',
      categoryId: 'cat-materiais',
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.transaction.upsert({
    where: { id: 'txn-3' },
    update: {},
    create: {
      id: 'txn-3',
      type: TransactionType.INCOME,
      amount: 50,
      description: 'Corte + Barba - João Silva',
      category: 'Serviço',
      categoryId: 'cat-servico',
      date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.transaction.upsert({
    where: { id: 'txn-4' },
    update: {},
    create: {
      id: 'txn-4',
      type: TransactionType.INCOME,
      amount: 40,
      description: 'Barboterapia - Rafael Costa',
      category: 'Serviço',
      categoryId: 'cat-servico',
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.transaction.upsert({
    where: { id: 'txn-5' },
    update: {},
    create: {
      id: 'txn-5',
      type: TransactionType.EXPENSE,
      amount: 200,
      description: 'Aluguel mensal da cadeira',
      category: 'Aluguel',
      categoryId: 'cat-aluguel',
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
  })

  // Seed Transações extras para dados de demonstração (últimos 3 meses)
  const demoTransactions = [
    // Mês passado
    { id: 'txn-d1',  type: TransactionType.INCOME,  amount: 35,  description: 'Corte Clássico - Pedro Santos',    categoryId: 'cat-servico',    daysAgo: 35 },
    { id: 'txn-d2',  type: TransactionType.INCOME,  amount: 50,  description: 'Corte + Barba - Marcos Souza',     categoryId: 'cat-servico',    daysAgo: 33 },
    { id: 'txn-d3',  type: TransactionType.INCOME,  amount: 40,  description: 'Barboterapia - João Silva',        categoryId: 'cat-servico',    daysAgo: 31 },
    { id: 'txn-d4',  type: TransactionType.INCOME,  amount: 25,  description: 'Corte Infantil',                   categoryId: 'cat-servico',    daysAgo: 30 },
    { id: 'txn-d5',  type: TransactionType.INCOME,  amount: 15,  description: 'Gorjeta - Carlos',                 categoryId: 'cat-gorjeta',    daysAgo: 30 },
    { id: 'txn-d6',  type: TransactionType.EXPENSE, amount: 200, description: 'Aluguel cadeira',                  categoryId: 'cat-aluguel',    daysAgo: 30 },
    { id: 'txn-d7',  type: TransactionType.EXPENSE, amount: 120, description: 'Produtos para barba',              categoryId: 'cat-materiais',  daysAgo: 28 },
    { id: 'txn-d8',  type: TransactionType.INCOME,  amount: 50,  description: 'Corte + Barba - Rafael Costa',     categoryId: 'cat-servico',    daysAgo: 27 },
    { id: 'txn-d9',  type: TransactionType.INCOME,  amount: 35,  description: 'Corte Clássico - Cliente avulso',  categoryId: 'cat-servico',    daysAgo: 25 },
    { id: 'txn-d10', type: TransactionType.EXPENSE, amount: 50,  description: 'Energia elétrica',                 categoryId: 'cat-utilidades', daysAgo: 25 },
    { id: 'txn-d11', type: TransactionType.INCOME,  amount: 50,  description: 'Corte + Barba',                    categoryId: 'cat-servico',    daysAgo: 22 },
    { id: 'txn-d12', type: TransactionType.INCOME,  amount: 35,  description: 'Corte Clássico',                   categoryId: 'cat-servico',    daysAgo: 20 },
    // 2 meses atrás
    { id: 'txn-d13', type: TransactionType.INCOME,  amount: 35,  description: 'Corte Clássico',                   categoryId: 'cat-servico',    daysAgo: 60 },
    { id: 'txn-d14', type: TransactionType.INCOME,  amount: 50,  description: 'Corte + Barba',                    categoryId: 'cat-servico',    daysAgo: 58 },
    { id: 'txn-d15', type: TransactionType.INCOME,  amount: 40,  description: 'Barboterapia',                     categoryId: 'cat-servico',    daysAgo: 55 },
    { id: 'txn-d16', type: TransactionType.EXPENSE, amount: 200, description: 'Aluguel cadeira',                  categoryId: 'cat-aluguel',    daysAgo: 60 },
    { id: 'txn-d17', type: TransactionType.EXPENSE, amount: 90,  description: 'Materiais diversos',               categoryId: 'cat-materiais',  daysAgo: 57 },
    { id: 'txn-d18', type: TransactionType.INCOME,  amount: 35,  description: 'Corte Clássico',                   categoryId: 'cat-servico',    daysAgo: 52 },
    { id: 'txn-d19', type: TransactionType.INCOME,  amount: 20,  description: 'Venda de produto',                 categoryId: 'cat-produto',    daysAgo: 50 },
    { id: 'txn-d20', type: TransactionType.EXPENSE, amount: 45,  description: 'Água e luz',                       categoryId: 'cat-utilidades', daysAgo: 55 },
    // Este mês (extras)
    { id: 'txn-d21', type: TransactionType.INCOME,  amount: 50,  description: 'Corte + Barba - Marcos',           categoryId: 'cat-servico',    daysAgo: 12 },
    { id: 'txn-d22', type: TransactionType.INCOME,  amount: 35,  description: 'Corte Clássico',                   categoryId: 'cat-servico',    daysAgo: 10 },
    { id: 'txn-d23', type: TransactionType.INCOME,  amount: 40,  description: 'Barboterapia',                     categoryId: 'cat-servico',    daysAgo: 8 },
    { id: 'txn-d24', type: TransactionType.INCOME,  amount: 10,  description: 'Gorjeta',                          categoryId: 'cat-gorjeta',    daysAgo: 8 },
    { id: 'txn-d25', type: TransactionType.EXPENSE, amount: 60,  description: 'Lâminas e navalhas',               categoryId: 'cat-materiais',  daysAgo: 5 },
    { id: 'txn-d26', type: TransactionType.EXPENSE, amount: 150, description: 'Marketing Instagram',              categoryId: 'cat-marketing',  daysAgo: 4 },
    { id: 'txn-d27', type: TransactionType.INCOME,  amount: 25,  description: 'Corte Infantil',                   categoryId: 'cat-servico',    daysAgo: 3 },
    { id: 'txn-d28', type: TransactionType.INCOME,  amount: 50,  description: 'Corte + Barba',                    categoryId: 'cat-servico',    daysAgo: 2 },
  ]

  for (const txn of demoTransactions) {
    const txnDate = new Date(today.getTime() - txn.daysAgo * 24 * 60 * 60 * 1000)
    await prisma.transaction.upsert({
      where: { id: txn.id },
      update: {},
      create: {
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        category: txn.description.split(' - ')[0],
        categoryId: txn.categoryId,
        date: txnDate,
      },
    })
  }

  // Seed Metas
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  await prisma.goal.upsert({
    where: { id: 'goal-1' },
    update: {},
    create: {
      id: 'goal-1',
      title: 'Receita Mensal',
      type: GoalType.REVENUE,
      targetAmount: 3000,
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
    },
  })

  await prisma.goal.upsert({
    where: { id: 'goal-2' },
    update: {},
    create: {
      id: 'goal-2',
      title: 'Novos Clientes no Mês',
      type: GoalType.CLIENTS,
      targetAmount: 10,
      period: 'monthly',
      startDate: monthStart,
      endDate: monthEnd,
    },
  })

  await prisma.goal.upsert({
    where: { id: 'goal-3' },
    update: {},
    create: {
      id: 'goal-3',
      title: 'Agendamentos Diários',
      type: GoalType.APPOINTMENTS,
      targetAmount: 8,
      period: 'daily',
      startDate: today,
      endDate: today,
    },
  })

  console.log('✅ Dados iniciais inseridos com sucesso!')
  console.log('📧 Login: admin@administrador.com')
  console.log('🔑 Senha: admin@administrador')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
