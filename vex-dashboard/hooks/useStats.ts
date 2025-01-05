'use client'

import { useState, useEffect } from 'react'

interface Stats {
  bestScore: number
  averageScore: number
  teamworkBest: number
  teamworkAverage: number
  matchCount: number
  isLoading: boolean
}

export function useStats(refreshKey: number = 0) {
  const [stats, setStats] = useState<Stats>({
    bestScore: 0,
    averageScore: 0,
    teamworkBest: 0,
    teamworkAverage: 0,
    matchCount: 0,
    isLoading: true
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        console.log('Fetched fresh stats:', data)
        setStats({
          ...data,
          isLoading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchStats()
  }, [refreshKey])

  return stats
} 