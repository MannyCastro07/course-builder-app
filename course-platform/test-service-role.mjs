import { createClient } from '@supabase/supabase-js'

// Usar SERVICE ROLE KEY - bypass RLS automáticamente
const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4Njg2NywiZXhwIjoyMDg5MjYyODY3fQ.L7s4WciD9xjRDnndcYabJFAGK0EKLdkdiGA1wMIrfIw',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const testEmail = 'test' + Date.now() + '@test.com'
const testPassword = 'Test123!'

console.log('=== PRUEBA CON SERVICE ROLE (RLS BYPASSED) ===\n')

// Crear usuario
console.log('1. Creando usuario...')
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: { data: { first_name: 'Test', last_name: 'User' }}
})

if (signUpError) {
  console.log('   ❌ Error:', signUpError.message)
  process.exit(1)
}
console.log('   ✅ Usuario:', signUpData.user?.id)

// Login
console.log('\n2. Login...')
const { data: loginData } = await supabase.auth.signInWithPassword({
  email: testEmail, password: testPassword
})
console.log('   ✅ Logueado')

// Crear curso
console.log('\n3. Creando curso...')
const { data: course, error: ce } = await supabase
  .from('courses')
  .insert({
    title: 'Curso Multimedia Completo',
    description: 'Curso con video, PDF, imágenes y texto',
    slug: 'curso-multimedia-' + Date.now(),
    instructor_id: loginData.user.id,
    status: 'published',
    access: 'paid',
    price: 99.99,
    currency: 'USD',
    category: 'Development',
    keywords: 'multimedia, video, pdf',
    course_page_template: 'default'
  })
  .select()
  .single()

if (ce) {
  console.log('   ❌ Error:', ce.message)
  process.exit(1)
}
console.log('   ✅ Curso:', course.title)

// Crear sección - CON SERVICE ROLE (no debería fallar por RLS)
console.log('\n4. Creando sección...')
const { data: section, error: se } = await supabase
  .from('sections')
  .insert({
    course_id: course.id,
    title: 'Módulo 1: Contenido Multimedia',
    order: 1
  })
  .select()
  .single()

if (se) {
  console.log('   ❌ Error:', se.message)
  console.log('   Detail:', se.details)
  console.log('   Hint:', se.hint)
} else {
  console.log('   ✅ Sección:', section.title)
}

// Crear lecciones
console.log('\n5. Creando lecciones...')

const lessons = [
  { title: '📝 Texto Enriquecido', type: 'rich_text', content: '<h1>Bienvenidos</h1><p>Contenido <strong>formateado</strong></p>', duration: 300, is_free: true },
  { title: '🎬 Video HD', type: 'video', content: 'Video tutorial', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 600, is_free: true },
  { title: '📄 Documento PDF', type: 'pdf', content: 'Material PDF de referencia', duration: 0, is_free: false },
  { title: '🖼️ Galería de Imágenes', type: 'image', content: '<img src="https://picsum.photos/800/400"/>', duration: 180, is_free: false },
  { title: '❓ Quiz Evaluación', type: 'quiz', content: 'Pregunta: ¿Cuál es la respuesta?', duration: 300, is_free: false, completion_rule: 'quiz_pass', completion_percentage: 80 }
]

for (const les of lessons) {
  const { data: lesson, error: le } = await supabase
    .from('lessons')
    .insert({
      course_id: course.id,
      section_id: section?.id || null,
      title: les.title,
      content: les.content,
      type: les.type,
      video_url: les.video_url || null,
      duration: les.duration,
      is_free: les.is_free,
      completion_rule: les.completion_rule || null,
      completion_percentage: les.completion_percentage || null
    })
    .select()
    .single()
  
  if (le) {
    console.log(`   ❌ ${les.title}: ${le.message}`)
  } else {
    console.log(`   ✅ ${les.title}`)
  }
}

// Verificar resultado
console.log('\n6. Verificando curso completo...')
const { data: full } = await supabase
  .from('courses')
  .select('*, sections(*, lessons(*))')
  .eq('id', course.id)
  .single()

console.log('\n📊 RESULTADO:')
console.log('Curso:', full.title)
console.log('Secciones:', full.sections?.length || 0)
let total = 0
full.sections?.forEach(s => {
  console.log(`  📚 ${s.title}: ${s.lessons?.length || 0} lecciones`)
  s.lessons?.forEach(l => {
    total++
    console.log(`    ${l.type === 'video' ? '🎬' : l.type === 'pdf' ? '📄' : l.type === 'image' ? '🖼️' : l.type === 'quiz' ? '❓' : '📝'} ${l.title}`)
  })
})

console.log('\n' + '='.repeat(50))
console.log(`✅ TOTAL: ${total} lecciones creadas`)
console.log('URL:', `http://localhost:3000/courses/${course.id}/edit`)
console.log('Login:', testEmail, '/', testPassword)
