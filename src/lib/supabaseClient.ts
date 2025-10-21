'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../supabase/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
