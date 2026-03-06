import fs from 'fs';
import path from 'path';

const FILE_PATH = path.resolve(process.cwd(), 'contents/sherlock/quiz-data.json');
const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));

// 유틸: 특정 id의 질문 찾기
const getQ = (id: string) => data.questions.find((q: any) => q.id === id);

// 1. 단서 요구량 대폭 상향 (q38)
// 기존: 단서 5개 이상이면 q41로 생존.
// 변경: 단서 8개 이상이어야 q41로 생존.
const q38 = getQ('q38');
if (q38) {
    q38.options.forEach((opt: any) => {
        if (opt.conditions) {
            opt.conditions.forEach((cond: any) => {
                if (cond.minEvidence !== undefined) {
                    cond.minEvidence = 8;
                }
            });
        }
    });
}

// 2. 일방통행을 2지선다 함정으로 변경 (q17 - 집시 구역 조사)
// 원래 q17은 1개 선택지뿐이었는데, 무리한 조사 시 HP가 깎이는 선택지 추가
const q17 = getQ('q17');
if (q17 && q17.options.length === 1) {
    q17.options.push({
        text: "텐트 안까지 몰래 잠입해 결정적 증거를 찾는다",
        stateChanges: { hp: -30 }, // 체력 깎임
        nextQuestionId: q17.options[0].nextQuestionId || "q18"
    });
    // 텍스트 보강
    q17.text += "\n무리해서 접근하면 들킬 위험이 있습니다.";
}

// 3. 일방통행을 2지선다로 (q25 - 스토크 모란 탐색)
const q25 = getQ('q25');
if (q25 && q25.options.length === 1) {
    q25.options.push({
        text: "주변의 수상한 흔적을 맨손으로 빠르게 파헤친다",
        stateChanges: { hp: -20 }, // 가시에 찔리거나 다침
        nextQuestionId: q25.options[0].nextQuestionId || "q26"
    });
}

// 4. q43 최종 교전에서의 생존 조건 강화
// 권총을 사용하면 사실 좁은 방에서 위험하므로 체력이 30 이상이어야 생존, 아니면 사망
const q43 = getQ('q43');
if (q43) {
    q43.options.forEach((opt: any) => {
        if (opt.text.includes('권총')) {
            // 기존 권총 옵션: 아이템 있으면 무조건 q46 생존
            // 수정: 아이템 있고 체력 50 이상이어야 q46 생존. 체력 낮으면 사망(q45)
            opt.conditions = [
                { requiredItems: ["권총"], minHp: 50, nextQuestionId: "q46" } // 체력 50 이상 성공
            ];
            opt.nextQuestionId = "q45"; // 조건 불만족 시 배드엔딩
        }
    });
}

// 수정된 데이터 저장
fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ 셜록 홈즈 게임북 난이도 패치 완료!');
