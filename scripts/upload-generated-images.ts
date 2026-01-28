import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const imagesToUpload = [
    {
        localPath: '/home/myc0058/.gemini/antigravity/brain/52668e09-0c68-4487-b48d-d011b1e505ea/result_eh_personality_1769592792538.png',
        remoteName: 'result-eh.jpg'
    },
    {
        localPath: '/home/myc0058/.gemini/antigravity/brain/52668e09-0c68-4487-b48d-d011b1e505ea/result_ih_personality_1769592942860.png',
        remoteName: 'result-ih.jpg'
    }
]

async function uploadGeneratedImages() {
    console.log('Uploading generated images to Supabase...\n')
    const urlMapping: Record<string, string> = {}

    for (const image of imagesToUpload) {
        try {
            console.log(`Reading: ${image.remoteName}`)
            const buffer = readFileSync(image.localPath)

            console.log(`Uploading to Supabase: ${image.remoteName}`)
            const { data, error } = await supabase.storage
                .from('quiz-images')
                .upload(image.remoteName, buffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (error) {
                throw error
            }

            const { data: publicUrlData } = supabase.storage
                .from('quiz-images')
                .getPublicUrl(image.remoteName)

            urlMapping[image.remoteName] = publicUrlData.publicUrl
            console.log(`✓ Uploaded: ${publicUrlData.publicUrl}\n`)

        } catch (error) {
            console.error(`✗ Failed to upload ${image.remoteName}:`, error)
        }
    }

    console.log('\n=== URL Mapping ===')
    console.log(JSON.stringify(urlMapping, null, 2))

    return urlMapping
}

uploadGeneratedImages()
    .then(() => {
        console.log('\n✓ Upload complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Upload failed:', error)
        process.exit(1)
    })
