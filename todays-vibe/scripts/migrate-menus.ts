/**
 * fortunes.json → Firestore `menus` 컬렉션 1회성 마이그레이션
 *
 * 실행 방법:
 *   npx tsx scripts/migrate-menus.ts
 *
 * 주의: 이미 존재하는 문서는 덮어씁니다 (merge: false).
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fortunesData = require("../src/data/fortunes.json");

function initAdmin() {
  if (getApps().length) return;
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Firebase Admin 환경 변수가 설정되지 않았습니다.");
    console.error("   FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY 를 .env.local에 추가하세요.");
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function main() {
  initAdmin();
  const db  = getFirestore();
  const col = db.collection("menus");

  const fortunes = fortunesData.fortunes as Record<string, unknown>[];
  console.log(`\n🚀 마이그레이션 시작: ${fortunes.length}개 항목\n`);

  // Firestore batch는 최대 500건. 33개이므로 한 번에 처리 가능.
  const batch = db.batch();

  fortunes.forEach((f, index) => {
    const ref = col.doc(f.id as string);
    batch.set(ref, {
      icon:        f.icon,
      nameKo:      f.nameKo,
      description: f.description,
      category:    f.category,
      path:        f.path,
      difficulty:  f.difficulty,
      isAI:        f.isAI        ?? false,
      ready:       f.ready       ?? false,
      accessLevel: f.isPremium   ? "premium" : "public",
      tags:        f.tags        ?? [],
      color:       f.color       ?? "",
      order:       index,
      createdAt:   new Date(),
      updatedAt:   new Date(),
    });
    console.log(`  ✓ ${f.nameKo}`);
  });

  await batch.commit();
  console.log(`\n✅ 마이그레이션 완료! Firestore menus 컬렉션에 ${fortunes.length}개 문서 저장됨.\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ 마이그레이션 실패:", e);
  process.exit(1);
});
