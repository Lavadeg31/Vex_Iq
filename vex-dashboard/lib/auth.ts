import { hash, compare } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function hashPassword(password: string) {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
}

export async function createToken(userId: number) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function verifyToken(): Promise<number | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )

    return payload.userId as number
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

