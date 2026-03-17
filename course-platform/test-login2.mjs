import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODY4NjcsImV4cCI6MjA4OTI2Mjg2N30.YXOtRG0epERiMS3lJnSxr0T4EM5ze8QqFfwgQenfzqk'
)

const email = 'manuel@reyeslaw.com'
const password = 'reyeslaw2026$$$'

console.log('Probando login...')

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

if (error) {
  console.log('❌ Login falló:', error.message)
} else {
  console.log('✅ Login exitoso!')
  console.log('User ID:', data.user.id)
  console.log('Token válido')
}
