import React from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '../../../lib/getServerSession'
import Sidebar from '../../../components/ui/Sidebar'

type ProtectedChatLayoutProps = {
  children: React.ReactNode
}

export default async function ProtectedChatLayout({ children }: ProtectedChatLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    console.log('No session found, redirecting to /auth/signin');
    redirect('/auth/signin');
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground lg:flex-row">
      <Sidebar userId={session.user.id} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
