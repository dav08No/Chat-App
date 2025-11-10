'use client'
import { SupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IoMdCloseCircleOutline } from 'react-icons/io'
import { RiTeamFill } from 'react-icons/ri'
import { supabase } from '@/lib/supabaseClient'
import { ImBin2 } from 'react-icons/im'

type ProfileResult = {
  data: {
    display_name: string | null
  } | null
}

type MemberWithConversation = {
  conversation_id: string
  conversations: {
    id: string
    title: string | null
    is_group: boolean
    created_at: string
  } | null
}

export type ConversationSummary = {
  id: string
  title: string | null
  isGroup: boolean
  createdAt: string
}

export type ProfileSuggestion = {
  id: string
  displayName: string
}

export type SidebarShellProps = {
  profileResult: ProfileResult
  conversationsResult: { data: MemberWithConversation[] | null }
  userId: string
  logoutAction: () => Promise<void>
  startNewConversation: (invitedUserId: string) => Promise<void>
  getUserId: (name: string) => Promise<string | undefined>
  searchProfiles: (query: string) => Promise<ProfileSuggestion[]>
  deleteConversation: (conversationId: string) => Promise<void>
}

function mapConversations(data: MemberWithConversation[] | null): ConversationSummary[] {
  return (data ?? [])
    .map((member) => {
      const c = member.conversations
      return c && {
        id: c.id,
        title: c.title,
        isGroup: c.is_group,
        createdAt: c.created_at,
      }
    })
    .filter((c): c is ConversationSummary => Boolean(c))
}


export default function SidebarShell({
  profileResult,
  conversationsResult,
  userId,
  logoutAction,
  startNewConversation,
  searchProfiles,
  deleteConversation,
}: SidebarShellProps) {

  const [surchName, setSurchName] = useState<string>('');
  const [profileSuggestions, setProfileSuggestions] = useState<ProfileSuggestion[]>([])
  const [isSearchingProfiles, setIsSearchingProfiles] = useState<boolean>(false)
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState<boolean>(false)
  const searchRequestIdRef = useRef(0)
  const [conversations, setConversations] = useState<ConversationSummary[]>(() =>
    mapConversations(conversationsResult.data)
  )

  const normalizedSearchTerm = useMemo(() => surchName.trim().toLowerCase(), [surchName])

  useEffect(() => {
    setConversations(mapConversations(conversationsResult.data))
  }, [conversationsResult.data])

  const filteredConversations: ConversationSummary[] = useMemo(() => {
    if (!normalizedSearchTerm) return conversations
    return conversations.filter((conversation) => {
      const label = conversation.title || 'Direkter Chat'
      return label.toLowerCase().includes(normalizedSearchTerm)
    })
  }, [normalizedSearchTerm, conversations])

  useEffect(() => {
    const channelMembers = supabase
      .channel(`public:sidebar-members-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'members', filter: `user_id=eq.${userId}` },
        async (payload) => {
          const conversationID = payload.new.conversation_id as string

          // Duplikate vermeiden mit prev, nicht mit conversations (stale)
          let already = false
          setConversations((prev) => {
            already = prev.some(c => c.id === conversationID)
            return prev
          })
          if (already) return

          const { data, error } = await supabase
            .from('conversations')
            .select('id, title, is_group, created_at')
            .eq('id', conversationID)
            .maybeSingle()

          if (!error && data) {
            setConversations((prev) => [
              { id: data.id, title: data.title, isGroup: data.is_group, createdAt: data.created_at },
              ...prev,
            ])
          } else if (error) {
            console.error('Fehler beim Abrufen der neuen Konversation:', error)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channelMembers) }
  }, [userId])

  useEffect(() => {
    const channelDeleteConversations = supabase
      .channel(`public:sidebar-conversations-${userId}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'conversations' },
        (payload) => {
          const deletedConversationID = payload.old.id as string
          setConversations((prev) => prev.filter(c => c.id !== deletedConversationID))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channelDeleteConversations) }
  }, [userId])



  useEffect(() => {
    setSearchFeedback(null)
  }, [surchName])

  useEffect(() => {
    const query = surchName.trim()

    if (!query) {
      searchRequestIdRef.current += 1
      setProfileSuggestions([])
      setIsSearchingProfiles(false)
      return
    }

    const currentRequestId = searchRequestIdRef.current + 1
    searchRequestIdRef.current = currentRequestId
    setIsSearchingProfiles(true)

    const timeoutId = setTimeout(() => {
      searchProfiles(query)
        .then((results) => {
          if (searchRequestIdRef.current !== currentRequestId) {
            return
          }
          setProfileSuggestions(results)
        })
        .catch((error) => {
          if (searchRequestIdRef.current !== currentRequestId) {
            return
          }
          console.error('Fehler beim Suchen nach Profilen', error)
          setProfileSuggestions([])
        })
        .finally(() => {
          if (searchRequestIdRef.current !== currentRequestId) {
            return
          }
          setIsSearchingProfiles(false)
        })
    }, 250)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [surchName, searchProfiles])

  const handleStartConversation = async (invitedUserId: string) => {
    if (!invitedUserId) {
      return
    }

    setIsCreatingConversation(true)
    try {
      await startNewConversation(invitedUserId)
      setSurchName('')
      setProfileSuggestions([])
      setSearchFeedback(null)
    } catch (error) {
      console.error('Fehler beim Starten einer Unterhaltung', error)
      setSearchFeedback('Chat konnte nicht gestartet werden.')
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const toggleId = `chat-sidebar-toggle-${userId}`
  const hasActiveSearch = Boolean(surchName.trim())
  const displayName: string = profileResult.data?.display_name ?? 'Du'

  const listSection = (
    <>
      <div className="space-y-3 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm shadow-sm focus-within:border-[color:var(--accent-color)]">
          <input
            type="search"
            placeholder="Kontakt oder Channel suchen"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            value={surchName}
            onChange={(e) => setSurchName(e.target.value)}
          />
        </div>

        {searchFeedback ? (
          <p className="px-1 text-xs text-muted-foreground">{searchFeedback}</p>
        ) : null}
      </div>

      {hasActiveSearch ? (
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Neue Kontakte
          </p>
          {isSearchingProfiles ? (
            <p className="mt-2 text-sm text-muted-foreground">Suche...</p>
          ) : profileSuggestions.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Keine passenden Kontakte gefunden.
            </p>
          ) : (
            <ul className="mt-2 space-y-1">
              {profileSuggestions.map((profile) => (
                <li key={profile.id}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-border px-3 py-2 text-left text-sm transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={() => handleStartConversation(profile.id)}
                    disabled={isCreatingConversation}
                  >
                    {profile.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
            Noch keine Chats. Starte eine Unterhaltung!
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
            Keine passenden Chats gefunden.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {filteredConversations.map((conversation: ConversationSummary) => {
              const label = conversation.title || 'Direkter Chat'

              return (
                <li key={conversation.id}>
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="group flex items-center justify-between gap-2 px-4 py-3 text-sm transition hover:bg-muted/60"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2 text-muted-foreground rounded-lg opacity-70 transition hover:opacity-100 hover:text-red-500 hover:bg-red-100"
                      title="Konversation löschen"
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setConversations(prev => prev.filter(c => c.id !== conversation.id))
                        await deleteConversation(conversation.id)
                      }}
                    >
                      <ImBin2 className="w-4 h-4" />
                    </button>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      <footer className="border-t border-border/60 px-4 py-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted/60"
          >
            Abmelden
          </button>
        </form>
      </footer>
    </>
  )

  return (
    <>
      <aside className="hidden h-full w-full max-w-xs flex-col border-r border-border/60 bg-background text-foreground lg:flex">
        <header className="border-b border-border/60 px-4 py-3">
          <p className="text-sm text-muted-foreground">Angemeldet als</p>
          <p className="text-base font-semibold">{displayName}</p>
        </header>
        {listSection}
      </aside>

      <div className="lg:hidden">
        <input id={toggleId} type="checkbox" className="peer hidden" />

        <div className="flex items-center justify-between border-b border-border/60 bg-background px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Chats</p>
            <p className="text-base font-semibold">{displayName}</p>
          </div>
          <label
            htmlFor={toggleId}
            className="rounded-md border border-border px-2 py-1 text-sm font-medium hover:bg-foreground/5 cursor-pointer"
          >
            <RiTeamFill size={25} />
          </label>
        </div>

        <label
          htmlFor={toggleId}
          className="pointer-events-none fixed inset-0 z-40 hidden bg-black/40 opacity-0 transition peer-checked:pointer-events-auto peer-checked:block peer-checked:opacity-100"
        />

        <aside className="fixed inset-y-0 left-0 z-50 flex w-10/12 max-w-xs -translate-x-full flex-col border-r border-border/60 bg-background text-foreground shadow-xl transition peer-checked:translate-x-0">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Angemeldet als</p>
                <p className="text-base font-semibold">{displayName}</p>
              </div>
              <label
                htmlFor={toggleId}
                className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-foreground/5 cursor-pointer"
              >
                <IoMdCloseCircleOutline size={25} />
              </label>
            </div>
          </div>
          {listSection}
        </aside>
      </div>
    </>
  )
}