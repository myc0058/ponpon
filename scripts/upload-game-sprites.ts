
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { existsSync, readdirSync, lstatSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const baseDir = path.resolve(process.cwd(), 'temp-game-assets', 'sprites')

async function uploadSprite(filePath: string, gameSlug: string, assetName: string): Promise<string | null> {
    const remotePath = `games/sprites/${gameSlug}/${assetName}.webp`

    console.log(`🚀 Uploading sprite: ${gameSlug}/${assetName}...`)

    try {
        const webpBuffer = await sharp(filePath)
            .webp({ quality: 90 })
            .toBuffer()

        const { error } = await supabase.storage
            .from('quiz-images')
            .upload(remotePath, webpBuffer, {
                contentType: 'image/webp',
                upsert: true
            })

        if (error) {
            console.error(`❌ Error uploading ${assetName}:`, error)
            return null
        }

        const { data } = supabase.storage
            .from('quiz-images')
            .getPublicUrl(remotePath)

        return `${data.publicUrl}?v=${Date.now()}`
    } catch (err) {
        console.error(`❌ Error processing ${assetName}:`, err)
        return null
    }
}

async function main() {
    if (!existsSync(baseDir)) return

    const gameDirs = readdirSync(baseDir)
    for (const gameSlug of gameDirs) {
        const gameDirPath = path.join(baseDir, gameSlug)
        if (!lstatSync(gameDirPath).isDirectory()) continue

        const spriteFiles = readdirSync(gameDirPath)
        for (const spriteFile of spriteFiles) {
            const assetName = path.parse(spriteFile).name
            const fullPath = path.join(gameDirPath, spriteFile)
            const url = await uploadSprite(fullPath, gameSlug, assetName)
            if (url) {
                console.log(`✅ ${gameSlug}/${assetName}: ${url}`)
            }
        }
    }
}

main().catch(console.error)
