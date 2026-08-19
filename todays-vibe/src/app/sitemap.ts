import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import zodiacData from "@/data/zodiac-signs.json";
import chineseZodiacData from "@/data/chinese-zodiac.json";

/**
 * 크롤러가 사이트의 모든 공개 페이지를 발견하도록 sitemap.xml 자동 생성.
 * 비공개 영역(mypage, admin, auth, api)은 의도적으로 제외.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 정적/콘텐츠 페이지
  const staticPaths = [
    "", // 홈
    "about",
    "terms",
    "privacy",
    "contact",
  ];

  // 운세 메뉴 페이지
  const fortunePaths = [
    "saju",
    "tojeong",
    "life-fortune",
    "wealth-fortune",
    "love-fortune",
    "health-fortune",
    "career-fortune",
    "moving-fortune",
    "numerology",
    "name-fortune",
    "chinese-zodiac",
    "zodiac",
    "dream",
    "iching",
    "rune",
    "oracle",
    "sangaji",
    "tarot-daily",
    "tarot-3cards",
    "tarot-celtic",
    "tarot-tree-of-life",
    "tarot-horseshoe",
    "tarot-full-moon",
    "love-compatibility",
    "name-compatibility",
    "business-compatibility",
    "zodiac-compatibility",
  ];

  // 동적 상세 페이지
  const zodiacSigns = (zodiacData.zodiacSigns ?? []).map(
    (s: { id: string }) => `zodiac/${s.id}`
  );
  const chineseAnimals = (
    (chineseZodiacData as { animals?: { id: string }[] }).animals ?? []
  ).map((a) => `chinese-zodiac/${a.id}`);

  const allPaths = [
    ...staticPaths,
    ...fortunePaths,
    ...zodiacSigns,
    ...chineseAnimals,
  ];

  return allPaths.map((path) => ({
    url: path ? `${SITE_URL}/${path}` : SITE_URL,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : staticPaths.includes(path) ? 0.5 : 0.8,
  }));
}
