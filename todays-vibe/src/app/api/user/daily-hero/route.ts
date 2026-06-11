import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST } from "@/lib/utils/date";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroData {
  score: number;
  message: string;
  stars: [number, number, number];
  isAI: boolean;
}

export interface HeroCardSettings {
  notLoggedInText: string;
  noBirthInfoText: string;
}

const DEFAULT_SETTINGS: HeroCardSettings = {
  notLoggedInText: "로그인하면 오늘의 운세 점수를 확인할 수 있어요",
  noBirthInfoText: "생년월일을 저장하면 AI가 맞춤 운세를 드려요",
};

// ─── Seed-based generation ─────────────────────────────────────────────────────

function uidDateSeed(uid: string, date: string): number {
  let hash = 5381;
  const str = uid + date;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function lcg(seed: number): number {
  return ((seed * 1664525 + 1013904223) >>> 0) / 4294967295;
}

const SEED_MESSAGES = [
  "새로운 기회가 찾아오는 날입니다.",
  "사람들과의 대화에서 좋은 에너지가 흐릅니다.",
  "작은 결단이 큰 변화를 만드는 하루입니다.",
  "평온한 마음으로 하루를 시작하면 좋겠습니다.",
  "뜻밖의 좋은 소식이 기다리고 있습니다.",
  "내면의 목소리에 귀 기울여 보세요.",
  "새로운 인연이 찾아올 수 있는 날입니다.",
  "준비해온 것들이 빛을 발하는 하루입니다.",
  "주변 사람들과의 조화가 행운을 부릅니다.",
  "긍정적인 에너지가 가득한 하루가 될 것입니다.",
  "집중력이 높아지는 날, 중요한 일을 처리하세요.",
  "작은 친절이 큰 복이 되어 돌아오는 날입니다.",
];

function generateSeedBased(uid: string, date: string): HeroData {
  const seed = uidDateSeed(uid, date);
  const score = Math.floor(60 + lcg(seed) * 36);
  const stars: [number, number, number] = [
    Math.floor(1 + lcg(seed + 1) * 5),
    Math.floor(1 + lcg(seed + 2) * 5),
    Math.floor(1 + lcg(seed + 3) * 5),
  ];
  const msgIdx = Math.floor(lcg(seed + 7) * SEED_MESSAGES.length);
  return { score, message: SEED_MESSAGES[msgIdx], stars, isAI: false };
}

// ─── AI generation ─────────────────────────────────────────────────────────────

interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour?: number;
  gender: string;
  isLunar?: boolean;
}

async function generateAI(birthInfo: BirthInfo, date: string): Promise<HeroData> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const genderText = birthInfo.gender === "male" ? "남성" : "여성";
  const birthText = `${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일`;
  const hourText =
    birthInfo.hour !== undefined && birthInfo.hour >= 0
      ? ` (${birthInfo.hour}시 출생)`
      : "";
  const today = `${date.slice(0, 4)}년 ${date.slice(4, 6)}월 ${date.slice(6, 8)}일`;

  const prompt = `당신은 사주 전문가입니다. 다음 정보를 바탕으로 오늘의 운세를 분석해주세요.

생년월일: ${birthText}${hourText}
성별: ${genderText}
오늘 날짜: ${today}

다음 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요:
{"score":75,"message":"오늘의 운세 한두 문장","stars":[3,4,5]}

규칙:
- score: 60~95 사이 정수
- message: 20~50자 한국어, 따뜻하고 구체적으로
- stars: [연애운, 재물운, 건강운] 각각 1~5 정수`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  const parsed = JSON.parse(text);

  return {
    score: Math.max(60, Math.min(95, Math.round(Number(parsed.score)))),
    message: String(parsed.message),
    stars: [
      Math.max(1, Math.min(5, Math.round(Number(parsed.stars[0])))),
      Math.max(1, Math.min(5, Math.round(Number(parsed.stars[1])))),
      Math.max(1, Math.min(5, Math.round(Number(parsed.stars[2])))),
    ],
    isAI: true,
  };
}

// ─── GET handler ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const db = getAdminFirestore();
  const date = todayKST();

  // Load settings (always, for all states)
  let settings: HeroCardSettings = DEFAULT_SETTINGS;
  try {
    const snap = await db.collection("settings").doc("heroCard").get();
    if (snap.exists) {
      settings = { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<HeroCardSettings>) };
    }
  } catch {
    // keep defaults
  }

  // Check auth
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({ state: "not_logged_in", settings });

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({ state: "not_logged_in", settings });

  const uid = session.uid;

  // Get birth info
  let birthInfo: BirthInfo | null = null;
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    birthInfo = (userDoc.data()?.birthInfo as BirthInfo) ?? null;
  } catch {
    // treat as no birth info
  }

  if (!birthInfo) {
    const data = generateSeedBased(uid, date);
    return Response.json({ state: "no_birth_info", ...data, settings });
  }

  // Check Firestore cache for AI result
  const cacheId = `${uid}_${date}`;
  try {
    const cached = await db.collection("daily_hero").doc(cacheId).get();
    if (cached.exists) {
      const d = cached.data()!;
      return Response.json({
        state: "ready",
        score: d.score,
        message: d.message,
        stars: d.stars,
        isAI: true,
        settings,
      });
    }
  } catch {
    // fall through
  }

  // Generate with AI, fall back to seed if error
  try {
    const data = await generateAI(birthInfo, date);
    await db.collection("daily_hero").doc(cacheId).set({
      ...data,
      uid,
      date,
      createdAt: new Date(),
    });
    return Response.json({ state: "ready", ...data, settings });
  } catch {
    const data = generateSeedBased(uid, date);
    return Response.json({ state: "no_birth_info", ...data, settings });
  }
}
