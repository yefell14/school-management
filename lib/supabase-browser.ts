import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

let supabase: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseBrowser = () => {
  if (!supabase) {
    supabase = createClientComponentClient<Database>()
  }
  return supabase
} 