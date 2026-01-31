# 🎨 통합 이미지 생성 및 관리 프로토콜 (Unified Image Production Protocol)

이 문서는 PonPon 프로젝트의 모든 가시적 자산(퀴즈 이미지, 게임 애셋, 메인 커버 등)을 생성하고 관리하는 표준 지침입니다.

---

## 1. 기술 표준 (Technical Standards)

모든 이미지는 다음 표준을 준수해야 합니다:
- **기본 해상도**: 512x512 (정사각형)
- **최종 포맷**: **WebP** (손실 압축, 품질 80 이상 추천)
- **저장소**: Supabase Storage (`quiz-images` 버킷)
- **캐싱**: URL 끝에 `?v=timestamp`를 붙여 캐시 버스팅 적용

---

## 2. 생성 도구 및 전략 (Tools & Strategy)

상황 및 쿼터 상태에 따라 적절한 도구를 선택합니다.

### 2.1. 기본 생성 (Primary)
- **도구**: `generate_image` (DALL-E 3 등 고품질 엔진)
- **용도**: 퀴즈 메인 커버, 게임 대표 썸네일 등 임팩트가 중요한 이미지.
- **제한**: 쿼터 제한이 있으며, 생성 간 **1분의 쿨다운**을 준수합니다.

### 2.2. 대량/연속 생성 및 저비용 폴백 (Secondary/Fallback)
- **도구**: `scripts/generate-nanobanana-assets.ts --topic=[slug] --use-ai-studio`
- **엔진**: **Gemini 2.5 Flash (Imagen 3)**
- **용도**: 퀴즈 질문/결과 이미지, 게임 내 반복 애셋, 쿼터 제한 발생 시.
- **장점**: 쿨다운이 짧거나 없으며, **캐릭터 및 화풍 일관성(Consistency)** 유지에 최적화됨.

---

## 3. 콘텐츠별 이미지 워크플로우

### 3.1. 퀴즈 (Quizzes)
1. `contents/[quiz-slug]/quiz-data.json` 작성 (imagePrompt 포함).
2. `scripts/generate-nanobanana-assets.ts`를 실행하여 애셋 생성 계획 수립.
3. 생성된 이미지를 `contents/[quiz-slug]/images/`에 저장.
4. `scripts/upload-quiz-assets.ts`를 실행하여 WebP 변환 및 Supabase 업로드.

### 3.2. 게임 (Games)
1. `public/games/[game-slug]/assets/` 폴더 준비.
2. 게임 컨셉에 맞는 화풍 선정 (예: 픽셀 아트, 3D 렌더링).
3. 필요한 게임 소스 이미지를 `generate_image` 또는 폴백 스크립트로 생성.
4. `sharp` 등을 이용해 필요한 경우 스프라이트 시트로 결합하거나 최적화.

---

## 4. 스타일 가이드 및 일관성 (Style & Consistency)

- **단일 가이드 참조**: 반드시 `gemini/style-guide.md`에서 정의된 화풍 중 하나를 사용합니다.
- **일관성 유지**: 동일한 퀴즈나 게임 내의 모든 이미지는 **반드시 동일한 Prompt 서두와 Style 키워드**를 공유해야 합니다.
- **나노바나나 활용**: 일관성이 중요한 경우 Gemini 2.5 Flash의 'In-Context' 능력을 활용하여 기준 이미지를 참조하도록 프롬프트를 구성합니다.

---

## 5. 🔍 에이전트 체크리스트
- [ ] 이미지 사이즈가 512x512인가?
- [ ] 최종 파일이 WebP로 변환되었는가?
- [ ] 쿼터 에러 시 즉시 `generate-nanobanana-assets.ts`로 전환했는가?
- [ ] 화풍이 프로젝트 전체 분위기와 조화로운가?
