'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Timer() {
  const [time, setTime] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null)
  const [hasCountdown, setHasCountdown] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const countdownRef = useRef<NodeJS.Timeout>()
  const timerAudioRef = useRef<HTMLAudioElement | null>(null)
  const timerAudioNoCountdownRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio elements with preload attribute
    timerAudioRef.current = new Audio('/audio/timer.mp3')
    timerAudioRef.current.preload = 'auto'
    timerAudioNoCountdownRef.current = new Audio('/audio/timer2.mp3')
    timerAudioNoCountdownRef.current.preload = 'auto'

    // Cache the audio files
    if ('caches' in window) {
      caches.open('timer-audio').then(cache => {
        cache.addAll(['/audio/timer.mp3', '/audio/timer2.mp3'])
      }).catch(console.error)
    }

    // Load the audio files
    timerAudioRef.current.load()
    timerAudioNoCountdownRef.current.load()

    return () => {
      stopAndResetAudio()
    }
  }, [])

  const stopAndResetAudio = () => {
    if (timerAudioRef.current) {
      timerAudioRef.current.pause()
      timerAudioRef.current.currentTime = 0
    }
    if (timerAudioNoCountdownRef.current) {
      timerAudioNoCountdownRef.current.pause()
      timerAudioNoCountdownRef.current.currentTime = 0
    }
  }

  const clearAllIntervals = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = undefined
    }
  }

  const startMainTimer = () => {
    clearAllIntervals()
    setIsRunning(true)

    if (!isMuted && !hasCountdown) {
      timerAudioNoCountdownRef.current?.play().catch(console.error)
    }

    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearAllIntervals()
          setIsRunning(false)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const startCountdown = () => {
    clearAllIntervals()
    setCountdownNumber(3)

    if (!isMuted) {
      timerAudioRef.current?.play().catch(console.error)
    }

    countdownRef.current = setInterval(() => {
      setCountdownNumber((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current)
          countdownRef.current = undefined
          setCountdownNumber(null)
          startMainTimer()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const toggleTimer = () => {
    if (!isRunning) {
      if (hasCountdown) {
        startCountdown()
      } else {
        startMainTimer()
      }
    } else {
      // Pause timer
      clearAllIntervals()
      setIsRunning(false)
      stopAndResetAudio()
    }
  }

  const resetTimer = () => {
    clearAllIntervals()
    setIsRunning(false)
    setTime(60)
    setCountdownNumber(null)
    stopAndResetAudio()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Timer</CardTitle>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className={isMuted ? 'text-muted-foreground' : ''}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              checked={hasCountdown}
              onCheckedChange={setHasCountdown}
            />
            <span className="text-sm">Countdown</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            key={countdownNumber ?? time}
            initial={{ scale: 1 }}
            animate={{ 
              scale: (time <= 10 && isRunning) || countdownNumber ? [1, 1.2, 1] : 1,
              color: time <= 10 ? 'hsl(var(--destructive))' : 'currentColor'
            }}
            transition={{ duration: 0.3 }}
            className="text-6xl font-bold tabular-nums"
          >
            {countdownNumber ?? formatTime(time)}
          </motion.div>
          <div className="flex space-x-2">
            <Button
              variant={(isRunning || countdownNumber !== null) ? "destructive" : "default"}
              onClick={toggleTimer}
            >
              {(isRunning || countdownNumber !== null) ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetTimer}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
