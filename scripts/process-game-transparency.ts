import { existsSync, readdirSync, lstatSync, unlinkSync, renameSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const SPRITES_DIR = path.resolve(process.cwd(), 'temp-game-assets', 'sprites')

async function processDirectory(dirPath: string) {
    const items = readdirSync(dirPath)

    for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stats = lstatSync(fullPath)

        if (stats.isDirectory()) {
            await processDirectory(fullPath)
        } else if (item.endsWith('.png')) {
            await makeTransparentFromPng(fullPath)
        }
    }
}

async function makeTransparentFromPng(filePath: string) {
    const webpPath = filePath.replace('.png', '.webp')
    console.log(`🎨 (High-Quality PNG) Processing ${path.basename(filePath)}...`)

    try {
        const input = sharp(filePath).ensureAlpha()
        const { data, info } = await input.raw().toBuffer({ resolveWithObject: true })
        const width = info.width
        const height = info.height
        const stride = 4

        const visited = new Uint8Array(width * height)
        const stack: [number, number][] = []

        // 모서리 및 테두리 중앙에서 시작하여 배경 탐색
        const seeds: [number, number][] = [
            [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
            [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
            [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)]
        ]

        function getBackgroundColorType(r: number, g: number, b: number) {
            // 형광 녹색 (Chroma Key: G가 매우 높음)
            if (g > 150 && g > r && g > b) return 'chroma'
            // 흰색 또는 밝은 회색
            if (r > 240 && g > 240 && b > 240) return 'white'
            return null
        }

        const firstPixelType = getBackgroundColorType(data[0], data[1], data[2])
        console.log(`🔍 Detected background type: ${firstPixelType || 'unknown'}`)

        function isBackgroundColor(r: number, g: number, b: number, type: string | null) {
            if (type === 'chroma') {
                // 초록색 계열 탐지 (그림자 추출을 위해 G가 R, B보다 높으면 허용)
                return g > Math.max(r, b) + 5
            }
            if (type === 'white') {
                return r > 200 && g > 200 && b > 200
            }
            return false
        }

        for (const [sx, sy] of seeds) {
            const idx = sy * width + sx
            const pIdx = idx * stride
            if (!visited[idx] && isBackgroundColor(data[pIdx], data[pIdx + 1], data[pIdx + 2], firstPixelType)) {
                stack.push([sx, sy])
                visited[idx] = 1
            }
        }

        // Flood Fill
        while (stack.length > 0) {
            const [x, y] = stack.pop()!
            const currentIdx = y * width + x
            const pIdx = currentIdx * stride

            // Extract Alpha & De-spill (for semi-transparent shadows/edges)
            const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2]
            if (firstPixelType === 'chroma') {
                const maxRB = Math.max(r, b)
                const surplus = g - maxRB
                // Surplus가 클수록 Alpha는 작아짐 (배경에 가까워짐)
                const alpha = Math.max(0, 255 - surplus)
                data[pIdx + 3] = alpha

                // Color correction: 초록색 기운 제거 (De-spill)
                if (alpha < 255) {
                    data[pIdx + 1] = Math.max(0, data[pIdx + 1] - surplus)
                }
            } else {
                data[pIdx + 3] = 0 // 배경은 완전 투명하게 (흰색 배경용)
            }

            const neighbors: [number, number][] = [
                [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
            ]

            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIdx = ny * width + nx
                    const npIdx = nIdx * stride
                    if (!visited[nIdx] && isBackgroundColor(data[npIdx], data[npIdx + 1], data[npIdx + 2], firstPixelType)) {
                        visited[nIdx] = 1
                        stack.push([nx, ny])
                    }
                }
            }
        }

        // Edge Refinement (Anti-Halo for White Backgrounds)
        if (firstPixelType === 'white') {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x
                    const pIdx = idx * stride

                    if (data[pIdx + 3] > 0) {
                        const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2]

                        if (r > 220 && g > 220 && b > 220) {
                            let hasTransparentNeighbor = false
                            const neighbors: [number, number][] = [
                                [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
                            ]
                            for (const [nx, ny] of neighbors) {
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    if (data[(ny * width + nx) * stride + 3] === 0) {
                                        hasTransparentNeighbor = true
                                        break
                                    }
                                }
                            }
                            if (hasTransparentNeighbor) {
                                data[pIdx + 3] = 0 // 헤일로 제거
                            }
                        }
                    }
                }
            }
        }

        let outputImage = sharp(data, {
            raw: { width, height, channels: 4 }
        })

        // 방향 보정 (Traffic Control 전용)
        if (filePath.includes('traffic-control')) {
            if (filePath.endsWith('car_red.png')) {
                // 새로운 레드카(그림자)는 제 위치(DOWN)에 있음
                console.log('🚗 car_red orientation is correct (DOWN)')
            } else if (filePath.endsWith('car_blue.png')) {
                // 새로운 블루카(그림자)는 반대(UP)를 보고 있으므로 180도 회전
                console.log('🚗 Rotating car_blue 180deg to face DOWN')
                outputImage = outputImage.rotate(180)
            }
        }

        const tempPath = filePath + '.adv.webp'
        await outputImage
            .webp({ quality: 100, lossless: true })
            .toFile(tempPath)

        if (existsSync(webpPath)) {
            unlinkSync(webpPath)
        }
        renameSync(tempPath, webpPath)
        // unlinkSync(filePath) // 사용자 요청: 원본 PNG 보존을 위해 삭제 로직 주석 처리

        console.log(`✅ ${path.basename(webpPath)} created (Original PNG preserved).`)

    } catch (err) {
        console.error(`❌ Error refining ${filePath}:`, err)
    }
}

async function main() {
    if (!existsSync(SPRITES_DIR)) {
        console.error('Sprites directory not found')
        return
    }

    console.log('🚀 Starting advanced transparency processing for sprites...')
    await processDirectory(SPRITES_DIR)
    console.log('🏁 Advanced processing complete!')
}

main().catch(console.error)
