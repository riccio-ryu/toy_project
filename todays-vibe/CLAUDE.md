# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Repository Overview

This is a mono-repo of personal projects by riccio-ryu. Active development focuses on new projects using modern stack (Next.js 14+, TypeScript, Firebase).

### Active Projects

| Directory      | Description                                            | Status            |
| -------------- | ------------------------------------------------------ | ----------------- |
| `todays-vibe/` | AI-powered fortune telling platform (타로, 사주, 운세) | 🚧 In Development |

### Legacy Projects (Reference Only)

| Directory                          | Description                             | Note                            |
| ---------------------------------- | --------------------------------------- | ------------------------------- |
| `petti/`                           | Pet SNS (React 17 + Express + MongoDB)  | ⏸️ Archived - 과거 버전, 참고만 |
| `jusi/`                            | Stock chart app (React 17 + ApexCharts) | ⏸️ Archived - 과거 버전, 참고만 |
| `git_practice/`, `calcal/`, `kmj/` | Practice/placeholder directories        | -                               |

---

## todays-vibe — AI Fortune Telling Platform

AI 기반 운세 플랫폼. Claude API를 활용한 맞춤형 사주, 타로, 꿈해몽 서비스.

### Tech Stack

**Frontend & Framework:**

- Next.js 16 (App Router)
- TypeScript
- React 19

**Styling:**

- Tailwind CSS
- shadcn/ui components (선택적)
- Framer Motion (애니메이션)

**Backend & Database:**

- Firebase (Firestore, Authentication, Hosting)
  - 또는 Google Cloud Platform (선택적)
- Next.js Server Actions

**AI Integration:**

- Anthropic Claude API (Sonnet 4.5)
- Streaming responses

**Additional Libraries:**

- React Query (TanStack Query) v5
- Zod (validation)
- date-fns (날짜 처리)

### Project Structure

```
todays-vibe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 관련 라우트
│   │   ├── (quick)/           # 빠른 운세 (별자리, 타로 원카드 등)
│   │   │   ├── zodiac/
│   │   │   ├── tarot-daily/
│   │   │   └── lucky/
│   │   ├── (ai)/              # AI 운세
│   │   │   ├── saju/          # 사주 풀이
│   │   │   ├── tarot/         # 타로 3장 스프레드
│   │   │   ├── dream/         # 꿈해몽
│   │   │   └── compatibility/ # 궁합
│   │   ├── share/             # 공유 피드
│   │   └── profile/           # 마이페이지
│   ├── components/
│   │   ├── ui/                # shadcn/ui 컴포넌트
│   │   ├── zodiac/            # 별자리 관련
│   │   ├── tarot/             # 타로 관련
│   │   ├── saju/              # 사주 관련
│   │   └── common/            # 공통 컴포넌트
│   ├── lib/
│   │   ├── firebase/          # Firebase 설정 및 유틸
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   └── firestore.ts
│   │   ├── claude/            # Claude API 관련
│   │   │   ├── client.ts
│   │   │   └── prompts.ts
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── utils/             # 유틸리티 함수
│   │   └── saju/              # 사주 계산 로직
│   ├── types/                 # TypeScript 타입 정의
│   │   ├── fortune.ts
│   │   ├── tarot.ts
│   │   └── user.ts
│   └── data/                  # 정적 데이터
│       ├── tarot-cards.json   # 타로 78장 데이터
│       ├── zodiac.json        # 별자리 운세 템플릿
│       └── lucky-items.json   # 럭키 아이템
├── public/
│   └── images/
│       ├── tarot/             # 타로 카드 이미지
│       └── zodiac/            # 별자리 아이콘
├── .env.local                 # 환경 변수 (gitignore됨)
├── .env.example               # 환경 변수 예시
├── firebase.json              # Firebase 설정
├── firestore.rules            # Firestore 보안 규칙
└── next.config.js
```

### Getting Started

**Prerequisites:**

- Node.js 18+
- npm or yarn or pnpm

**Installation:**

```bash
cd todays-vibe
npm install
```

**Environment Variables:**
Copy `.env.example` to `.env.local` and fill in:

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Optional: Google Cloud
GOOGLE_CLOUD_PROJECT_ID=...
```

**Run Development Server:**

```bash
npm run dev
# Opens on http://localhost:3000
```

**Build & Deploy:**

```bash
npm run build           # Production build
npm run start           # Start production server
firebase deploy         # Deploy to Firebase Hosting
```

### Key Patterns & Conventions

**1. Server Actions (AI 호출)**

```typescript
// src/app/(ai)/tarot/actions.ts
"use server";

import Anthropic from "@anthropic-ai/sdk";

export async function interpretTarot(cards: string[], question: string) {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      { role: "user", content: `질문: ${question}\n카드: ${cards.join(", ")}` },
    ],
  });

  // Stream to client
  return stream.toReadableStream();
}
```

**2. Firestore 데이터 저장**

```typescript
// src/lib/firebase/firestore.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export async function saveReading(userId: string, data: any) {
  return addDoc(collection(db, "ai_readings"), {
    userId,
    ...data,
    createdAt: serverTimestamp(),
  });
}
```

**3. TypeScript 타입 정의**

```typescript
// src/types/fortune.ts
export type FortuneType = "saju" | "tarot" | "dream" | "zodiac";

export interface TarotCard {
  id: string;
  name: string;
  nameKo: string;
  suit: "major" | "cups" | "wands" | "swords" | "pentacles";
  meaning: string;
  imageUrl: string;
}

export interface ReadingResult {
  id: string;
  type: FortuneType;
  input: Record<string, any>;
  result: string;
  createdAt: Date;
  userId?: string;
  isPublic: boolean;
}
```

**4. Tailwind 클래스 컨벤션**

- 다크모드 기본: `bg-gray-900 text-white`
- 그라데이션 배경: `bg-gradient-to-br from-purple-900 via-blue-900 to-black`
- 카드 스타일: `rounded-xl shadow-2xl backdrop-blur-sm bg-white/10`

### Database Schema (Firestore)

**Collections:**

```javascript
// ai_readings/{readingId}
{
  type: 'saju' | 'tarot' | 'dream',
  userId: string,              // optional (비회원 가능)
  input: {
    birthDate?: string,        // for saju
    cards?: string[],          // for tarot
    question?: string,         // for tarot/dream
  },
  result: string,              // AI 해석 결과
  createdAt: Timestamp,
  isPublic: boolean,
}

// users/{uid}
{
  email: string,
  nickname: string,
  birthDate?: string,          // optional
  createdAt: Timestamp,
  savedReadings: string[],     // readingId array
}

// tarot_cards/{cardId}
{
  name: string,
  nameKo: string,
  suit: string,
  meaning: string,
  imageUrl: string,
}
```

### API Routes & Server Actions

**AI Interpretation (Server Actions):**

- `src/app/(ai)/saju/actions.ts` — 사주 해석
- `src/app/(ai)/tarot/actions.ts` — 타로 해석
- `src/app/(ai)/dream/actions.ts` — 꿈해몽

**Data Fetching (Server Components):**

- Firestore queries in Server Components
- Client-side: React Query for caching

### Development Workflow

**Phase 1: MVP (빠른 운세)**

- [ ] 별자리 오늘의 운세
- [ ] 타로 원카드
- [ ] 오늘의 럭키 아이템

**Phase 2: AI Integration (핵심)**

- [ ] Claude API 연동
- [ ] 타로 3장 + AI 해석
- [ ] 사주 계산 + AI 해석
- [ ] Streaming UI

**Phase 3: 고급 기능**

- [ ] Firebase Auth
- [ ] 결과 저장/공유
- [ ] 커뮤니티 피드

**Phase 4: 완성도**

- [ ] 반응형 디자인
- [ ] SEO 최적화
- [ ] 애니메이션
- [ ] 배포

### Deployment

**Firebase Hosting:**

```bash
firebase init hosting
firebase deploy --only hosting
```

**Environment:**

- Production: Firebase Hosting
- Firestore in production mode
- Claude API with rate limiting

### Notes for Claude Code

- **우선순위**: Next.js 16 App Router 패턴 사용
- **레거시 무시**: petti, jusi 프로젝트는 참고하지 말 것 (과거 버전)
- **타입 안정성**: 모든 함수에 TypeScript 타입 명시
- **에러 처리**: Server Actions는 try-catch 필수
- **보안**: API 키는 절대 클라이언트 노출 금지
- **성능**: AI 응답은 Streaming으로 처리
- **캐싱**: 같은 입력값은 Firestore에서 캐싱 검토

---

## Legacy Projects (참고만, 수정 금지)

### petti, jusi

- React 17 + CRA 기반
- **현재 프로젝트와 무관**
- 마이그레이션 계획 없음
- 코드 참고만 가능
