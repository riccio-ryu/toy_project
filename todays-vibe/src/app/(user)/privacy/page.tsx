import type { Metadata } from "next";
import ContentPage from "@/components/common/ContentPage";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 오늘운",
  description:
    "오늘운이 수집하는 개인정보 항목, 이용 목적, 보관 기간, 제3자 제공 및 광고 쿠키 사용에 관한 안내입니다.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal" title="개인정보처리방침" updatedAt="2026년 1월 1일">
      <p>
        오늘운(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를 소중히 여기며, 관련
        법령을 준수합니다. 본 방침은 서비스가 어떤 개인정보를 어떻게 수집·이용·보관하는지
        설명합니다.
      </p>

      <section>
        <h2>1. 수집하는 개인정보</h2>
        <ul>
          <li>소셜 로그인 시: 이름, 이메일, 프로필 사진</li>
          <li>서비스 이용 시: 생년월일(사주), 꿈 내용, 질문 텍스트 등 입력 정보</li>
          <li>자동 수집: 접속 일시, 서비스 이용 기록, 브라우저·기기 정보, 쿠키</li>
        </ul>
      </section>

      <section>
        <h2>2. 수집 및 이용 목적</h2>
        <ul>
          <li>AI 운세 해석 서비스 제공</li>
          <li>이용 내역 저장 및 조회 기능 제공</li>
          <li>서비스 개선 및 품질 관리</li>
          <li>부정 이용 방지 및 서비스 안정성 확보</li>
        </ul>
      </section>

      <section>
        <h2>3. 보관 기간</h2>
        <p>
          회원 탈퇴 시 수집한 개인정보는 즉시 삭제됩니다. 단, 관련 법령에 따라 일정
          기간 보관이 필요한 경우 해당 기간 동안 보관 후 지체 없이 파기합니다.
        </p>
      </section>

      <section>
        <h2>4. 제3자 제공 및 처리 위탁</h2>
        <p>
          수집한 개인정보는 원칙적으로 제3자에게 제공하지 않습니다. 다만 서비스 제공을
          위해 아래와 같이 일부 정보를 외부 처리자에게 전송·위탁할 수 있습니다.
        </p>
        <ul>
          <li>Anthropic Claude API — AI 운세 해석을 위한 입력 내용 처리</li>
          <li>Google Firebase — 인증 및 데이터 저장</li>
        </ul>
      </section>

      <section>
        <h2>5. 쿠키 및 광고</h2>
        <p>
          서비스는 이용자 경험 개선과 광고 게재를 위해 쿠키를 사용할 수 있습니다.
          Google 등 제3자 광고 사업자는 쿠키를 이용해 이용자의 관심사에 기반한 광고를
          제공할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있으며,
          Google 광고 설정(
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            google.com/settings/ads
          </a>
          )에서 맞춤 광고를 관리할 수 있습니다.
        </p>
      </section>

      <section>
        <h2>6. 이용자의 권리</h2>
        <p>
          이용자는 언제든지 자신의 개인정보 열람·정정·삭제·처리 정지를 요청할 수
          있습니다. 요청은 아래 문의처를 통해 접수됩니다.
        </p>
      </section>

      <section>
        <h2>7. 문의</h2>
        <p>
          개인정보 관련 문의는{" "}
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> 으로 연락해 주세요.
        </p>
      </section>
    </ContentPage>
  );
}
