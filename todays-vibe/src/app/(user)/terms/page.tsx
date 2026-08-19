import type { Metadata } from "next";
import ContentPage from "@/components/common/ContentPage";

export const metadata: Metadata = {
  title: "이용약관 | 오늘운",
  description: "오늘운 AI 운세 서비스의 이용 조건 및 절차를 규정한 이용약관입니다.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ContentPage eyebrow="Legal" title="이용약관" updatedAt="2026년 1월 1일">
      <section>
        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 오늘운(이하 &ldquo;서비스&rdquo;)이 제공하는 AI 운세 서비스의
          이용 조건 및 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2>제2조 (서비스 내용)</h2>
        <p>
          서비스는 인공지능(AI) 기술을 활용하여 타로, 사주, 꿈해몽, 별자리 등 운세
          관련 콘텐츠를 제공합니다. 모든 해석 결과는 오락 및 참고 목적으로만
          제공됩니다.
        </p>
      </section>

      <section>
        <h2>제3조 (면책 조항)</h2>
        <p>
          서비스가 제공하는 운세 해석은 AI가 생성한 콘텐츠로, 사실이나 예언을
          보장하지 않습니다. 이용자가 서비스의 내용을 신뢰하여 내린 결정 및 그로 인해
          발생한 결과에 대해 서비스 운영자는 법령이 허용하는 범위 내에서 책임을 지지
          않습니다.
        </p>
      </section>

      <section>
        <h2>제4조 (이용 제한)</h2>
        <p>다음의 행위는 금지됩니다.</p>
        <ul>
          <li>서비스를 영리 목적으로 무단 복제·배포하는 행위</li>
          <li>타인의 정보를 도용하여 이용하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>자동화된 수단으로 서비스에 과도한 부하를 유발하는 행위</li>
        </ul>
      </section>

      <section>
        <h2>제5조 (지식재산권)</h2>
        <p>
          서비스가 제공하는 화면 구성, 이미지, 텍스트 등 콘텐츠에 대한 저작권 및
          지식재산권은 서비스 운영자에게 귀속됩니다. 이용자는 개인적·비상업적
          용도로만 콘텐츠를 이용할 수 있습니다.
        </p>
      </section>

      <section>
        <h2>제6조 (약관 변경)</h2>
        <p>
          운영자는 필요 시 약관을 변경할 수 있으며, 변경 내용은 서비스 내 공지를
          통해 안내합니다. 변경된 약관은 공지된 시점부터 효력이 발생합니다.
        </p>
      </section>
    </ContentPage>
  );
}
