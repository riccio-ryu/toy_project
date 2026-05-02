// TODO: Firebase Admin SDK 초기화 후 실제 구현으로 교체

export type UserRole = "user" | "admin";

export interface SessionUser {
  uid: string;
  email: string;
  nickname: string;
  role: UserRole;
}

/** 서버 컴포넌트에서 현재 세션 유저 가져오기 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // TODO: cookies()로 세션 쿠키 읽고 Firebase Admin으로 검증
  return null;
}

/** 어드민 여부 확인 */
export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "admin";
}
