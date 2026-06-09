import CompatibilityBirthForm from "@/components/fortune/CompatibilityBirthForm";

export default function BusinessCompatibilityPage() {
  return (
    <CompatibilityBirthForm
      config={{
        type: "business-compatibility",
        title: "사업 파트너 궁합",
        icon: "🤝",
        gradient: "from-blue-500 to-indigo-600",
        person2Label: "파트너",
      }}
    />
  );
}
