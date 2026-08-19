import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/common/ContentPage";

export const metadata: Metadata = {
  title: "서비스 소개 | 오늘운",
  description:
    "오늘운은 사주·타로·꿈해몽·별자리 등 33가지 운세를 AI로 해석해 드리는 운세 플랫폼입니다. 오늘운이 어떤 서비스인지, 어떻게 운세를 해석하는지 소개합니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage eyebrow="About" title="오늘운 소개">
      <p>
        <strong>오늘운</strong>은 사주, 타로, 꿈해몽, 별자리를 비롯한 33가지 운세를
        인공지능(AI)으로 해석해 드리는 운세 콘텐츠 플랫폼입니다. 오래전부터 이어져 온
        동서양의 운세 전통을 현대적인 언어로 풀어, 누구나 부담 없이 자신의 오늘을
        돌아볼 수 있도록 만드는 것을 목표로 합니다.
      </p>

      <section>
        <h2>어떤 운세를 볼 수 있나요?</h2>
        <p>
          오늘운은 크게 네 갈래의 운세를 제공합니다. 각 메뉴는 입력한 정보에 따라
          서로 다른 해석을 생성합니다.
        </p>
        <ul>
          <li>
            <strong>사주·명리</strong> — 생년월일과 태어난 시각을 바탕으로 한 사주팔자,
            토정비결, 평생운, 재물운, 애정운, 건강운, 직업운, 이사운 풀이
          </li>
          <li>
            <strong>타로</strong> — 데일리 원카드, 3장 스프레드, 켈틱 크로스,
            생명의 나무, 말굽 스프레드, 풀문 스프레드 등 다양한 배열
          </li>
          <li>
            <strong>별자리·점성</strong> — 12별자리 오늘·주간·월간·연간 운세와
            별자리 궁합
          </li>
          <li>
            <strong>동양·서양 점술</strong> — 꿈해몽, 주역(I Ching), 룬, 오라클 카드,
            수비학, 성명학, 십이지(띠) 운세, 궁합(연인·이름·사업)
          </li>
        </ul>
      </section>

      <section>
        <h2>운세는 어떻게 해석되나요?</h2>
        <p>
          이용자가 선택하거나 입력한 정보(생년월일, 뽑은 카드, 꾼 꿈의 내용, 질문
          등)를 바탕으로, Anthropic의 Claude AI가 전통 해석 원리와 상징 체계를 참고해
          맞춤형 풀이를 생성합니다. 정해진 문구를 그대로 보여주는 방식이 아니라,
          입력된 맥락에 맞춰 매번 새롭게 문장을 작성합니다.
        </p>
      </section>

      <section>
        <h2>결과는 얼마나 믿어도 되나요?</h2>
        <p>
          오늘운이 제공하는 모든 운세 해석은 <strong>재미와 참고를 위한
          콘텐츠</strong>입니다. 미래를 예언하거나 사실을 보장하지 않으며, 투자·건강·
          법률·진로와 같은 중요한 결정은 반드시 전문가와 상의하고 스스로 판단하시기
          바랍니다. 운세는 오늘 하루를 한 번 더 다정하게 들여다보는 계기일 뿐,
          정답이 아닙니다.
        </p>
      </section>

      <section>
        <h2>더 알아보기</h2>
        <ul>
          <li>
            <Link href="/terms">이용약관</Link> — 서비스 이용 조건
          </li>
          <li>
            <Link href="/privacy">개인정보처리방침</Link> — 개인정보 수집·이용 안내
          </li>
          <li>
            <Link href="/contact">문의하기</Link> — 제휴·오류 신고·기타 문의
          </li>
        </ul>
      </section>
    </ContentPage>
  );
}
