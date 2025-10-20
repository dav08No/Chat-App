import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '../../../lib/getServerSession'
import Sidebar from '../../../components/ui/Sidebar'

type ProtectedChatLayoutProps = {
  children: React.ReactNode
}

export default async function ProtectedChatLayout({ children }: ProtectedChatLayoutProps) {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="hidden w-full max-w-xs border-r border-border/60 bg-background lg:flex">
        <Sidebar userId={session.user.id} />
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
