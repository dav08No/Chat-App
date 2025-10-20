import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '../../supabase/types/database.types';

export async function getServerSession() {
  const cookieStore = await cookies();

  const serverSupabase = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(_name: string, _value: string, _options: CookieOptions) { },
        remove(_name: string, _options: CookieOptions) { },
      },
    }
  );

  const { data: { session } } = await serverSupabase.auth.getSession();
  return session;
}
