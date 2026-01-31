
import 'dotenv/config'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import axios from 'axios'

const apiKey = process.env.GOOGLE_AI_STUDIO_KEY
const outputDir = path.resolve(process.cwd(), 'temp-game-assets', 'thumbnails')

if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
}

const jobs = [
    { slug: '3d-cube-runner', prompt: 'Vaporwave style 3D landscape in 8-bit pixel art, glowing neon cubes, synthwave aesthetic, square aspect ratio.' },
    { slug: 'math-quickie', prompt: '8-bit pixel art of a blackboard with mathematical equations and a timer, competitive academic vibe, square aspect ratio.' },
    { slug: 'higher-or-lower', prompt: '8-bit pixel art of playing cards with up and down arrow icons, gambling style game art, square aspect ratio.' },
    { slug: 'card-solitaire', prompt: '8-bit pixel art of traditional mahjong tiles stacked in patterns, wooden table background, square aspect ratio.' },
    { slug: 'connect-four', prompt: '8-bit pixel art of a vertical blue board with red and yellow tokens, classic family board game, square aspect ratio.' },
    { slug: 'piano-tiles', prompt: '8-bit pixel art of piano keys in motion, musical notes appearing, dark neon rhythm aesthetic, square aspect ratio.' },
    { slug: 'bubble-shooter', prompt: '8-bit pixel art of colorful bubbles clustered together, a cannon aiming upward, vibrant arcade colors, square aspect ratio.' },
    { slug: 'slingshot-attack', prompt: '8-bit pixel art of a large wooden slingshot, aiming at a fortress, physics-based game art style, square aspect ratio.' },
    { slug: 'jump-jump', prompt: '8-bit pixel art of a cute slime jumping up on clouds, bright sky background, endless jumper game aesthetic, square aspect ratio.' },
    { slug: 'memory-sound', prompt: '8-bit pixel art of colorful musical notes glowing in sequence, rhythm and memory game theme, square aspect ratio.' },
    { slug: 'maze-escape', prompt: '8-bit pixel art of a stone maze from top-view, a small adventurer holding a torch, square aspect ratio.' },
    { slug: 'color-flood', prompt: 'Abstract pixel art of a color grid shifting from one color to another, satisfying puzzle game art, square aspect ratio.' },
    { slug: 'galaxy-defender', prompt: '8-bit pixel art of a cool spaceship in deep space, blue engine glow, retro shmup aesthetic, square aspect ratio.' },
    { slug: 'box-tower', prompt: '8-bit pixel art of cardboard boxes stacked high, swinging crane hook, warehouse background, square aspect ratio.' },
    { slug: 'fruit-slicer', prompt: '8-bit pixel art of a watermelon and pineapple sliced in half, juice splashing effects, fast action game, square aspect ratio.' },
    { slug: 'traffic-control', prompt: '8-bit pixel art of a busy city crossroad from top-view, red and yellow cars, management game art, square aspect ratio.' },
    { slug: 'nonogram-logic', prompt: 'Clean grid-based pixel art with numbers on rows and columns, solving a secret picture puzzle, square aspect ratio.' },
];

async function generateWithAiStudio(prompt: string, filename: string) {
    if (!apiKey) {
        console.error('❌ GOOGLE_AI_STUDIO_KEY not found in .env')
        return false
    }

    console.log(`🎨 Requesting Image from AI Studio: "${filename}"...`)

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: `Generate a high quality 512x512 image of: ${prompt}. Return only the image data.` }]
                }]
            }
        )

        const base64Data = response.data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

        if (base64Data) {
            const savePath = path.join(outputDir, filename)
            writeFileSync(savePath, Buffer.from(base64Data, 'base64'))
            console.log(`✅ Saved: ${savePath}`)
            return true
        } else {
            console.error(`❌ No image data in response for ${filename}`)
            return false
        }
    } catch (error: any) {
        console.error(`❌ Error calling AI Studio for ${filename}:`, error.response?.data || error.message)
        return false
    }
}

async function main() {
    for (const job of jobs) {
        const filename = `thumb_${job.slug.replace(/-/g, '_')}.png`
        await generateWithAiStudio(job.prompt, filename)
        // Add a small delay to avoid hitting AI Studio rate limits if any
        await new Promise(r => setTimeout(r, 1000))
    }
}

main().catch(console.error)
