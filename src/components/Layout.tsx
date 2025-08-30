import React from 'react'
import { IPhoneMenu } from '@/components/IPhoneMenu'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100C1F] via-[#0D0A18] to-black">
      <main className="pb-20">
        {children}
      </main>
      <IPhoneMenu />
    </div>
  )
}