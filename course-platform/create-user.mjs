import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4Njg2NywiZXhwIjoyMDg5MjYyODY3fQ.L7s4WciD9xjRDnndcYabJFAGK0EKLdkdiGA1wMIrfIw'
)

const email = 'manuel@reyeslaw.com'
const password = 'reyeslaw2026$$$'

console.log('Creando usuario...')

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    first_name: 'Manuel',
    last_name: 'Reyes'
  }
})

if (error) {
  console.log('❌ Error:', error.message)
  console.log('Código:', error.code)
} else {
  console.log('✅ Usuario creado:')
  console.log('ID:', data.user.id)
  console.log('Email:', data.user.email)
  console.log('Confirmed:', data.user.email_confirmed_at ? 'Sí' : 'No')
}
