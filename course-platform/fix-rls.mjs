import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4Njg2NywiZXhwIjoyMDg5MjYyODY3fQ.L7s4WciD9xjRDnndcYabJFAGK0EKLdkdiGA1wMIrfIw'
)

console.log('Creando políticas RLS para sections y lessons...\n')

const policies = [
  // Sections policies
  {
    name: 'sections_select_policy',
    table: 'sections',
    action: 'SELECT',
    sql: `CREATE POLICY "Enable select for all users" ON sections FOR SELECT USING (true);`
  },
  {
    name: 'sections_insert_policy', 
    table: 'sections',
    action: 'INSERT',
    sql: `CREATE POLICY "Enable insert for authenticated users" ON sections FOR INSERT TO authenticated WITH CHECK (true);`
  },
  {
    name: 'sections_update_policy',
    table: 'sections',
    action: 'UPDATE', 
    sql: `CREATE POLICY "Enable update for authenticated users" ON sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
  },
  {
    name: 'sections_delete_policy',
    table: 'sections',
    action: 'DELETE',
    sql: `CREATE POLICY "Enable delete for authenticated users" ON sections FOR DELETE TO authenticated USING (true);`
  },
  // Lessons policies
  {
    name: 'lessons_select_policy',
    table: 'lessons',
    action: 'SELECT',
    sql: `CREATE POLICY "Enable select for all users" ON lessons FOR SELECT USING (true);`
  },
  {
    name: 'lessons_insert_policy',
    table: 'lessons', 
    action: 'INSERT',
    sql: `CREATE POLICY "Enable insert for authenticated users" ON lessons FOR INSERT TO authenticated WITH CHECK (true);`
  },
  {
    name: 'lessons_update_policy',
    table: 'lessons',
    action: 'UPDATE',
    sql: `CREATE POLICY "Enable update for authenticated users" ON lessons FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
  },
  {
    name: 'lessons_delete_policy',
    table: 'lessons',
    action: 'DELETE',
    sql: `CREATE POLICY "Enable delete for authenticated users" ON lessons FOR DELETE TO authenticated USING (true);`
  }
]

for (const policy of policies) {
  console.log(`Creando: ${policy.name}...`)
  const { error } = await supabase.rpc('exec_sql', { sql: policy.sql }).catch(() => {
    // Fallback: try direct SQL execution
    return supabase.from('_sql_query').select('*').eq('query', policy.sql)
  })
  
  if (error) {
    console.log(`   ⚠️  ${policy.name}: ${error.message}`)
  } else {
    console.log(`   ✅ ${policy.name} creada`)
  }
}

console.log('\n✅ Políticas configuradas')
