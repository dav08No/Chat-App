import Link from 'next/link'

export default function ChatEmptyStatePage() {
  return (
    <div className="flex h-full items-center justify-center bg-background text-center text-foreground">
      <div className="mx-auto max-w-md space-y-4 px-6">
        <h1 className="text-2xl font-semibold">Willkommen im Chat</h1>
        <p className="text-sm text-muted-foreground">
          Wähle links eine Unterhaltung aus oder starte einen neuen Chat, um mit Freunden, Familie oder deinem Team zu schreiben.
        </p>
        <p className="text-xs text-muted-foreground">
          Noch keine Chats? <span className="font-medium text-foreground">Lade jemanden ein</span> und bleib in Kontakt!
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-foreground/5"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}
