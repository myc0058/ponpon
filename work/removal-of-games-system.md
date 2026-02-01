# 게임 시스템 제거 (2026-02-01)

## 수행 항목
- [x] 프론트엔드 게임 페이지 삭제 (`src/app/games`)
- [x] 어드민 게임 페이지 및 API 삭제 (`src/app/admin/games`, `src/app/api/admin/games`)
- [x] 게임 관련 서버 액션 삭제 (`src/actions/game.ts`)
- [x] 게임 관련 컴포넌트 삭제 (`src/components/games`, `GameCard`)
- [x] 게임 관련 시드 및 애셋 업로드 스크립트 삭제
- [x] Prisma 스키마에서 `MiniGame` 모델 제거 및 DB 마이그레이션 적용
- [x] Supabase Storage (`quiz-images/games/`) 내의 모든 애셋 삭제
- [x] 메인 탭 UI 제거 및 `QuizGrid`로의 리팩토링
- [x] `TODO` 리스트에서 게임 관련 항목 제거

## 미수행 항목
- 없음 (완전 제거 완료)
