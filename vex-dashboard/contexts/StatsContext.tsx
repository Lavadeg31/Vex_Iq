'use client'

import { createContext, useContext, useState } from 'react'
import { useStats } from '@/hooks/useStats'

interface StatsContextType {
  stats: ReturnType<typeof useStats>
  refreshStats: () => void
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const stats = useStats(refreshKey)

  const refreshStats = () => {
    console.log('Refreshing stats with new key:', refreshKey + 1)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <StatsContext.Provider value={{ stats, refreshStats }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStatsContext() {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStatsContext must be used within a StatsProvider')
  }
  return context
} 