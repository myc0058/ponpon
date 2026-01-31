import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const CONTENTS_DIR = path.join(process.cwd(), 'contents')

// 512x512 리사이징
const TARGET_WIDTH = 512
const TARGET_HEIGHT = 512

async function downloadImage(url: string, destPath: string) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    })
    fs.writeFileSync(destPath, response.data)
}

async function resizeImage(inputPath: string, outputPath: string) {
    try {
        await sharp(inputPath)
            .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover' }) // 꽉 채우기
            .webp({ quality: 80 })
            .toFile(outputPath)
        return true
    } catch (error) {
        console.error(`Error resizing ${inputPath}:`, error)
        return false
    }
}

async function uploadToSupabase(filePath: string, bucket: string, remotePath: string) {
    const fileContent = fs.readFileSync(filePath)
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(remotePath, fileContent, {
            contentType: 'image/webp',
            upsert: true
        })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(remotePath)

    return publicUrlData.publicUrl
}

async function processQuiz(quizSlug: string) {
    const quizDir = path.join(CONTENTS_DIR, quizSlug)
    const jsonPath = path.join(quizDir, 'quiz-data.json')
    const imagesDir = path.join(quizDir, 'images')

    if (!fs.existsSync(quizDir) || !fs.existsSync(jsonPath)) {
        console.error(`Quiz not found: ${quizSlug}`)
        return
    }

    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true })
    }

    const quizData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    let updated = false
    const timestamp = Date.now()

    // 재귀적으로 이미지 URL 탐색 및 처리
    async function traverseAndProcess(obj: any) {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                await traverseAndProcess(obj[key])
            } else if ((key === 'imageUrl' || key.endsWith('Url')) && typeof obj[key] === 'string') {
                const url = obj[key]

                // 이미지 파일명 추출 (URL에서)
                // 예: .../main-cover.webp -> main-cover.webp
                // 기존 URL이 없거나 유효하지 않으면 패스
                if (!url.startsWith('http')) continue;

                const urlObj = new URL(url)
                const filename = path.basename(urlObj.pathname)

                // 로컬 파일 경로
                const localOriginalPath = path.join(imagesDir, filename)
                const localResizedPath = path.join(imagesDir, filename.replace(/\.[^.]+$/, '.webp')) // 확장자 webp 강제

                // 1. 이미지가 로컬에 없으면 다운로드
                if (!fs.existsSync(localOriginalPath) && !fs.existsSync(localResizedPath)) {
                    console.log(`Downloading: ${url}`)
                    try {
                        await downloadImage(url, localOriginalPath)
                    } catch (e) {
                        console.error(`Failed to download ${url}`, e)
                        continue
                    }
                }

                // 다운로드 받은 파일 또는 기존 파일 사용
                const sourcePath = fs.existsSync(localResizedPath) ? localResizedPath : localOriginalPath

                // 2. 리사이징 (512x512)
                console.log(`Resizing: ${filename} -> 512x512`)
                // 임시 파일로 저장 후 덮어쓰기
                const tempPath = path.join(imagesDir, `temp_${filename.replace(/\.[^.]+$/, '.webp')}`)
                const success = await resizeImage(sourcePath, tempPath)

                if (success) {
                    fs.renameSync(tempPath, localResizedPath)
                    // 원본이 webp가 아니었으면 삭제 (선택사항, 여기선 일단 둠)
                } else {
                    continue
                }

                // 3. Supabase 업로드
                const remotePath = `${quizSlug}/${path.basename(localResizedPath)}`
                console.log(`Uploading: ${remotePath}`)
                const publicUrl = await uploadToSupabase(localResizedPath, 'quiz-images', remotePath)

                // 4. URL 업데이트 (캐시 버스팅 추가)
                const newUrl = `${publicUrl}?v=${timestamp}`
                if (obj[key] !== newUrl) {
                    obj[key] = newUrl
                    updated = true
                    console.log(`Updated URL: ${newUrl}`)
                }
            }
        }
    }

    await traverseAndProcess(quizData)

    if (updated) {
        fs.writeFileSync(jsonPath, JSON.stringify(quizData, null, 2))
        console.log(`Saved updated quiz-data.json for ${quizSlug}`)
    } else {
        console.log(`No changes made to quiz-data.json for ${quizSlug}`)
    }
}

const targetQuiz = process.argv[2]
if (!targetQuiz) {
    console.error('Please provide a quiz slug')
    process.exit(1)
}

processQuiz(targetQuiz)
