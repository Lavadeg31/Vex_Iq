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

    // Fetch database statistics
    const [userCount, matchCount, dbSize] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM matches'),
      query(`
        SELECT pg_size_pretty(
          pg_database_size(current_database())
        ) as size
      `)
    ])

    return NextResponse.json({
      userCount: parseInt(userCount.rows[0]?.count || '0'),
      matchCount: parseInt(matchCount.rows[0]?.count || '0'),
      averageScore: 0, // We'll implement this when matches are added
      totalMatches: parseInt(matchCount.rows[0]?.count || '0'),
      dbSize: dbSize.rows[0]?.size || '0 MB'
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
} 