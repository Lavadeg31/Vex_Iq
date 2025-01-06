'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Plus, Minus } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { useStatsContext } from '@/contexts/StatsContext'
import { useRouter } from 'next/navigation'

const calculateScore = (balls: number, switches: number, passes: number, mode: 'teamwork' | 'skills'): [number, boolean] => {
  let score = 0
  const matchType = mode === 'teamwork' ? 0 : 1

  // Adjust passes based on rules
  let adjustedPasses = passes
  if (switches === 0 && passes > 4 && matchType === 0) {
    adjustedPasses = 4
  } else if (passes > balls && matchType === 0 && switches !== 0) {
    adjustedPasses = balls
  }

  const switchKey = [1, 4, 8, 10, 12, 12, 12, 12, 12]
  const scoreKey = matchType === 0 
    ? [1, 1, switchKey[switches]] 
    : [switchKey[switches], 1, 0]

  const matchData = [balls, switches, adjustedPasses]
  
  // Calculate total score
  for (let i = 0; i < 3; i++) {
    score += matchData[i] * scoreKey[i]
  }

  // Check if score is invalid
  const isInvalid = Math.min(...matchData) < 0 || matchData[1] > 4

  return [score, isInvalid]
}

export function ScoreCalculator() {
  const { toast } = useToast()
  const { refreshStats } = useStatsContext()
  const router = useRouter()
  const [mode, setMode] = useState<'teamwork' | 'skills'>('teamwork')
  const [balls, setBalls] = useState(0)
  const [switches, setSwitches] = useState(0)
  const [passes, setPasses] = useState(0)
  const [score, setScore] = useState(0)
  const [scoreInvalid, setScoreInvalid] = useState(false)

  useEffect(() => {
    const [newScore, isInvalid] = calculateScore(balls, switches, passes, mode)
    setScore(newScore)
    setScoreInvalid(isInvalid)
  }, [balls, switches, passes, mode])

  const adjustValue = useCallback((setter: React.Dispatch<React.SetStateAction<number>>, change: number) => {
    setter(prev => {
      const newValue = Math.max(0, prev + change)
      return setter === setSwitches ? Math.min(4, newValue) : newValue
    })
  }, [])

  const handleSaveScore = async () => {
    if (!scoreInvalid) {
      try {
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score,
            balls,
            switches,
            passes,
            mode
          })
        })

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to save score')
        }

        // Reset form first
        setBalls(0)
        setSwitches(0)
        setPasses(0)

        // Force refresh stats and wait for it
        await fetch('/api/stats', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        refreshStats()

        toast({
          title: "Score saved",
          description: `Your score of ${score} has been saved.`
        })
      } catch (error) {
        console.error('Error saving score:', error)
        toast({
          title: "Error",
          description: "Failed to save score",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Calculator</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="mode"
            checked={mode === 'skills'}
            onCheckedChange={(checked) => setMode(checked ? 'skills' : 'teamwork')}
          />
          <Label htmlFor="mode">Skills Mode</Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Yellow Balls</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setBalls, -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={balls}
                onChange={(e) => setBalls(Math.max(0, parseInt(e.target.value) || 0))}
                className="text-center"
                id="goals-display"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setBalls, 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Switches</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setSwitches, -1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={switches}
                onChange={(e) => setSwitches(Math.min(4, Math.max(0, parseInt(e.target.value) || 0)))}
                className="text-center"
                id="switches-display"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustValue(setSwitches, 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {mode === 'teamwork' && (
            <div className="grid gap-2" id="passes-group">
              <Label>Passes</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue(setPasses, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={passes}
                  onChange={(e) => setPasses(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-center"
                  id="passes-display"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue(setPasses, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold">Total Score</div>
            <div 
              className={`text-4xl font-bold ${scoreInvalid ? 'text-destructive' : 'text-primary'}`}
              id="result"
            >
              {scoreInvalid ? `Illegal Score: ${score}` : `Total Points: ${score}`}
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleSaveScore}
            disabled={scoreInvalid}
          >
            Save Score
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

