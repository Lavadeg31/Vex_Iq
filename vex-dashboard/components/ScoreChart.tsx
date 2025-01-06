'use client'

import { useEffect, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"

interface Score {
  id: number
  score: number
  mode: 'skills' | 'teamwork'
  created_at: string
}

export function ScoreChart() {
  const [scores, setScores] = useState<Score[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchScores() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/scores', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.status === 401) {
          router.push('/login')
          return
        }
        
        if (!response.ok) throw new Error('Failed to fetch scores')
        const data = await response.json()
        setScores(data)
      } catch (error) {
        console.error('Error fetching scores:', error)
        toast({
          title: "Error",
          description: "Failed to load scores",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchScores()
  }, [toast, router])

  const data = scores.map(score => ({
    date: new Date(score.created_at).toLocaleDateString(),
    score: score.score
  })).reverse() // Reverse to show chronological order

  if (isLoading) {
    return <div className="flex items-center justify-center h-[350px]">Loading...</div>
  }

  if (scores.length === 0) {
    return <div className="flex items-center justify-center h-[350px] text-muted-foreground">No scores yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

