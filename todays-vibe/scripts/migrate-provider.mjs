/**
 * 기존 users 컬렉션의 provider 필드를 Firebase Auth에서 읽어 일괄 업데이트
 * 사용: node scripts/migrate-provider.mjs
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
    })
);

initializeApp({
  credential: cert({
    projectId:   env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey:  env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db   = getFirestore();
const auth = getAuth();

function providerIdToKey(providerId, uid) {
  if (uid.startsWith("kakao:")) return "kakao";
  if (uid.startsWith("naver:")) return "naver";
  if (providerId === "google.com") return "google";
  if (providerId === "github.com") return "github";
  if (providerId === "password")   return "email";
  return "unknown";
}

// Firestore users 전체 조회
const usersSnap = await db.collection("users").get();
const docs = usersSnap.docs;
console.log(`총 ${docs.length}명 조회`);

// provider 미설정 유저만 추출
const needsUpdate = docs.filter((d) => !d.data().provider);
console.log(`provider 미설정: ${needsUpdate.length}명`);

if (needsUpdate.length === 0) {
  console.log("✅ 모두 이미 설정됨");
  process.exit(0);
}

// Firebase Auth에서 100명씩 배치 조회
const BATCH_SIZE = 100;
let updated = 0;

for (let i = 0; i < needsUpdate.length; i += BATCH_SIZE) {
  const chunk = needsUpdate.slice(i, i + BATCH_SIZE);
  const identifiers = chunk.map((d) => ({ uid: d.data().uid ?? d.id }));

  const { users: authUsers } = await auth.getUsers(identifiers);
  const authMap = new Map(authUsers.map((u) => [u.uid, u]));

  const batch = db.batch();
  for (const doc of chunk) {
    const uid = doc.data().uid ?? doc.id;
    const authUser = authMap.get(uid);
    const providerId = authUser?.providerData?.[0]?.providerId ?? "unknown";
    const provider = providerIdToKey(providerId, uid);
    batch.update(doc.ref, { provider });
    console.log(`  ${uid} (${doc.data().email}) → ${provider}`);
    updated++;
  }
  await batch.commit();
}

console.log(`\n✅ ${updated}명 provider 업데이트 완료`);
process.exit(0);
