'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { useStatsContext } from '@/contexts/StatsContext'
import { useRouter } from 'next/navigation'

interface Score {
  id: number
  score: number
  mode: 'skills' | 'teamwork'
  created_at: string
}

export function ScoreHistory() {
  const [scores, setScores] = useState<Score[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { refreshStats } = useStatsContext()
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
        console.log('Fetched scores:', data)
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
  }, [toast, router, refreshStats])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/scores/${id}`, {
        method: 'DELETE',
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to delete score')
      }

      setScores(scores.filter(score => score.id !== id))
      
      await fetch('/api/stats', { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      refreshStats()
      
      toast({
        title: "Score deleted",
        description: "The score has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting score:', error)
      toast({
        title: "Error",
        description: "Failed to delete score. Please try again.",
        variant: "destructive",
      })
    }
    setDeleteId(null)
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading scores...</div>
  }

  if (scores.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No scores yet</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {scores.map((score) => (
              <motion.tr
                key={score.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <TableCell>
                  {new Date(score.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="capitalize">{score.mode}</TableCell>
                <TableCell className="text-right font-medium">
                  {score.score}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(score.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Delete Score
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this score? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

