import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const questionImages = [
    {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-01.jpg', // Mirror/reflection
        description: 'Q1: Elevator mirror'
    },
    {
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-02.jpg', // Friends gathering
        description: 'Q2: Reunion'
    },
    {
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-03.jpg', // Person looking at camera
        description: 'Q3: Appearance change'
    },
    {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-04.jpg', // Concert/event audience
        description: 'Q4: Stage event'
    },
    {
        url: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-05.jpg', // Phone with notifications
        description: 'Q5: Group chat'
    },
    {
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-06.jpg', // Hair salon
        description: 'Q6: Friend haircut'
    },
    {
        url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-07.jpg', // Broken cup/dishes
        description: 'Q7: Broken cup'
    },
    {
        url: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-08.jpg', // Phone texting/romance
        description: 'Q8: Crush texting'
    },
    {
        url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-09.jpg', // Movie theater
        description: 'Q9: Sad movie'
    },
    {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        name: 'question-10.jpg', // Contemplation/solitude
        description: 'Q10: Being disliked'
    }
]

async function migrateQuestionImages() {
    console.log('Starting question image migration...\n')
    const urlMapping: Record<string, string> = {}

    for (const image of questionImages) {
        try {
            console.log(`Downloading: ${image.description}`)
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

            urlMapping[image.name] = publicUrlData.publicUrl
            console.log(`✓ Uploaded: ${publicUrlData.publicUrl}\n`)

        } catch (error) {
            console.error(`✗ Failed to migrate ${image.name}:`, error)
        }
    }

    console.log('\n=== URL Mapping ===')
    console.log(JSON.stringify(urlMapping, null, 2))

    return urlMapping
}

migrateQuestionImages()
    .then(() => {
        console.log('\n✓ Migration complete!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Migration failed:', error)
        process.exit(1)
    })
