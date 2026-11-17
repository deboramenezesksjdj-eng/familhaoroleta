import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Variáveis SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas.')
}

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'missing', {
  auth: { persistSession: false },
})

export const REDEMPTIONS_TABLE = 'redemptions'
