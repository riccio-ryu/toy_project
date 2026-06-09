import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  if (getApps().length) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin 환경 변수가 설정되지 않았습니다.");
  }

  adminApp = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export async function createCustomToken(
  uid: string,
  claims?: Record<string, unknown>
) {
  return getAdminAuth().createCustomToken(uid, claims);
}

export async function upsertOAuthUser(
  uid: string,
  profile: { email?: string; displayName?: string; photoURL?: string }
) {
  const auth = getAdminAuth();
  try {
    await auth.updateUser(uid, profile);
  } catch {
    await auth.createUser({ uid, ...profile });
  }
}
