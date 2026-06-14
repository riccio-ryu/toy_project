import { formatCardLines } from "@/lib/tarot/utils";
import { createTarotSpreadRoute, TarotCardBase } from "@/lib/api/tarot-route-factory";

export const runtime = "nodejs";

type CardInput = TarotCardBase & { meaning: string };

function buildPrompt(cards: CardInput[], question?: string): string {
  const cardLines = formatCardLines(cards.map((c) => ({ ...c, extra: c.meaning })));

  return `당신은 따뜻하고 통찰력 있는 타로 카드 리더입니다.

스프레드: 생명의 나무 (Tree of Life) — 카발라 세피로트 10위치
${question ? `질문: ${question}` : "전반적인 삶의 흐름"}

세피로트 포지션:
1번 케테르 (왕관) — 영적인 것
2번 호크마 (지혜) — 책임
3번 비나 (이해) — 장애물
4번 헤세드 (자비) — 도움을 주는 것
5번 게부라 (힘) — 나를 반대하는 것
6번 티파레트 (아름다움) — 성취할 수 있는 것
7번 네짜흐 (승리) — 감정 관계
8번 호드 (영광) — 인간관계 및 커리어
9번 예소드 (기반) — 무의식의 기반
10번 말쿠트 (왕국) — 가족들에 대해

뽑힌 카드:
${cardLines}

위 생명의 나무 배치를 해석해주세요.

작성 규칙:
- 10개 세피로트를 영적(1-3) → 현실(4-6) → 관계/무의식(7-10)의 흐름으로 연결
- 각 포지션의 세피로트 의미와 카드 의미를 결합하여 서술
- 확정적 예언 금지 — 가능성과 방향성으로 표현
- 부정적 카드도 성장·통찰의 관점으로 해석
- 따뜻하고 공감적인 톤, 한국어
- 1200~1800자 내외`;
}

export const POST = createTarotSpreadRoute({ readingType: "tarot-tree-of-life", cardCount: 10, buildPrompt });
