'use client'
import Link from 'next/link';
import React from 'react'
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { RiTeamFill } from 'react-icons/ri';

type SidebarShellProps = {
  profileResult: any;
  conversationsResult: any;
  userId: string;
  logoutAction: () => Promise<void>;
}

export default function SidebarShell({ profileResult, conversationsResult, userId, logoutAction }: SidebarShellProps) {

  const displayName = profileResult.data?.display_name ?? 'Du';
  const conversations = (conversationsResult.data ?? [])
    .map((member) => member.conversations)
    .filter((conversation): conversation is NonNullable<typeof conversation> => Boolean(conversation))

  const toggleId = `chat-sidebar-toggle-${userId}`

  const listSection = (
    <>
      <div className="space-y-3 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm shadow-sm focus-within:border-[color:var(--accent-color)]">
          <input
            type="search"
            placeholder="Kontakt oder Channel suchen"
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="w-full rounded-md bg-[color:var(--accent-color)] px-3 py-2 text-sm font-medium text-[color:var(--accent-color-foreground)] shadow-sm transition hover:opacity-90"
        >
          Neuen Chat starten
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
            Noch keine Chats. Starte eine Unterhaltung!
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {conversations.map((conversation) => {
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
