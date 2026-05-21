'use client'

import { useEffect, useState } from 'react'
import SkyLayer from './SkyLayer'

// 시간대별 HSL 키프레임 (hour, hue, saturation%, lightness%)
// 정오(12시)가 가장 밝은 채도 낮은 어두운 보라색, 22시~02시는 블랙에 가까움
const KEYFRAMES = [
  { hour: 0,  h: 270, s: 3,  l: 2  },  // 자정 — 거의 블랙
  { hour: 2,  h: 270, s: 5,  l: 4  },  // 02시
  { hour: 4,  h: 270, s: 8,  l: 9  },  // 04시
  { hour: 6,  h: 270, s: 13, l: 16 },  // 06시 — 새벽
  { hour: 8,  h: 270, s: 17, l: 25 },  // 08시 — 아침
  { hour: 10, h: 270, s: 20, l: 33 },  // 10시
  { hour: 12, h: 270, s: 22, l: 38 },  // 12시 — 가장 밝은 채도 낮은 보라
  { hour: 14, h: 270, s: 17, l: 29 },  // 14시
  { hour: 16, h: 270, s: 12, l: 19 },  // 16시 — 오후
  { hour: 18, h: 270, s: 8,  l: 11 },  // 18시 — 저녁
  { hour: 20, h: 270, s: 4,  l: 5  },  // 20시 — 밤
  { hour: 22, h: 0,   s: 0,  l: 0  },  // 22시 — 블랙
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getColorForTime(totalMinutes: number): string {
  const hour = totalMinutes / 60

  // 22시 이후~다음날 00시: 블랙 → 자정 키프레임으로 보간
  // KEYFRAMES는 0~22 사이를 커버하고, 22~24는 22시(블랙)→다음날 00시로 보간
  const extended = [
    ...KEYFRAMES,
    { hour: 24, h: 270, s: 3, l: 2 }, // 24시 = 다음날 00시와 동일
  ]

  // 현재 시간이 속한 구간 찾기
  let from = extended[extended.length - 2]
  let to = extended[extended.length - 1]

  for (let i = 0; i < extended.length - 1; i++) {
    if (hour >= extended[i].hour && hour < extended[i + 1].hour) {
      from = extended[i]
      to = extended[i + 1]
      break
    }
  }

  const t = (hour - from.hour) / (to.hour - from.hour)
  const h = Math.round(lerp(from.h, to.h, t))
  const s = lerp(from.s, to.s, t).toFixed(1)
  const l = lerp(from.l, to.l, t).toFixed(1)

  return `hsl(${h}, ${s}%, ${l}%)`
}

export default function TimeBackground({ children }: { children: React.ReactNode }) {
  const [bgColor, setBgColor] = useState('#000000')

  useEffect(() => {
    function update() {
      const now = new Date()
      const totalMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
      setBgColor(getColorForTime(totalMinutes))
    }

    update()
    const interval = setInterval(update, 60_000) // 1분마다 갱신
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="relative min-h-screen transition-colors duration-[3000ms] ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <SkyLayer />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
