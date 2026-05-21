import TimeBackground from '@/components/TimeBackground'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <TimeBackground>
      {children}
    </TimeBackground>
  )
}
