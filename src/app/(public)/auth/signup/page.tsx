import Link from "next/link"
import { SignUpForm } from "../../../../components/Auth/SignupForm"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-4xl gap-8 rounded-3xl border border-border/60 bg-background/80 p-10 shadow-lg md:grid-cols-[0.9fr_1.1fr]">
          <section className="order-2 space-y-6 md:order-1">
            <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Neu hier?
            </span>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Leg los und erstelle dein Chat-Konto.
            </h1>
            <p className="text-sm text-muted-foreground">
              Verwende Chat App für Familie, Freundeskreis oder kleine Teams. Alles bleibt in einem
              übersichtlichen Verlauf – ganz ohne komplizierte Einrichtung.
            </p>
            <div className="rounded-2xl border border-border/50 bg-background p-4 text-sm text-muted-foreground">
              Unser Theme passt sich über eine einzige Variable an. Du kannst später einfach zwischen
              <code> "lilac"</code>, <code>"ocean"</code> und <code>"sunset"</code> wechseln.
            </div>
          </section>

          <section className="order-1 space-y-6 rounded-2xl border border-border/70 bg-background/90 p-6 shadow-sm md:order-2">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-xl font-semibold">Registrieren</h2>
              <p className="text-sm text-muted-foreground">Fülle die Felder aus und erhalte Zugriff auf deinen Account.</p>
            </div>
            <SignUpForm />
            <p className="text-sm text-muted-foreground">
              Du hast bereits ein Konto?{" "}
              <Link className="font-medium text-foreground transition-colors hover:text-[var(--accent-color)]" href="/auth/signin">
                Zum Login
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
