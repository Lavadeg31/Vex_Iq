'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface ScoreInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function ScoreInput({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 999 
}: ScoreInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  const handleDecrement = () => {
    if (value > min) onChange(value - 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    if (isNaN(newValue)) return
    if (newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className="space-y-2">
      <motion.label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        initial={false}
        animate={{
          color: isFocused ? 'hsl(var(--primary))' : 'currentColor'
        }}
      >
        {label}
      </motion.label>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="shrink-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="relative flex-1">
          <Input
            type="number"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            min={min}
            max={max}
            className="pr-4 text-center"
          />
          <AnimatePresence>
            {value > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
              >
                pts
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 