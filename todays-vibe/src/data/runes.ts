export interface Rune {
  id: string;
  symbol: string;
  name: string;
  nameKo: string;
  keywords: string[];
  meaning: string;
}

export const RUNES: Rune[] = [
  { id: "fehu",     symbol: "ᚠ", name: "Fehu",     nameKo: "페후 (재물)",    keywords: ["풍요", "재물", "번영", "새로운 시작"],   meaning: "재물과 번영의 룬. 노력의 결실이 찾아오고 있습니다." },
  { id: "uruz",     symbol: "ᚢ", name: "Uruz",     nameKo: "우루즈 (힘)",    keywords: ["힘", "건강", "용기", "변화"],              meaning: "야생의 힘과 생명력의 룬. 강한 변화가 당신을 기다립니다." },
  { id: "thurisaz", symbol: "ᚦ", name: "Thurisaz", nameKo: "수리사즈 (방패)", keywords: ["보호", "경계", "도전", "내성"],             meaning: "방어와 경계의 룬. 지혜롭게 행동하기 전에 신중히 생각하세요." },
  { id: "ansuz",    symbol: "ᚨ", name: "Ansuz",    nameKo: "안수즈 (메시지)", keywords: ["소통", "지혜", "신의 메시지", "영감"],       meaning: "신성한 소통의 룬. 중요한 메시지나 영감이 찾아올 것입니다." },
  { id: "raido",    symbol: "ᚱ", name: "Raido",    nameKo: "라이도 (여행)",   keywords: ["여행", "움직임", "변화", "방향"],            meaning: "여정과 변화의 룬. 새로운 방향으로 나아갈 때입니다." },
  { id: "kenaz",    symbol: "ᚲ", name: "Kenaz",    nameKo: "케나즈 (빛)",     keywords: ["창의", "영감", "명확함", "기술"],            meaning: "내면의 불꽃과 창의성의 룬. 당신의 재능을 발휘하세요." },
  { id: "gebo",     symbol: "ᚷ", name: "Gebo",     nameKo: "게보 (선물)",     keywords: ["선물", "관계", "균형", "교환"],              meaning: "선물과 관계의 룬. 주고받는 균형 속에서 진정한 연결이 만들어집니다." },
  { id: "wunjo",    symbol: "ᚹ", name: "Wunjo",    nameKo: "운조 (기쁨)",     keywords: ["기쁨", "성공", "조화", "만족"],              meaning: "기쁨과 성취의 룬. 소망하던 것이 이루어지고 행복이 찾아옵니다." },
  { id: "hagalaz",  symbol: "ᚺ", name: "Hagalaz",  nameKo: "하갈라즈 (폭풍)", keywords: ["변화", "도전", "파괴", "재건"],              meaning: "변혁의 룬. 갑작스러운 변화가 있을 수 있지만, 그 후 새로운 성장이 옵니다." },
  { id: "nauthiz",  symbol: "ᚾ", name: "Nauthiz",  nameKo: "나우티즈 (필요)", keywords: ["인내", "제약", "필요", "극복"],              meaning: "인내와 극복의 룬. 어려움이 있지만 이를 통해 강해질 것입니다." },
  { id: "isa",      symbol: "ᛁ", name: "Isa",      nameKo: "이사 (멈춤)",     keywords: ["멈춤", "내성", "재충전", "기다림"],           meaning: "정지와 성찰의 룬. 지금은 행동보다 내면을 들여다볼 시간입니다." },
  { id: "jera",     symbol: "ᛃ", name: "Jera",     nameKo: "예라 (수확)",     keywords: ["수확", "결실", "보상", "순환"],              meaning: "수확과 결실의 룬. 꾸준한 노력이 드디어 결실을 맺을 때입니다." },
  { id: "eiwaz",    symbol: "ᛇ", name: "Eiwaz",    nameKo: "에이와즈 (생명)", keywords: ["인내", "변화", "보호", "균형"],              meaning: "생명나무의 룬. 어려움을 통해 더 깊은 지혜와 힘을 얻습니다." },
  { id: "perthro",  symbol: "ᛈ", name: "Perthro",  nameKo: "페르소 (신비)",   keywords: ["신비", "운명", "비밀", "잠재력"],            meaning: "운명과 신비의 룬. 숨겨진 것들이 드러나거나 예상치 못한 일이 생깁니다." },
  { id: "algiz",    symbol: "ᛉ", name: "Algiz",    nameKo: "알기즈 (보호)",   keywords: ["보호", "방어", "본능", "안전"],              meaning: "보호와 방어의 룬. 직관을 믿고 자신을 지키는 경계를 세우세요." },
  { id: "sowilo",   symbol: "ᛋ", name: "Sowilo",   nameKo: "소윌로 (태양)",   keywords: ["성공", "에너지", "승리", "빛"],              meaning: "태양의 룬. 승리와 성공의 에너지가 강하게 흐르고 있습니다." },
  { id: "tiwaz",    symbol: "ᛏ", name: "Tiwaz",    nameKo: "티와즈 (정의)",   keywords: ["정의", "희생", "용기", "규율"],              meaning: "정의와 용기의 룬. 옳은 것을 위해 희생과 인내가 필요할 수 있습니다." },
  { id: "berkano",  symbol: "ᛒ", name: "Berkano",  nameKo: "베르카노 (탄생)", keywords: ["탄생", "성장", "가정", "새 출발"],            meaning: "탄생과 재생의 룬. 새로운 프로젝트나 관계가 꽃을 피울 것입니다." },
  { id: "ehwaz",    symbol: "ᛖ", name: "Ehwaz",    nameKo: "에와즈 (전진)",   keywords: ["파트너십", "이동", "발전", "신뢰"],           meaning: "파트너십과 전진의 룬. 신뢰할 수 있는 동반자와 함께 나아가세요." },
  { id: "mannaz",   symbol: "ᛗ", name: "Mannaz",   nameKo: "만나즈 (인간)",   keywords: ["자아", "공동체", "지성", "협력"],             meaning: "인류와 자아의 룬. 타인과의 협력 속에서 당신의 잠재력이 드러납니다." },
  { id: "laguz",    symbol: "ᛚ", name: "Laguz",    nameKo: "라구즈 (흐름)",   keywords: ["직관", "감정", "흐름", "적응"],              meaning: "물과 흐름의 룬. 감정의 흐름에 저항하지 말고 자연스럽게 따라가세요." },
  { id: "ingwaz",   symbol: "ᛜ", name: "Ingwaz",   nameKo: "잉와즈 (잠재력)", keywords: ["잠재력", "결실", "완성", "내적 성장"],         meaning: "잠재된 힘의 룬. 내면에서 조용히 준비되어 온 것이 드디어 꽃 피웁니다." },
  { id: "dagaz",    symbol: "ᛞ", name: "Dagaz",    nameKo: "다가즈 (새벽)",   keywords: ["돌파구", "깨달음", "변화", "희망"],           meaning: "새벽의 룬. 어둠이 걷히고 새로운 빛과 깨달음이 찾아오고 있습니다." },
  { id: "othala",   symbol: "ᛟ", name: "Othala",   nameKo: "오살라 (유산)",   keywords: ["뿌리", "유산", "가족", "전통"],              meaning: "유산과 귀환의 룬. 뿌리로 돌아가 진정한 자신의 가치를 발견하세요." },
];

export function drawRunes(count: number): Rune[] {
  const shuffled = [...RUNES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
