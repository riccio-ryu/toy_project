# 📋 개발 일지

---

## 2026-06-05

- 어드민 회원 관리 페이지 전면 개편 (`src/app/admin/users/page.tsx`) — 상단 통계 카드 고정(검색/필터와 무관), 검색 결과 건수 "N건 / 전체 M건" 표시, 컬럼 정렬 3단계(내림차순→오름차순→해제), 플랜 필터에 admin 추가, 가입 경로(provider) 필터 추가
- 플랜 관리 기능 추가 (`src/app/api/admin/plans/route.ts`) — 커스텀 플랜 CRUD API, 플랜 생성 팝업(이름·ID·설명·할당 계정) 구현
- 회원 상세 드로어 구현 (`src/app/admin/users/UserDetailDrawer.tsx`, `src/app/api/admin/users/[uid]/route.ts`) — 우측 슬라이드 패널, 프로필 카드, 이용 히스토리 탭(최근 50건), 오늘 사용량 탭
- `admins` Firestore 컬렉션 제거 → `users.plan === "admin"` 단일 소스로 통합 — 플랜 변경 시 Firestore 즉시 반영, 로그인 시 plan 값 그대로 세션에 유지
- provider 감지 로직 강화 (`src/app/api/auth/session/route.ts`) — UID 프리픽스(`kakao:`, `naver:`, `google:`, `github:`) 및 `sign_in_provider` 필드 기반 자동 감지, 신규 로그인마다 Firestore에 업데이트
- `scripts/migrate-provider.mjs` 신규 생성 — 기존 회원 `provider` 필드 일괄 마이그레이션 (Firebase Auth `getUsers` 100명 배치)
- `scripts/add-admin.mjs` 신규 생성 — 이메일로 `users.plan = "admin"` 설정하는 관리자 지정 스크립트
- `src/types/user.ts` 타입 확장 — `UserProvider`, `BuiltinPlan`, `PlanConfig`, `AllStats` 추가, `UserPlan`을 `string`으로 확장
- Google/GitHub 소셜 로그인을 서버사이드 OAuth로 전환 (`src/app/api/auth/google/`, `src/app/api/auth/github/`) — popup/redirect 방식 모두 Vercel 환경에서 동작 불가, Kakao/Naver와 동일한 Authorization Code Flow + Firebase Custom Token 방식으로 변경

---

## 2026-06-01

- 타로 카드 이미지 스프라이트 시트 → 개별 PNG 파일로 전환 (`src/lib/tarot/utils.ts`) — `tarot_majors/`, `tarot_cups/`, `tarot_wands/`, `tarot_swords/`, `tarot_pentacles/` 서브폴더 구조 대응
- 비회원 로그인 유도 모달 구현 (`src/components/common/LoginRequiredModal.tsx`, `src/app/(user)/FortuneGrid.tsx`) — 비회원이 회원 전용 운세 클릭 시 모달 표시 → 로그인 페이지 이동 후 원래 페이지로 복귀
- 관리자 계정 일반/어드민 페이지 자유 이동 구현 (`src/components/Header.tsx`, `src/contexts/AuthContext.tsx`) — `isAdmin` 상태 추가, 헤더 드롭다운에 관리자 페이지 링크 표시
- 사주팔자 기능 구현 (`src/app/(user)/saju/page.tsx`, `src/lib/saju/calculator.ts`, `src/app/api/fortune/saju/route.ts`) — lunisolar 기반 만세력 계산, 사주 원국 테이블 UI, 출생 정보 저장 옵션, Gemini AI 스트리밍 해석
- 출생 정보 API 구현 (`src/app/api/user/birth-info/route.ts`) — GET/POST/DELETE, Firestore `users/{uid}.birthInfo` 저장
- 마이페이지 출생 정보 섹션 추가 (`src/app/(user)/mypage/page.tsx`) — 등록·수정·삭제 UI, 사주팔자 바로가기 퀵링크 추가

---

## 2026-05-31

- 어드민 메뉴 관리(`src/app/admin/menus/page.tsx`) 전면 개편 — Firestore 기반 CRUD, 툴바(전체노출/미노출·메뉴추가·선택삭제·선택카테고리변환), 컬럼 표시 설정 모달, 3단계 정렬(오름차순→내림차순→해제)
- 카테고리 관리 기능 추가 — 카테고리 추가·수정·삭제, 기본 카테고리는 삭제 불가 처리
- 순서 변경 모달 구현 — 카테고리 순서 및 카테고리별 메뉴 순서를 드래그 앤 드롭 + ▲▼ 버튼으로 조정, 로컬 드래프트 후 "순서 저장" 클릭 시 일괄 반영
- `src/types/menu.ts` 신규 생성 — `MenuItem`, `Category`, `AccessLevel`, `UsageLimits` 타입 정의
- `src/app/admin/menus/actions.ts` 신규 생성 — Firestore Admin SDK 기반 메뉴/카테고리 Server Actions (`getMenus`, `saveMenu`, `deleteMenusByIds`, `patchMenusByIds`, `batchUpdateOrders` 등)
- `scripts/migrate-menus.ts` 신규 생성 — `fortunes.json` → Firestore `menus` 컬렉션 1회성 마이그레이션 스크립트 (33개 항목)
- 메인 페이지(`src/app/(user)/page.tsx`) Firestore 연동 — Firestore 우선 조회, 없으면 JSON 폴백
- 회원등급별 일일 사용량 제한 기능 추가 — `MenuItem.usageLimits` 필드 (비회원/회원/프리미엄/관리자별 하루 횟수, -1=무제한, 0=차단), FortuneModal에 등급별 설정 UI
- `src/lib/firebase/usage.ts` 신규 생성 — KST 기준 일별 사용량 Firestore 트랜잭션 추적 (`checkAndIncrementUsage`, `getUsageCount`, `getBulkUsage`)
- `src/lib/usage-check.ts` 신규 생성 — 운세 API 라우트용 공통 미들웨어 (`accessLevel` 체크 → `usageLimits` 원자적 체크+증가, 401/403/429 반환)
- 운세 API 라우트 6종에 사용량 체크 연결 — `fortune`, `tarot`, `tarot-celtic`, `tarot-full-moon`, `tarot-horseshoe`, `tarot-tree-of-life`
- 배치 강제 실행 KST 버그 수정 (`src/app/api/cron/fortune/force/route.ts`) — `new Date()` UTC 그대로 사용해 자정 이후 이전 달/주차로 생성되던 문제 해결, `Date.now() + 9h` KST 변환 적용

---

## 2026-05-29

- 켈틱 크로스 타로 페이지 구현 (`src/app/(user)/tarot-celtic/page.tsx`) — 78장 팬 스프레드에서 10장 선택, Celtic Cross 배열(카드 2 교차 90° 회전), 포지션 리스트, AI 해석 (PRO 뱃지)
- 생명의 나무 타로 페이지 구현 (`src/app/(user)/tarot-tree-of-life/page.tsx`) — 카발라 세피로트 10위치 배열, 세피로트명·의미 이중 표시, PRO 뱃지
- 말발굽 타로 페이지 구현 (`src/app/(user)/tarot-horseshoe/page.tsx`) — 5장 호 형태 배열(현재·방향·장애물·지략·결과), AI 해석
- 보름달 타로 페이지 구현 (`src/app/(user)/tarot-full-moon/page.tsx`) — 7장 마름모 배열, 중심 카드(7번 예상 결과)를 보름달 에너지로 강조(하늘색 뱃지), AI 해석
- 타로 API 라우트 4종 추가 (`tarot-celtic`, `tarot-tree-of-life`, `tarot-horseshoe`, `tarot-full-moon`) — Gemini 스트리밍, 스프레드별 포지션 프롬프트
- 타로 스프레드 카드 선택 UX 개선 — 선택 시 팬에서 사라지고 하단 슬롯에 순서대로 배치, 슬롯 클릭 시 해제 및 팬 재등장 (`spreadReady` 플래그로 cascade 딜레이 스킵)
- 스프레드 단계 🔀 다시 섞기 버튼 추가 — 타로 3장·켈틱·생명의 나무·말발굽·보름달 전 페이지 공통 적용
- `TarotCard` xs 사이즈 추가 (54×92px) — 팬 스프레드 및 하단 슬롯용
- `fortunes.json` 켈틱·생명의 나무·말발굽·보름달 타로 `ready: true` 활성화, 생명의 나무 `isPremium: true` 추가
- 소셜 로그인(Google/GitHub) 운영 환경 팝업 차단 버그 수정 (`next.config.ts`) — Vercel 프로덕션에서 `Cross-Origin-Opener-Policy` 헤더가 Firebase `signInWithPopup` 팝업을 차단하는 문제 확인, `same-origin-allow-popups` 헤더 추가로 해결
- Google/GitHub 로그인 `catch` 에러 로깅 추가 (`src/app/(auth)/login/page.tsx`) — `auth/popup-blocked` 에러 진단을 위한 `console.error` 추가
- Google/GitHub 소셜 로그인 email 미저장 원인 분석 — Firebase Email Enumeration Protection 비활성화, Google Cloud Console OAuth 동의 화면 범위(`userinfo.email`, `userinfo.profile`) 추가, Firebase 승인 도메인에 운영 서버(`todays-vibe.vercel.app`) 추가
- OAuth 설정 트러블슈팅 문서 작성 (`docs/oauth-setup.md`) — 원인 분석·해결 방법·코드 수정 내역·체크리스트 정리

---

## 2026-05-28

- Google/GitHub 소셜 로그인 email 필드 미저장 원인 분석 및 트러블슈팅 — Firebase Email Enumeration Protection 비활성화, Google Cloud Console OAuth 동의 화면 범위(`userinfo.email`, `userinfo.profile`) 추가, Firebase 승인 도메인에 운영 서버(`todays-vibe.vercel.app`) 추가
- COOP 헤더 이슈 확인 — `Cross-Origin-Opener-Policy` 가 Firebase `signInWithPopup` 팝업 통신 차단, `next.config.ts`에 `same-origin-allow-popups` 설정
- Firestore cold start 타임아웃 버그 수정 — 5초 → 10초 증가, 타임아웃 시 `users` 문서 생성 백그라운드 재시도 로직 추가
- GitHub OAuth `user:email` scope 추가 — `providerData[0].email` 에서 이메일 추출하도록 Admin SDK 폴백 개선
- OAuth 설정 트러블슈팅 문서 작성 (`docs/oauth-setup.md`) — 원인 분석·해결 방법·코드 수정 내역·체크리스트 정리

- `.env.local` 로컬 환경 변수 구성 — Firebase, Gemini API, GitHub OAuth, `CRON_SECRET`, `SESSION_SECRET` 설정
- 로그인 버그 수정 — `SESSION_SECRET` 빈 문자열로 인한 `DataError: Zero-length key is not supported` 해결 (`openssl rand -hex 32`로 재생성)
- `annual` → `yearly` 네이밍 전체 통일 — 타입·함수·컴포넌트 전반 혼용 제거
- 어드민 배치 버튼 분리 (`src/app/admin/batch/page.tsx`) — 주간/월간/연간 × 별자리/띠 6개 개별 버튼 + 전체 생성 버튼으로 재편
- 강제 배치 API 개선 (`src/app/api/cron/fortune/force/route.ts`) — `period` 파라미터 세분화(`weekly-zodiac`, `monthly-chinese` 등), `forceCurrentPeriod` 플래그 추가로 강제 실행 시 현재 기간 데이터 생성
- 띠별 출생년도 8개로 확장 (`src/data/chinese-zodiac.json`) — 기존 5개에서 1936~2031 범위 8사이클로 확장
- 띠별 배치 프롬프트에 출생년도별 맞춤 운세 추가 (`src/lib/fortune/schedule-prompts.ts`) — `byBirthYear` 필드, 연령대별(유소년~80대+) 특별 노트 생성
- `byBirthYear` 타입 정의 추가 (`src/types/scheduled-fortune.ts`) — `WeeklyFortune`, `MonthlyFortune`, `YearlyFortune` 모두 적용
- 띠 상세 페이지 출생년도 선택 UI 구현 (`src/app/(user)/chinese-zodiac/[animal]/page.tsx`) — 미래 연도 필터링, 토글 버튼, 오늘 탭 포함 전 탭에서 년생별 특별 운세 노출
- 분기 표시 순서 버그 수정 — `Object.entries()` 순서 미보장 문제 해결, 명시적 배열 `["q1","q2","q3","q4"]`로 q1→q4 순서 고정 (별자리·띠 상세 페이지 공통)
- 홈 메뉴 카드 UI 개선 (`src/app/(user)/page.tsx`) — 카드 높이 통일(`h-full`, `items-stretch`), 설명 텍스트 2줄 초과 말줄임 처리(`line-clamp-2`)
- SkyLayer 달 개선 (`src/components/SkyLayer.tsx`) — SVG 달을 `moon.png` 기반으로 교체, SVG `clipPath`로 위상(초승달~보름달) 모양 유지, 어두운 오버레이(0.60) 적용으로 배경 자연스럽게 처리, `public/moon.png` → `public/images/moon.png` 이동

---

## 2026-05-27

- Firestore 스키마 재설계 — 기간별 단일 문서(모든 별자리/띠 필드 포함) 구조로 전환, 컬렉션명 체계화 (`zodiac_weekly`, `zodiac_monthly`, `zodiac_yearly`, `chinese_zodiac_weekly` 등)
- 배치 생성 최적화 — 별자리/띠 각각 1회 API 호출로 12개 동시 생성 (기존 72회 → 6회로 감축)
- 신규 문서 저장 후 이전 기간 문서 자동 삭제 로직 추가 (`src/lib/fortune/generator.ts`)
- Gemini 모델 트러블슈팅 — `gemini-1.5-flash` 미지원(404) → `gemini-2.0-flash` 쿼터 0 → `gemini-2.5-flash`로 최종 변경 (`src/lib/gemini/client.ts`)
- 날짜 키 헬퍼 함수 추가 (`src/lib/fortune/date-utils.ts`) — `toWeekDocKey`, `toMonthDocKey`, `getPrevWeekDocKey` 등
- `fortune-reader.ts` 신규 스키마 대응 업데이트 — 컬렉션/문서 경로 변경, 별자리/띠 분리 조회 헬퍼 추가
- 띠별 운세 목록 페이지 구현 (`src/app/(user)/chinese-zodiac/page.tsx`) — 12띠 그리드, 현재 연도 띠 금색 하이라이트 + "올해" 뱃지
- 띠별 운세 상세 페이지 구현 (`src/app/(user)/chinese-zodiac/[animal]/page.tsx`) — 오늘/이번 주/이번 달/올해 탭, 럭키 아이템 카드, 띠별 테마 색상
- SpriteCard 컴포넌트 생성 (`src/components/common/SpriteCard.tsx`) — CSS 스프라이트 기법으로 6×2 시트에서 개별 카드 추출 (`background-size: 600% 200%`)
- 별자리/띠 상세 페이지에 SpriteCard 적용 — 헤더 영역 카드 이미지 표시
- `public/images/` 폴더 구조 재편 — `zodiac/`, `chinese-zodiac/`, `tarot/`, `icons/` 하위 디렉토리로 분리
- 홈 메뉴 "준비중" 처리 (`src/app/(user)/page.tsx`) — `fortunes.json` `ready` 필드 기반으로 미구현 항목 불투명 처리 + 뱃지 표시, 클릭 불가

---

## 2026-05-26

- 어드민 접근 권한 제어 구현 — Firestore `admins/{email}` 컬렉션 기반, Firebase Console에서 문서 추가/삭제로 권한 관리
- HMAC 세션 토큰 시스템 구축 — `src/lib/session.ts` 생성 (Edge+Node.js 양쪽 호환, Web Crypto API 기반 서명/검증)
- 세션 API 라우트 생성 (`src/app/api/auth/session/route.ts`) — Firebase ID 토큰 검증 후 HMAC 서명 쿠키 발급, Firestore 연결 실패 시 env 폴백 처리
- `src/proxy.ts` 완성 — Firebase Admin 제거 (Edge 런타임 충돌 해소), HMAC 세션 검증 방식으로 교체
- 로그인 흐름 완성 (`src/app/(auth)/login/page.tsx`, `src/lib/firebase/auth.ts`) — 로그인 후 `isAdmin` 반환값에 따라 `/admin` 또는 `/` 분기 이동
- 어드민 레이아웃 사이드바에 ⚡ 운세 배치 메뉴 추가 (`src/app/admin/layout.tsx`)
- 별자리 운세 선택 페이지 구현 (`src/app/(user)/zodiac/page.tsx`) — 12별자리 그리드, 원소별 색상 구분
- 별자리 운세 상세 페이지 구현 (`src/app/(user)/zodiac/[sign]/page.tsx`) — 오늘/이번 주/이번 달/올해 탭, 럭키 아이템 카드
- Firestore 클라이언트 운세 조회 유틸 생성 (`src/lib/firebase/fortune-reader.ts`) — `fortune_weekly` / `fortune_monthly` / `fortune_annual` 컬렉션 조회 헬퍼

---

## 2026-05-25

- GitHub 소셜 로그인 추가 (`src/app/(auth)/login/page.tsx`)
- `src/app/auth/complete/page.tsx` Suspense 래핑 — `useSearchParams()` 빌드 오류 수정
- 중첩 git 저장소(`todays-vibe/.git`) 제거 및 잘못 커밋된 `todays-vibe/todays-vibe/` 중첩 디렉토리 삭제
- toy_project remote origin 연결 및 master 브랜치 동기화
- Vercel 배포 연동 — https://toy-project-ruby.vercel.app/

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

---

## 2026-05-21

- 시간대별 동적 배경 컴포넌트 구현 — `src/components/TimeBackground.tsx`, `src/components/SkyLayer.tsx` 생성
- `src/app/(user)/layout.tsx` 에 TimeBackground 적용 — 사용자 레이아웃 배경 통합
- `src/app/globals.css` 배경 관련 전역 스타일 추가

---

## 2026-05-01 (2)

- `src/data/fortunes.json` 운세 목록 18개 → 30개로 확장
- 카테고리 5개로 재편 — 기존 4개 + `appearance` (관상/신체) 신규 추가
- 전 운세에 `difficulty` 필드 추가 (easy / medium / hard / expert)
- 신규 운세 12개 추가: 자미두수, 출생차트, 육효점, 기문둔갑, 주역괘, 산가지점, 건강운, 이사/방위, 사업파트너궁합, AI관상, AI수상, 성명학
- README 구현 현황 테이블 30행 + 난이도 컬럼으로 업데이트

---

## 2026-05-01

- 프로젝트 구조 전면 재설계 — 사용자/어드민/미들웨어 3-레이어 구조로 변경
- `src/app/(user)/` 라우트 그룹 생성 — 사용자 레이아웃 및 홈 페이지
- `src/app/admin/` 어드민 섹션 생성 — 대시보드, 회원 관리, 메뉴 관리, 사용 통계, AI 사용량
- `src/middleware.ts` 생성 — 어드민 접근 제한, AI API 토큰 한도 체크 (Firebase 연동 후 실 동작)
- `src/lib/claude/client.ts` 재생성 — Anthropic 클라이언트 싱글턴
- `src/lib/auth/index.ts` 생성 — 세션 유저 헬퍼 (Firebase 연동 대비)
