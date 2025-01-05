import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyToken()
    console.log('Delete request for score:', params.id, 'by user:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete score but verify it belongs to the user
    const result = await query(`
      DELETE FROM scores 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [params.id, userId])

    console.log('Delete result:', result.rows)

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Score not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting score:', error)
    return NextResponse.json(
      { error: 'Failed to delete score' },
      { status: 500 }
    )
  }
} 