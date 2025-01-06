import { NextResponse } from 'next/server'
import { verifyPassword, createToken } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log('Login attempt for email:', email)

    // Get user from database
    const result = await query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      console.log('No user found with email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = result.rows[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Valid login for user:', email)
    // Create JWT token and set cookie
    const token = await createToken(user.id)
    console.log('Token set for user:', email)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error logging in' },
      { status: 500 }
    )
  }
}

