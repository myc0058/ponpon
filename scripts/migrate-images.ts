import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const externalImages = [
    {
        url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'quiz-main.jpg'
    },
    {
        url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'result-es.jpg'
    },
    {
        url: 'https://images.unsplash.com/photo-1485290334039-a3c69043e541?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'result-eh.jpg'
    },
    {
        url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'result-is.jpg'
    },
    {
        url: 'https://images.unsplash.com/photo-1534349762913-92499557a627?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'result-ih.jpg'
    }
]

async function migrateImages() {
    console.log('Starting image migration...\n')
    const urlMapping: Record<string, string> = {}

    for (const image of externalImages) {
        try {
            console.log(`Downloading: ${image.name}`)
            const response = await fetch(image.url)

            if (!response.ok) {
                throw new Error(`Failed to download: ${response.statusText}`)
            }

            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            console.log(`Uploading to Supabase: ${image.name}`)
            const { data, error } = await supabase.storage
                .from('quiz-images')
                .upload(image.name, buffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (error) {
                throw error
            }

            const { data: publicUrlData } = supabase.storage
                .from('quiz-images')
                .getPublicUrl(image.name)

            urlMapping[image.url] = publicUrlData.publicUrl
            console.log(`✓ Uploaded: ${publicUrlData.publicUrl}\n`)

        } catch (error) {
            console.error(`✗ Failed to migrate ${image.name}:`, error)
        }
    }

    console.log('\n=== URL Mapping ===')
    console.log(JSON.stringify(urlMapping, null, 2))

    return urlMapping
}

migrateImages()
    .then(() => {
        console.log('\n✓ Migration complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Migration failed:', error)
        process.exit(1)
    })
