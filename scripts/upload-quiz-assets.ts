
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import mime from 'mime-types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const args = process.argv.slice(2)
const dirArg = args.find(arg => arg.startsWith('--dir='))

if (!dirArg) {
    console.error('Usage: npx tsx scripts/upload-quiz-assets.ts --dir=contents/my-quiz')
    process.exit(1)
}

const dirPath = path.resolve(process.cwd(), dirArg.split('=')[1])
const jsonPath = path.join(dirPath, 'quiz-data.json')
const imagesDir = path.join(dirPath, 'images')

async function uploadFile(filename: string): Promise<string | null> {
    const localFilePath = path.join(imagesDir, filename)
    if (!existsSync(localFilePath)) {
        console.warn(`⚠️ File not found: ${localFilePath}`)
        return null
    }

    const fileBuffer = readFileSync(localFilePath)
    const mimeType = mime.lookup(localFilePath) || 'application/octet-stream'

    // Use a timestamp to avoid caching issues or overwrites if needed, 
    // but for now keeping filename simple or prefixing with quiz slug could be good.
    // Actually, use random string + filename to ensure uniqueness or put in folder.
    // Let's put in 'quiz-assets/{filename}'
    const remotePath = `${path.basename(dirPath)}/${filename}`

    console.log(`Uploading ${filename} to ${remotePath}...`)

    const { error } = await supabase.storage
        .from('quiz-images')
        .upload(remotePath, fileBuffer, {
            contentType: mimeType,
            upsert: true
        })

    if (error) {
        console.error(`Error uploading ${filename}:`, error)
        return null
    }

    const { data } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(remotePath)

    return data.publicUrl
}

async function main() {
    if (!existsSync(jsonPath)) {
        console.error(`JSON file not found: ${jsonPath}`)
        process.exit(1)
    }

    const content = readFileSync(jsonPath, 'utf-8')
    const quizData = JSON.parse(content)
    let updated = false

    // Recursive function to traverse and update objects
    async function traverse(obj: any) {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                await traverse(obj[key])
            } else if (key === 'imageUrl' && typeof obj[key] === 'string') {
                const val = obj[key]
                if (val && !val.startsWith('http')) {
                    // Assume it's a local filename
                    const publicUrl = await uploadFile(val)
                    if (publicUrl) {
                        obj[key] = publicUrl
                        updated = true
                    }
                }
            }
        }
    }

    await traverse(quizData)

    if (updated) {
        writeFileSync(jsonPath, JSON.stringify(quizData, null, 2))
        console.log('✅ quiz-data.json updated with remote URLs.')
    } else {
        console.log('No local images found or uploaded.')
    }
}

main()
