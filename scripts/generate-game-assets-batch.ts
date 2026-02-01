
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
    // Batch 1-C: Board & Puzzle (Chroma Key & Shadows)
    { slug: 'connect-four', prompt: '8-bit pixel art yellow game board for connect four, with empty circular holes, on a pure fluorescent green background (#00FF00), retro game style, clean edges', file: 'board.png' },
    { slug: 'connect-four', prompt: '8-bit pixel art red circular game chip for connect four, on a pure fluorescent green background (#00FF00), with a soft subtle shadow beneath, retro game style, clean edges', file: 'red_chip.png' },
    { slug: 'connect-four', prompt: '8-bit pixel art yellow circular game chip for connect four, on a pure fluorescent green background (#00FF00), with a soft subtle shadow beneath, retro game style, clean edges', file: 'yellow_chip.png' },
    { slug: 'minesweeper', prompt: '8-bit pixel art classic sea mine with spikes for minesweeper, on a pure fluorescent green background (#00FF00), with a soft subtle shadow beneath, retro game style, clean edges', file: 'mine.png' },
    { slug: 'minesweeper', prompt: '8-bit pixel art red military flag for minesweeper, on a pure fluorescent green background (#00FF00), with a soft subtle shadow beneath, retro game style, clean edges', file: 'flag.png' },
    { slug: 'tic-tac-toe', prompt: '8-bit pixel art wooden circle O symbol for tic-tac-toe, on a pure fluorescent green background (#00FF00), retro game style, clean edges, vibrant colors', file: 'o.png' },
    { slug: 'tic-tac-toe', prompt: '8-bit pixel art wooden cross X symbol for tic-tac-toe, on a pure fluorescent green background (#00FF00), retro game style, clean edges, vibrant colors', file: 'x.png' },
    { slug: 'memory-match', prompt: '8-bit pixel art retro game card back with a golden question mark, on a pure fluorescent green background (#00FF00), with a soft subtle shadow beneath, retro game style, clean edges', file: 'back.png' },
    { slug: 'memory-match', prompt: '8-bit pixel art colorful diamond icon for memory card, on a pure fluorescent green background (#00FF00), retro game style, clean edges', file: 'card1.png' },
    { slug: 'memory-match', prompt: '8-bit pixel art colorful star icon for memory card, on a pure fluorescent green background (#00FF00), retro game style, clean edges', file: 'card2.png' },
    { slug: 'memory-match', prompt: '8-bit pixel art colorful heart icon for memory card, on a pure fluorescent green background (#00FF00), retro game style, clean edges', file: 'card3.png' }
]

async function main() {
    for (const job of jobs) {
        await generateWithAiStudio(job.prompt, job.slug, job.file)
        await new Promise(r => setTimeout(r, 1000))
    }
}

main().catch(console.error)
