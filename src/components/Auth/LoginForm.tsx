'use client'

import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation';

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Bitte E-Mail und Passwort eingeben.')
      return
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message);
        return
      }

      router.push('/chat');
      router.refresh();

    } catch (signInError) {
      setErrorMessage('Login fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-muted-foreground">E-Mail</span>
        <input
          id="email"
          type="email"
          autoComplete="email"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          value={email}
          className="rounded-md border border-border/80 bg-background px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed"
          disabled={isSubmitting}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-muted-foreground">Passwort</span>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          value={password}
          className="rounded-md border border-border/80 bg-background px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed"
          disabled={isSubmitting}
          required
        />
      </label>
      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-100/70 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        className="rounded-md px-4 py-2 text-sm font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: "var(--accent-color)",
          color: "var(--accent-color-foreground)",
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Wird eingeloggt…' : 'Einloggen'}
      </button>
    </form>
  )
}
