
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'

const CONTENTS_DIR = path.resolve(process.cwd(), 'contents')

function removeImagePrompts(obj: any) {
    if (typeof obj !== 'object' || obj === null) return

    if (Array.isArray(obj)) {
        obj.forEach(removeImagePrompts)
    } else {
        delete obj.imagePrompt
        for (const key in obj) {
            removeImagePrompts(obj[key])
        }
    }
}

function processQuiz(quizDir: string) {
    const jsonPath = path.join(quizDir, 'quiz-data.json')
    if (!existsSync(jsonPath)) return

    console.log(`🧹 Cleaning up: ${path.basename(quizDir)}`)

    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    removeImagePrompts(data)

    writeFileSync(jsonPath, JSON.stringify(data, null, 2))
}

function main() {
    const items = readdirSync(CONTENTS_DIR)
    for (const item of items) {
        const itemPath = path.join(CONTENTS_DIR, item)
        if (require('fs').statSync(itemPath).isDirectory() && item !== 'games') {
            processQuiz(itemPath)
        }
    }
    console.log('\n✅ All imagePrompt fields removed.')
}

main()
