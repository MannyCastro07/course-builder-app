import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODY4NjcsImV4cCI6MjA4OTI2Mjg2N30.YXOtRG0epERiMS3lJnSxr0T4EM5ze8QqFfwgQenfzqk'
)

console.log('Obteniendo esquema de tablas...\n')

const { data: courses, error: c1 } = await supabase.from('courses').select('*').limit(1)
if (c1) console.log('Courses error:', c1.message)
else console.log('Courses columns:', Object.keys(courses[0] || {}).join(', '))

const { data: sections, error: s1 } = await supabase.from('sections').select('*').limit(1)
if (s1) console.log('Sections error:', s1.message)
else console.log('Sections columns:', Object.keys(sections[0] || {}).join(', '))

const { data: lessons, error: l1 } = await supabase.from('lessons').select('*').limit(1)
if (l1) console.log('Lessons error:', l1.message)
else console.log('Lessons columns:', Object.keys(lessons[0] || {}).join(', '))
