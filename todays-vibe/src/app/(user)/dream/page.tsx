import { Metadata } from "next";
import DreamForm from "@/components/fortune/DreamForm";

export const metadata: Metadata = {
  title: "꿈해몽 | 오늘운",
  description: "꾼 꿈을 AI가 전통 해몽과 심리학적 관점으로 풀이해 드립니다.",
};

export default function DreamPage() {
  return <DreamForm />;
}
