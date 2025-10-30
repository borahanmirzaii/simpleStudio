import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Generation {
  id: string
  prompt: string
  video_url: string | null
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
  metadata: Record<string, any>
}
