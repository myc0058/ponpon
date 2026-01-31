
import { execSync } from 'child_process'

const topics = [
    'ai-work-survival',
    'dopamine-detox-level',
    'companion-object-test',
    'street-fashion-2026',
    'idol-position-test',
    'meme-addiction-test',
    'phone-phobia-test',
    'dating-red-flag',
    'lucky-charm-2026',
    'mars-colonist-role'
]

console.log('🚀 Starting Bulk Generation Pipeline for 10 Trend Quizzes...')

for (const topic of topics) {
    console.log(`\n👉 Starting topic: ${topic}`)
    try {
        // 1. Generate Assets
        console.log(`[1/4] Generating assets for ${topic}...`)
        execSync(`npx tsx scripts/generate-nanobanana-assets.ts --topic=${topic} --use-ai-studio`, { stdio: 'inherit' })

        // 2. Populate Local Paths (JSON update)
        console.log(`[2/4] Populating local paths for ${topic}...`)
        execSync(`npx tsx scripts/populate-local-paths-generic.ts --topic=${topic}`, { stdio: 'inherit' })

        // 3. Upload Assets to Supabase
        console.log(`[3/4] Uploading assets for ${topic}...`)
        execSync(`npx tsx scripts/upload-quiz-assets.ts --dir=contents/${topic}`, { stdio: 'inherit' })

        // 4. Seed Database
        console.log(`[4/4] Seeding database for ${topic}...`)
        execSync(`npx tsx scripts/seed-from-json.ts --file=contents/${topic}/quiz-data.json`, { stdio: 'inherit' })

        console.log(`✅ Fully Completed topic: ${topic}`)
    } catch (error) {
        console.error(`❌ Failed topic: ${topic}`, error)
        // Continue to next topic even if one fails
    }
}

console.log('\n🎉 All 10 topics processed!')
