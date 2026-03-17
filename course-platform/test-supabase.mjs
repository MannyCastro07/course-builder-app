import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODY4NjcsImV4cCI6MjA4OTI2Mjg2N30.YXOtRG0epERiMS3lJnSxr0T4EM5ze8QqFfwgQenfzqk'
)

// Test 1: Check connection
console.log('Test 1: Connection...')
const { data: { user }, error: authError } = await supabase.auth.getUser()
console.log('Auth:', authError ? 'FAIL: ' + authError.message : 'OK (no user)')

// Test 2: Check courses table exists and is readable
console.log('\nTest 2: Courses table...')
const { data: courses, error: coursesError } = await supabase
  .from('courses')
  .select('*')
  .limit(1)
console.log('Courses:', coursesError ? 'FAIL: ' + coursesError.message : 'OK (found ' + (courses?.length || 0) + ' rows)')

// Test 3: Check schema
console.log('\nTest 3: Schema check...')
const { data: schema, error: schemaError } = await supabase
  .from('courses')
  .select('id, title, slug, description, status, access, price, instructor_id, created_at')
  .limit(1)
console.log('Schema:', schemaError ? 'FAIL: ' + schemaError.message : 'OK')

// Summary
console.log('\n=== SUMMARY ===')
console.log('Connection:', !authError ? '✅' : '❌')
console.log('Courses table:', !coursesError ? '✅' : '❌')
console.log('Schema:', !schemaError ? '✅' : '❌')
