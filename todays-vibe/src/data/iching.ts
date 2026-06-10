export interface Hexagram {
  no: number;
  nameKo: string;     // 한국어 괘명
  nameZh: string;     // 한자
  upper: string;      // 상괘 (상단 삼효)
  lower: string;      // 하괘 (하단 삼효)
  lines: string;      // 6자리 이진 문자열: index 0=하단효, index 5=상단효 (1=양, 0=음)
  keyword: string;
  description: string; // 괘사 기반 기본 풀이 (무료 제공)
}

// 팔괘 삼효 패턴 (하→상, 1=양, 0=음)
// 乾(111) 坤(000) 震(100) 巽(011) 坎(010) 離(101) 艮(001) 兌(110)
export const HEXAGRAMS: Hexagram[] = [
  {
    no: 1, nameKo: "건", nameZh: "乾", upper: "천", lower: "천", lines: "111111", keyword: "창조, 강건함, 하늘",
    description: "하늘이 거듭되는 대창조의 괘. 강건한 창조의 힘이 정점에 달한 시기로, 크게 형통하고 올바름이 이롭다. 스스로 쉬지 않고 노력하면 모든 일이 뜻대로 이루어진다.",
  },
  {
    no: 2, nameKo: "곤", nameZh: "坤", upper: "지", lower: "지", lines: "000000", keyword: "수용, 순응, 땅",
    description: "대지의 넓은 포용력을 뜻하는 괘. 리더를 따르고 협력하면 이롭고, 독단적으로 앞서려 하면 길을 잃는다. 순응하며 때를 기다리면 반드시 형통한다.",
  },
  {
    no: 3, nameKo: "준", nameZh: "屯", upper: "수", lower: "뇌", lines: "100010", keyword: "어려운 시작, 새싹",
    description: "처음 싹이 트는 고난의 시작을 뜻하는 괘. 섣불리 나아가면 위험하니 도움을 구하고 서두르지 마라. 인내하며 기반을 다지면 반드시 돌파구가 열린다.",
  },
  {
    no: 4, nameKo: "몽", nameZh: "蒙", upper: "산", lower: "수", lines: "010001", keyword: "몽매, 학습, 성장",
    description: "어린아이가 배움을 구하는 어둠 속 성장의 괘. 먼저 묻는 자의 뜻을 받아들이되, 같은 질문을 반복하면 가르치지 않는다. 올바른 스승과 방법을 찾으면 형통한다.",
  },
  {
    no: 5, nameKo: "수", nameZh: "需", upper: "수", lower: "천", lines: "111010", keyword: "기다림, 인내",
    description: "비구름 앞에서 기다리는 괘. 음식과 술을 즐기며 여유롭게 인내하면 이롭다. 때가 오기 전 무리하게 나아가면 흉하니, 준비하며 기다리는 것이 최선이다.",
  },
  {
    no: 6, nameKo: "송", nameZh: "訟", upper: "천", lower: "수", lines: "010111", keyword: "다툼, 분쟁",
    description: "하늘과 물이 어긋나 분쟁이 생기는 괘. 소송이나 다툼은 반쯤에서 멈추는 것이 길하다. 끝까지 밀어붙이거나 큰일을 도모하면 흉하니, 타협과 중재가 최선이다.",
  },
  {
    no: 7, nameKo: "사", nameZh: "師", upper: "지", lower: "수", lines: "010000", keyword: "군대, 조직, 리더십",
    description: "땅속에 물이 담기듯 규율과 조직을 뜻하는 괘. 강직한 어른이 이끌면 길하고 허물이 없다. 올바른 지도자를 따르면 이롭고, 공이 없는 자가 나서면 흉하다.",
  },
  {
    no: 8, nameKo: "비", nameZh: "比", upper: "수", lower: "지", lines: "000010", keyword: "화합, 연대, 협력",
    description: "물이 땅에 스미듯 서로 돕고 화합하는 괘. 진실로 뭉치면 길하니, 때를 놓치지 말고 결단하라. 늦게 참여하는 자는 흉하니, 기회가 왔을 때 빠르게 행동하라.",
  },
  {
    no: 9, nameKo: "소축", nameZh: "小畜", upper: "풍", lower: "천", lines: "111011", keyword: "소축, 제약, 준비",
    description: "바람이 하늘을 가리듯 작게 모으는 괘. 아직 큰 성과는 이르고 소소한 준비만 가능한 시기다. 서두르지 말고 내공을 쌓으며 조용히 때를 기다려라.",
  },
  {
    no: 10, nameKo: "리", nameZh: "履", upper: "천", lower: "택", lines: "110111", keyword: "예절, 조심, 발걸음",
    description: "호랑이 꼬리를 밟듯 조심스럽게 나아가는 괘. 예절과 규범을 지키면 호랑이도 물지 않고 형통한다. 바른 태도와 조심스러운 행동이 성공의 열쇠다.",
  },
  {
    no: 11, nameKo: "태", nameZh: "泰", upper: "지", lower: "천", lines: "111000", keyword: "태평, 번영, 조화",
    description: "하늘과 땅이 교류하여 태평성대를 이루는 괘. 작은 것은 가고 큰 것이 오니 길하고 형통하다. 내외가 화합하고 상하가 소통하는 최고의 전성기.",
  },
  {
    no: 12, nameKo: "비", nameZh: "否", upper: "천", lower: "지", lines: "000111", keyword: "막힘, 정체, 비색",
    description: "하늘과 땅이 막혀 소통이 끊어진 괘. 군자의 도는 사라지고 소인이 득세하는 시기다. 무리하게 나서지 말고 덕을 쌓으며 조용히 때가 바뀌기를 기다려라.",
  },
  {
    no: 13, nameKo: "동인", nameZh: "同人", upper: "천", lower: "화", lines: "101111", keyword: "연대, 공동체, 화합",
    description: "하늘 아래 불처럼 사람들이 대의로 뭉치는 괘. 광야에서 뜻을 같이하면 크게 형통하고 큰 강을 건너는 것이 이롭다. 공동의 목표를 위해 힘을 모으면 큰일을 이룬다.",
  },
  {
    no: 14, nameKo: "대유", nameZh: "大有", upper: "화", lower: "천", lines: "111101", keyword: "대풍요, 성공",
    description: "불이 하늘 위에서 모든 것을 비추는 대풍요의 괘. 강건함과 밝음이 조화를 이루어 원형이정 모두 형통하다. 겸손함을 잃지 않으면 풍요가 오래 지속된다.",
  },
  {
    no: 15, nameKo: "겸", nameZh: "謙", upper: "지", lower: "산", lines: "001000", keyword: "겸손, 낮춤, 덕",
    description: "땅 아래 산이 숨어 있듯 겸손함을 뜻하는 괘. 군자는 끝까지 겸손하여 길하다. 가득 찬 것은 덜어내고 낮은 것은 보태주니, 겸손은 모든 덕의 근본이다.",
  },
  {
    no: 16, nameKo: "예", nameZh: "豫", upper: "뇌", lower: "지", lines: "000100", keyword: "즐거움, 기쁨, 준비",
    description: "우레가 땅 위에서 울리듯 기쁨과 준비를 뜻하는 괘. 큰 장수를 세우고 군대를 움직이면 이롭다. 성심으로 미리 준비하고 대비하면 반드시 형통한다.",
  },
  {
    no: 17, nameKo: "수", nameZh: "隨", upper: "택", lower: "뇌", lines: "100110", keyword: "따름, 유연성, 적응",
    description: "연못 안에서 우레가 쉬듯 때를 따르는 괘. 크게 형통하고 올바르면 허물이 없다. 때에 따르고 상황에 유연하게 적응하는 것이 성공의 핵심이다.",
  },
  {
    no: 18, nameKo: "고", nameZh: "蠱", upper: "산", lower: "풍", lines: "011001", keyword: "개혁, 치유, 부패 극복",
    description: "산 아래 바람이 부는 부패 극복의 괘. 개혁을 시작하기 3일 전, 마친 후 3일이 중요하니 준비와 마무리 모두 철저히 하라. 과감한 개혁으로 적폐를 청산하면 크게 이롭다.",
  },
  {
    no: 19, nameKo: "임", nameZh: "臨", upper: "지", lower: "택", lines: "110000", keyword: "접근, 임박, 리더십",
    description: "연못 위에 땅이 있어 지도자가 아랫사람에게 다가가는 괘. 크게 형통하고 바르면 이롭다. 따뜻하게 이끌면 백성이 따르지만, 너무 오래 지속하면 쇠할 수 있으니 유의하라.",
  },
  {
    no: 20, nameKo: "관", nameZh: "觀", upper: "풍", lower: "지", lines: "000011", keyword: "관찰, 통찰, 성찰",
    description: "바람이 땅 위에 불어 두루 살피는 괘. 손을 씻고 제사 지내기 전처럼 경건하게 내면을 들여다보라. 깊은 성찰과 넓은 관찰이 지금 필요한 때이다.",
  },
  {
    no: 21, nameKo: "서합", nameZh: "噬嗑", upper: "화", lower: "뇌", lines: "100101", keyword: "결단, 정의, 장애물 제거",
    description: "불과 우레처럼 씹어 합치는 결단의 괘. 입 안에 물건이 있어 씹어 없애야 형통하다. 장애물을 과감히 제거하고 법과 원칙을 엄격히 적용하면 이롭다.",
  },
  {
    no: 22, nameKo: "비", nameZh: "賁", upper: "산", lower: "화", lines: "101001", keyword: "아름다움, 꾸밈, 형식",
    description: "산 아래 불빛처럼 아름답게 꾸미는 괘. 형식의 아름다움이 빛나나 실질이 반드시 뒤따라야 한다. 작은 일에는 이롭지만, 형식이 실질을 가리면 큰일에는 부족하다.",
  },
  {
    no: 23, nameKo: "박", nameZh: "剝", upper: "산", lower: "지", lines: "000001", keyword: "붕괴, 쇠퇴, 변화",
    description: "산이 땅 위에서 무너지는 쇠퇴의 괘. 소인의 기운이 성하니 섣불리 나아가는 것이 이롭지 않다. 참고 내면을 지키며 변화의 때가 오기를 기다려라.",
  },
  {
    no: 24, nameKo: "복", nameZh: "復", upper: "지", lower: "뇌", lines: "100000", keyword: "귀환, 회복, 재생",
    description: "땅 아래 우레가 싹트는 회복과 귀환의 괘. 7일 만에 돌아오는 순환의 이치처럼, 가고 옴에 허물이 없다. 새로운 시작의 기운이 다시 살아나는 희망의 시기.",
  },
  {
    no: 25, nameKo: "무망", nameZh: "無妄", upper: "천", lower: "뇌", lines: "100111", keyword: "순수, 무심, 자연스러움",
    description: "하늘 아래 우레가 치는 순수한 무심의 괘. 사심 없이 행하면 크게 형통하고 올바름이 이롭다. 자연의 흐름에 따르면 반드시 좋은 결과가 오고, 억지로 바라면 오히려 화가 된다.",
  },
  {
    no: 26, nameKo: "대축", nameZh: "大畜", upper: "산", lower: "천", lines: "111001", keyword: "대축적, 내공, 저장",
    description: "하늘이 산 안에 갇힌 대축적의 괘. 굳건한 인내로 내공을 쌓을 때가 무르익었다. 집에 있으면 이롭지 않고 큰 강을 건너는 것이 이로우니, 이제 나아갈 때다.",
  },
  {
    no: 27, nameKo: "이", nameZh: "頤", upper: "산", lower: "뇌", lines: "100001", keyword: "양육, 음식, 돌봄",
    description: "산 아래 우레가 있는 양육의 괘. 무엇을 기르고 어떻게 먹는가를 살피면 길하다. 스스로 먹을 것을 구하는 방법을 올바르게 취하면 형통한다.",
  },
  {
    no: 28, nameKo: "대과", nameZh: "大過", upper: "택", lower: "풍", lines: "011110", keyword: "과도함, 위기, 변혁",
    description: "연못 위에 바람이 부는 크게 지나친 괘. 용마루가 휘어질 정도로 무거운 짐을 지고 있다. 갈 곳을 정하고 과감히 결단하면 형통하니, 지금은 머뭇거릴 때가 아니다.",
  },
  {
    no: 29, nameKo: "감", nameZh: "坎", upper: "수", lower: "수", lines: "010010", keyword: "위험, 물, 극복",
    description: "위험이 거듭되는 물의 괘. 믿음을 지키고 내면을 굳게 하면 형통한다. 위험 속에서도 올바름을 잃지 않으면 반드시 벗어나는 길이 열리고, 행하면 공이 있다.",
  },
  {
    no: 30, nameKo: "리", nameZh: "離", upper: "화", lower: "화", lines: "101101", keyword: "빛, 불, 명확성",
    description: "불이 거듭되는 밝음과 문명의 괘. 소처럼 온순하게 기르면 길하다. 빛에 의지하여 천하를 비추니, 지혜와 명확성으로 나아가면 크게 형통한다.",
  },
  {
    no: 31, nameKo: "함", nameZh: "咸", upper: "택", lower: "산", lines: "001110", keyword: "감응, 이끌림, 교감",
    description: "산 위에 연못이 있어 서로 감응하는 괘. 남녀가 끌리듯 빈 마음으로 상대를 느끼면 크게 형통하고 바르면 이롭다. 진심 어린 교감이 모든 관계의 시작이다.",
  },
  {
    no: 32, nameKo: "항", nameZh: "恒", upper: "뇌", lower: "풍", lines: "011100", keyword: "지속, 항구, 인내",
    description: "우레와 바람이 항상 함께하는 항구함의 괘. 변하지 않는 올바름을 지키면 형통하고 허물이 없다. 꾸준히 한 방향으로 나아가면 이롭고, 중간에 방향을 바꾸면 흉하다.",
  },
  {
    no: 33, nameKo: "돈", nameZh: "遯", upper: "천", lower: "산", lines: "001111", keyword: "물러남, 후퇴, 은둔",
    description: "하늘 아래 산이 있어 물러남을 뜻하는 괘. 소인의 기운이 성한 시기에는 용감하게 물러나는 것이 지혜다. 바르게 물러남으로써 오히려 미래를 보존할 수 있다.",
  },
  {
    no: 34, nameKo: "대장", nameZh: "大壯", upper: "뇌", lower: "천", lines: "111100", keyword: "강성함, 힘, 전진",
    description: "우레가 하늘 위에서 크게 울리는 강성함의 괘. 큰 힘이 넘치는 시기이나 바름을 잃으면 흉하다. 힘을 과신하지 말고 정도를 지키며 나아가야 오래 지속된다.",
  },
  {
    no: 35, nameKo: "진", nameZh: "晉", upper: "화", lower: "지", lines: "000101", keyword: "전진, 승진, 발전",
    description: "불이 땅 위에서 밝게 떠오르는 전진의 괘. 왕후가 말을 많이 받고 하루에 세 번 접견받듯이 밝은 덕이 드러나는 발전의 시기다. 적극적으로 나아가면 크게 이롭다.",
  },
  {
    no: 36, nameKo: "명이", nameZh: "明夷", upper: "지", lower: "화", lines: "101000", keyword: "빛의 상처, 인내, 잠복",
    description: "빛이 땅 아래에 숨은 어둠의 시기. 어리석은 척 내면의 밝음을 지켜야 이롭다. 굴욕을 참으며 때를 기다리면 반드시 어둠이 걷히고 다시 빛날 날이 온다.",
  },
  {
    no: 37, nameKo: "가인", nameZh: "家人", upper: "풍", lower: "화", lines: "101011", keyword: "가족, 조화, 역할",
    description: "바람이 불 위에 있어 가족의 도리를 뜻하는 괘. 각자의 역할을 바르게 지키면 이롭다. 가정의 도리가 바로 서면 천하도 안정되니, 가까운 곳부터 바르게 하라.",
  },
  {
    no: 38, nameKo: "규", nameZh: "睽", upper: "화", lower: "택", lines: "110101", keyword: "갈등, 대립, 차이",
    description: "불과 연못이 등지는 어긋남의 괘. 두 기운이 달라 소통이 어려운 시기다. 대립을 피하고 공통점을 찾으며 작은 일에 집중하면 이롭다.",
  },
  {
    no: 39, nameKo: "건", nameZh: "蹇", upper: "수", lower: "산", lines: "001010", keyword: "장애, 어려움, 도움 구하기",
    description: "산 위에 물이 막힌 장애의 괘. 서남방은 이롭고 동북방은 이롭지 않다. 어려울 때 큰 사람의 도움을 구하고 자신을 반성하면 반드시 돌파구가 생긴다.",
  },
  {
    no: 40, nameKo: "해", nameZh: "解", upper: "뇌", lower: "수", lines: "010100", keyword: "해방, 해결, 자유",
    description: "우레와 빗물이 합쳐 맺힌 것이 풀리는 괘. 할 일이 없으면 돌아오는 것이 길하고, 할 일이 있으면 서둘러 해결하라. 용서하고 너그럽게 대처하면 이롭다.",
  },
  {
    no: 41, nameKo: "손", nameZh: "損", upper: "산", lower: "택", lines: "110001", keyword: "감소, 절제, 단순화",
    description: "연못이 산 아래 있어 덜어내는 괘. 두 그릇을 가져다 제사 지내듯 성실하면 허물이 없다. 덜어내는 것이 오히려 더하는 것이 되는 역설의 시기이니 절제하라.",
  },
  {
    no: 42, nameKo: "익", nameZh: "益", upper: "풍", lower: "뇌", lines: "100011", keyword: "증가, 성장, 이익",
    description: "바람과 우레가 서로 더하는 성장의 괘. 가는 곳이 이롭고 큰 강을 건너는 것이 이롭다. 위의 것을 덜어 아래에 더하면 백성의 기쁨이 끝이 없다.",
  },
  {
    no: 43, nameKo: "쾌", nameZh: "夬", upper: "택", lower: "천", lines: "111110", keyword: "돌파, 결단, 결말",
    description: "연못이 하늘 위에 솟은 결단의 괘. 조정에서 진실로 위험을 알리고 나아가야 길하다. 과감한 결단으로 소인의 기운을 제거할 때이니, 홀로 결단하고 전진하라.",
  },
  {
    no: 44, nameKo: "구", nameZh: "姤", upper: "천", lower: "풍", lines: "011111", keyword: "만남, 유혹, 우연",
    description: "하늘 아래 바람이 부는 우연한 만남의 괘. 강한 여성이 등장하는 형상이니 경솔한 관계는 이롭지 않다. 예상치 못한 만남이 찾아오는 시기이니 분별력을 발휘하라.",
  },
  {
    no: 45, nameKo: "췌", nameZh: "萃", upper: "택", lower: "지", lines: "000110", keyword: "모임, 결집, 집중",
    description: "연못이 땅 위에 있어 모이는 결집의 괘. 왕이 사당을 섬기듯 목적을 세우면 형통하다. 같은 뜻을 가진 사람들이 모이는 시기이니 결집하고 준비하라.",
  },
  {
    no: 46, nameKo: "승", nameZh: "升", upper: "지", lower: "풍", lines: "011000", keyword: "상승, 성장, 노력",
    description: "땅 아래 나무가 자라 올라오듯 상승하는 괘. 크게 형통하고 큰 사람을 만나면 이롭다. 착실하게 아래에서부터 쌓아 올리면 반드시 성공하는 시기다.",
  },
  {
    no: 47, nameKo: "곤", nameZh: "困", upper: "택", lower: "수", lines: "010110", keyword: "곤경, 고난, 내면",
    description: "연못의 물이 빠져 곤경에 빠진 괘. 형통하나 말로 전하면 믿지 않으니 조용히 행동으로 보여라. 군자는 곤경 속에서도 뜻을 굽히지 않아야 길하다.",
  },
  {
    no: 48, nameKo: "정", nameZh: "井", upper: "수", lower: "풍", lines: "011010", keyword: "우물, 자원, 근본",
    description: "물 위에 나무가 있어 우물을 뜻하는 괘. 고을은 바꿔도 우물은 바꾸지 않는다. 변하지 않는 근본 자원을 잘 관리하고 활용하면 이롭다.",
  },
  {
    no: 49, nameKo: "혁", nameZh: "革", upper: "택", lower: "화", lines: "101110", keyword: "혁명, 변화, 개혁",
    description: "연못 위에 불이 있어 혁명을 뜻하는 괘. 기일이 지난 후에 믿음을 얻으면 크게 길하다. 낡은 것을 과감히 혁신하면 허물이 없고, 올바른 혁신은 천하가 따른다.",
  },
  {
    no: 50, nameKo: "정", nameZh: "鼎", upper: "화", lower: "풍", lines: "011101", keyword: "솥, 변환, 문명",
    description: "나무 위에 불이 있어 솥에서 변환이 일어나는 괘. 문명의 새로운 창조와 변환의 시기로 크게 길하고 형통하다. 현인을 등용하고 혁신하면 크게 성공한다.",
  },
  {
    no: 51, nameKo: "진", nameZh: "震", upper: "뇌", lower: "뇌", lines: "100100", keyword: "천둥, 충격, 각성",
    description: "우레가 거듭되는 충격과 각성의 괘. 우레가 쳐도 웃고 즐기는 여유를 잃지 마라. 충격 속에서도 평정심을 유지하면 허물이 없고 마침내 기쁜 소식이 온다.",
  },
  {
    no: 52, nameKo: "간", nameZh: "艮", upper: "산", lower: "산", lines: "001001", keyword: "멈춤, 산, 명상",
    description: "산이 거듭되어 멈춤을 뜻하는 괘. 등을 멈추게 하면 몸을 얻지 못하고 마당에 가도 사람을 보지 못한다. 행동할 때와 멈춰야 할 때를 분별하는 지혜가 핵심이다.",
  },
  {
    no: 53, nameKo: "점", nameZh: "漸", upper: "풍", lower: "산", lines: "001011", keyword: "점진, 천천히, 발전",
    description: "산 위에 나무가 자라듯 점진하는 괘. 기러기가 차례대로 나아가듯 바르게 나아가면 이롭다. 서두르지 말고 단계적으로 쌓아가면 반드시 성공한다.",
  },
  {
    no: 54, nameKo: "귀매", nameZh: "歸妹", upper: "뇌", lower: "택", lines: "110100", keyword: "결합, 부적절한 관계",
    description: "우레 위에 연못이 있어 결합을 뜻하는 괘. 정도를 잃은 관계이니 끝까지 가면 흉하다. 감정에 휩쓸리지 말고 올바른 관계의 도리를 지켜야 한다.",
  },
  {
    no: 55, nameKo: "풍", nameZh: "豐", upper: "뇌", lower: "화", lines: "101100", keyword: "풍요, 최고조, 절정",
    description: "우레와 불이 함께하여 풍요가 절정에 달한 괘. 왕이 이를 행하니 걱정하지 마라. 한낮의 태양처럼 풍요의 절정에 있으나 반드시 쇠함을 대비해야 한다.",
  },
  {
    no: 56, nameKo: "려", nameZh: "旅", upper: "화", lower: "산", lines: "001101", keyword: "여행, 이방인, 유랑",
    description: "불이 산 위에 있어 나그네를 뜻하는 괘. 작은 것에 형통하고 바르면 길하다. 머무는 곳에서 겸손하게 처신하면 어려운 상황을 벗어나 좋은 결과를 얻는다.",
  },
  {
    no: 57, nameKo: "손", nameZh: "巽", upper: "풍", lower: "풍", lines: "011011", keyword: "바람, 침투, 온화함",
    description: "바람이 거듭되어 스며드는 괘. 작은 형통함이 있고 갈 곳이 이롭다. 부드럽게 스며들듯 은근한 설득과 침투로 뜻을 이루는 것이 지금의 방법이다.",
  },
  {
    no: 58, nameKo: "태", nameZh: "兌", upper: "택", lower: "택", lines: "110110", keyword: "기쁨, 호수, 소통",
    description: "연못이 거듭되어 기쁨이 넘치는 괘. 형통하고 바름이 이롭다. 진심에서 우러나는 기쁨으로 소통하면 따르는 사람이 많아지고 함께 즐거워진다.",
  },
  {
    no: 59, nameKo: "환", nameZh: "渙", upper: "풍", lower: "수", lines: "010011", keyword: "분산, 해산, 자유",
    description: "바람이 물 위에 불어 흩어지는 괘. 왕이 사당에 나아가는 것이 이롭고 큰 강을 건너는 것이 이롭다. 굳어진 것을 녹여 흩트리면 새로운 흐름이 생긴다.",
  },
  {
    no: 60, nameKo: "절", nameZh: "節", upper: "수", lower: "택", lines: "110010", keyword: "절제, 한계, 규율",
    description: "연못 위에 물이 있어 절제를 뜻하는 괘. 괴로운 절제는 바르지 않으니 즐거운 마음으로 절제하라. 한계를 정하고 규율을 지키면 크게 형통한다.",
  },
  {
    no: 61, nameKo: "중부", nameZh: "中孚", upper: "풍", lower: "택", lines: "110011", keyword: "내면의 진실, 신뢰",
    description: "바람 위에 연못이 있어 내면의 진실한 믿음을 뜻하는 괘. 돼지와 물고기에도 믿음이 통할 만큼 진실하면 길하다. 내면의 성실함이 겉으로 드러나면 어떤 일도 이루어진다.",
  },
  {
    no: 62, nameKo: "소과", nameZh: "小過", upper: "뇌", lower: "산", lines: "001100", keyword: "작은 과도함, 조심",
    description: "우레 위에 산이 있어 작게 지나치는 괘. 새가 하늘 높이 날지 말고 내려오는 것이 이롭다. 큰일보다 작은 일에서 성실하면 길하고, 과욕을 부리면 흉하다.",
  },
  {
    no: 63, nameKo: "기제", nameZh: "既濟", upper: "수", lower: "화", lines: "101010", keyword: "완성, 성취, 마무리",
    description: "물과 불이 조화로운 완성의 괘. 처음에는 길하나 나중에 어지러워질 수 있다. 성취 후에도 긴장을 늦추지 말고 마무리를 잘 다져야 오래 지속된다.",
  },
  {
    no: 64, nameKo: "미제", nameZh: "未濟", upper: "화", lower: "수", lines: "010101", keyword: "미완성, 전환점, 희망",
    description: "불과 물이 어긋난 미완성의 괘. 어린 여우가 강을 거의 건넜으나 꼬리를 적신다. 목표 앞에서 방심하지 말고 끝까지 신중하게 마무리하면 반드시 이루어진다.",
  },
];

const HEXAGRAM_MAP: Record<string, Hexagram> = {};
for (const h of HEXAGRAMS) {
  HEXAGRAM_MAP[h.lines] = h;
}

export function getHexagramByLines(lines: boolean[]): Hexagram | null {
  const key = lines.map((l) => (l ? "1" : "0")).join("");
  return HEXAGRAM_MAP[key] ?? null;
}

export function throwCoins(): boolean {
  // 동전 3개: 앞=1, 뒤=0. 합≥2 → 양효(—), 합<2 → 음효(- -)
  const sum = [0, 1, 2].reduce((acc) => acc + (Math.random() < 0.5 ? 1 : 0), 0);
  return sum >= 2;
}
