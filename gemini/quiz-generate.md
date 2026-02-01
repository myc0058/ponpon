# 🤖 AI 에이전트 전용: 퀴즈 생성 및 배포 프로토콜

이 문서는 사용자의 요청에 따라 AI 에이전트(Antigravity)가 직접 퀴즈를 기획, 제작, 배포하는 표준 절차(SOP)입니다.

## 1. 주제 선정 및 기획 (Planning)
사용자가 주제를 주거나, 트렌드 조사를 요청하면 다음 단계를 수행합니다.

1.  **트렌드 확인**: `search_web` 도구를 사용하여 **전 세대(10대 ~ 50대+)**를 아우르는 트렌드를 파악합니다. 연령별 관심사가 다르므로 타겟을 확실히 정합니다.
2.  **주제 제안**: 타겟 연령층에 맞는 3가지 이상의 퀴즈 주제를 제안합니다.
    *   **10-20대 (잘파세대)**: 아이돌, 연애, 밈, 학교/알바 (재미 & 공유 중심)
    *   **20-30대 (MZ세대)**: 직장, 커리어, 연애/결혼, 재테크, 번아웃 (공감 & 힐링 중심)
    *   **40-50대+ (X/부머세대)**: 건강, 가족, 자녀교육, 운세/사주, 트로트, 추억 (실용 & 정보 중심)
3.  **구조 설계**: `TYPE_BASED` (MBTI형) 또는 `SCORE_BASED` (점수형) 중 적절한 형식을 선택합니다.

## 2. 컨텐츠 데이터 생성 (Content Generation)
확정된 주제로 JSON 파일을 생성합니다.

1.  **경로 생성**: `contents/[topic-slug]/` 디렉토리를 생성합니다.
2.  **데이터 작성**: 아래 스키마에 맞춰 `quiz-data.json` 파일을 생성합니다.
    *   **Tone & Manner**: 질문과 결과는 위트 있고, 인터넷 용어를 적절히 혼합하여 해당세대가 공감할 수 있게 작성합니다. 이모지는 절대 사용하지 않습니다.
    *   **Length Constraints**:
        *   **Questions**: 모바일 화면 기준 최대 2줄을 넘지 않도록 작성합니다. (약 30자 이내)
        *   **Options**: 한 줄에 들어오도록 최대한 짧고 핵심적인 내용만 담습니다. (약 10자 내외)
    *   **필수 항목**: 퀴즈 메타데이터, 질문 7~10개, 결과 유형 4개 이상.

```json
// contents/[topic-slug]/quiz-data.json 예시
{
  "title": "...",
  "description": "...",
  "resultType": "TYPE_BASED", // or "SCORE_BASED"
  "typeCodeLimit": 2,
  "questions": [
    {
      "order": 1,
      "content": "...",
      "imagePrompt": "질문 상황을 묘사하는 프롬프트 (영어)",
      "options": [...] 
    }
  ],
  "results": [
    {
      "typeCode": "ES",
      "title": "...",
      "description": "...",
      "imagePrompt": "결과 캐릭터를 묘사하는 프롬프트 (영어)"
    }
  ]
}
```

## 3. 이미지 생성 (Asset Production)
`generate_image` 도구를 사용하여 이미지를 생성하며, 쿼터가 부족하거나 대량의 이미지가 필요한 경우 **NanoBanana (Gemini 2.5 Flash Image)** 방식을 우선 사용합니다.

1.  **이미지 컨셉 선정**:
      컨텐츠와 어울리는 이미지를 생성해야되고 커버이미지를 한장 생성하고 컨셉이 맞는지 확인을 받아야 한다.
    **CRITICAL RULE**: **이미지 내에 어떠한 텍스트(글자, 숫자 등)도 포함하지 마십시오.** (No text in images)
    **CRITICAL RULE**: **단일 퀴즈 내의 모든 이미지(커버, 질문, 결과)는 반드시 동일한 화풍과 톤앤매너를 유지**해야 합니다. (일관성 유지)
2.  **이미지 생성**: 선정된 스타일을 포함하여 JSON의 `imagePrompt`를 기반으로 `generate_image`를 호출합니다.  
    **주의**: 이미지 사이즈는 반드시 512x512로 생성해야 합니다.
    **주의**: 만약 이미지 생성 도구(`generate_image`) 사용 중 **쿼터 제한(Limit)**에 걸린다면, 즉시 `scripts/generate-nanobanana-assets.ts --topic=[slug] --use-ai-studio` 명령어를 실행하여 서비스를 중단 없이 이어가야 합니다.
3.  **파일 저장**: 생성된 이미지는 `contents/[topic-slug]/images/` 폴더에 저장합니다.
    *   네이밍: `main-cover.png`, `q1.png`, `q2.png`, `result-es.png`, `result-ih.png`... (생성 후 반드시 WebP로 변환하여 업로드한다.)

## 4. 배포 및 DB 등록 (Deployment)
준비된 데이터와 이미지를 실제 서비스에 반영합니다.

1.  **이미지 업로드**: `contents/[topic-slug]/images/`의 이미지를 Supabase Storage(`quiz-images`)에 업로드합니다.
    *   *(스크립트 필요: `scripts/upload-folder-images.ts`)*
2.  **JSON 업데이트**: 업로드된 이미지 URL을 `quiz-data.json`의 `imageUrl` 필드에 반영합니다.
3.  **DB 시딩**: `scripts/seed-from-json.ts` 스크립트를 실행하여 DB에 데이터를 넣습니다.
    ```bash
    npx tsx scripts/seed-from-json.ts --file=contents/[topic-slug]/quiz-data.json
    ```
4.  **검증**: `/quiz/[new-id]/play` 접속하여 테스트 진행.

## 🔍 에이전트 체크리스트
- [ ] 주제가 최신 트렌드를 반영하는가?
- [ ] JSON 데이터 문법이 유효한가?
- [ ] 이미지 스타일이 단일 퀴즈 내에서 일관되게 유지되는가?
- [ ] DB 등록 후 플레이 테스트가 정상적으로 동작하는가?
- [ ] 모든 이미지는 중복이 없는가?
- [ ] 이모지를 사용하지 않았는가?