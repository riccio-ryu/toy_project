export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-black flex flex-col items-center justify-center px-4">
      {children}
    </div>
  );
}
