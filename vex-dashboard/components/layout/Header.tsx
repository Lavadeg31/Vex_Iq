'use client'

import { MainNav } from "@/components/layout/MainNav"
import { UserNav } from "@/components/layout/UserNav"

export function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  )
} 