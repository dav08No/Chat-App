import Link from "next/link";

const accentColor = "var(--accent-color)";
const accentForeground = "var(--accent-color-foreground)";

const highlights = [
  {
    title: "Für Familie & Freunde",
    description:
      "Organisiere private Chats, spontane Treffen und tägliche Updates an einem Ort.",
  },
  {
    title: "Gute Laune statt Chaos",
    description:
      "Teile Fotos, To-dos und Sprachnachrichten ohne endlose Gruppen in anderen Apps.",
  },
  {
    title: "Praktisch für kleine Teams",
    description:
      "Nutze Channels für Schule, Verein oder Side-Project – alles übersichtlich in einem Feed.",
  },
  {
    title: "Sofort startklar",
    description:
      "Supabase Auth sorgt für Anmeldung, sichere Sessions und schnelle Synchronisation.",
  },
];

const steps = [
  {
    title: "Registrieren",
    description: "Erstelle dir in wenigen Sekunden einen Account mit deiner E-Mail-Adresse.",
  },
  {
    title: "Bereiche anlegen",
    description: "Starte deinen ersten Kanal für Familie, Freunde oder das nächste Projekt.",
  },
  {
    title: "Einladen & Loslegen",
    description: "Teile den Link mit allen, die dazugehören – und schon kann gechattet werden.",
  },
];

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold shadow-sm"
              style={{ backgroundColor: accentColor, color: accentForeground }}
            >
              CA
            </span>
            <span className="text-base font-semibold">Chat App</span>
          </div>
          <nav className="hidden gap-5 text-sm text-muted-foreground sm:flex">
            <a className="transition-colors hover:text-foreground" href="#features">
              Funktionen
            </a>
            <a className="transition-colors hover:text-foreground" href="#theme">
              Theme
            </a>
            <a className="transition-colors hover:text-foreground" href="#start">
              Start
            </a>
          </nav>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/auth/signin"
              className="rounded-md border border-transparent px-4 py-2 transition-colors hover:border-foreground/20 hover:bg-foreground/5"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md px-4 py-2 shadow-sm transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: accentColor, color: accentForeground }}
            >
              Registrieren
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
        <section className="space-y-6 text-center sm:text-left">
          <span className="inline-block rounded-full bg-foreground/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Für Alltag & Team
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Chat für alle, die in Kontakt bleiben wollen.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:mx-0">
            Egal ob Familie, WG, Sportgruppe oder kleines Projekt – Chat App hält alle Nachrichten
            übersichtlich zusammen und funktioniert auf Handy, Tablet und Desktop.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth/signup"
              className="rounded-md px-5 py-3 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: accentColor, color: accentForeground }}
            >
              Jetzt kostenlos starten
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/5"
            >
              Schon eingeloggt?
            </Link>
          </div>
        </section>

        <section id="features" className="grid gap-6 sm:grid-cols-2">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/70 bg-background/80 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </section>

        <section
          id="theme"
          className="space-y-4 rounded-2xl border border-border/70 bg-background/80 p-8 shadow-sm"
        >
          <h2 className="text-3xl font-semibold">Theme wechseln mit einem Klick</h2>
          <p className="text-sm text-muted-foreground">
            Ändere einfach den Wert der Einstellung <code>DEFAULT_THEME</code><br></br> Zur Auswahl stehen aktuell <code>"lilac"</code>,{" "}
            <code>"ocean"</code> und <code>"sunset"</code>.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background/90 p-4 text-xs text-muted-foreground">
            {`// src/app/layout.tsx
const DEFAULT_THEME = "lilac";`}
          </pre>
          <p className="text-sm text-muted-foreground">
            Später kannst du diesen Wert auch dynamisch setzen – zum Beispiel über eine Einstellung in
            deinem Profil oder direkt aus der Datenbank.
          </p>
        </section>

        <section
          id="start"
          className="space-y-6 rounded-2xl border border-border/60 bg-muted/60 p-8 shadow-sm"
        >
          <h2 className="text-2xl font-semibold">So geht&apos;s los</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-lg bg-background/70 p-4 shadow-sm">
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {currentYear} Chat App</span>
          <div className="flex gap-4">
            <Link className="transition-colors hover:text-foreground" href="/auth/signin">
              Login
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/auth/signup">
              Registrieren
            </Link>
            <a className="transition-colors hover:text-foreground" href="#theme">
              Theme
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
