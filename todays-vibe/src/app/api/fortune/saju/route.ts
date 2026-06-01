import { NextRequest } from "next/server";
import { getGemini, DEFAULT_MODEL } from "@/lib/gemini/client";
import { checkUsage, denyResponse } from "@/lib/usage-check";

export const runtime = "nodejs";

function buildPrompt(summary: string, question?: string): string {
  return `당신은 정통 사주명리학에 깊은 조예를 지닌 전문 역술가입니다.
현대적이고 따뜻한 언어로 사주를 해석해주세요.

${summary}
${question ? `\n질문: ${question}` : ""}

아래 항목을 순서대로 해석해주세요:

**1. 일간 분석 (나 자신의 성격)**
일간(日干)이 나타내는 기본 성격, 강점, 약점을 설명해주세요.

**2. 사주 전체 흐름**
년주·월주·일주·시주의 오행 균형과 상생·상극 관계를 분석해주세요.

**3. 운세 종합 해석**
- 성격 & 적성
- 대인관계 & 연애운
- 직업 & 재물운
- 건강

**4. 조언**
이 사주를 가진 분이 삶에서 주의해야 할 점과 잘 활용할 수 있는 방향을 알려주세요.

총 1200~1800자 내외로 작성해주세요. 어렵고 딱딱한 한자 용어보다 이해하기 쉬운 설명을 중심으로 해주세요.`;
}

export async function POST(req: NextRequest) {
  const check = await checkUsage(req, "saju");
  if (!check.allowed) return denyResponse(check.reason);

  const { summary, question } = await req.json();
  if (!summary) {
    return Response.json({ error: "사주 정보가 필요합니다." }, { status: 400 });
  }

  const gemini = getGemini();
  const prompt = buildPrompt(summary, question);

  try {
    const result = await gemini.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        for await (const chunk of result) {
          const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (text) controller.enqueue(enc.encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
