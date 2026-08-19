import type { Metadata } from "next";
import ContentPage from "@/components/common/ContentPage";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "문의하기 | 오늘운",
  description:
    "오늘운 서비스 이용 중 궁금한 점, 오류 신고, 제휴·광고 문의를 남기는 방법을 안내합니다.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <ContentPage eyebrow="Contact" title="문의하기">
      <p>
        오늘운을 이용해 주셔서 감사합니다. 서비스에 대한 문의, 오류 신고, 제휴 및 광고
        제안 등 어떤 내용이든 아래 이메일로 편하게 연락해 주세요. 확인 후 순차적으로
        답변드리겠습니다.
      </p>

      <section>
        <h2>이메일 문의</h2>
        <p>
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
        </p>
      </section>

      <section>
        <h2>이런 내용을 문의할 수 있어요</h2>
        <ul>
          <li>운세 결과가 표시되지 않거나 오류가 발생한 경우</li>
          <li>계정·로그인 관련 문제</li>
          <li>개인정보 열람·삭제 요청</li>
          <li>제휴, 광고, 콘텐츠 이용 제안</li>
          <li>기타 서비스 개선 의견</li>
        </ul>
      </section>

      <section>
        <h2>문의 전 참고</h2>
        <p>
          오늘운의 운세 해석은 재미와 참고를 위한 콘텐츠이며, 개별 운세 결과에 대한
          상담이나 사실 확인은 제공하지 않습니다. 서비스 소개는{" "}
          <a href="/about">서비스 소개</a> 페이지에서 확인하실 수 있습니다.
        </p>
      </section>
    </ContentPage>
  );
}
