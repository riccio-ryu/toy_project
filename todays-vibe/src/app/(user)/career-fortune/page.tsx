import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "취업/시험운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 취업·시험운 풀이",
};

export default function CareerFortunePage() {
  return (
    <GeneralFortuneForm
      config={{
        type: "career-fortune",
        title: "취업/시험운",
        icon: "📋",
        questionLabel: "생년월일로 풀어보는 나의 취업·시험운",
        questionPlaceholder: "목표하는 직장이나 시험을 적어주세요",
      }}
    />
  );
}
