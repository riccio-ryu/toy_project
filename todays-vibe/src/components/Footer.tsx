"use client";

import { useState } from "react";
import LegalModal from "@/components/common/LegalModal";

type ModalType = "terms" | "privacy" | null;

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="mt-auto border-t border-white/10">
        {/* 접힌 상태 */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 text-white/30 hover:text-white/50 text-xs transition-colors"
        >
          <span>© 2026 오늘운</span>
          <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>∨</span>
        </button>

        {/* 펼친 상태 */}
        <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-6 pb-8 space-y-6 max-w-xl mx-auto">

            {/* 면책조항 */}
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-white/40 text-[11px] leading-relaxed">
                본 서비스의 AI 운세 해석은 <span className="text-white/60">재미와 참고 목적</span>으로 제공됩니다.
                실제 의사결정, 투자, 건강, 법률 등 중요한 사안에 활용하지 마세요.
                운세 결과는 개인의 상황에 따라 다를 수 있습니다.
              </p>
            </div>

            {/* 링크 */}
            <div className="flex justify-center gap-6 text-xs text-white/40">
              <button onClick={() => setModal("terms")} className="hover:text-white/70 transition-colors">이용약관</button>
              <span className="text-white/20">·</span>
              <button onClick={() => setModal("privacy")} className="hover:text-white/70 transition-colors">개인정보처리방침</button>
              <span className="text-white/20">·</span>
              <a href="mailto:ters9292@gmail.com" className="hover:text-white/70 transition-colors">문의하기</a>
            </div>

            <p className="text-center text-white/20 text-[11px]">© 2026 오늘운 · All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 이용약관 */}
      <LegalModal isOpen={modal === "terms"} onClose={() => setModal(null)} title="이용약관">
        <section>
          <h3 className="text-white/80 font-semibold mb-2">제1조 목적</h3>
          <p>본 약관은 오늘운(이하 "서비스")이 제공하는 AI 운세 서비스의 이용 조건 및 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">제2조 서비스 내용</h3>
          <p>서비스는 인공지능(AI) 기술을 활용하여 타로, 사주, 꿈해몽, 별자리 등 운세 관련 콘텐츠를 제공합니다. 모든 해석 결과는 오락 및 참고 목적으로만 제공됩니다.</p>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">제3조 면책 조항</h3>
          <p>서비스가 제공하는 운세 해석은 AI가 생성한 콘텐츠로, 사실이나 예언을 보장하지 않습니다. 서비스 이용으로 인한 실제 손해에 대해 서비스 운영자는 책임을 지지 않습니다.</p>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">제4조 이용 제한</h3>
          <p>다음의 행위는 금지됩니다.</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-white/50">
            <li>서비스를 영리 목적으로 무단 복제·배포하는 행위</li>
            <li>타인의 정보를 도용하여 이용하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
          </ul>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">제5조 약관 변경</h3>
          <p>운영자는 필요 시 약관을 변경할 수 있으며, 변경 내용은 서비스 내 공지를 통해 안내합니다.</p>
        </section>
        <p className="text-white/30 text-xs">시행일: 2026년 1월 1일</p>
      </LegalModal>

      {/* 개인정보처리방침 */}
      <LegalModal isOpen={modal === "privacy"} onClose={() => setModal(null)} title="개인정보처리방침">
        <section>
          <h3 className="text-white/80 font-semibold mb-2">1. 수집하는 개인정보</h3>
          <ul className="list-disc list-inside space-y-1 text-white/50">
            <li>소셜 로그인 시: 이름, 이메일, 프로필 사진</li>
            <li>서비스 이용 시: 생년월일(사주), 꿈 내용, 질문 텍스트</li>
            <li>자동 수집: 접속 일시, 서비스 이용 기록</li>
          </ul>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">2. 수집 및 이용 목적</h3>
          <ul className="list-disc list-inside space-y-1 text-white/50">
            <li>AI 운세 해석 서비스 제공</li>
            <li>이용 내역 저장 및 조회 기능 제공</li>
            <li>서비스 개선 및 품질 관리</li>
          </ul>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">3. 보관 기간</h3>
          <p>회원 탈퇴 시 즉시 삭제됩니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관 후 삭제합니다.</p>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">4. 제3자 제공</h3>
          <p>수집한 개인정보는 원칙적으로 제3자에게 제공하지 않습니다. 단, AI 운세 해석을 위해 Anthropic Claude API에 입력 내용이 전송될 수 있습니다.</p>
        </section>
        <section>
          <h3 className="text-white/80 font-semibold mb-2">5. 문의</h3>
          <p>개인정보 관련 문의는 <a href="mailto:ters9292@gmail.com" className="text-purple-400 hover:underline">ters9292@gmail.com</a>으로 연락해 주세요.</p>
        </section>
        <p className="text-white/30 text-xs">시행일: 2026년 1월 1일</p>
      </LegalModal>
    </>
  );
}
