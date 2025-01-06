'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="w-[400px] p-6 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="space-y-4">
              <h3 className="font-semibold">Cookie Consent</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsVisible(false)}>
                  Decline
                </Button>
                <Button onClick={acceptCookies}>
                  Accept
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 