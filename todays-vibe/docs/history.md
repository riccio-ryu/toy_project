# 📋 개발 일지

---

## 2026-05-01

- 프로젝트 구조 전면 재설계 — 사용자/어드민/미들웨어 3-레이어 구조로 변경
- `src/app/(user)/` 라우트 그룹 생성 — 사용자 레이아웃 및 홈 페이지
- `src/app/admin/` 어드민 섹션 생성 — 대시보드, 회원 관리, 메뉴 관리, 사용 통계, AI 사용량
- `src/middleware.ts` 생성 — 어드민 접근 제한, AI API 토큰 한도 체크 (Firebase 연동 후 실 동작)
- `src/lib/claude/client.ts` 재생성 — Anthropic 클라이언트 싱글턴
- `src/lib/auth/index.ts` 생성 — 세션 유저 헬퍼 (Firebase 연동 대비)

---

## 2026-05-01 (2)

- `src/data/fortunes.json` 운세 목록 18개 → 30개로 확장
- 카테고리 5개로 재편 — 기존 4개 + `appearance` (관상/신체) 신규 추가
- 전 운세에 `difficulty` 필드 추가 (easy / medium / hard / expert)
- 신규 운세 12개 추가: 자미두수, 출생차트, 육효점, 기문둔갑, 주역괘, 산가지점, 건강운, 이사/방위, 사업파트너궁합, AI관상, AI수상, 성명학
- README 구현 현황 테이블 30행 + 난이도 컬럼으로 업데이트

---

## 2026-05-21

- 시간대별 동적 배경 컴포넌트 구현 — `src/components/TimeBackground.tsx`, `src/components/SkyLayer.tsx` 생성
- `src/app/(user)/layout.tsx` 에 TimeBackground 적용 — 사용자 레이아웃 배경 통합
- `src/app/globals.css` 배경 관련 전역 스타일 추가

---

## 2026-05-24

- Firebase 프로젝트 연동 — `firebase`, `firebase-admin` 패키지 설치, `.env.local` Firebase 설정값 입력
- Firebase Auth 설정 — 이메일/비밀번호, Google 로그인 활성화
- 인증 인프라 구축 — `src/lib/firebase/config.ts` (lazy 초기화), `src/lib/firebase/auth.ts`, `src/lib/firebase/admin.ts`, `src/contexts/AuthContext.tsx` 생성
- 로그인 페이지 구현 (`src/app/(auth)/login/page.tsx`) — 이메일/비밀번호, 네이버, 카카오, Google, GitHub 소셜 로그인 버튼
- 회원가입 페이지 구현 (`src/app/(auth)/signup/page.tsx`) — 닉네임, 이메일, 비밀번호 입력 및 유효성 검사
- Naver/Kakao OAuth API 라우트 구현 — 리다이렉트 플로우, Firebase 커스텀 토큰 발급, `/auth/complete` 처리 페이지
- 헤더 컴포넌트 구현 (`src/components/Header.tsx`) — 비로그인 시 로그인/회원가입 버튼, 로그인 시 아바타(이니셜/프로필 사진) + 드롭다운 메뉴
- `src/app/(user)/layout.tsx` 에 Header 추가, `next.config.ts` 외부 이미지 도메인 허용 (Google, GitHub)
- 루트 `src/app/page.tsx` 제거 — `(user)` 레이아웃 우회 문제 해결
