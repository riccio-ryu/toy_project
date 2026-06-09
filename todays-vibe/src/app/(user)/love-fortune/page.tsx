import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "연애운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 연애운 풀이",
};

export default function LoveFortunePage() {
  return (
    <GeneralFortuneForm
      config={{
        type: "love-fortune",
        title: "연애운",
        icon: "💕",
        questionLabel: "생년월일로 풀어보는 나의 연애운",
        questionPlaceholder: "현재 연애 상황이나 궁금한 점을 적어주세요",
      }}
    />
  );
}
