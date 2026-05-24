# 🔮 todays-vibe

**오늘의 바이브를 AI가 읽어드립니다**

타로, 사주, 별자리 등 18가지 운세를 AI와 함께 확인하고, 결과를 인스타그램에 공유할 수 있는 현대적인 운세 플랫폼입니다.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Claude API](https://img.shields.io/badge/Claude-Sonnet%204.5-orange?style=flat-square)](https://www.anthropic.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-pink?style=flat-square)](https://www.framer.com/motion/)

---

## ✨ 주요 기능

### 🎴 **30가지 운세**
- **생년월일 기반** (10종): 사주팔자, 자미두수, 평생운세, 토정비결, 별자리, 출생차트, 띠별 운세, 숫자 운세, 육효점, 기문둔갑
- **카드/도구 점술** (7종): 타로 원카드, 타로 3장 스프레드, 켈틱 크로스, 오라클 카드, 룬 문자, 주역 괘, 산가지 점
- **AI 맞춤 운세** (6종): 꿈해몽, 연애운, 재물운, 취업/시험운, 건강운, 이사/방위 길흉
- **궁합/관계** (4종): 연애 궁합, 이름 궁합, 띠 궁합, 사업 파트너 궁합
- **관상/신체** (3종): AI 관상, AI 수상, 성명학

### 🤖 **AI 기반 해석**
- **Claude Sonnet 4.5** API를 활용한 개인화된 운세 해석
- 실시간 **Streaming** 응답으로 몰입감 있는 UX
- 사주, 타로, 꿈해몽 등 복잡한 운세를 현대적 관점으로 재해석

### 📱 **소셜 공유**
- 운세 결과를 **인스타그램 스토리** 형식 이미지로 자동 생성
- **고유 URL** 생성으로 친구와 결과 공유
- 공유 피드에서 다른 사람들의 운세 구경 가능

### 🎨 **현대적인 UI/UX**
- 다크모드 기반 **신비로운 디자인**
- **반응형** 레이아웃 (모바일/태블릿/데스크톱)
- **Framer Motion** 애니메이션으로 부드러운 인터랙션
- **Tailwind CSS**로 일관된 디자인 시스템

---

## 🛠️ 기술 스택

### **Frontend**
- [Next.js 16](https://nextjs.org/) — React 프레임워크 (App Router)
- [TypeScript](https://www.typescriptlang.org/) — 타입 안정성
- [Tailwind CSS v4](https://tailwindcss.com/) — 유틸리티 기반 스타일링
- [Framer Motion](https://www.framer.com/motion/) — 애니메이션
- [shadcn/ui](https://ui.shadcn.com/) — UI 컴포넌트 (선택적)

### **Backend & AI**
- [Claude API](https://www.anthropic.com/) — AI 운세 해석 (Sonnet 4.5)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) — 서버사이드 로직
- [Firebase](https://firebase.google.com/) — 인증, 데이터베이스, 호스팅

### **Additional Libraries**
- [React Query (TanStack Query)](https://tanstack.com/query) — 서버 상태 관리
- [Zod](https://zod.dev/) — 스키마 검증
- [date-fns](https://date-fns.org/) — 날짜 처리

---

## 🚀 시작하기

### **Prerequisites**
- Node.js 18 이상
- npm, yarn, 또는 pnpm

### **설치**

```bash
# 저장소 클론
git clone https://github.com/riccio-ryu/todays-vibe.git
cd todays-vibe

# 의존성 설치
npm install
```

### **환경 변수 설정**

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
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
│   │   ├── (user)/               # 사용자 페이지 (라우트 그룹)
│   │   │   ├── layout.tsx        # 사용자 레이아웃 (다크 그라데이션)
│   │   │   └── page.tsx          # 홈 — 18가지 운세 목록
│   │   ├── admin/                # 어드민 페이지
│   │   │   ├── layout.tsx        # 사이드바 포함 어드민 레이아웃
│   │   │   ├── page.tsx          # 대시보드
│   │   │   ├── users/            # 회원 관리
│   │   │   ├── menus/            # 메뉴 관리
│   │   │   ├── stats/            # 사용 통계
│   │   │   └── ai-usage/         # AI 사용량 관리
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   └── globals.css
│   ├── lib/
│   │   ├── claude/
│   │   │   └── client.ts         # Anthropic 클라이언트
│   │   └── auth/
│   │       └── index.ts          # 세션 유저 헬퍼
│   ├── middleware.ts              # 인증 + AI 사용량 체크
│   └── data/
│       ├── fortunes.json         # 18가지 운세 메타데이터
│       ├── zodiac-signs.json     # 12별자리 데이터
│       └── tarot-cards.json      # 타로 78장 데이터
├── .claude/
│   └── commands/
│       └── log.md                # /log 커맨드
├── CLAUDE.md
└── package.json
```

## 🎯 주요 페이지

| 경로 | 페이지 | 설명 | 상태 |
|------|--------|------|------|
| `/` | 홈 | 18가지 운세 카테고리별 목록 | ✅ |
| `/zodiac` | 별자리 운세 | 12성좌 선택 → 특성·강점·행운 표시 | ✅ |
| `/tarot-daily` | 타로 원카드 | 78장 중 랜덤 1장 카드 플립 | ✅ |
| `/tarot-3cards` | 타로 3장 스프레드 | 과거-현재-미래 AI 해석 | 📋 |
| `/saju` | 사주 풀이 | 생년월일시 입력 → AI 사주 해석 | 📋 |
| `/dream` | 꿈해몽 | 꿈 키워드 입력 → AI 해몽 | 📋 |
| `/share` | 공유 피드 | 다른 사람들의 운세 결과 피드 | 📋 |

---

## 🔑 핵심 기능 구현

### **AI 스트리밍 응답**

```typescript
// src/app/(ai)/tarot-3cards/actions.ts
'use server'

import Anthropic from '@anthropic-ai/sdk'

export async function interpretTarot(cards: string[], question: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `질문: ${question}\n뽑힌 카드: ${cards.join(', ')}\n\n과거-현재-미래 관점으로 타로를 해석해주세요.`,
      },
    ],
  })

  return stream.toReadableStream()
}
```

### **타로 카드 랜덤 선택**

```typescript
// src/lib/utils/tarot.ts
import tarotData from '@/data/tarot-cards.json'

export function getRandomCard() {
  const allCards = [
    ...tarotData.majorArcana,
    ...tarotData.minorArcana.wands,
    ...tarotData.minorArcana.cups,
    ...tarotData.minorArcana.swords,
    ...tarotData.minorArcana.pentacles,
  ]
  return allCards[Math.floor(Math.random() * allCards.length)]
}
```

---

## 📊 데이터 구조

### **Firestore Collections**

```javascript
// ai_readings/{readingId}
{
  type: 'saju' | 'tarot' | 'dream',
  userId: string,          // optional (비회원 가능)
  input: {
    birthDate?: string,
    cards?: string[],
    question?: string,
  },
  result: string,          // AI 해석 결과
  createdAt: Timestamp,
  isPublic: boolean,
}

// users/{uid}
{
  email: string,
  nickname: string,
  savedReadings: string[], // readingId array
  createdAt: Timestamp,
}
```

---

## 🎨 디자인 시스템

### **컬러 & 그라데이션**

```css
/* 배경 */
bg-gradient-to-br from-purple-900 via-blue-900 to-black

/* 카드 (유리 효과) */
backdrop-blur-sm bg-white/10 border border-white/10

/* 호버 */
hover:-translate-y-1 hover:bg-white/15
```

---

## 🚢 배포

### **Firebase Hosting**

```bash
firebase init hosting
npm run build
firebase deploy --only hosting
```

### **Vercel (대안)**

```bash
vercel
```

---

## 📈 로드맵

### **Phase 1 — 기본 운세 UI** ✅
- [x] 홈페이지 — 18가지 운세 카드 그리드
- [x] 별자리 운세 페이지
- [x] 타로 원카드 페이지 (Framer Motion 카드 플립)

### **Phase 2 — AI 운세 연동** 🚧
- [ ] Claude API 스트리밍 연동
- [ ] 타로 3장 스프레드 AI 해석
- [ ] 사주 계산 로직 + AI 해석
- [ ] 꿈해몽 AI 해석

### **Phase 3 — 나머지 운세 페이지** 📋
- [ ] 띠별 운세, 생일 숫자 운세, 토정비결, 평생운세
- [ ] 켈틱 크로스 타로, 오라클 카드, 룬 문자
- [ ] 연애운, 재물운, 취업/시험운
- [ ] 연애 궁합, 이름 궁합, 띠 궁합

### **Phase 4 — 소셜 기능** 📋
- [ ] Firebase 인증 (Google 로그인)
- [ ] 결과 저장 / 마이페이지
- [ ] 공유 피드
- [ ] 인스타그램 스토리 이미지 생성

### **Phase 5 — 고도화** 🔮
- [ ] 매일 운세 푸시 알림
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 프리미엄 기능 (상세 해석)
- [ ] 운세 히스토리 대시보드

---

## 🗺️ 30가지 운세 구현 현황

| # | 분류 | 운세 | 경로 | 난이도 | 상태 |
|---|------|------|------|:------:|:----:|
| 1 | 📅 생년월일 | 별자리 운세 | `/zodiac` | ⭐ | ✅ |
| 2 | 🃏 카드 | 타로 원카드 | `/tarot-daily` | ⭐ | ✅ |
| 3 | 📅 생년월일 | 사주팔자 | `/saju` | ⭐⭐⭐ | 📋 |
| 4 | 📅 생년월일 | 자미두수 | `/jamidusu` | ⭐⭐⭐⭐ | 📋 |
| 5 | 📅 생년월일 | 평생운세 | `/life-fortune` | ⭐⭐⭐ | 📋 |
| 6 | 📅 생년월일 | 토정비결 | `/tojeong` | ⭐⭐ | 📋 |
| 7 | 📅 생년월일 | 출생 차트 | `/natal-chart` | ⭐⭐⭐ | 📋 |
| 8 | 📅 생년월일 | 띠별 운세 | `/zodiac-year` | ⭐ | 📋 |
| 9 | 📅 생년월일 | 생일 숫자 운세 | `/numerology` | ⭐ | 📋 |
| 10 | 📅 생년월일 | 육효점 | `/yuk-hyo` | ⭐⭐ | 📋 |
| 11 | 📅 생년월일 | 기문둔갑 | `/gi-mun` | ⭐⭐⭐⭐ | 📋 |
| 12 | 🃏 카드 | 타로 3장 스프레드 | `/tarot-3cards` | ⭐⭐ | 📋 |
| 13 | 🃏 카드 | 켈틱 크로스 타로 | `/tarot-celtic` | ⭐⭐⭐ | 📋 |
| 14 | 🃏 카드 | 오라클 카드 | `/oracle` | ⭐ | 📋 |
| 15 | 🃏 카드 | 룬 문자 | `/rune` | ⭐⭐ | 📋 |
| 16 | 🃏 카드 | 주역 괘 | `/iching` | ⭐⭐⭐ | 📋 |
| 17 | 🃏 카드 | 산가지 점 | `/sangaji` | ⭐ | 📋 |
| 18 | 💭 AI 운세 | 꿈해몽 | `/dream` | ⭐ | 📋 |
| 19 | 💭 AI 운세 | 연애운 | `/love-fortune` | ⭐⭐ | 📋 |
| 20 | 💭 AI 운세 | 재물운 | `/wealth-fortune` | ⭐⭐ | 📋 |
| 21 | 💭 AI 운세 | 취업/시험운 | `/career-fortune` | ⭐⭐ | 📋 |
| 22 | 💭 AI 운세 | 건강운 | `/health-fortune` | ⭐⭐ | 📋 |
| 23 | 💭 AI 운세 | 이사/방위 길흉 | `/moving-fortune` | ⭐⭐ | 📋 |
| 24 | 💕 궁합 | 연애 궁합 | `/love-compatibility` | ⭐⭐ | 📋 |
| 25 | 💕 궁합 | 이름 궁합 | `/name-compatibility` | ⭐ | 📋 |
| 26 | 💕 궁합 | 띠 궁합 | `/zodiac-compatibility` | ⭐ | 📋 |
| 27 | 💕 궁합 | 사업 파트너 궁합 | `/business-compatibility` | ⭐⭐ | 📋 |
| 28 | 👤 관상/신체 | AI 관상 | `/face-reading` | ⭐⭐ | 📋 |
| 29 | 👤 관상/신체 | AI 수상 | `/palm-reading` | ⭐⭐ | 📋 |
| 30 | 👤 관상/신체 | 성명학 | `/name-fortune` | ⭐⭐ | 📋 |

> ✅ 완료 · 🚧 진행 중 · 📋 예정 · 난이도: ⭐ 쉬움 · ⭐⭐ 중급 · ⭐⭐⭐ 고급 · ⭐⭐⭐⭐ 최고급
---

## 🤝 기여하기

PR은 언제나 환영입니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 **MIT 라이선스** 하에 배포됩니다.

---

## 👤 개발자

**riccio-ryu** · [@riccio-ryu](https://github.com/riccio-ryu)

---

## 🙏 감사의 말

- [Anthropic](https://www.anthropic.com/) — Claude API 제공
- [Vercel](https://vercel.com/) — Next.js 개발
- [shadcn/ui](https://ui.shadcn.com/) — UI 컴포넌트


---

## 📋 개발 일지

자세한 작업 내역은 [docs/history.md](./docs/history.md) 에서 확인하세요.
