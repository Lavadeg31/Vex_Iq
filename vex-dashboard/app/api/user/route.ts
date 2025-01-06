import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function DELETE() {
  try {
    const userId = await verifyToken()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete all user's scores first
    await query('DELETE FROM scores WHERE user_id = $1', [userId])
    
    // Delete the user
    await query('DELETE FROM users WHERE id = $1', [userId])

    // Clear the auth cookie
    cookies().delete('auth-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 