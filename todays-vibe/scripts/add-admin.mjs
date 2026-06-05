/**
 * users 컬렉션에서 해당 이메일의 plan을 "admin"으로 설정
 * 사용: node scripts/add-admin.mjs ters9292@gmail.com
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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

const email = process.argv[2];
if (!email) {
  console.error("사용법: node scripts/add-admin.mjs <이메일>");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId:   env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey:  env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

const usersSnap = await db.collection("users").where("email", "==", email).limit(1).get();
if (usersSnap.empty) {
  console.error(`❌ users 컬렉션에 ${email} 없음 — 먼저 로그인해야 합니다.`);
  process.exit(1);
}

await usersSnap.docs[0].ref.update({ plan: "admin" });
console.log(`✅ users/${usersSnap.docs[0].id} (${email}) → plan: "admin" 설정 완료`);
console.log("   다음 로그인 시 관리자 권한이 자동 적용됩니다.");

process.exit(0);
