import { readFileSync, writeFileSync, existsSync, readdirSync, lstatSync } from 'fs'
import path from 'path'

function resetJsonPaths(dirPath: string) {
    const items = readdirSync(dirPath)

    for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stats = lstatSync(fullPath)

        if (stats.isDirectory()) {
            resetJsonPaths(fullPath)
        } else if (item === 'quiz-data.json') {
            console.log(`📝 Resetting paths in ${fullPath}...`)
            const content = readFileSync(fullPath, 'utf-8')
            let data = JSON.parse(content)
            let updated = false

            function traverse(obj: any) {
                for (const key in obj) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        traverse(obj[key])
                    } else if (key === 'imageUrl' && typeof obj[key] === 'string') {
                        const val = obj[key]
                        if (val.startsWith('http')) {
                            // Extract just the filename at the end
                            const filename = val.split('/').pop()
                            if (filename) {
                                obj[key] = filename
                                updated = true
                            }
                        }
                    }
                }
            }

            traverse(data)
            if (updated) {
                writeFileSync(fullPath, JSON.stringify(data, null, 2))
                console.log(`✅ Reset paths to local filenames in ${item}`)
            }
        }
    }
}

const contentsDir = path.resolve(process.cwd(), 'contents')
resetJsonPaths(contentsDir)
