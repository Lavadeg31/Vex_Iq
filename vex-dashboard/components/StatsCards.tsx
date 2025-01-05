'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useStatsContext } from '@/contexts/StatsContext'

export function StatsCards() {
  const { stats } = useStatsContext()
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestScore}</div>
            <p className="text-xs text-muted-foreground">
              Skills Mode
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teamwork Best</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamworkBest}</div>
            <p className="text-xs text-muted-foreground">
              Teamwork Mode
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Scores</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.averageScore}</div>
                <p className="text-xs text-muted-foreground">Skills</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.teamworkAverage}</div>
                <p className="text-xs text-muted-foreground">Teamwork</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {stats.matchCount} matches
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

