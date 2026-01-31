
import 'dotenv/config'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import axios from 'axios'

/**
 * NanoBanana Asset Generation Script (Antigravity + AI Studio Fallback)
 * 
 * This script automates the generation of quiz images.
 * Strategy:
 * 1. If GOOGLE_AI_STUDIO_KEY is present, it can attempt to use Gemini API (Imagen 3) directly.
 * 2. Otherwise, it outputs [ACTION] tags for the Antigravity agent to handle manually.
 */

const args = process.argv.slice(2)
const topicArg = args.find(arg => arg.startsWith('--topic='))
const useAiStudio = args.includes('--use-ai-studio')

if (!topicArg) {
    console.error('Usage: npx tsx scripts/generate-nanobanana-assets.ts --topic=your-topic-slug [--use-ai-studio]')
    process.exit(1)
}

const topic = topicArg.split('=')[1]
const dirPath = path.resolve(process.cwd(), 'contents', topic)
const jsonPath = path.join(dirPath, 'quiz-data.json')
const imagesDir = path.join(dirPath, 'images')
const apiKey = process.env.GOOGLE_AI_STUDIO_KEY

async function generateWithAiStudio(prompt: string, filename: string) {
    if (!apiKey) {
        console.error('❌ GOOGLE_AI_STUDIO_KEY not found in .env')
        return false
    }

    console.log(`🎨 Requesting Image from AI Studio: "${prompt}"...`)

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
            const savePath = path.join(imagesDir, filename)
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
    if (!existsSync(jsonPath)) {
        console.error(`JSON file not found: ${jsonPath}`)
        process.exit(1)
    }

    if (!existsSync(imagesDir)) {
        mkdirSync(imagesDir, { recursive: true })
    }

    const content = readFileSync(jsonPath, 'utf-8')
    const quizData = JSON.parse(content)

    console.log(`🚀 Starting NanoBanana asset generation for: ${quizData.title}`)

    const jobs = [
        { prompt: quizData.imagePrompt || quizData.description, filename: 'main-cover.png', label: 'Main Cover' },
        ...quizData.questions.map((q: any) => ({
            prompt: q.imagePrompt || q.content,
            filename: `q${q.order}.png`,
            label: `Question ${q.order}`
        })),
        ...quizData.results.map((r: any) => ({
            prompt: r.imagePrompt || r.description,
            filename: `result-${(r.typeCode || r.title).toLowerCase()}.png`,
            label: `Result ${r.typeCode || r.title}`
        }))
    ]

    for (const job of jobs) {
        const savePath = path.join(imagesDir, job.filename)
        if (existsSync(savePath)) {
            console.log(`\n--- Skipping ${job.label} (already exists) ---`)
            continue
        }

        console.log(`\n--- Processing ${job.label} ---`)
        if (useAiStudio && apiKey) {
            await generateWithAiStudio(job.prompt, job.filename)
            // Note: Since the agent (Antigravity) is the one with the capability to write files 
            // from tool outputs, the script serves as a conductor.
        } else {
            console.log(`[ACTION] generate_image: "${job.prompt}" -> ${job.filename} (Style: NanoBanana)`)
        }

    }

    console.log('\n✅ Pipeline operation logged.')
    if (useAiStudio && apiKey) {
        console.log('💡 AI Studio Key detected. Agent will prioritize using this for generation if internal tools fail.')
    }
}

main().catch(console.error)
