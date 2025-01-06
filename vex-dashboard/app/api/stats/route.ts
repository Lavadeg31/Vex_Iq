import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)
    console.log('JWT_SECRET first 10 chars:', process.env.JWT_SECRET?.slice(0, 10))
    
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')
    
    if (token) {
      try {
        const decoded = await jwtVerify(
          token.value,
          new TextEncoder().encode(process.env.JWT_SECRET)
        )
        console.log('Token decode test:', decoded)
      } catch (e) {
        console.error('Token decode test failed:', e)
      }
    }
    
    const userId = await verifyToken()
    console.log('Fetching stats for user:', userId) // Debug log

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all scores for the user with proper mode handling
    const result = await query(`
      WITH modes AS (
        SELECT unnest(ARRAY['skills', 'teamwork']) AS mode
      ),
      stats AS (
        SELECT 
          s.mode,
          MAX(s.score) as best_score,
          ROUND(AVG(s.score)::numeric, 1) as avg_score,
          COUNT(*) as count
        FROM scores s
        WHERE s.user_id = $1
        GROUP BY s.mode
      )
      SELECT 
        m.mode,
        COALESCE(s.best_score, 0) as best_score,
        COALESCE(s.avg_score, 0.0) as avg_score,
        COALESCE(s.count, 0) as count
      FROM modes m
      LEFT JOIN stats s ON m.mode = s.mode
    `, [userId])

    console.log('Raw stats query result:', result.rows) // Debug log

    // Initialize stats
    let stats = {
      bestScore: 0,
      averageScore: 0,
      teamworkBest: 0,
      teamworkAverage: 0,
      matchCount: 0
    }

    // Process results
    result.rows.forEach(row => {
      const bestScore = Number(row.best_score)
      const avgScore = Number(row.avg_score)
      const count = Number(row.count)

      if (row.mode === 'skills') {
        stats.bestScore = bestScore
        stats.averageScore = avgScore
      } else if (row.mode === 'teamwork') {
        stats.teamworkBest = bestScore
        stats.teamworkAverage = avgScore
      }
      stats.matchCount += count
    })

    console.log('Calculated stats:', stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
