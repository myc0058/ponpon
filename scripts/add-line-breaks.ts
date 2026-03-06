/**
 * 셜록 홈즈 quiz-data.json의 질문/옵션/결과 텍스트에 적절한 줄바꿈을 추가하는 스크립트 (V2)
 * 실행: npx tsx scripts/add-line-breaks.ts
 */
import fs from 'fs'
import path from 'path'

const FILE_PATH = path.resolve(process.cwd(), 'contents/sherlock/quiz-data.json')

function addLineBreaks(text: string): string {
    if (!text) return text

    let result = text

    // 1. 마침표/물음표/느낌표로 끝나는 내레이션과 시작하는 대화문(' 또는 ") 사이에 줄바꿈
    result = result.replace(/([.!?])\s+(['"""''])/g, '$1\n$2')

    // 2. 닫는 대화문(' 또는 ")과 그 뒤에 오는 내레이션 사이에 줄바꿈
    result = result.replace(/(['"""''])\s+([가-힣](?!['"""'']))/g, '$1\n$2')

    // 3. 마침표로 끝나는 내레이션 두 문장이 이어질 때, 두 번째 문장이 새 주어나 상황 전환이면 줄바꿈
    // (30자 이상의 문장 뒤에만 적용해서 과도한 줄바꿈 방지)
    result = result.replace(/(.{30,}[.!?])\s+([가-힣A-Z])/g, (match, sentence, nextChar) => {
        // 이미 줄바꿈이 있으면 무시
        if (match.includes('\n')) return match
        return `${sentence}\n${nextChar}`
    })

    // 4. 연속된 줄바꿈 정리 (2개 이상 -> 1개)
    result = result.replace(/\n{2,}/g, '\n')

    return result.trim()
}

async function main() {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    const data = JSON.parse(raw)

    let modifiedQuestions = 0
    let modifiedResults = 0

    data.questions = data.questions.map((q: any) => {
        const newText = addLineBreaks(q.text)
        if (newText !== q.text) modifiedQuestions++
        return {
            ...q,
            text: newText,
            options: q.options.map((opt: any) => ({
                ...opt,
                // 선택지 텍스트는 보통 짧으므로 줄바꿈 추가하지 않음
                text: opt.text
            }))
        }
    })

    data.results = data.results.map((r: any) => {
        const newDesc = addLineBreaks(r.description)
        if (newDesc !== r.description) modifiedResults++
        return {
            ...r,
            description: newDesc
        }
    })

    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`✅ 완료: ${modifiedQuestions}개 질문, ${modifiedResults}개 결과에 줄바꿈 추가`)
    console.log('\n샘플 (첫 번째 질문):')
    console.log('---')
    console.log(data.questions[0].text)
    console.log('---')

    console.log('\n샘플 (마지막 질문):')
    console.log('---')
    console.log(data.questions[data.questions.length - 1].text)
    console.log('---')

    console.log('\n샘플 (첫 번째 결과):')
    console.log('---')
    console.log(data.results[0].description)
    console.log('---')
}

main().catch(console.error)
