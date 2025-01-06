import { NextResponse } from 'next/server'
import { createToken, hashPassword } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: Request) {
  try {
    console.log('Starting signup process')

    // Validate request body
    let email, password
    try {
      const body = await request.json()
      email = body.email?.trim()
      password = body.password
      console.log('Received signup request for email:', email)
    } catch (error) {
      console.error('Error parsing request body:', error)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    try {
      // Verify database connection first
      await query('SELECT 1')

      // Check if user exists
      console.log('Checking for existing user')
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        console.log('User already exists')
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }

      // Hash password
      console.log('Hashing password')
      const hashedPassword = await hashPassword(password)

      // Create user with explicit column names
      console.log('Creating new user')
      const result = await query(
        `INSERT INTO users (email, password_hash) 
         VALUES ($1, $2) 
         RETURNING id, email`,
        [email, hashedPassword]
      )

      const user = result.rows[0]
      console.log('User created:', { id: user.id, email: user.email })

      // Create session
      console.log('Creating session token')
      await createToken(user.id)

      return NextResponse.json({ 
        success: true,
        message: 'Account created successfully'
      })

    } catch (error) {
      console.error('Database operation error:', error)
      
      if (error instanceof Error) {
        // Handle specific PostgreSQL error codes
        const pgError = error as any
        switch (pgError.code) {
          case '23505': // unique_violation
            return NextResponse.json(
              { error: 'Email already registered' },
              { status: 400 }
            )
          case '42P01': // undefined_table
            return NextResponse.json(
              { error: 'Database setup error' },
              { status: 500 }
            )
          case '28P01': // invalid_password
          case '28000': // invalid_authorization_specification
            return NextResponse.json(
              { error: 'Database authentication error' },
              { status: 500 }
            )
          default:
            console.error('Unhandled database error:', {
              code: pgError.code,
              message: pgError.message,
              detail: pgError.detail
            })
        }
      }

      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error'
    console.error('Signup error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 