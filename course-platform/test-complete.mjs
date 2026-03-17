import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mtuypilvdzycfckhcufn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODY4NjcsImV4cCI6MjA4OTI2Mjg2N30.YXOtRG0epERiMS3lJnSxr0T4EM5ze8QqFfwgQenfzqk'
)

const testEmail = 'test' + Date.now() + '@test.com'
const testPassword = 'Test123!'

console.log('=== PRUEBA COMPLETA DEL WIZARD ===\n')
console.log('1. Creando usuario de prueba:', testEmail)

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
  console.log('   ❌ Error signup:', signUpError.message)
  process.exit(1)
}

console.log('   ✅ Usuario creado:', signUpData.user?.id)

console.log('\n2. Login...')
const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email: testEmail,
  password: testPassword
})

if (loginError) {
  console.log('   ❌ Error login:', loginError.message)
  process.exit(1)
}

console.log('   ✅ Login exitoso')

console.log('\n3. Creando curso (Wizard Step 1-4)...')
const { data: course, error: courseError } = await supabase
  .from('courses')
  .insert({
    title: 'Curso Completo con Contenido Multimedia',
    description: 'Este curso incluye video, PDF, imágenes y texto enriquecido',
    slug: 'curso-completo-' + Date.now(),
    instructor_id: loginData.user.id,
    status: 'published',
    access: 'paid',
    price: 99.99,
    currency: 'USD',
    category: 'Development',
    keywords: 'video, pdf, imagenes, multimedia, curso',
    course_page_template: 'default'
  })
  .select()
  .single()

if (courseError) {
  console.log('   ❌ Error creando curso:', courseError.message)
  process.exit(1)
}

console.log('   ✅ Curso creado:', course.title)
console.log('      - ID:', course.id)
console.log('      - Slug:', course.slug)
console.log('      - Precio:', course.price, course.currency)

console.log('\n4. Creando sección (Módulo)...')
const { data: section, error: sectionError } = await supabase
  .from('sections')
  .insert({
    course_id: course.id,
    title: 'Módulo 1: Contenido Multimedia',
    order: 1
  })
  .select()
  .single()

if (sectionError) {
  console.log('   ❌ Error creando sección:', sectionError.message)
  process.exit(1)
}

console.log('   ✅ Sección creada:', section.title)

console.log('\n5. Creando lecciones con diferentes tipos de contenido:')

// Lección 1: Texto enriquecido
console.log('\n   5.1 Lección de TEXTO ENRIQUECIDO...')
const { data: lesson1, error: l1e } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: '📝 Lección 1: Introducción al Curso',
    content: '<h1>¡Bienvenidos al Curso!</h1><p>Este es un curso <strong>completo</strong> con contenido multimedia.</p><ul><li>Videos HD</li><li>Documentos PDF</li><li>Imágenes</li><li>Texto formateado</li></ul><p>Empecemos a aprender 🚀</p>',
    type: 'rich_text',
    order: 1,
    is_free: true,
    duration: 300
  })
  .select()
  .single()

if (l1e) console.log('      ❌ Error:', l1e.message)
else console.log('      ✅ Creada:', lesson1.title)

// Lección 2: Video
console.log('\n   5.2 Lección de VIDEO...')
const { data: lesson2, error: l2e } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: '🎬 Lección 2: Video Tutorial',
    content: 'En esta lección veremos un video explicativo detallado.',
    type: 'video',
    order: 2,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    video_source: 'url',
    duration: 600,
    is_free: true
  })
  .select()
  .single()

if (l2e) console.log('      ❌ Error:', l2e.message)
else console.log('      ✅ Creada:', lesson2.title, '(10 min)')

// Lección 3: PDF
console.log('\n   5.3 Lección con PDF...')
const { data: lesson3, error: l3e } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: '📄 Lección 3: Material PDF',
    content: 'Documento PDF de referencia con todo el contenido teórico.',
    type: 'pdf',
    order: 3,
    duration: 0,
    is_free: false
  })
  .select()
  .single()

if (l3e) console.log('      ❌ Error:', l3e.message)
else console.log('      ✅ Creada:', lesson3.title)

// Lección 4: Imagen/Galería
console.log('\n   5.4 Lección con IMÁGENES...')
const { data: lesson4, error: l4e } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: '🖼️ Lección 4: Galería de Imágenes',
    content: '<p>Galería de imágenes ilustrativas:</p><img src="https://picsum.photos/800/400?random=1" alt="Ejemplo 1"/><img src="https://picsum.photos/800/400?random=2" alt="Ejemplo 2"/>',
    type: 'image',
    order: 4,
    duration: 180,
    is_free: false,
    background_image: 'https://picsum.photos/1200/600?random=3'
  })
  .select()
  .single()

if (l4e) console.log('      ❌ Error:', l4e.message)
else console.log('      ✅ Creada:', lesson4.title)

// Lección 5: Quiz/Interactivo (bonus)
console.log('\n   5.5 Lección de QUIZ...')
const { data: lesson5, error: l5e } = await supabase
  .from('lessons')
  .insert({
    course_id: course.id,
    section_id: section.id,
    title: '❓ Lección 5: Quiz de Evaluación',
    content: 'Pregunta 1: ¿Cuál es la respuesta correcta?\nA) Opción A\nB) Opción B\nC) Opción C',
    type: 'quiz',
    order: 5,
    duration: 300,
    is_free: false,
    completion_rule: 'quiz_pass',
    completion_percentage: 80
  })
  .select()
  .single()

if (l5e) console.log('      ❌ Error:', l5e.message)
else console.log('      ✅ Creada:', lesson5.title)

console.log('\n6. Verificando curso completo...')
const { data: fullCourse, error: fetchError } = await supabase
  .from('courses')
  .select('*, sections(*, lessons(*))')
  .eq('id', course.id)
  .single()

if (fetchError) {
  console.log('   ❌ Error:', fetchError.message)
} else {
  console.log('   ✅ Curso verificado')
  console.log('\n   📊 RESUMEN DEL CURSO:')
  console.log('   ──────────────────────────────────')
  console.log('   Título:', fullCourse.title)
  console.log('   Slug:', fullCourse.slug)
  console.log('   Status:', fullCourse.status)
  console.log('   Access:', fullCourse.access)
  console.log('   Precio:', fullCourse.price, fullCourse.currency)
  console.log('   Categoría:', fullCourse.category)
  console.log('   Secciones:', fullCourse.sections?.length || 0)
  
  let totalLessons = 0
  fullCourse.sections?.forEach((sec, i) => {
    console.log(`\n   📚 ${sec.title}`)
    sec.lessons?.forEach((les, j) => {
      totalLessons++
      const icon = les.type === 'video' ? '🎬' : 
                   les.type === 'pdf' ? '📄' : 
                   les.type === 'image' ? '🖼️' : 
                   les.type === 'quiz' ? '❓' : '📝'
      const free = les.is_free ? '(GRATIS)' : '(PAGO)'
      console.log(`      ${icon} ${les.title} ${free}`)
    })
  })
  
  console.log('\n   ──────────────────────────────────')
  console.log('   Total de lecciones:', totalLessons)
}

console.log('\n' + '='.repeat(50))
console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE')
console.log('='.repeat(50))
console.log('\n🔗 URLs para acceder:')
console.log('   Login:', 'http://localhost:3000/login')
console.log('   Curso:', `http://localhost:3000/courses/${course.id}/edit`)
console.log('\n👤 Credenciales de prueba:')
console.log('   Email:', testEmail)
console.log('   Password:', testPassword)
