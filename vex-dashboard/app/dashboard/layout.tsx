import { StatsProvider } from '@/contexts/StatsContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StatsProvider>
      {children}
    </StatsProvider>
  )
} 