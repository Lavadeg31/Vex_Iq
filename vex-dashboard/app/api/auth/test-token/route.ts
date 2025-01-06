import { NextResponse } from 'next/server'
import { createToken } from '@/lib/auth'

export async function GET() {
  try {
    console.log('Creating test token with JWT_SECRET:', process.env.JWT_SECRET?.slice(0, 10) + '...')
    
    // Create a test token for user ID 1
    const token = await createToken(1)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test token created and set in cookies',
      token // Include token in response for debugging
    })
  } catch (error) {
    console.error('Error creating test token:', error)
    return NextResponse.json(
      { error: 'Failed to create test token' },
      { status: 500 }
    )
  }
} 