
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'

const CONTENTS_DIR = path.resolve(process.cwd(), 'contents')

function auditQuiz(quizDir: string) {
    const jsonPath = path.join(quizDir, 'quiz-data.json')
    if (!existsSync(jsonPath)) return

    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const missing: string[] = []
    const topic = path.basename(quizDir)

    if (!data.imageUrl) {
        missing.push('Main Quiz Cover')
    }

    if (data.questions) {
        data.questions.forEach((q: any, idx: number) => {
            if (!q.imageUrl) {
                missing.push(`Question ${q.order || idx + 1}`)
            }
        })
    }

    if (data.results) {
        data.results.forEach((r: any, idx: number) => {
            if (!r.imageUrl) {
                missing.push(`Result ${r.typeCode || r.title || idx + 1}`)
            }
        })
    }

    if (missing.length > 0) {
        console.log(`\n❌ [${topic}] Missing imageUrl in:`)
        missing.forEach(m => console.log(`  - ${m}`))
    }
}

function main() {
    const items = readdirSync(CONTENTS_DIR)
    console.log('🧐 Auditing for missing imageUrl fields...\n')
    for (const item of items) {
        const itemPath = path.join(CONTENTS_DIR, item)
        if (require('fs').statSync(itemPath).isDirectory() && item !== 'games') {
            auditQuiz(itemPath)
        }
    }
    console.log('\n✅ Audit complete.')
}

main()
