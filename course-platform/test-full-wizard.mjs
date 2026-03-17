import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODY4NjcsImV4cCI6MjA4OTI2Mjg2N30.YXOtRG0epERiMS3lJnSxr0T4EM5ze8QqFfwgQenfzqk'
)

const testEmail = 'test' + Date.now() + '@test.com'
const testPassword = 'Test123!'

console.log('Creando usuario de prueba:', testEmail)

const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: {
    data: {
      first_name: 'Test',
      last_name: 'User'
    }
  }
})

if (signUpError) {
  console.log('Error signup:', signUpError.message)
  process.exit(1)
}

console.log('Usuario creado:', signUpData.user?.id)

const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email: testEmail,
  password: testPassword
})

if (loginError) {
  console.log('Error login:', loginError.message)
  process.exit(1)
}

console.log('Login exitoso')
console.log('Session token:', loginData.session?.access_token.slice(0, 30) + '...')

const { data: course, error: courseError } = await supabase
  .from('courses')
  .insert({
    title: 'Curso de Prueba Completo',
    description: 'Descripción de prueba para el wizard',
    slug: 'curso-prueba-' + Date.now(),
    instructor_id: loginData.user.id,
    status: 'published',
    access: 'paid',
    price: 99.99,
    currency: 'USD',
    category: 'Development',
    keywords: 'test, curso, prueba',
    course_page_template: 'default'
  })
  .select()
  .single()

if (courseError) {
  console.log('Error creando curso:', courseError.message)
  process.exit(1)
}

console.log('Curso creado:', course.id)
console.log('Curso slug:', course.slug)

const { data: section, error: sectionError } = await supabase
  .from('sections')
  .insert({
    course_id: course.id,
    title: 'Módulo 1: Introducción',
    order: 1,
    access_status: 'free'
  })
  .select()
  .single()

if (sectionError) {
  console.log('Error creando sección:', sectionError.message)
  process.exit(1)
}

console.log('Sección creada:', section.id)

const { data: lesson1, error: lesson1Error } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: 'Lección 1: Texto enriquecido',
    content: '<h1>Bienvenidos</h1><p>Este es contenido <strong>enriquecido</strong> con texto formateado.</p><ul><li>Item 1</li><li>Item 2</li></ul>',
    type: 'rich_text',
    order: 1,
    is_free: true
  })
  .select()
  .single()

if (lesson1Error) {
  console.log('Error lección 1:', lesson1Error.message)
} else {
  console.log('Lección 1 creada (texto):', lesson1.id)
}

const { data: lesson2, error: lesson2Error } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: 'Lección 2: Video',
    content: 'Video placeholder',
    type: 'video',
    order: 2,
    video_url: 'https://example.com/video.mp4',
    duration: 600,
    is_free: false
  })
  .select()
  .single()

if (lesson2Error) {
  console.log('Error lección 2:', lesson2Error.message)
} else {
  console.log('Lección 2 creada (video):', lesson2.id)
}

const { data: lesson3, error: lesson3Error } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: 'Lección 3: PDF',
    content: 'PDF documento de referencia',
    type: 'pdf',
    order: 3,
    is_free: false
  })
  .select()
  .single()

if (lesson3Error) {
  console.log('Error lección 3:', lesson3Error.message)
} else {
  console.log('Lección 3 creada (PDF):', lesson3.id)
}

const { data: lesson4, error: lesson4Error } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: 'Lección 4: Imágenes',
    content: 'Galería de imágenes del curso',
    type: 'image',
    order: 4,
    is_free: false
  })
  .select()
  .single()

if (lesson4Error) {
  console.log('Error lección 4:', lesson4Error.message)
} else {
  console.log('Lección 4 creada (imagen):', lesson4.id)
}

const { data: fullCourse, error: fetchError } = await supabase
  .from('courses')
  .select('*, sections(*, lessons(*))')
  .eq('id', course.id)
  .single()

if (fetchError) {
  console.log('Error fetching course:', fetchError.message)
} else {
  console.log('\n=== CURSO COMPLETO ===')
  console.log('Título:', fullCourse.title)
  console.log('Slug:', fullCourse.slug)
  console.log('Status:', fullCourse.status)
  console.log('Price:', fullCourse.price)
  console.log('Secciones:', fullCourse.sections?.length || 0)
  
  fullCourse.sections?.forEach((sec, i) => {
    console.log(`\nSección ${i + 1}: ${sec.title}`)
    console.log('  Lecciones:', sec.lessons?.length || 0)
    sec.lessons?.forEach((les, j) => {
      console.log(`    ${j + 1}. [${les.type}] ${les.title}`)
    })
  })
}

console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE')
console.log('URL del curso:', `http://localhost:3000/courses/${course.id}/edit`)
