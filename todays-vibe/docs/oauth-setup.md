# OAuth 소셜 로그인 설정 가이드

## 개요

Google, GitHub 소셜 로그인 시 Firebase Authentication이 이메일을 받아오지 못하는 문제 및 설정 방법을 정리한 문서.

---

## 문제 원인 분석

### 공통 증상
- Firebase ID 토큰에 `email` 클레임이 없음 (`decoded.email === undefined`)
- Firebase Admin SDK `getUser(uid)` 도 이메일 반환 안 함
- Firebase Authentication 콘솔에서 식별자가 `-` 로 표시
- Firestore `users` 컬렉션에 문서 미생성 (Firestore timeout 동반)

### Google 원인
**Google Cloud Console OAuth 동의 화면에 범위(Scope)가 등록되어 있지 않음.**
범위가 없으면 Google은 Firebase가 `email` scope를 요청해도 응답에 이메일을 포함하지 않음.

### GitHub 원인
Firebase가 GitHub OAuth 응답에서 최상위 `email` 필드만 확인하는데, GitHub는 이메일을 `providerUserInfo[].email` (provider 레벨)에만 저장함.
→ `userRecord.providerData[0].email` 에서 직접 추출해야 함.

### Firestore timeout 원인
Next.js 개발 서버 콜드 스타트 시 Firebase Admin SDK의 Firestore 연결 초기화에 5초 이상 소요됨.
기존 타임아웃이 5초로 설정되어 있어 연결 성공 전에 타임아웃 발생.

---

## 해결 방법

### 1. Google Cloud Console — OAuth 범위 추가

1. [Google Cloud Console](https://console.cloud.google.com) 접속 → Firebase 프로젝트 선택
2. **APIs & Services → OAuth 동의 화면 → 데이터 액세스**
3. **"범위 추가 또는 삭제"** 클릭
4. 아래 두 범위 체크 후 **업데이트**:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. 페이지 하단 **저장**

> 설정 후 Firebase Authentication에서 기존 Google 계정 삭제 → 재로그인 필요 (기존 계정은 소급 적용 안 됨)

### 2. Firebase Authentication — Email Enumeration Protection 비활성화

1. Firebase Console → Authentication → **설정**
2. **사용자 작업** 탭
3. **"이메일 열거 보호(권장)"** 체크 해제 → 저장

> 이 기능이 활성화되어 있으면 Firebase가 ID 토큰에 이메일을 포함하지 않음

---

## 코드 수정 내역

### `src/lib/firebase/auth.ts`
- GitHub 프로바이더에 `user:email` scope 추가
- `createSession(user, clientEmail?)` — 소셜 로그인 시 클라이언트에서 이메일을 받아 서버로 전달하는 파라미터 추가

### `src/app/(auth)/login/page.tsx`
- Google/GitHub `signInWithPopup` 결과의 `additionalUserInfo.profile.email` 추출
- `createSession` 호출 시 클라이언트 이메일 전달

### `src/app/api/auth/session/route.ts`
이메일 확보 우선순위:
1. `decoded.email` (Firebase ID 토큰)
2. `userRecord.email` (Firebase Admin SDK)
3. `userRecord.providerData[0].email` (GitHub 등 provider 레벨 이메일)
4. 클라이언트 전달 이메일 (`additionalUserInfo.profile.email`)

기존 유저 email 업데이트:
- `userDoc.exists` 분기에서 `email` 필드가 비어있고 현재 이메일이 있으면 업데이트

Firestore timeout:
- 기존 5초 → **10초**로 증가
- timeout 발생 시에도 `users` 문서 생성을 백그라운드에서 재시도

---

## 로그인 제공자별 이메일 상태 (Firebase Identity Toolkit 기준)

| 제공자 | `users[].email` | `providerUserInfo[].email` |
|--------|----------------|---------------------------|
| Google (정상 설정 후) | O | O |
| Google (범위 미설정) | X | X |
| GitHub | X | O (`ters9292@gmail.com`) |
| 이메일/비밀번호 | O | O |

---

## 확인 체크리스트

- [ ] Google Cloud Console 데이터 액세스 범위에 `userinfo.email`, `userinfo.profile` 추가
- [ ] Firebase Authentication 이메일 열거 보호 비활성화
- [ ] 기존 테스트 계정 삭제 후 재로그인으로 검증
- [ ] Firebase Authentication 콘솔에서 식별자(이메일)가 정상 표시되는지 확인
- [ ] Firestore `users` 컬렉션에 문서 생성 및 `email` 필드 정상 저장 확인
