'use client'

import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export const SignUpForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (!email.trim() || !password.trim() || !name.trim()) {
      setErrorMessage('Bitte Name, E-Mail und Passwort eingeben.')
      setSuccessMessage(null)
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      const userId = data.user?.id
      if (!userId) {
        setErrorMessage('Registrierung fehlgeschlagen.')
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: userId, display_name: name.trim() || null }, { onConflict: 'id' })

      if (profileError) {
        setErrorMessage('Profil konnte nicht gespeichert werden.')
        return
      }

      setSuccessMessage('Registrierung erfolgreich!')
      setName('')
      setEmail('')
      setPassword('')
    } catch (signUpError) {
      setErrorMessage('Registrierung fehlgeschlagen. Bitte erneut versuchen.')
      console.log('Unexpected error signing up:', signUpError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-muted-foreground">Anzeigename</span>
        <input
          id="display-name"
          type="text"
          autoComplete="name"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          value={name}
          className="rounded-md border border-border/80 bg-background px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed"
          disabled={isSubmitting}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-muted-foreground">E-Mail</span>
        <input
          id="signup-email"
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
          id="signup-password"
          type="password"
          autoComplete="new-password"
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
      {successMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
          {successMessage}
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
        {isSubmitting ? 'Registrierung läuft…' : 'Registrieren'}
      </button>
    </form>
  )
}
