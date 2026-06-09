import TimeBackground from "@/components/TimeBackground";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <TimeBackground>
      <Header />
      <main className="pt-14">
        {children}
      </main>
      <Footer />
    </TimeBackground>
  );
}
