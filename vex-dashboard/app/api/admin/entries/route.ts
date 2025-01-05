import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const userId = await verifyToken()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminCheck = await query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    )

    if (!adminCheck.rows[0]?.is_admin) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Fetch all database entries
    const result = await query(
      'SELECT * FROM your_table ORDER BY id DESC'
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  // Implement create functionality
}

export async function PUT() {
  // Implement update functionality
}

export async function DELETE() {
  // Implement delete functionality
} 