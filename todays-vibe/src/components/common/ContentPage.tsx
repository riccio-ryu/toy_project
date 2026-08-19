import Link from "next/link";

/**
 * 정적 콘텐츠 페이지(소개·약관·개인정보·문의) 공통 셸.
 * 크롤러가 읽을 수 있도록 서버 렌더링되는 순수 텍스트 레이아웃.
 */
export default function ContentPage({
  eyebrow,
  title,
  updatedAt,
  children,
}: {
  eyebrow?: string;
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-12">
      <article className="max-w-2xl mx-auto">
        <header className="mb-8">
          {eyebrow && <p className="text-white/40 text-sm mb-2">{eyebrow}</p>}
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {updatedAt && (
            <p className="text-white/30 text-xs mt-3">최종 업데이트: {updatedAt}</p>
          )}
        </header>

        <div className="space-y-6 text-white/60 text-[15px] leading-relaxed [&_h2]:text-white/85 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-2 [&_a]:text-purple-400 [&_a]:hover:underline [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_strong]:text-white/80">
          {children}
        </div>

        <footer className="mt-12 pt-6 border-t border-white/10">
          <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </footer>
      </article>
    </div>
  );
}
