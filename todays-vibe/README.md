# 🔮 todays-vibe

**당신만을 위한 오늘의 운세**

사주·타로·꿈해몽 — 33가지 운세로 당신의 오늘을 가장 깊이 읽어드립니다.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-pink?style=flat-square)](https://www.framer.com/motion/)

🌐 **라이브**: [todays-vibe.com](https://todays-vibe.com) · [todays-vibe.vercel.app](https://todays-vibe.vercel.app)

---

## ✨ 주요 기능

### 🎴 **33가지 운세 (27종 완료)**

**생년월일 기반 (6종):** 별자리, 띠별 운세, 사주팔자, 숫자 운세, 토정비결, 평생운세  
**카드/도구 점술 (10종):** 타로 원카드, 3장 스프레드, 켈틱 크로스, 말발굽 타로, 생명의 나무 타로, 보름달 타로, 오라클 카드, 룬 문자, 주역 괘, 산가지 점  
**AI 맞춤 운세 (6종):** 꿈해몽, 연애운, 재물운, 취업/시험운, 건강운, 이사/방위 길흉  
**궁합/관계 (4종):** 연애 궁합, 이름 궁합, 띠 궁합, 사업 파트너 궁합  
**관상/신체 (1종):** 성명학  

**준비 중 (6종):** 자미두수, 출생 차트, 육효점, 기문둔갑, AI 관상, AI 수상

### 🤖 **AI 기반 해석**

- **Gemini API** 스트리밍으로 개인화된 운세 해석
- 실시간 **Streaming** 응답으로 몰입감 있는 UX
- 사주, 타로, 꿈해몽 등 복잡한 운세를 현대적 관점으로 재해석

### 🔐 **소셜 로그인**

- Google / GitHub OAuth 로그인
- Firebase Custom Token 기반 세션 관리
- 생년월일 저장으로 자동 입력 지원

### 🎨 **현대적인 UI/UX**

- 다크모드 기반 **신비로운 디자인**
- **반응형** 레이아웃 (모바일/태블릿/데스크톱)
- **Framer Motion** 애니메이션으로 부드러운 인터랙션
- **Tailwind CSS v4**로 일관된 디자인 시스템

---

## 🛠️ 기술 스택

### **Frontend**

- [Next.js 16](https://nextjs.org/) — React 프레임워크 (App Router)
- [TypeScript](https://www.typescriptlang.org/) — 타입 안정성
- [Tailwind CSS v4](https://tailwindcss.com/) — 유틸리티 기반 스타일링
- [Framer Motion](https://www.framer.com/motion/) — 애니메이션

### **Backend & AI**

- [Gemini API](https://ai.google.dev/) — AI 운세 해석 (Streaming)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) — 서버사이드 로직
- [Firebase](https://firebase.google.com/) — Auth, Firestore, Hosting

### **Infrastructure**

- [Vercel](https://vercel.com/) — 배포 플랫폼
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) — 서버사이드 인증 / DB
- [Google AdSense](https://adsense.google.com/) — 광고 수익화

---

## 🚀 시작하기

### **Prerequisites**

- Node.js 18 이상
- npm, yarn, 또는 pnpm

### **설치**

```bash
git clone https://github.com/riccio-ryu/todays-vibe.git
cd todays-vibe
npm install
```

### **환경 변수 설정**

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_ADMIN_PRIVATE_KEY=...
FIREBASE_ADMIN_CLIENT_EMAIL=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

NEXT_PUBLIC_BASE_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
```

### **개발 서버 실행**

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

---

## 📂 프로젝트 구조

```
todays-vibe/
├── src/
│   ├── app/
│   │   ├── (user)/               # 사용자 페이지 (운세 목록, 각 운세 페이지)
│   │   ├── (auth)/               # 로그인 / 회원가입
│   │   ├── api/
│   │   │   ├── auth/             # Google / GitHub OAuth 콜백
│   │   │   ├── fortune/          # 운세 AI 스트리밍 API
│   │   │   └── user/             # 유저 정보 API
│   │   ├── admin/                # 어드민 (회원/메뉴/통계 관리)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── fortune/              # FortuneResult (스트리밍 UI)
│   │   └── ui/                   # shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── firebase/             # Firebase Admin + Client 설정
│   │   ├── gemini/               # Gemini API 클라이언트
│   │   ├── claude/               # 프롬프트 빌더 (buildPrompt)
│   │   ├── session.ts            # JWT 세션 쿠키
│   │   └── utils/
│   ├── contexts/
│   │   └── AuthContext.tsx       # 클라이언트 인증 상태
│   ├── types/
│   │   └── fortune.ts            # FortuneType / Input 타입
│   └── data/
│       ├── fortunes.json         # 33가지 운세 메타데이터
│       ├── zodiac-signs.json     # 12별자리 데이터
│       └── tarot-cards.json      # 타로 78장 데이터
├── docs/
│   └── history.md                # 개발 일지
├── CLAUDE.md
└── package.json
```

---

## 🎯 주요 페이지

| 경로                      | 페이지            | 상태 |
| ------------------------- | ----------------- | :--: |
| `/`                       | 홈 — 운세 목록    |  ✅  |
| `/zodiac`                 | 별자리 운세       |  ✅  |
| `/tarot-daily`            | 타로 원카드       |  ✅  |
| `/tarot-3cards`           | 타로 3장 스프레드 |  ✅  |
| `/saju`                   | 사주팔자          |  ✅  |
| `/dream`                  | 꿈해몽            |  ✅  |
| `/tojeong`                | 토정비결          |  ✅  |
| `/life-fortune`           | 평생운세          |  ✅  |
| `/love-compatibility`     | 연애 궁합         |  ✅  |
| `/name-fortune`           | 성명학            |  ✅  |
| `/rune`                   | 룬 문자           |  ✅  |
| `/mypage`                 | 마이페이지        |  ✅  |
| `/admin`                  | 어드민 대시보드   |  ✅  |

---

## 📊 Firestore 컬렉션

```javascript
// ai_readings/{readingId}  — 일반 운세 결과
{ type, userId, input, result, date, createdAt }

// tojeong_readings/{uid}_{year}  — 토정비결 (연간 캐시)
{ userId, result, year, createdAt }

// lifetime_readings/{uid}_{year}_{month}_{day}_{gender}  — 평생운세 (영구 캐시)
{ userId, birthYear, birthMonth, birthDay, gender, result, date, createdAt }

// users/{uid}
{ email, displayName, photoURL, birthInfo, createdAt }
```

---

## 📈 로드맵

### **Phase 1 — 기본 운세 UI** ✅

- [x] 홈페이지 — 운세 카드 그리드
- [x] 별자리 운세, 타로 원카드 (Framer Motion 카드 플립)

### **Phase 2 — AI 운세 연동** ✅

- [x] Gemini API 스트리밍 연동
- [x] 타로 3장, 켈틱 크로스, 말발굽, 생명의 나무, 보름달 타로
- [x] 사주팔자, 꿈해몽, 숫자 운세
- [x] 연애운·재물운·취업운·건강운, 각종 궁합

### **Phase 3 — 나머지 운세 페이지** 🚧

- [x] 띠별 운세, 오라클 카드, 룬 문자, 성명학
- [x] 토정비결 (연간 1회 캐시)
- [x] 평생운세 (생년월일 영구 캐시 + 하루 1회 신규 생성)
- [x] 주역 괘, 산가지 점, 이사/방위 길흉
- [ ] 자미두수, 출생 차트, 육효점, 기문둔갑

### **Phase 4 — 인증 & 소셜** ✅

- [x] Firebase Auth (Google / GitHub 로그인)
- [x] 결과 저장 / 마이페이지

### **Phase 5 — 관상/AI 이미지** 🔮

- [ ] AI 관상 (이미지 업로드)
- [ ] AI 수상 (손금 분석)

### **Phase 6 — 고도화** 🔮

- [ ] 매일 운세 푸시 알림
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 공유 피드 / 인스타그램 스토리 이미지

---

## 🗺️ 운세 구현 현황

| #   | 분류         | 운세              | 경로                      |  난이도  | 상태 |
| --- | ------------ | ----------------- | ------------------------- | :------: | :--: |
| 1   | 📅 생년월일  | 별자리 운세       | `/zodiac`                 |    ⭐    |  ✅  |
| 2   | 📅 생년월일  | 띠별 운세         | `/chinese-zodiac`         |    ⭐    |  ✅  |
| 3   | 📅 생년월일  | 사주팔자          | `/saju`                   |  ⭐⭐⭐  |  ✅  |
| 4   | 📅 생년월일  | 자미두수          | `/jamidusu`               | ⭐⭐⭐⭐ |  📋  |
| 5   | 📅 생년월일  | 평생운세          | `/life-fortune`           |  ⭐⭐⭐  |  ✅  |
| 6   | 📅 생년월일  | 토정비결          | `/tojeong`                |   ⭐⭐   |  ✅  |
| 7   | 📅 생년월일  | 출생 차트         | `/natal-chart`            |  ⭐⭐⭐  |  📋  |
| 8   | 📅 생년월일  | 생일 숫자 운세    | `/numerology`             |    ⭐    |  ✅  |
| 9   | 📅 생년월일  | 육효점            | `/yuk-hyo`                |   ⭐⭐   |  📋  |
| 10  | 📅 생년월일  | 기문둔갑          | `/gi-mun`                 | ⭐⭐⭐⭐ |  📋  |
| 11  | 🃏 카드      | 타로 원카드       | `/tarot-daily`            |    ⭐    |  ✅  |
| 12  | 🃏 카드      | 타로 3장 스프레드 | `/tarot-3cards`           |   ⭐⭐   |  ✅  |
| 13  | 🃏 카드      | 켈틱 크로스 타로  | `/tarot-celtic`           |  ⭐⭐⭐  |  ✅  |
| 14  | 🃏 카드      | 말발굽 타로       | `/tarot-horseshoe`        |   ⭐⭐   |  ✅  |
| 15  | 🃏 카드      | 생명의 나무 타로  | `/tarot-tree-of-life`     |  ⭐⭐⭐  |  ✅  |
| 16  | 🃏 카드      | 보름달 타로       | `/tarot-full-moon`        |   ⭐⭐   |  ✅  |
| 17  | 🃏 카드      | 오라클 카드       | `/oracle`                 |    ⭐    |  ✅  |
| 18  | 🃏 카드      | 룬 문자           | `/rune`                   |   ⭐⭐   |  ✅  |
| 19  | 🃏 카드      | 주역 괘           | `/iching`                 |  ⭐⭐⭐  |  ✅  |
| 20  | 🃏 카드      | 산가지 점         | `/sangaji`                |    ⭐    |  ✅  |
| 21  | 💭 AI 운세   | 꿈해몽            | `/dream`                  |    ⭐    |  ✅  |
| 22  | 💭 AI 운세   | 연애운            | `/love-fortune`           |   ⭐⭐   |  ✅  |
| 23  | 💭 AI 운세   | 재물운            | `/wealth-fortune`         |   ⭐⭐   |  ✅  |
| 24  | 💭 AI 운세   | 취업/시험운       | `/career-fortune`         |   ⭐⭐   |  ✅  |
| 25  | 💭 AI 운세   | 건강운            | `/health-fortune`         |   ⭐⭐   |  ✅  |
| 26  | 💭 AI 운세   | 이사/방위 길흉    | `/moving-fortune`         |   ⭐⭐   |  ✅  |
| 27  | 💕 궁합      | 연애 궁합         | `/love-compatibility`     |   ⭐⭐   |  ✅  |
| 28  | 💕 궁합      | 이름 궁합         | `/name-compatibility`     |    ⭐    |  ✅  |
| 29  | 💕 궁합      | 띠 궁합           | `/zodiac-compatibility`   |    ⭐    |  ✅  |
| 30  | 💕 궁합      | 사업 파트너 궁합  | `/business-compatibility` |   ⭐⭐   |  ✅  |
| 31  | 👤 관상/신체 | AI 관상           | `/face-reading`           |   ⭐⭐   |  📋  |
| 32  | 👤 관상/신체 | AI 수상           | `/palm-reading`           |   ⭐⭐   |  📋  |
| 33  | 👤 관상/신체 | 성명학            | `/name-fortune`           |   ⭐⭐   |  ✅  |

> ✅ 완료 (27개) · 📋 예정 (6개) · 난이도: ⭐ 쉬움 · ⭐⭐ 중급 · ⭐⭐⭐ 고급 · ⭐⭐⭐⭐ 최고급

---

## 👤 개발자

**riccio-ryu** · [@riccio-ryu](https://github.com/riccio-ryu)

---

## 📋 개발 일지

자세한 작업 내역은 [docs/history.md](./docs/history.md) 에서 확인하세요.
