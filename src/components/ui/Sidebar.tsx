'use server'
import React from 'react'
import { redirect } from 'next/navigation'
import { createClientForServer } from '@/lib/supabaseServer'
import SidebarShell from './SidebarShell'

type SidebarProps = {
  userId: string
}

async function logoutAction() {
  'use server'
  const supabase = await createClientForServer()
  await supabase.auth.signOut()
  redirect('/auth/signin')
}

export default async function Sidebar({ userId }: SidebarProps) {
  const supabase = await createClientForServer();

  const [profileResult, conversationsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('members')
      .select('conversation_id, conversations ( id, title, is_group, created_at )')
      .eq('user_id', userId)
      .order('created_at', { foreignTable: 'conversations', ascending: false }),
  ])

  async function startNewConversation(invitedUserId: string) {
    'use server'
    supabase.from('conversations').insert({
      is_group: false,
      members: {
        data: [
          { user_id: userId },
          { user_id: invitedUserId },
        ],
      },
    })
  }

  return <SidebarShell profileResult={profileResult} conversationsResult={conversationsResult} userId={userId} logoutAction={logoutAction} />
}
