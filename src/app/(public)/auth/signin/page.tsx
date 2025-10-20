import Link from "next/link"
import { LoginForm } from "../../../../components/Auth/LoginForm"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-4xl gap-8 rounded-3xl border border-border/60 bg-background/80 p-10 shadow-lg md:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Willkommen zurück
            </span>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Schön, dass du wieder da bist!
            </h1>
            <p className="text-sm text-muted-foreground">
              Melde dich an, um deine privaten Chats, Familiengruppen oder Projekt-Kanäle zu öffnen.
            </p>
            <div className="rounded-2xl border border-border/50 bg-background p-4 text-sm text-muted-foreground">
              Dein Look, dein Chat: Sobald Theme-Einstellungen aktiv sind, kannst du die Farben mit nur
              einem Klick wechseln.
            </div>
          </section>

          <section className="space-y-6 rounded-2xl border border-border/70 bg-background/90 p-6 shadow-sm">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-xl font-semibold">Login</h2>
              <p className="text-sm text-muted-foreground">Gib deine Zugangsdaten ein.</p>
            </div>
            <LoginForm />
            <p className="text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link className="font-medium text-foreground transition-colors hover:text-[var(--accent-color)]" href="/auth/signup">
                Jetzt registrieren
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
