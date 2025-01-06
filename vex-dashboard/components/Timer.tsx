'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { motion } from 'framer-motion'

export function Timer() {
  const [time, setTime] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [hasCountdown, setHasCountdown] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const countdownRef = useRef<NodeJS.Timeout>()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio elements
    const timerAudio = new Audio('/audio/timer.mp3')    // 1-minute audio with countdown
    const timer2Audio = new Audio('/audio/timer2.mp3')  // 1-minute audio without countdown
    
    // Set up load handlers
    let loadedCount = 0
    const handleLoad = () => {
      loadedCount++
      if (loadedCount === 2) {
        console.log('Both audio files loaded')
        setAudioLoaded(true)
      }
    }

    timerAudio.addEventListener('canplaythrough', handleLoad)
    timer2Audio.addEventListener('canplaythrough', handleLoad)

    // Assign to refs
    audioRef.current = timerAudio          // With countdown
    countdownAudioRef.current = timer2Audio // Without countdown

    return () => {
      timerAudio.removeEventListener('canplaythrough', handleLoad)
      timer2Audio.removeEventListener('canplaythrough', handleLoad)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause()
        countdownAudioRef.current.currentTime = 0
      }
    }
  }, [])

  const startCountdown = () => {
    setCountdownNumber(3)
    
    // Start the countdown audio
    if (!isMuted && audioLoaded) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(console.error)
      }
    }

    // Visual countdown
    const countDown = () => {
      setCountdownNumber(prev => {
        if (prev === null || prev <= 1) {
          setIsRunning(true)
          setCountdownNumber(null)
          return null
        }
        return prev - 1
      })
    }

    // Start countdown timer
    countdownRef.current = setInterval(countDown, 1000)
  }

  useEffect(() => {
    if (isRunning && time === 60 && !hasCountdown) {
      // Start the non-countdown audio immediately
      if (!isMuted && audioLoaded) {
        const audio = countdownAudioRef.current
        if (audio) {
          audio.currentTime = 0
          audio.play().catch(console.error)
        }
      }
    }

    if (isRunning) {
      const interval = setInterval(() => {
        setTime(prevTime => prevTime + 10)
      }, 10)
      return () => clearInterval(interval)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, hasCountdown, isMuted, audioLoaded])

  // Cleanup countdown timer
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  const toggleTimer = () => {
    if (!isRunning) {
      if (hasCountdown) {
        startCountdown()
      } else {
        setIsRunning(true)
      }
    } else {
      setIsRunning(false)
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        setCountdownNumber(null)
      }
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause()
      }
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTime(60)
    setCountdownNumber(null)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    // Reset audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause()
      countdownAudioRef.current.currentTime = 0
    }
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

