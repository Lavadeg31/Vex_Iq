'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreCalculator } from '@/components/ScoreCalculator'
import { Timer } from '@/components/Timer'
import { ScoreHistory } from '@/components/ScoreHistory'
import { ScoreChart } from '@/components/ScoreChart'
import { StatsCards } from '@/components/StatsCards'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">Calculator & Timer</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <StatsCards />
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreCalculator />
            <Timer />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Score Progress</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ScoreChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <ScoreHistory />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <StatsCards />
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreCalculator />
            <Timer />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Progress</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ScoreChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreHistory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

