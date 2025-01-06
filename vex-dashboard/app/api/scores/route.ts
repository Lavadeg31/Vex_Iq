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

    const result = await query(`
      SELECT 
        id, 
        score, 
        mode, 
        created_at,
        balls,
        switches,
        passes
      FROM scores 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId])

    console.log('Scores query result:', result.rows)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyToken()
    console.log('User ID:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received score data:', body)

    const { score, mode, balls, switches, passes } = body

    const result = await query(`
      INSERT INTO scores (user_id, score, mode, balls, switches, passes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, score, mode, created_at, balls, switches, passes
    `, [userId, score, mode, balls, switches, passes])

    console.log('Database insert result:', result.rows[0])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating score:', error)
    return NextResponse.json(
      { error: 'Failed to create score', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

