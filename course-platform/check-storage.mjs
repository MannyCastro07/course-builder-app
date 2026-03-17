import { createClient } from '@supabase/supabase-js'

const url = 'https://mtuypilvdzycfckhcufn.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10dXlwaWx2ZHp5Y2Zja2hjdWZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4Njg2NywiZXhwIjoyMDg5MjYyODY3fQ.L7s4WciD9xjRDnndcYabJFAGK0EKLdkdiGA1wMIrfIw'

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const bucketName = 'course-content'
const filePath = `test/test-${Date.now()}.txt`

const result = {
  bucketName,
  existed: false,
  created: false,
  public: null,
  fileSizeLimit: null,
  uploadSuccess: false,
  publicReadSuccess: false,
  publicUrl: null,
  errors: []
}

const { data: buckets, error: listError } = await supabase.storage.listBuckets()
if (listError) {
  result.errors.push(`listBuckets: ${listError.message}`)
  console.error(JSON.stringify(result, null, 2))
  process.exit(1)
}

let bucket = buckets.find(b => b.name === bucketName)
if (bucket) {
  result.existed = true
} else {
  const { data: created, error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 500 * 1024 * 1024
  })
  if (createError) {
    result.errors.push(`createBucket: ${createError.message}`)
    console.error(JSON.stringify(result, null, 2))
    process.exit(1)
  }
  result.created = true
  bucket = created
}

const { data: bucketInfo, error: getBucketError } = await supabase.storage.getBucket(bucketName)
if (getBucketError) {
  result.errors.push(`getBucket: ${getBucketError.message}`)
} else {
  result.public = bucketInfo.public
  result.fileSizeLimit = bucketInfo.file_size_limit ?? bucketInfo.fileSizeLimit ?? null
}

const payload = new Blob(['test'], { type: 'text/plain' })
const { error: uploadError } = await supabase.storage
  .from(bucketName)
  .upload(filePath, payload, { contentType: 'text/plain', upsert: true })

if (uploadError) {
  result.errors.push(`upload: ${uploadError.message}`)
} else {
  result.uploadSuccess = true
}

const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(filePath)
result.publicUrl = publicData.publicUrl

try {
  const response = await fetch(publicData.publicUrl)
  const text = await response.text()
  result.publicReadSuccess = response.ok && text === 'test'
  if (!response.ok) {
    result.errors.push(`publicFetch: HTTP ${response.status}`)
  } else if (text !== 'test') {
    result.errors.push(`publicFetch: unexpected body ${JSON.stringify(text)}`)
  }
} catch (err) {
  result.errors.push(`publicFetch: ${err.message}`)
}

console.log(JSON.stringify(result, null, 2))

if (!result.uploadSuccess || !result.publicReadSuccess || result.public !== true) {
  process.exit(2)
}
