import 'server-only'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../supabase/types/database.types'

export async function getServerSession() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // Server Components können keine Cookies setzen.
        },
        remove(_name: string, _options: CookieOptions) {
          // Server Components können keine Cookies entfernen.
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}
