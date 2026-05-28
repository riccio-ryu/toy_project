# 👤 회원제 설계 문서

> todays-vibe 회원 등급 및 접근 제어 설계.  
> 기준일: 2026-05-28

---

## 1. 등급 체계

```
비회원 < 회원(free) < 프리미엄(premium) < 관리자(admin)
```

| 등급 | 조건 | 식별 방법 |
|------|------|----------|
| **비회원** | 로그인 안 된 상태 | 세션 쿠키 없음 |
| **회원** | Firebase Auth 로그인 완료 | 세션 쿠키 `plan: "free"` |
| **프리미엄** | 유료 결제 완료 | 세션 쿠키 `plan: "premium"` |
| **관리자** | Firestore `admins/{email}` `allowed: true` | 세션 쿠키 `isAdmin: true` |

> 관리자는 plan과 별개로 관리. `admins` 컬렉션에 이메일 문서가 있어야 함.

---

## 2. Firestore 컬렉션 구조

### 2-1. `admins/{email}` (기존 유지)

```
admins/
  someone@email.com/
    allowed: true
```

- Firebase Console에서 수동으로 추가/삭제
- 로그인 시 이 컬렉션 조회 → 세션 쿠키 `isAdmin` 결정

---

### 2-2. `users/{uid}` (신규)

```typescript
interface UserDoc {
  uid: string;                        // Firebase Auth UID (= 문서 ID)
  email: string;
  nickname: string;
  photoURL?: string;                  // 소셜 로그인 프로필 이미지
  plan: "free" | "premium";           // 회원 등급
  planExpiresAt?: Timestamp;          // 프리미엄 만료일 (없으면 free)
  createdAt: Timestamp;               // 가입일
  lastLoginAt: Timestamp;             // 마지막 로그인
}
```

**예시 문서:**
```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "nickname": "달빛여우",
  "plan": "premium",
  "planExpiresAt": "2026-06-28T00:00:00Z",
  "createdAt": "2026-05-01T12:00:00Z",
  "lastLoginAt": "2026-05-28T09:30:00Z"
}
```

---

### 2-3. `users/{uid}/daily_usage/{YYYY-MM-DD}` (신규, 서브컬렉션)

```typescript
interface DailyUsageDoc {
  date: string;      // "2026-05-28"
  dream: number;     // 꿈해몽 AI 사용 횟수
  tarot: number;     // 타로 AI 사용 횟수
  saju: number;      // 사주 AI 사용 횟수
  compatibility: number; // 궁합 AI 사용 횟수
}
```

- 문서 ID = `YYYY-MM-DD` (날짜가 바뀌면 자동으로 새 문서 생성됨)
- 문서가 없으면 → 사용 횟수 0으로 간주
- 오래된 문서는 Cloud Functions나 배치로 주기적 삭제 가능

---

## 3. 세션 쿠키 구조

로그인 시 `/api/auth/session` 에서 발급하는 HMAC 서명 쿠키:

```typescript
interface SessionPayload {
  uid: string;
  email: string;
  isAdmin: boolean;
  plan: "free" | "premium";   // ← 신규 추가
  iat: number;                 // 발급 시각 (Unix timestamp)
}
```

**발급 흐름:**
```
1. Firebase ID 토큰 검증
2. Firestore admins/{email} 조회 → isAdmin 결정
3. Firestore users/{uid} 조회 → plan 결정
   - 문서 없으면 plan: "free" (비회원 → 회원 전환 직후 문서 생성)
   - planExpiresAt 지났으면 plan: "free" 로 강제
4. HMAC 서명 쿠키 발급
```

> 프리미엄 만료 시: 다음 로그인 때 plan이 "free"로 자동 갱신됨.  
> 중간에 만료되는 케이스는 AI 기능 호출 시 서버에서 Firestore 재검증으로 처리.

---

## 4. 기능별 접근 제한

### 4-1. 페이지 접근 (미들웨어)

| 페이지 | 비회원 | 회원 | 프리미엄 | 관리자 |
|--------|--------|------|---------|--------|
| 홈 `/` | ✅ | ✅ | ✅ | ✅ |
| 별자리 `/zodiac` | ✅ | ✅ | ✅ | ✅ |
| 띠별 `/chinese-zodiac` | ✅ | ✅ | ✅ | ✅ |
| 꿈해몽 `/dream` | ❌ 로그인 유도 | ✅ | ✅ | ✅ |
| 타로 `/tarot` | ❌ | ✅ | ✅ | ✅ |
| 사주 `/saju` | ❌ | ✅ | ✅ | ✅ |
| 프리미엄 전용 기능 | ❌ | ❌ | ✅ | ✅ |
| 어드민 `/admin` | ❌ | ❌ | ❌ | ✅ |

### 4-2. AI 기능 일일 사용 제한

| 기능 | 비회원 | 회원(free) | 프리미엄 |
|------|--------|-----------|---------|
| 꿈해몽 | - | **1회/일** | **3회/일** |
| 타로 AI 해석 | - | **1회/일** | **3회/일** |
| 사주 풀이 | - | **1회/일** | **5회/일** |
| 궁합 | - | **1회/일** | **3회/일** |

> 한도 초과 시: 프리미엄 업그레이드 유도 UI 노출

---

## 5. 회원가입 처리 흐름

```
Firebase Auth 계정 생성
    ↓
users/{uid} 문서 자동 생성
    ↓
{
  uid, email, nickname,
  plan: "free",           // 기본값
  createdAt: now(),
  lastLoginAt: now()
}
    ↓
세션 쿠키 발급 (plan: "free")
    ↓
홈 "/" 리다이렉트
```

---

## 6. 프리미엄 업그레이드 흐름 (미래 구현)

```
결제 완료 (토스페이먼츠 / 카카오페이 등)
    ↓
서버에서 users/{uid} 업데이트
    {
      plan: "premium",
      planExpiresAt: 30일 후 Timestamp
    }
    ↓
세션 갱신 (재로그인 or 강제 쿠키 재발급)
    ↓
프리미엄 기능 활성화
```

---

## 7. 구현 우선순위

| 단계 | 작업 | 상태 |
|------|------|------|
| 1 | `users/{uid}` 문서 스키마 확정 | ✅ 이 문서 |
| 2 | 회원가입 시 users 문서 자동 생성 | ⬜ 미구현 |
| 3 | 세션 쿠키에 `plan` 필드 추가 | ⬜ 미구현 |
| 4 | 미들웨어 접근 제어 (plan 기반) | ⬜ 미구현 |
| 5 | AI 기능 일일 사용량 체크/차단 | ⬜ 미구현 |
| 6 | 프리미엄 결제 연동 | ⬜ 미구현 (서비스 오픈 후) |

---

## 8. Firestore 보안 규칙 (예정)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 관리자 컬렉션: 서버(Admin SDK)만 읽기
    match /admins/{email} {
      allow read, write: if false;
    }

    // 유저 문서: 본인만 읽기/쓰기
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // 일일 사용량: 본인만
    match /users/{uid}/daily_usage/{date} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // 운세 데이터: 누구나 읽기 (배치 생성은 Admin SDK)
    match /zodiac_weekly/{doc} { allow read: if true; }
    match /zodiac_monthly/{doc} { allow read: if true; }
    match /zodiac_yearly/{doc} { allow read: if true; }
    match /chinese_zodiac_weekly/{doc} { allow read: if true; }
    match /chinese_zodiac_monthly/{doc} { allow read: if true; }
    match /chinese_zodiac_yearly/{doc} { allow read: if true; }
  }
}
```
