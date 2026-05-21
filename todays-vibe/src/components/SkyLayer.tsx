'use client'

import { useEffect, useState, useId } from 'react'

const MAX = 4_294_967_295
function rng(s: number): number { return ((s * 1_664_525 + 1_013_904_223) >>> 0) }

function getTimeBasedPhase(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60
  return (0.5 + hour / 24) % 1
}

const STARS = Array.from({ length: 80 }, (_, i) => {
  let s = rng((i + 1) * 6_271)
  const x    = (s / MAX) * 100
  s = rng(s); const y       = (s / MAX) * 72
  s = rng(s); const size    = 0.7 + (s / MAX) * 1.0
  s = rng(s); const opacity = 0.35 + (s / MAX) * 0.45
  s = rng(s); const glow    = (s / MAX) > 0.6
  return { x, y, size, opacity, glow, dur: 3 + (i % 7), delay: (i * 0.41) % 7 }
})

const CLOUDS = Array.from({ length: 10 }, (_, i) => {
  let s = rng((i + 1) * 3_571)
  const widthVw = 14 + (s / MAX) * 32
  s = rng(s); const topPct  = 2 + (s / MAX) * 52
  s = rng(s); const dur     = 80 + (s / MAX) * 120
  s = rng(s); const delay   = -Math.round((s / MAX) * dur)
  s = rng(s); const opacity = 0.12 + (s / MAX) * 0.14
  s = rng(s); const variant = Math.floor((s / MAX) * 20)   // 0~19
  return { widthVw, top: `${topPct.toFixed(0)}%`, dur, delay, opacity, variant }
})

// ── 구름 프리셋 20종 ──────────────────────────────────────────────────────────
// 모든 형태는 전역 그라데이션 cPuff·cBase 참조
function CloudShape({ variant }: { variant: number }) {

  // v1 — 소형 두 봉우리
  if (variant === 1) return (
    <svg viewBox="0 0 175 72" width="100%" height="auto">
      <ellipse cx="88"  cy="63" rx="78"  ry="10" fill="url(#cBase)"/>
      <ellipse cx="58"  cy="44" rx="52"  ry="32" fill="url(#cPuff)" opacity="0.80"/>
      <ellipse cx="120" cy="42" rx="54"  ry="34" fill="url(#cPuff)" opacity="0.86"/>
      <ellipse cx="89"  cy="26" rx="33"  ry="21" fill="url(#cPuff)" opacity="0.65"/>
      <ellipse cx="18"  cy="57" rx="22"  ry="9"  fill="url(#cBase)" opacity="0.65"/>
      <ellipse cx="158" cy="56" rx="19"  ry="8"  fill="url(#cBase)" opacity="0.60"/>
    </svg>
  )

  // v2 — 넓은 층운형 (stratus), 봉우리 4개
  if (variant === 2) return (
    <svg viewBox="0 0 380 62" width="100%" height="auto">
      <ellipse cx="190" cy="54" rx="172" ry="10" fill="url(#cBase)"/>
      <ellipse cx="72"  cy="38" rx="68"  ry="28" fill="url(#cPuff)" opacity="0.60"/>
      <ellipse cx="158" cy="34" rx="74"  ry="31" fill="url(#cPuff)" opacity="0.65"/>
      <ellipse cx="248" cy="35" rx="72"  ry="30" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="328" cy="40" rx="58"  ry="25" fill="url(#cPuff)" opacity="0.55"/>
      <ellipse cx="118" cy="20" rx="40"  ry="17" fill="url(#cPuff)" opacity="0.44"/>
      <ellipse cx="218" cy="18" rx="44"  ry="18" fill="url(#cPuff)" opacity="0.46"/>
      <ellipse cx="14"  cy="48" rx="20"  ry="8"  fill="url(#cBase)" opacity="0.50"/>
      <ellipse cx="368" cy="48" rx="18"  ry="7"  fill="url(#cBase)" opacity="0.45"/>
    </svg>
  )

  // v3 — 적란운형, 세로로 키 큰 극적인 형태
  if (variant === 3) return (
    <svg viewBox="0 0 210 100" width="100%" height="auto">
      <ellipse cx="105" cy="90" rx="92"  ry="12" fill="url(#cBase)"/>
      <ellipse cx="105" cy="65" rx="76"  ry="40" fill="url(#cPuff)" opacity="0.86"/>
      <ellipse cx="48"  cy="58" rx="42"  ry="28" fill="url(#cPuff)" opacity="0.60"/>
      <ellipse cx="164" cy="55" rx="44"  ry="30" fill="url(#cPuff)" opacity="0.64"/>
      <ellipse cx="105" cy="40" rx="60"  ry="30" fill="url(#cPuff)" opacity="0.78"/>
      <ellipse cx="105" cy="22" rx="44"  ry="22" fill="url(#cPuff)" opacity="0.68"/>
      <ellipse cx="18"  cy="74" rx="24"  ry="10" fill="url(#cBase)" opacity="0.60"/>
      <ellipse cx="192" cy="72" rx="22"  ry="9"  fill="url(#cBase)" opacity="0.55"/>
    </svg>
  )

  // v4 — 두 봉우리가 뚜렷하게 분리된 넓은 구름
  if (variant === 4) return (
    <svg viewBox="0 0 295 78" width="100%" height="auto">
      <ellipse cx="148" cy="68" rx="132" ry="12" fill="url(#cBase)"/>
      <ellipse cx="88"  cy="48" rx="72"  ry="40" fill="url(#cPuff)" opacity="0.84"/>
      <ellipse cx="208" cy="46" rx="76"  ry="42" fill="url(#cPuff)" opacity="0.88"/>
      <ellipse cx="148" cy="54" rx="44"  ry="27" fill="url(#cPuff)" opacity="0.64"/>
      <ellipse cx="82"  cy="27" rx="36"  ry="22" fill="url(#cPuff)" opacity="0.70"/>
      <ellipse cx="210" cy="25" rx="38"  ry="24" fill="url(#cPuff)" opacity="0.72"/>
      <ellipse cx="20"  cy="62" rx="28"  ry="11" fill="url(#cBase)" opacity="0.65"/>
      <ellipse cx="276" cy="60" rx="24"  ry="10" fill="url(#cBase)" opacity="0.60"/>
    </svg>
  )

  // v5 — 얇고 흐린 권운형 (cirrus)
  if (variant === 5) return (
    <svg viewBox="0 0 330 52" width="100%" height="auto">
      <ellipse cx="165" cy="46" rx="152" ry="8"  fill="url(#cBase)"/>
      <ellipse cx="62"  cy="33" rx="56"  ry="22" fill="url(#cPuff)" opacity="0.50"/>
      <ellipse cx="135" cy="29" rx="64"  ry="24" fill="url(#cPuff)" opacity="0.54"/>
      <ellipse cx="215" cy="30" rx="66"  ry="25" fill="url(#cPuff)" opacity="0.52"/>
      <ellipse cx="285" cy="34" rx="50"  ry="20" fill="url(#cPuff)" opacity="0.44"/>
      <ellipse cx="102" cy="18" rx="42"  ry="14" fill="url(#cPuff)" opacity="0.36"/>
      <ellipse cx="200" cy="16" rx="46"  ry="15" fill="url(#cPuff)" opacity="0.38"/>
      <ellipse cx="12"  cy="40" rx="18"  ry="7"  fill="url(#cBase)" opacity="0.44"/>
      <ellipse cx="318" cy="40" rx="16"  ry="6"  fill="url(#cBase)" opacity="0.40"/>
    </svg>
  )

  // v6 — 넓은 4봉우리 적운
  if (variant === 6) return (
    <svg viewBox="0 0 320 82" width="100%" height="auto">
      <ellipse cx="160" cy="72" rx="145" ry="12" fill="url(#cBase)"/>
      <ellipse cx="60"  cy="50" rx="58"  ry="35" fill="url(#cPuff)" opacity="0.80"/>
      <ellipse cx="130" cy="46" rx="62"  ry="38" fill="url(#cPuff)" opacity="0.85"/>
      <ellipse cx="202" cy="47" rx="64"  ry="37" fill="url(#cPuff)" opacity="0.84"/>
      <ellipse cx="272" cy="51" rx="56"  ry="33" fill="url(#cPuff)" opacity="0.78"/>
      <ellipse cx="115" cy="27" rx="36"  ry="22" fill="url(#cPuff)" opacity="0.65"/>
      <ellipse cx="200" cy="26" rx="38"  ry="23" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="22"  cy="63" rx="28"  ry="11" fill="url(#cBase)" opacity="0.65"/>
      <ellipse cx="300" cy="62" rx="25"  ry="10" fill="url(#cBase)" opacity="0.60"/>
    </svg>
  )

  // v7 — 왼쪽이 더 크고 높은 비대칭 구름
  if (variant === 7) return (
    <svg viewBox="0 0 260 82" width="100%" height="auto">
      <ellipse cx="130" cy="72" rx="118" ry="11" fill="url(#cBase)"/>
      <ellipse cx="76"  cy="46" rx="74"  ry="42" fill="url(#cPuff)" opacity="0.90"/>
      <ellipse cx="168" cy="52" rx="62"  ry="35" fill="url(#cPuff)" opacity="0.78"/>
      <ellipse cx="74"  cy="24" rx="44"  ry="26" fill="url(#cPuff)" opacity="0.72"/>
      <ellipse cx="148" cy="35" rx="36"  ry="20" fill="url(#cPuff)" opacity="0.58"/>
      <ellipse cx="212" cy="38" rx="30"  ry="18" fill="url(#cPuff)" opacity="0.52"/>
      <ellipse cx="18"  cy="62" rx="26"  ry="10" fill="url(#cBase)" opacity="0.70"/>
      <ellipse cx="242" cy="62" rx="22"  ry="9"  fill="url(#cBase)" opacity="0.55"/>
    </svg>
  )

  // v8 — 단일 큰 봉우리, 수직으로 웅장
  if (variant === 8) return (
    <svg viewBox="0 0 165 90" width="100%" height="auto">
      <ellipse cx="82"  cy="79" rx="74"  ry="13" fill="url(#cBase)"/>
      <ellipse cx="82"  cy="54" rx="70"  ry="44" fill="url(#cPuff)" opacity="0.90"/>
      <ellipse cx="82"  cy="32" rx="52"  ry="32" fill="url(#cPuff)" opacity="0.78"/>
      <ellipse cx="82"  cy="16" rx="34"  ry="20" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="36"  cy="60" rx="34"  ry="20" fill="url(#cPuff)" opacity="0.55"/>
      <ellipse cx="128" cy="58" rx="34"  ry="20" fill="url(#cPuff)" opacity="0.55"/>
      <ellipse cx="18"  cy="70" rx="24"  ry="10" fill="url(#cBase)" opacity="0.65"/>
      <ellipse cx="146" cy="68" rx="22"  ry="9"  fill="url(#cBase)" opacity="0.60"/>
    </svg>
  )

  // v9 — 2단 레이어 구름, 상하 겹침
  if (variant === 9) return (
    <svg viewBox="0 0 280 95" width="100%" height="auto">
      <ellipse cx="140" cy="85" rx="128" ry="12" fill="url(#cBase)"/>
      <ellipse cx="70"  cy="65" rx="60"  ry="32" fill="url(#cPuff)" opacity="0.78"/>
      <ellipse cx="145" cy="63" rx="65"  ry="34" fill="url(#cPuff)" opacity="0.82"/>
      <ellipse cx="218" cy="66" rx="58"  ry="30" fill="url(#cPuff)" opacity="0.76"/>
      <ellipse cx="100" cy="38" rx="52"  ry="28" fill="url(#cPuff)" opacity="0.66"/>
      <ellipse cx="178" cy="36" rx="54"  ry="28" fill="url(#cPuff)" opacity="0.64"/>
      <ellipse cx="140" cy="18" rx="40"  ry="22" fill="url(#cPuff)" opacity="0.52"/>
      <ellipse cx="22"  cy="75" rx="25"  ry="10" fill="url(#cBase)" opacity="0.62"/>
      <ellipse cx="258" cy="73" rx="24"  ry="10" fill="url(#cBase)" opacity="0.58"/>
    </svg>
  )

  // v10 — 왼쪽 큰 봉우리에서 오른쪽으로 흘러내리는 흘림 구름
  if (variant === 10) return (
    <svg viewBox="0 0 345 72" width="100%" height="auto">
      <ellipse cx="172" cy="63" rx="158" ry="10" fill="url(#cBase)"/>
      <ellipse cx="70"  cy="44" rx="66"  ry="38" fill="url(#cPuff)" opacity="0.88"/>
      <ellipse cx="70"  cy="24" rx="46"  ry="28" fill="url(#cPuff)" opacity="0.72"/>
      <ellipse cx="150" cy="46" rx="58"  ry="26" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="225" cy="51" rx="52"  ry="20" fill="url(#cPuff)" opacity="0.46"/>
      <ellipse cx="295" cy="55" rx="48"  ry="16" fill="url(#cPuff)" opacity="0.32"/>
      <ellipse cx="18"  cy="57" rx="22"  ry="9"  fill="url(#cBase)" opacity="0.68"/>
      <ellipse cx="330" cy="59" rx="20"  ry="7"  fill="url(#cBase)" opacity="0.32"/>
    </svg>
  )

  // v11 — 빽빽하고 꽉 찬 봉우리 여러 개
  if (variant === 11) return (
    <svg viewBox="0 0 225 78" width="100%" height="auto">
      <ellipse cx="112" cy="68" rx="102" ry="11" fill="url(#cBase)"/>
      <ellipse cx="55"  cy="47" rx="52"  ry="30" fill="url(#cPuff)" opacity="0.85"/>
      <ellipse cx="110" cy="44" rx="54"  ry="32" fill="url(#cPuff)" opacity="0.90"/>
      <ellipse cx="165" cy="47" rx="50"  ry="29" fill="url(#cPuff)" opacity="0.84"/>
      <ellipse cx="80"  cy="27" rx="38"  ry="22" fill="url(#cPuff)" opacity="0.68"/>
      <ellipse cx="140" cy="25" rx="40"  ry="23" fill="url(#cPuff)" opacity="0.65"/>
      <ellipse cx="110" cy="12" rx="28"  ry="16" fill="url(#cPuff)" opacity="0.52"/>
      <ellipse cx="20"  cy="59" rx="22"  ry="9"  fill="url(#cBase)" opacity="0.65"/>
      <ellipse cx="205" cy="58" rx="20"  ry="8"  fill="url(#cBase)" opacity="0.60"/>
    </svg>
  )

  // v12 — 가로로 긴 중형 3봉우리
  if (variant === 12) return (
    <svg viewBox="0 0 305 70" width="100%" height="auto">
      <ellipse cx="152" cy="61" rx="138" ry="11" fill="url(#cBase)"/>
      <ellipse cx="68"  cy="43" rx="62"  ry="34" fill="url(#cPuff)" opacity="0.80"/>
      <ellipse cx="150" cy="40" rx="68"  ry="37" fill="url(#cPuff)" opacity="0.86"/>
      <ellipse cx="232" cy="43" rx="60"  ry="33" fill="url(#cPuff)" opacity="0.80"/>
      <ellipse cx="110" cy="22" rx="42"  ry="22" fill="url(#cPuff)" opacity="0.64"/>
      <ellipse cx="190" cy="21" rx="44"  ry="23" fill="url(#cPuff)" opacity="0.61"/>
      <ellipse cx="22"  cy="54" rx="28"  ry="10" fill="url(#cBase)" opacity="0.62"/>
      <ellipse cx="284" cy="53" rx="24"  ry="9"  fill="url(#cBase)" opacity="0.58"/>
    </svg>
  )

  // v13 — 오른쪽이 더 크고 높은 비대칭
  if (variant === 13) return (
    <svg viewBox="0 0 265 80" width="100%" height="auto">
      <ellipse cx="132" cy="70" rx="120" ry="11" fill="url(#cBase)"/>
      <ellipse cx="90"  cy="52" rx="60"  ry="34" fill="url(#cPuff)" opacity="0.76"/>
      <ellipse cx="188" cy="47" rx="76"  ry="43" fill="url(#cPuff)" opacity="0.92"/>
      <ellipse cx="192" cy="24" rx="46"  ry="28" fill="url(#cPuff)" opacity="0.74"/>
      <ellipse cx="138" cy="38" rx="40"  ry="24" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="60"  cy="36" rx="30"  ry="18" fill="url(#cPuff)" opacity="0.52"/>
      <ellipse cx="20"  cy="63" rx="24"  ry="9"  fill="url(#cBase)" opacity="0.58"/>
      <ellipse cx="248" cy="60" rx="26"  ry="10" fill="url(#cBase)" opacity="0.68"/>
    </svg>
  )

  // v14 — 아주 넓은 파노라마형 5봉우리
  if (variant === 14) return (
    <svg viewBox="0 0 420 65" width="100%" height="auto">
      <ellipse cx="210" cy="56" rx="200" ry="10" fill="url(#cBase)"/>
      <ellipse cx="56"  cy="40" rx="54"  ry="26" fill="url(#cPuff)" opacity="0.56"/>
      <ellipse cx="130" cy="36" rx="66"  ry="29" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="210" cy="34" rx="70"  ry="31" fill="url(#cPuff)" opacity="0.66"/>
      <ellipse cx="294" cy="36" rx="66"  ry="29" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="368" cy="40" rx="54"  ry="25" fill="url(#cPuff)" opacity="0.55"/>
      <ellipse cx="168" cy="18" rx="44"  ry="17" fill="url(#cPuff)" opacity="0.42"/>
      <ellipse cx="252" cy="17" rx="46"  ry="18" fill="url(#cPuff)" opacity="0.44"/>
      <ellipse cx="12"  cy="48" rx="20"  ry="8"  fill="url(#cBase)" opacity="0.46"/>
      <ellipse cx="408" cy="48" rx="18"  ry="7"  fill="url(#cBase)" opacity="0.42"/>
    </svg>
  )

  // v15 — 완만하게 굴곡진 구릉형 (rolling hills)
  if (variant === 15) return (
    <svg viewBox="0 0 310 72" width="100%" height="auto">
      <ellipse cx="155" cy="63" rx="140" ry="11" fill="url(#cBase)"/>
      <ellipse cx="62"  cy="46" rx="58"  ry="30" fill="url(#cPuff)" opacity="0.78"/>
      <ellipse cx="132" cy="42" rx="62"  ry="33" fill="url(#cPuff)" opacity="0.84"/>
      <ellipse cx="205" cy="44" rx="60"  ry="31" fill="url(#cPuff)" opacity="0.82"/>
      <ellipse cx="268" cy="48" rx="52"  ry="27" fill="url(#cPuff)" opacity="0.74"/>
      <ellipse cx="100" cy="28" rx="34"  ry="16" fill="url(#cPuff)" opacity="0.50"/>
      <ellipse cx="175" cy="26" rx="36"  ry="17" fill="url(#cPuff)" opacity="0.48"/>
      <ellipse cx="245" cy="29" rx="32"  ry="15" fill="url(#cPuff)" opacity="0.46"/>
      <ellipse cx="20"  cy="56" rx="28"  ry="10" fill="url(#cBase)" opacity="0.60"/>
      <ellipse cx="292" cy="56" rx="24"  ry="9"  fill="url(#cBase)" opacity="0.56"/>
    </svg>
  )

  // v16 — 소형 3봉우리 콤팩트
  if (variant === 16) return (
    <svg viewBox="0 0 185 70" width="100%" height="auto">
      <ellipse cx="92"  cy="61" rx="82"  ry="10" fill="url(#cBase)"/>
      <ellipse cx="52"  cy="44" rx="50"  ry="30" fill="url(#cPuff)" opacity="0.82"/>
      <ellipse cx="100" cy="41" rx="54"  ry="33" fill="url(#cPuff)" opacity="0.88"/>
      <ellipse cx="148" cy="44" rx="48"  ry="29" fill="url(#cPuff)" opacity="0.80"/>
      <ellipse cx="92"  cy="23" rx="36"  ry="21" fill="url(#cPuff)" opacity="0.66"/>
      <ellipse cx="16"  cy="54" rx="20"  ry="8"  fill="url(#cBase)" opacity="0.62"/>
      <ellipse cx="170" cy="55" rx="18"  ry="7"  fill="url(#cBase)" opacity="0.58"/>
    </svg>
  )

  // v17 — 3단 층 구름, 위로 갈수록 좁아짐
  if (variant === 17) return (
    <svg viewBox="0 0 230 105" width="100%" height="auto">
      <ellipse cx="115" cy="93" rx="105" ry="14" fill="url(#cBase)"/>
      <ellipse cx="62"  cy="72" rx="60"  ry="35" fill="url(#cPuff)" opacity="0.82"/>
      <ellipse cx="145" cy="70" rx="68"  ry="37" fill="url(#cPuff)" opacity="0.85"/>
      <ellipse cx="188" cy="74" rx="48"  ry="30" fill="url(#cPuff)" opacity="0.76"/>
      <ellipse cx="90"  cy="46" rx="54"  ry="30" fill="url(#cPuff)" opacity="0.72"/>
      <ellipse cx="152" cy="44" rx="56"  ry="30" fill="url(#cPuff)" opacity="0.70"/>
      <ellipse cx="118" cy="22" rx="44"  ry="26" fill="url(#cPuff)" opacity="0.62"/>
      <ellipse cx="118" cy="10" rx="28"  ry="16" fill="url(#cPuff)" opacity="0.50"/>
      <ellipse cx="18"  cy="82" rx="24"  ry="10" fill="url(#cBase)" opacity="0.62"/>
      <ellipse cx="212" cy="80" rx="22"  ry="9"  fill="url(#cBase)" opacity="0.58"/>
    </svg>
  )

  // v18 — 퍼프가 간격을 두고 분산된 산개형
  if (variant === 18) return (
    <svg viewBox="0 0 350 80" width="100%" height="auto">
      <ellipse cx="175" cy="70" rx="160" ry="11" fill="url(#cBase)" opacity="0.70"/>
      <ellipse cx="58"  cy="50" rx="52"  ry="32" fill="url(#cPuff)" opacity="0.82"/>
      <ellipse cx="148" cy="46" rx="60"  ry="36" fill="url(#cPuff)" opacity="0.88"/>
      <ellipse cx="248" cy="48" rx="58"  ry="34" fill="url(#cPuff)" opacity="0.84"/>
      <ellipse cx="320" cy="53" rx="44"  ry="26" fill="url(#cPuff)" opacity="0.72"/>
      <ellipse cx="104" cy="42" rx="32"  ry="18" fill="url(#cPuff)" opacity="0.55"/>
      <ellipse cx="200" cy="44" rx="34"  ry="19" fill="url(#cPuff)" opacity="0.52"/>
      <ellipse cx="286" cy="46" rx="28"  ry="16" fill="url(#cPuff)" opacity="0.48"/>
      <ellipse cx="148" cy="24" rx="38"  ry="20" fill="url(#cPuff)" opacity="0.60"/>
      <ellipse cx="248" cy="26" rx="36"  ry="19" fill="url(#cPuff)" opacity="0.58"/>
      <ellipse cx="22"  cy="61" rx="24"  ry="9"  fill="url(#cBase)" opacity="0.60"/>
      <ellipse cx="334" cy="62" rx="22"  ry="8"  fill="url(#cBase)" opacity="0.55"/>
    </svg>
  )

  // v19 — 납작한 층적운 (stratocumulus), 낮은 프로파일
  if (variant === 19) return (
    <svg viewBox="0 0 360 55" width="100%" height="auto">
      <ellipse cx="180" cy="48" rx="166" ry="9"  fill="url(#cBase)"/>
      <ellipse cx="60"  cy="36" rx="58"  ry="20" fill="url(#cPuff)" opacity="0.65"/>
      <ellipse cx="132" cy="33" rx="64"  ry="22" fill="url(#cPuff)" opacity="0.70"/>
      <ellipse cx="206" cy="32" rx="66"  ry="23" fill="url(#cPuff)" opacity="0.68"/>
      <ellipse cx="280" cy="34" rx="62"  ry="21" fill="url(#cPuff)" opacity="0.65"/>
      <ellipse cx="336" cy="38" rx="48"  ry="17" fill="url(#cPuff)" opacity="0.56"/>
      <ellipse cx="94"  cy="20" rx="36"  ry="13" fill="url(#cPuff)" opacity="0.44"/>
      <ellipse cx="190" cy="18" rx="40"  ry="14" fill="url(#cPuff)" opacity="0.46"/>
      <ellipse cx="268" cy="19" rx="36"  ry="13" fill="url(#cPuff)" opacity="0.42"/>
      <ellipse cx="12"  cy="42" rx="18"  ry="7"  fill="url(#cBase)" opacity="0.48"/>
      <ellipse cx="348" cy="42" rx="16"  ry="6"  fill="url(#cBase)" opacity="0.44"/>
    </svg>
  )

  // v0 — 기본 3봉우리 적운 (default)
  return (
    <svg viewBox="0 0 245 82" width="100%" height="auto">
      <ellipse cx="122" cy="72" rx="110" ry="12" fill="url(#cBase)"/>
      <ellipse cx="82"  cy="50" rx="64"  ry="38" fill="url(#cPuff)" opacity="0.82"/>
      <ellipse cx="160" cy="47" rx="70"  ry="42" fill="url(#cPuff)" opacity="0.88"/>
      <ellipse cx="118" cy="31" rx="40"  ry="26" fill="url(#cPuff)" opacity="0.70"/>
      <ellipse cx="28"  cy="63" rx="32"  ry="13" fill="url(#cBase)" opacity="0.70"/>
      <ellipse cx="220" cy="61" rx="28"  ry="12" fill="url(#cBase)" opacity="0.65"/>
    </svg>
  )
}

// ── 달 ────────────────────────────────────────────────────────────────────────
function MoonSVG({ phase }: { phase: number }) {
  const rawId = useId()
  const id    = rawId.replace(/[^a-zA-Z0-9]/g, '')
  const vb = 100, r = vb * 0.42, cx = vb / 2, cy = vb / 2

  if (phase < 0.03 || phase > 0.97) return null

  const isWaxing   = phase <= 0.5
  const cosPhase   = Math.cos(2 * Math.PI * phase)
  const termRx     = Math.abs(cosPhase) * r
  const outerSweep = isWaxing ? 1 : 0
  const termSweep  = isWaxing ? (cosPhase < 0 ? 1 : 0) : (cosPhase < 0 ? 0 : 1)
  const top = `${cx},${cy - r}`, bot = `${cx},${cy + r}`
  const term = termRx < 1 ? `L ${top}` : `A ${termRx},${r},0,0,${termSweep},${top}`
  const litPath = `M ${top} A ${r},${r},0,0,${outerSweep},${bot} ${term} Z`

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} width="100%" height="auto">
      <defs>
        <filter id={`mgf${id}`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="rgba(20, 10, 42, 0.72)"/>
      <path d={litPath} fill="rgba(230, 220, 200, 0.88)" filter={`url(#mgf${id})`}/>
    </svg>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
export default function SkyLayer() {
  const [phase, setPhase]             = useState<number | null>(null)
  const [nightFactor, setNightFactor] = useState(1)

  useEffect(() => {
    const now  = new Date()
    setPhase(getTimeBasedPhase(now))
    const hour = now.getHours() + now.getMinutes() / 60
    setNightFactor((1 - Math.cos(((hour - 12 + 24) % 24) / 24 * 2 * Math.PI)) / 2)
  }, [])

  const starVis = 0.7 + nightFactor * 0.3
  const moonVis = 0.25 + nightFactor * 0.65

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }} aria-hidden="true">

      {/* 전역 그라데이션 */}
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
        <defs>
          <radialGradient id="cPuff" cx="50%" cy="28%" r="68%">
            <stop offset="0%"   stopColor="white" stopOpacity="1.0"/>
            <stop offset="35%"  stopColor="rgb(225,230,245)" stopOpacity="0.75"/>
            <stop offset="75%"  stopColor="rgb(200,210,230)" stopOpacity="0.30"/>
            <stop offset="100%" stopColor="rgb(180,195,220)" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="cBase" cx="50%" cy="60%" r="55%">
            <stop offset="0%"   stopColor="rgb(190,200,220)" stopOpacity="0.50"/>
            <stop offset="60%"  stopColor="rgb(210,220,235)" stopOpacity="0.20"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
      </svg>

      {/* 별 */}
      {STARS.map((star, i) => (
        <div key={i} style={{ position: 'absolute', left: `${star.x}%`, top: `${star.y}%`, opacity: star.opacity * starVis }}>
          <div style={{
            width: `${star.size}px`, height: `${star.size}px`,
            borderRadius: '50%', background: 'white',
            boxShadow: star.glow ? `0 0 ${star.size * 3}px ${star.size * 1.2}px rgba(255,255,255,0.55)` : undefined,
            animation: `twinkle ${star.dur}s ${star.delay}s ease-in-out infinite`,
          }}/>
        </div>
      ))}

      {/* 달 */}
      {phase !== null && (
        <div style={{ position: 'absolute', top: '10%', right: '12%', width: 'clamp(70px, 11vw, 150px)', opacity: moonVis }}>
          <MoonSVG phase={phase}/>
        </div>
      )}

      {/* 구름 */}
      {CLOUDS.map((cloud, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: cloud.top,
          left: 0,
          width: `${cloud.widthVw}vw`,
          opacity: cloud.opacity,
          filter: 'blur(7px)',
          overflow: 'visible',
          animation: `cloudDrift ${cloud.dur}s ${cloud.delay}s linear infinite`,
        }}>
          <CloudShape variant={cloud.variant}/>
        </div>
      ))}
    </div>
  )
}
