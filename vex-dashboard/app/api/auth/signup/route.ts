import { NextResponse } from 'next/server'
import { createToken, hashPassword } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING id`,
      [email, hashedPassword]
    )

    const user = result.rows[0]

    // Create session
    await createToken(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
} 