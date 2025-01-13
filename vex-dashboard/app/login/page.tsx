'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Frame, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LockIcon } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error('Invalid email or password')
          case 404:
            throw new Error('No account found with this email. Please sign up first.')
          case 429:
            throw new Error('Too many attempts. Please try again later.')
          default:
            throw new Error('Failed to sign in. Please try again.')
        }
      }

      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center gap-2">
            <Frame className="h-6 w-6" />
            <span className="text-lg font-bold">VEX IQ Tracker</span>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                Track your VEX IQ Rapid Relay scores and improve your performance with detailed analytics.
              </p>
            </blockquote>
          </div>
        </div>
        <div className="p-4 lg:p-8 h-full w-full">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex items-center gap-2 justify-center lg:hidden mb-8">
              <Frame className="h-8 w-8" />
              <span className="text-xl font-bold">VEX IQ Tracker</span>
            </div>
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email to sign in to your account
              </p>
            </div>
            <div className="grid gap-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                <Button 
                  disabled={isLoading} 
                  className="h-12 text-base"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/register"
                className="underline underline-offset-4 hover:text-primary transition-colors"
              >
                Don't have an account? Sign Up
              </Link>
            </p>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <LockIcon className="inline-block w-4 h-4 mr-2" />
            Your password is never stored and is encrypted in your browser before being sent to the server. We can never see your password or decrypt it.
          </p>
        </div>
      </div>
    </div>
  )
}

