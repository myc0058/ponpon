import { readFileSync, writeFileSync, existsSync, readdirSync, lstatSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

async function optimizeDirectory(dirPath: string) {
    const items = readdirSync(dirPath)

    for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stats = lstatSync(fullPath)

        if (stats.isDirectory()) {
            await optimizeDirectory(fullPath)
        } else if (item === 'quiz-data.json') {
            await optimizeQuizData(fullPath)
        } else if (/\.(png|jpg|jpeg|avif)$/i.test(item)) {
            await convertToWebP(fullPath)
        }
    }
}

async function convertToWebP(filePath: string) {
    const ext = path.extname(filePath)
    const webpPath = filePath.replace(ext, '.webp')

    if (existsSync(webpPath)) {
        console.log(`⏩ Skipping ${path.basename(filePath)} (WebP already exists)`)
        return
    }

    console.log(`🎨 Optimizing ${path.basename(filePath)} to WebP...`)

    try {
        await sharp(filePath)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(webpPath)

        console.log(`✅ Converted to ${path.basename(webpPath)}`)
    } catch (err) {
        console.error(`❌ Error converting ${filePath}:`, err)
    }
}

async function optimizeQuizData(jsonPath: string) {
    console.log(`📝 Updating ${jsonPath}...`)
    try {
        const content = readFileSync(jsonPath, 'utf-8')
        let data = JSON.parse(content)
        let updated = false

        function traverse(obj: any) {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverse(obj[key])
                } else if (typeof obj[key] === 'string' && obj[key].match(/\.(png|jpg|jpeg|avif)$/i)) {
                    // Only update if it's a relative path (local file) or matches our supabase pattern
                    if (!obj[key].startsWith('http') || obj[key].includes('supabase.co')) {
                        obj[key] = obj[key].replace(/\.(png|jpg|jpeg|avif)$/i, '.webp')
                        updated = true
                    }
                }
            }
        }

        traverse(data)

        if (updated) {
            writeFileSync(jsonPath, JSON.stringify(data, null, 2))
            console.log(`✅ Updated JSON references in ${path.basename(jsonPath)}`)
        }
    } catch (err) {
        console.error(`❌ Error updating ${jsonPath}:`, err)
    }
}

async function main() {
    const contentsDir = path.resolve(process.cwd(), 'contents')
    if (!existsSync(contentsDir)) {
        console.error('Contents directory not found')
        return
    }

    console.log('🚀 Starting image optimization for contents...')
    await optimizeDirectory(contentsDir)
    console.log('🏁 Optimization complete!')
}

main()
