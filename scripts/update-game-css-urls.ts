import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'fs'
import path from 'path'

const GAMES_DIR = path.resolve(process.cwd(), 'src', 'app', 'games')
const SUPABASE_BASE_URL = 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/games/sprites/'

async function updateCssFiles(dirPath: string) {
    const items = readdirSync(dirPath)

    for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stats = lstatSync(fullPath)

        if (stats.isDirectory()) {
            await updateCssFiles(fullPath)
        } else if (item.endsWith('.module.css')) {
            await processCssFile(fullPath)
        }
    }
}

async function processCssFile(filePath: string) {
    let content = readFileSync(filePath, 'utf-8')
    let updated = false

    // 정규식 설명: url('...') 또는 url("...") 형식의 기존 Supabase URL 또는 상대 경로 이미지
    // .png, .jpg 등을 .webp로 바꾸고 타임스탬프 업데이트

    const timestamp = Date.now()

    // 1. 기존 .png, .jpg, .webp URL을 .webp로 변경 및 타임스탬프 갱신
    const updatedContent = content.replace(/url\(['"]?([^'"]+)\.(png|jpg|jpeg|webp)(\?v=[^'"]+)?['"]?\)/g, (match, p1, p2) => {
        updated = true
        // 만약 이미 Supabase URL이면 버전만 갱신하거나 경로 유지
        // 여기서는 모든 게임 에셋을 일관된 Supabase 경로로 업데이트하는 것이 안전함
        const fileName = path.basename(p1)
        const gameSlug = path.basename(path.dirname(filePath)) // 파일이 위치한 폴더명 (예: flappy-bird)

        // 특별 처리: 폴더명이 다를 수 있으므로(예: dino vs dino-run) 확인 필요하나 
        // 업로드 스크립트가 사용한 slug를 따라가는 것이 좋음
        // 여기서는 기존 URL 구조를 최대한 보존하면서 확장자와 버전만 변경
        return `url('${p1}.webp?v=${timestamp}')`
    })

    if (updated) {
        writeFileSync(filePath, updatedContent)
        console.log(`✅ Updated ${path.basename(filePath)}`)
    }
}

async function main() {
    console.log('🚀 Updating CSS files with new WebP URLs...')
    await updateCssFiles(GAMES_DIR)
    console.log('🏁 CSS update complete!')
}

main().catch(console.error)
