
import 'dotenv/config'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import axios from 'axios'

const apiKey = process.env.GOOGLE_AI_STUDIO_KEY

async function generateWithAiStudio(prompt: string, gameSlug: string, filename: string) {
    if (!apiKey) {
        console.error('❌ GOOGLE_AI_STUDIO_KEY not found in .env')
        return false
    }

    const dirPath = path.resolve(process.cwd(), 'temp-game-assets', 'sprites', gameSlug)
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true })
    }

    const savePath = path.join(dirPath, filename)
    if (existsSync(savePath)) {
        console.log(`\n--- Skipping ${gameSlug}/${filename} (already exists) ---`)
        return true
    }

    console.log(`🎨 Generating ${gameSlug}/${filename}: "${prompt}"...`)

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: `Generate a high quality 512x512 image of: ${prompt}. DO NOT include any text, letters, or numbers in the image. Return only the image data.` }]
                }]
            }
        )

        const base64Data = response.data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

        if (base64Data) {
            writeFileSync(savePath, Buffer.from(base64Data, 'base64'))
            console.log(`✅ Saved: ${savePath}`)
            return true
        } else {
            console.error(`❌ No image data in response for ${filename}`)
            return false
        }
    } catch (error: any) {
        console.error(`❌ Error for ${filename}:`, error.response?.data || error.message)
        return false
    }
}

const jobs = [
    // Batch 6
    { slug: 'galaxy-defender', prompt: '8-bit pixel art cool starship, top view, vibrant colors, centered on white background, game asset', file: 'player.png' },
    { slug: 'galaxy-defender', prompt: '8-bit pixel art menacing alien spaceship, top view, centered on white background, game asset', file: 'enemy.png' },
    { slug: 'galaxy-defender', prompt: '8-bit pixel art deep space background with stars and nebulae, retro game style, game asset', file: 'bg.png' },
    { slug: 'box-tower', prompt: '8-bit pixel art simple cardboard box, centered on white background, game asset', file: 'box.png' },
    { slug: 'box-tower', prompt: '8-bit pixel art city alley background with brick walls, retro game style, game asset', file: 'bg.png' },
    { slug: 'fruit-slicer', prompt: '8-bit pixel art juicy red apple, centered on white background, game asset', file: 'apple.png' },
    { slug: 'fruit-slicer', prompt: '8-bit pixel art bright yellow banana, centered on white background, game asset', file: 'banana.png' },
    { slug: 'fruit-slicer', prompt: '8-bit pixel art dark wooden board texture background, clean and simple, game asset', file: 'bg.png' },
    { slug: 'traffic-control', prompt: '8-bit pixel art red sports car, top view, centered on white background, game asset', file: 'car_red.png' },
    { slug: 'traffic-control', prompt: '8-bit pixel art blue sedan car, top view, centered on white background, game asset', file: 'car_blue.png' },
    { slug: 'traffic-control', prompt: '8-bit pixel art city road intersection background, top view, retro game style, game asset', file: 'intersection.png' },
    { slug: 'nonogram-logic', prompt: '8-bit pixel art solid blue filled square tile, centered on white background, game asset', file: 'tile_filled.png' },
    { slug: 'nonogram-logic', prompt: '8-bit pixel art clean grid paper background, subtle lines, game asset', file: 'bg.png' },
    { slug: 'clicker-hero', prompt: '8-bit pixel art cute green slime monster with big eyes, centered on white background, game asset', file: 'monster.png' },
    { slug: 'clicker-hero', prompt: '8-bit pixel art lush green field background with a distance castle, retro game style, game asset', file: 'bg.png' }
]

async function main() {
    for (const job of jobs) {
        await generateWithAiStudio(job.prompt, job.slug, job.file)
        await new Promise(r => setTimeout(r, 1000))
    }
}

main().catch(console.error)
