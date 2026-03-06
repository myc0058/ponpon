
import 'dotenv/config'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import axios from 'axios'

const apiKey = process.env.GOOGLE_AI_STUDIO_KEY
const imagesDir = path.resolve(process.cwd(), 'contents/lucid-dream/images')

async function generate(prompt: string, filename: string) {
    console.log(`🎨 Falling back to AI Studio for: ${filename}`)
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.1-flash-image:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: `Generate a hyper-realistic, surreal 512x512 image of: ${prompt}. Cinematic lighting, 8k, no text.` }]
                }]
            }
        )
        const base64Data = response.data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data
        if (base64Data) {
            writeFileSync(path.join(imagesDir, filename), Buffer.from(base64Data, 'base64'))
            console.log(`✅ Saved: ${filename}`)
        }
    } catch (e: any) {
        console.error(`❌ Failed ${filename}:`, e.message)
    }
}

async function main() {
    if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true })
    await generate("A hand holding a crystal glass with glowing red liquid evaporating into black smoke", "res_poison.png")
    await generate("An absolute pitch-black void with a single tiny fading spark of light in the distance", "res_void.png")
}
main()
