'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch('/api/admin/check')
        if (!response.ok) {
          throw new Error('Not authorized')
        }
        setIsAdmin(true)
      } catch (error) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive"
        })
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router, toast])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAdmin) {
    return null
  }

  return children
} 