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
  // splitmix32 finalizer: consecutive dates had seeds differing by 1, causing identical outputs
  hash = (hash ^ (hash >>> 16)) | 0;
  hash = Math.imul(hash, 0x45d9f3b) | 0;
  hash = (hash ^ (hash >>> 16)) | 0;
  return hash >>> 0;
}

// Independent random per slot — avoids lcg(seed+k) where k=1,2,3 produces nearly identical values
function subRand(baseSeed: number, slot: number): number {
  let h = (baseSeed ^ Math.imul(slot + 1, 0x9e3779b9)) >>> 0;
  h = (h ^ (h >>> 16)) | 0;
  h = Math.imul(h, 0x45d9f3b) | 0;
  h = (h ^ (h >>> 16)) | 0;
  return (h >>> 0) / 4294967295;
}

const SEED_MESSAGES = [
  "새로운 기회가 문을 두드리는 날입니다.",
  "오늘 나누는 대화가 큰 인연으로 이어질 수 있어요.",
  "작은 결단 하나가 삶의 방향을 바꾸는 하루입니다.",
  "평온한 마음이 오늘 최고의 무기입니다.",
  "뜻밖의 기쁜 소식이 찾아올 수 있는 날이에요.",
  "직감을 믿어보세요. 오늘은 그것이 맞을 확률이 높아요.",
  "새로운 인연의 씨앗이 뿌려지는 날입니다.",
  "그동안 준비해온 것들이 빛을 발하기 시작합니다.",
  "주변의 작은 친절에 감사하면 더 큰 복이 찾아와요.",
  "긍정적인 에너지가 오늘 하루를 가득 채울 거예요.",
  "집중력이 높아지는 날, 중요한 일을 지금 처리하세요.",
  "베푼 친절이 예상치 못한 방식으로 돌아오는 날이에요.",
  "오늘은 쉬어도 좋을 날, 충전이 내일의 도약이 됩니다.",
  "창의적인 아이디어가 샘솟는 하루가 될 거예요.",
  "오래된 인연에서 새로운 가능성을 발견할 수 있어요.",
  "작은 목표부터 하나씩 달성해나가는 날입니다.",
  "솔직한 표현이 오늘 관계를 더 깊게 만들어줄 거예요.",
  "멈춰서 주변을 돌아볼 때 숨겨진 행운이 보입니다.",
  "재물운이 흐르는 날, 현명한 선택이 빛을 발해요.",
  "작은 노력들이 쌓여 큰 결실을 맺기 시작합니다.",
  "오늘의 용기 있는 한 걸음이 미래를 바꿉니다.",
  "가까운 사람에게 따뜻한 말 한마디가 큰 힘이 됩니다.",
  "새로운 것을 배우기에 최고인 날입니다.",
  "기다리던 소식이 올 수 있는 하루예요.",
  "마음의 여유가 최고의 행운을 불러들입니다.",
  "오늘 만나는 사람이 중요한 열쇠를 쥐고 있을 수 있어요.",
  "포기하지 않는 마음이 오늘 빛납니다.",
  "자신을 믿는 힘이 가장 강한 날입니다.",
  "협력이 혼자보다 훨씬 큰 결과를 만드는 날이에요.",
  "생각지 못한 곳에서 도움의 손길이 나타납니다.",
  "오늘은 계획보다 흐름을 따르는 것이 유리해요.",
  "감사하는 마음이 더 많은 기쁨을 끌어당깁니다.",
  "즐거운 대화 속에서 귀한 정보를 얻을 수 있어요.",
  "건강에 투자하는 하루가 오래도록 이로울 거예요.",
  "오래 고민했던 것의 답이 오늘 보일 수 있어요.",
  "작은 것에서 행복을 찾으면 오늘이 더 빛납니다.",
  "과감하게 의견을 표현하면 좋은 결과가 따라옵니다.",
  "오늘의 실수가 내일의 지혜가 될 거예요.",
  "주변 환경을 정리하면 새로운 에너지가 들어와요.",
  "잠시 멈추고 호흡을 고르면 명확한 방향이 보입니다.",
  "오늘 받은 영감을 놓치지 말고 기록해두세요.",
  "믿었던 사람이 든든한 지원군이 되어줄 거예요.",
  "서두르지 않아도 돼요, 오늘은 여유가 정답입니다.",
  "작은 발견들이 모여 큰 그림을 완성하는 날이에요.",
  "오늘의 인내가 내일의 풍요로 이어집니다.",
  "유연한 사고가 막힌 문을 여는 열쇠가 됩니다.",
  "웃음이 오늘의 가장 강력한 에너지원입니다.",
  "좋아하는 일에 시간을 쏟으면 운이 따라옵니다.",
  "오늘은 결정보다 관찰이 더 많은 것을 알려줄 거예요.",
  "나만의 방식으로 해결책을 찾는 날입니다.",
  "중요한 만남이 예정되어 있을 수 있는 하루예요.",
  "변화가 두렵더라도 오늘은 한 발 내딛어 보세요.",
  "마음이 편안할 때 가장 좋은 판단을 내릴 수 있어요.",
  "오늘 뿌린 씨앗이 가장 좋은 열매를 맺을 거예요.",
  "예상치 못한 행운이 평범한 하루에 숨어있어요.",
  "오래된 문제의 해결 실마리가 오늘 보일 수 있어요.",
  "열린 마음이 새로운 세계를 안내해줄 거예요.",
  "소중한 사람과의 시간이 오늘 특별한 의미를 가집니다.",
  "적극적인 태도가 오늘 기회를 잡는 열쇠예요.",
  "조용히 집중하는 시간이 큰 도약의 발판이 됩니다.",
  "오늘 하루도 당신은 충분히 잘하고 있어요.",
  "새로운 시도가 예상보다 좋은 결과를 가져올 거예요.",
  "감각이 예민해지는 날, 놓쳤던 것들이 보입니다.",
  "오늘은 무리하지 않는 것이 가장 현명한 선택이에요.",
  "꾸준함이 가장 빛나는 재능임을 보여주는 날입니다.",
  "기대 이상의 결과가 기다리고 있을 수 있어요.",
  "오늘 만나는 인연을 소중히 여기세요.",
  "작은 변화가 큰 흐름을 바꾸는 시작점이 됩니다.",
  "지금 이 순간에 집중하면 모든 것이 명확해져요.",
  "오래 기다려온 것이 드디어 결실을 맺는 날이에요.",
  "진심이 담긴 노력은 반드시 보답받습니다.",
  "오늘의 여유가 내일의 생산성을 높여줄 거예요.",
  "선한 마음이 오늘 행운의 문을 엽니다.",
  "다양한 시각으로 바라보면 새로운 가능성이 보여요.",
  "무심코 지나쳤던 것에서 소중한 가치를 발견합니다.",
  "오늘의 결심이 내일의 습관으로 이어집니다.",
  "힘들더라도 포기하지 않는 마음이 빛을 발하는 날이에요.",
  "재능을 나누면 두 배로 돌아오는 날입니다.",
  "차분하게 생각하면 복잡한 것도 단순해집니다.",
  "오늘은 자신을 더 아끼고 돌봐주는 날이에요.",
  "노력이 눈에 보이는 결과로 나타나기 시작합니다.",
  "믿음과 확신이 오늘 가장 강한 힘입니다.",
  "의외의 곳에서 영감과 에너지를 얻게 됩니다.",
  "오늘의 작은 도전이 내일의 큰 자신감이 됩니다.",
  "진심으로 대하면 상대방의 마음도 열립니다.",
  "한 박자 쉬어가도 돼요, 여유가 운을 부릅니다.",
  "오래 닫혔던 문이 오늘 열릴 수 있어요.",
  "집중한 만큼 결과가 따라오는 날입니다.",
  "오늘은 마음 가는 대로 움직여보세요.",
  "좋은 기운이 사방에서 모여드는 하루입니다.",
  "지금까지의 노력이 오늘 인정받을 수 있어요.",
  "바람직한 변화의 기운이 주변에 흐르고 있어요.",
  "오늘의 배려가 관계를 더 단단하게 만들어줍니다.",
  "새벽빛처럼 맑은 기운이 오늘 하루를 감싸줍니다.",
  "진정성 있는 행동이 오늘 가장 큰 가치를 발휘합니다.",
  "오늘은 당신이 원하는 것에 더 가까워지는 날이에요.",
  "기쁨을 나누면 배가 되어 돌아오는 하루입니다.",
  "인내의 끝에 환한 빛이 기다리고 있어요.",
  "오늘 하루가 당신의 이야기에서 가장 빛나는 한 페이지가 됩니다.",
];

// Weighted star 1~5 — 3·4가 가장 많고, 2 > 5 > 1 순
function weightedStar(r: number): number {
  // 1★:8%, 2★:20%, 3★:28%, 4★:28%, 5★:16%
  const v = Math.floor(r * 10000);
  if (v <  800) return 1;
  if (v < 2800) return 2;
  if (v < 5600) return 3;
  if (v < 8400) return 4;
  return 5;
}

// Weighted score 60~100 — 80점대가 가장 많이 나오는 분포
function weightedScore(r: number): number {
  // 60-64:3%, 65-69:7%, 70-74:16%, 75-79:20%, 80-84:23%, 85-89:18%, 90-94:8%, 95-99:4%, 100:1%
  const cuts  = [300, 1000, 2600, 4600, 6900, 8700, 9500, 9900, 10000];
  const bases = [ 60,   65,   70,   75,   80,   85,   90,   95,   100];
  const v = Math.floor(r * 10000);
  let prev = 0;
  for (let i = 0; i < cuts.length; i++) {
    if (v < cuts[i]) {
      if (bases[i] === 100) return 100;
      return bases[i] + Math.floor((v - prev) * 5 / (cuts[i] - prev));
    }
    prev = cuts[i];
  }
  return 100;
}

// uid+월(YYYYMM) 기준 셔플 → day-1 번째 인덱스 반환 (한 달 내 중복 없음)
function monthlyMsgIndex(uid: string, date: string): number {
  const ym = date.slice(0, 6);
  const day = parseInt(date.slice(6), 10) - 1;
  const baseSeed = uidDateSeed(uid, ym);
  const n = SEED_MESSAGES.length;
  const perm = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    let h = (baseSeed ^ Math.imul(i + 100, 0x9e3779b9)) >>> 0;
    h = (h ^ (h >>> 16)) | 0;
    h = Math.imul(h, 0x45d9f3b) | 0;
    h = (h ^ (h >>> 16)) | 0;
    const j = (h >>> 0) % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm[day % n];
}

function generateSeedBased(uid: string, date: string): HeroData {
  const seed = uidDateSeed(uid, date);
  const score = weightedScore(subRand(seed, 0));
  const stars: [number, number, number] = [
    weightedStar(subRand(seed, 1)),
    weightedStar(subRand(seed, 2)),
    weightedStar(subRand(seed, 3)),
  ];
  const msgIdx = monthlyMsgIndex(uid, date);
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
