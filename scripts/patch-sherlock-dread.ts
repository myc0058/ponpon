/**
 * 셜록 홈즈 게임북 '공포 난이도' 강화 패치 (V3 - 고난도/긴장감 중심)
 * 실행: npx tsx scripts/patch-sherlock-dread.ts
 */
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.resolve(process.cwd(), 'contents/sherlock/quiz-data.json');
const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));

const getQ = (id: string) => data.questions.find((q: any) => q.id === id);

// 1. 초반 로일럿의 위협 (q9)
// 기존: 항의하면 HP -15 후 진행.
// 변경: 항의하면 로일럿이 부지깽이로 내려쳐 기절시킴 -> 의뢰 무산 (Bad Ending)
const q9 = getQ('q9');
if (q9) {
    q9.text = "거구의 로일럿 박사가 부지깽이를 구부리며 당신을 압박합니다.\n'내 일에 끼어들면 각오하는 게 좋을 거요!'\n그의 눈에는 살기가 가득합니다.";
    q9.options[0] = {
        text: "냉정하게 그의 눈을 마주치며 강하게 항의한다",
        targetResultId: "res_noclue" // 즉시 실패
    };
    q9.options[1].text = "자극하지 않고 차분히 홈즈 뒤에서 틈을 엿본다 (생존)";
}

// 2. 표범 조우 (q35)
// 기존: 랜턴 없어도 HP -35로 생존.
// 변경: 랜턴 없으면 표범에게 물려 사망 (Bad Ending)
const q35 = getQ('q35');
if (q35) {
    q35.options[0] = {
        text: "[랜턴] 강렬한 불빛을 눈에 쏘아 표범을 퇴치한다",
        conditions: [{ requiredItems: ["랜턴"], nextQuestionId: "q37" }],
        targetResultId: "res_death" // 랜턴 없으면 사망
    };
    q35.options[1] = {
        text: "방어하려 노력하지만 맨손으로는 무리다",
        targetResultId: "res_death" // 즉시 사망
    };
}

// 3. 단서 요구량 극단적 상향 (q38)
// 기존: 5 -> 8개
// 변경: 12개 이상이어야 진엔딩 진입 가능. 아니면 미해결(res_noclue)
const q38 = getQ('q38');
if (q38) {
    q38.options[0].conditions[0].minEvidence = 12;
}

// 4. 최종 교전 (q43)
// 체력이 80 미만이면 지팡이 휘두르기 실패로 사망하게 변경
const q43 = getQ('q43');
if (q43) {
    const meleeOpt = q43.options.find((o: any) => o.text.includes('지팡이'));
    if (meleeOpt) {
        meleeOpt.conditions[0].minHp = 80;
    }
}

// 5. 문구 수정 (긴장감 조성)
data.results[2].description = "단편적인 정보만으로 매복을 결행하려 했으나, 홈즈는 당신의 준비되지 않은 모습을 보고 실망하며 철수를 명령했습니다.\n결국 헬렌은 며칠 뒤 끔찍한 죽음을 맞이했고, 당신은 탐정으로서의 명예를 영영 잃었습니다.";

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
console.log('💀 셜록 홈즈: 공포 난이도(Dread Mode) 패치 완료!');
