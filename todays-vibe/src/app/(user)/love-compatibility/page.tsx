import CompatibilityBirthForm from "@/components/fortune/CompatibilityBirthForm";

export default function LoveCompatibilityPage() {
  return (
    <CompatibilityBirthForm
      config={{
        type: "love-compatibility",
        title: "연애 궁합",
        icon: "💑",
        gradient: "from-pink-500 to-rose-600",
        person2Label: "상대방",
      }}
    />
  );
}
