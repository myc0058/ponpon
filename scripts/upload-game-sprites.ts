
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { existsSync, readdirSync, lstatSync, readFileSync, unlinkSync } from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const baseDir = path.resolve(process.cwd(), 'temp-game-assets', 'sprites')

async function uploadSprite(filePath: string, gameSlug: string, assetName: string): Promise<string | null> {
    const remotePath = `games/sprites/${gameSlug}/${assetName}.webp`

    console.log(`🚀 Uploading sprite: ${gameSlug}/${assetName}...`)

    try {
        const fileBuffer = readFileSync(filePath)

        const { error } = await supabase.storage
            .from('quiz-images')
            .upload(remotePath, fileBuffer, {
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
        // .webp 파일들만 업로드
        const webpFiles = spriteFiles.filter(f => f.endsWith('.webp'))

        for (const webpFile of webpFiles) {
            const assetName = path.parse(webpFile).name
            const fullPath = path.join(gameDirPath, webpFile)
            const url = await uploadSprite(fullPath, gameSlug, assetName)
            if (url) {
                console.log(`✅ ${gameSlug}/${assetName}: ${url}`)
            }
        }

        // 업로드 후 로컬 PNG 삭제 (사용자 요청: webp 파일만 남기게 해줘)
        for (const file of spriteFiles) {
            if (file.endsWith('.png')) {
                unlinkSync(path.join(gameDirPath, file))
            }
        }
    }
}

main().catch(console.error)
