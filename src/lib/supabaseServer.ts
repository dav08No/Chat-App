import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../supabase/types/database.types'

export async function createClientForServer() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          // Server Components können keine Cookies setzen.
        },
        remove() {
          // Server Components können keine Cookies entfernen.
        },
      },
    }
  )
}
