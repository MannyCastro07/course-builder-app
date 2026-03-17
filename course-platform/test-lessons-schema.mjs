import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODY4NjcsImV4cCI6MjA4OTI2Mjg2N30.YXOtRG0epERiMS3lJnSxr0T4EM5ze8QqFfwgQenfzqk'
)

console.log('Checking Lessons table schema...')
const { data, error } = await supabase
  .from('lessons')
  .select('id, video_source, background_image, is_password_protected, completion_rule')
  .limit(1)

if (error) {
  console.log('❌ Error or missing columns:', error.message)
} else {
  console.log('✅ Lessons columns found!')
}
