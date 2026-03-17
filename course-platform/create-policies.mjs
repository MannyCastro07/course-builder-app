import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4Njg2NywiZXhwIjoyMDg5MjYyODY3fQ.L7s4WciD9xjRDnndcYabJFAGK0EKLdkdiGA1wMIrfIw'
)

console.log('Intentando crear políticas RLS permisivas...\n')

// Método: Insertar directamente en la tabla pg_policy
const policies = [
  {
    schemaname: 'public',
    tablename: 'sections',
    policyname: 'sections_all_policy',
    permissive: 'PERMISSIVE',
    roles: '{authenticated}',
    cmd: 'ALL',
    qual: 'true',
    with_check: 'true'
  },
  {
    schemaname: 'public',
    tablename: 'lessons',
    policyname: 'lessons_all_policy',
    permissive: 'PERMISSIVE',
    roles: '{authenticated}',
    cmd: 'ALL',
    qual: 'true',
    with_check: 'true'
  }
]

for (const policy of policies) {
  console.log(`Creando política ${policy.policyname}...`)
  
  const { error } = await supabase
    .from('pg_policies')
    .insert(policy)
  
  if (error) {
    console.log(`   ❌ Error: ${error.message}`)
    console.log(`   Code: ${error.code}`)
  } else {
    console.log(`   ✅ Política creada`)
  }
}

console.log('\nVerificando políticas...')
const { data: existing, error: listError } = await supabase
  .from('pg_policies')
  .select('*')
  .in('tablename', ['sections', 'lessons'])

if (listError) {
  console.log('Error listando:', listError.message)
} else {
  console.log(`Políticas encontradas: ${existing?.length || 0}`)
  existing?.forEach(p => {
    console.log(`  - ${p.tablename}: ${p.policyname}`)
  })
}
