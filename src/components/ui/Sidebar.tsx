'use server'

import Link from 'next/link'
import { createClientForServer } from '@/lib/supabaseServer'

type SidebarProps = {
  userId: string
}

export default async function Sidebar({ userId }: SidebarProps) {
  const supabase = createClientForServer()

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

  const displayName = profileResult.data?.display_name ?? 'Du'
  const memberships = conversationsResult.data ?? []

  return (
    <aside className="flex h-full w-full flex-col border-border/60 bg-background text-foreground">
      <header className="border-b border-border/60 px-4 py-3">
        <p className="text-sm text-muted-foreground">Angemeldet als</p>
        <p className="text-base font-semibold">{displayName}</p>
      </header>

      <nav className="flex-1 overflow-y-auto">
        {memberships.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
            Noch keine Chats. Starte eine Unterhaltung!
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {memberships.map((member) => {
              const conversation = member.conversations
              if (!conversation) {
                return null
              }

              const label = conversation.title || 'Direkter Chat'

              return (
                <li key={conversation.id}>
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="flex flex-col gap-1 px-4 py-3 text-sm transition hover:bg-muted/60"
                  >
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
