/**
 * 게임북 데이터 무결성 검증 스크립트 (V5 - 순수 서사 분기형 전용)
 * 필드 누락, 연결 끊김, 그리고 스토리의 완결성을 검사합니다.
 */
import fs from 'fs';
import path from 'path';

function validateQuiz(filePath: string) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const qMap = new Map();
    data.questions.forEach((q: any) => qMap.set(q.id, q));
    const rMap = new Map();
    data.results.forEach((r: any) => rMap.set(r.typeCode, r));

    console.log(`\n[검증 시작] ${data.title}`);

    let errors = 0;
    let warnings = 0;

    // 1. 결과(엔딩) 데이터 존재 확인
    if (!data.results || data.results.length < 10) {
        console.warn(`⚠️ 경고: 엔딩 개수가 ${data.results.length}개로 적습니다. (지침상 10개 이상 권장)`);
        warnings++;
    }

    // 2. 연결 무결성 (Dangling references)
    data.questions.forEach((q: any) => {
        if (!q.options || q.options.length === 0) {
            console.error(`❌ 에러: [${q.id}]에 선택지가 없습니다.`);
            errors++;
        }

        q.options.forEach((opt: any, idx: number) => {
            // 금지 필드 체크 (V5 지침)
            if (opt.conditions || opt.stateChanges || opt.score) {
                console.warn(`⚠️ 경고: [${q.id}] 선택지 ${idx + 1}에 금지된 필드(conditions/stateChanges/score)가 포함되어 있습니다. (순수 서사형은 지양)`);
                warnings++;
            }

            // 경로 연결 체크
            if (!opt.nextQuestionId && !opt.targetResultId) {
                console.error(`❌ 에러: [${q.id}] 선택지 ${idx + 1}에 이동할 곳(ID)이 정의되지 않았습니다.`);
                errors++;
            }

            if (opt.nextQuestionId && !qMap.has(opt.nextQuestionId)) {
                console.error(`❌ 에러: [${q.id}]가 존재하지 않는 질문 ID [${opt.nextQuestionId}]를 가리킵니다.`);
                errors++;
            }

            if (opt.targetResultId && !rMap.has(opt.targetResultId)) {
                console.error(`❌ 에러: [${q.id}]가 존재하지 않는 결과 ID [${opt.targetResultId}]를 가리킵니다.`);
                errors++;
            }
        });
    });

    console.log('\n-----------------------------------');
    console.log(`검증 요약: 에러 ${errors}, 경고 ${warnings}`);
    if (errors === 0) {
        console.log('✅ 기술적 그래프 무결성 확인됨.');
    } else {
        console.log('❌ 결정적인 데이터 수정이 필요합니다.');
    }
}

const target = process.argv[2] || 'contents/sherlock/quiz-data.json';
validateQuiz(path.resolve(process.cwd(), target));
