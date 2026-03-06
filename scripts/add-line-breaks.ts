/**
 * 셜록 홈즈 quiz-data.json의 질문/옵션/결과 텍스트에 적절한 줄바꿈을 추가하는 스크립트
 * 실행: npx tsx scripts/add-line-breaks.ts
 */
import fs from 'fs'
import path from 'path'

const FILE_PATH = path.resolve(process.cwd(), 'contents/sherlock/quiz-data.json')

function addLineBreaks(text: string): string {
    if (!text) return text

    // 대화문과 내레이션 사이에 줄바꿈 추가
    // 1. 닫는 따옴표(',") 뒤에 공백+대문자나 한글이 오면 줄바꿈
    let result = text.replace(/(['"』」])(\s+)([가-힣A-Z"'])/g, '$1\n$3')

    // 2. 문장 끝(마침표, 물음표, 느낌표) 뒤에 새 문단이 시작되면 줄바꿈 추가
    // 단, 따옴표 안에 있는 것은 건드리지 않음
    result = result.replace(/([.!?])(\s+)([가-힣"'](?:[가-힣\s'"]*?[가-힣]))/g, (match, punct, space, next) => {
        // 2줄 이상이 되지 않게 중복 줄바꿈 방지
        return `${punct}\n${next}`
    })

    return result
}

async function main() {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    const data = JSON.parse(raw)

    let modified = 0

    data.questions = data.questions.map((q: any) => {
        const newText = addLineBreaks(q.text)
        if (newText !== q.text) modified++
        return {
            ...q,
            text: newText,
            options: q.options.map((opt: any) => ({
                ...opt,
                text: addLineBreaks(opt.text)
            }))
        }
    })

    data.results = data.results.map((r: any) => ({
        ...r,
        description: addLineBreaks(r.description)
    }))

    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`✅ 완료: ${modified}개 질문에 줄바꿈 추가`)
    console.log('\n샘플 (첫 번째 질문):')
    console.log(data.questions[0].text)
}

main().catch(console.error)
