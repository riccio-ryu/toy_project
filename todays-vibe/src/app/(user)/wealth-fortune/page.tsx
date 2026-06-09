import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "재물운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 재물운 풀이",
};

export default function WealthFortunePage() {
  return (
    <GeneralFortuneForm
      config={{
        type: "wealth-fortune",
        title: "재물운",
        icon: "💰",
        questionLabel: "생년월일로 풀어보는 나의 재물운",
        questionPlaceholder: "재정 목표나 현재 상황을 적어주세요",
      }}
    />
  );
}
