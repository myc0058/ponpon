
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)
const prisma = new PrismaClient()

const thumbnailsDir = path.resolve(process.cwd(), 'temp-game-assets', 'thumbnails')

async function uploadThumbnail(filePath: string, slug: string): Promise<string | null> {
    const filename = path.basename(filePath)
    const remotePath = `games/thumbnails/${slug}.webp`

    console.log(`🚀 Optimizing and Uploading ${filename} for ${slug}...`)

    try {
        const webpBuffer = await sharp(filePath)
            .resize(512, 512, { fit: 'cover' })
            .webp({ quality: 85 })
            .toBuffer()

        const { error } = await supabase.storage
            .from('quiz-images') // Reusing existing bucket for simplicity, or we could create a new one
            .upload(remotePath, webpBuffer, {
                contentType: 'image/webp',
                upsert: true
            })

        if (error) {
            console.error(`❌ Error uploading ${filename}:`, error)
            return null
        }

        const { data } = supabase.storage
            .from('quiz-images')
            .getPublicUrl(remotePath)

        return `${data.publicUrl}?v=${Date.now()}`
    } catch (err) {
        console.error(`❌ Error processing ${filename}:`, err)
        return null
    }
}

async function main() {
    if (!existsSync(thumbnailsDir)) {
        console.error(`❌ Thumbnails directory not found: ${thumbnailsDir}`)
        return
    }

    const files = readdirSync(thumbnailsDir)
    console.log(`📂 Found ${files.length} thumbnails to process.`)

    for (const file of files) {
        // Filename format: thumb_slug_name.png
        const slugMatch = file.match(/^thumb_(.+)\.(png|jpg|jpeg|webp)$/)
        if (!slugMatch) continue

        const slug = slugMatch[1].replace(/_/g, '-')
        const fullPath = path.join(thumbnailsDir, file)

        const publicUrl = await uploadThumbnail(fullPath, slug)
        if (publicUrl) {
            await prisma.miniGame.update({
                where: { slug },
                data: { thumbnailUrl: publicUrl }
            }).catch(e => console.error(`❌ DB Update failed for ${slug}:`, e.message))
            console.log(`✅ Updated ${slug} in DB.`)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
