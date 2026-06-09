import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "건강운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 건강운 풀이",
};

export default function HealthFortunePage() {
  return (
    <GeneralFortuneForm
      config={{
        type: "health-fortune",
        title: "건강운",
        icon: "🌿",
        questionLabel: "생년월일로 풀어보는 나의 건강운",
        questionPlaceholder: "현재 건강 상태나 걱정되는 부분을 적어주세요",
      }}
    />
  );
}
