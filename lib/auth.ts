import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

const SESSION_COOKIE = 'barberos_session'

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  
  if (!sessionId) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, name: true, email: true, role: true },
    })
    return user
  } catch {
    return null
  }
}

export async function createSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
