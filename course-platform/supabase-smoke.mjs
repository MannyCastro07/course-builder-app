import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(url, key)

const { data, error } = await supabase.auth.getSession()
console.log(JSON.stringify({ ok: !error, hasSession: !!data?.session, error: error?.message ?? null }))
