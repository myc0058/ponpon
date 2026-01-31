
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync, mkdirSync } from 'fs'
import path from 'path'
import axios from 'axios'

const CONTENTS_DIR = path.resolve(process.cwd(), 'contents')

async function downloadFile(url: string, dest: string) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })

        return new Promise((resolve, reject) => {
            const writer = require('fs').createWriteStream(dest)
            response.data.pipe(writer)
            writer.on('finish', resolve)
            writer.on('error', reject)
        })
    } catch (err: any) {
        console.error(`Failed to download ${url}: ${err.message}`)
    }
}

async function processQuiz(quizDir: string) {
    const jsonPath = path.join(quizDir, 'quiz-data.json')
    if (!existsSync(jsonPath)) return

    const imagesDir = path.join(quizDir, 'images')
    if (!existsSync(imagesDir)) {
        mkdirSync(imagesDir, { recursive: true })
    }

    const quizData = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const urls: Set<string> = new Set()

    // Helper to find all imageUrls
    function findUrls(obj: any) {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                findUrls(obj[key])
            } else if (key === 'imageUrl' && typeof obj[key] === 'string' && obj[key].startsWith('http')) {
                urls.add(obj[key])
            }
        }
    }

    findUrls(quizData)

    console.log(`\n🚀 Processing: ${path.basename(quizDir)} (${urls.size} images)`)

    for (const urlWithVersion of urls) {
        // Remove version query param
        const url = urlWithVersion.split('?')[0]
        const filename = path.basename(url)
        if (!filename.endsWith('.webp')) continue

        const dest = path.join(imagesDir, filename)
        process.stdout.write(`  ⬇️ Downloading ${filename}... `)
        await downloadFile(urlWithVersion, dest)
        process.stdout.write(`Done.\n`)
    }

    // Clean up PNGs
    if (existsSync(imagesDir)) {
        const files = readdirSync(imagesDir)
        for (const file of files) {
            if (file.toLowerCase().endsWith('.png')) {
                console.log(`  🗑️ Deleting ${file}`)
                unlinkSync(path.join(imagesDir, file))
            }
        }
    }
}

async function main() {
    const items = readdirSync(CONTENTS_DIR)
    for (const item of items) {
        const itemPath = path.join(CONTENTS_DIR, item)
        if (require('fs').statSync(itemPath).isDirectory() && item !== 'games') {
            await processQuiz(itemPath)
        }
    }
    console.log('\n✅ All quizzes synchronized to WebP.')
}

main().catch(console.error)
