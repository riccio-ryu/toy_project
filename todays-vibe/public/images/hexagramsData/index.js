import React from 'react';
import { hexagramsData64 } from './hexagramsData64'; // 위 데이터를 import

export default function FullFortuneWheel() {
  const radius = 380; // 외곽 원 반지름

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%" style={{ backgroundColor: '#fff' }}>
      <g transform="translate(500, 500)">
        
        {/* 중앙 선천팔괘 및 붉은 팔각형 선인 장식 요소들은 유지 */}
        <polygon points="0,-250 176.8,-176.8 250,0 176.8,176.8 0,250 -176.8,176.8 -250,0 -176.8,-176.8" fill="none" stroke="#b22222" strokeWidth="3" />

        {/* 64괘 1대1 매칭 완전한 루프 회전 */}
        {hexagramsData64.map((item, idx) => {
          // 360도를 정확히 64등분하여 한 칸당 5.625도씩 회전시킵니다.
          const angle = idx * (360 / 64); 
          
          return (
            <g key={idx} transform={`rotate(${angle}) translate(0, -${radius})`}>
              
              {/* 괘상 막대 그리기 (6층 레이어 복원) */}
              <g fill="#111111">
                {item.pattern.map((isYang, layer) => {
                  const yPos = -5 - (layer * 4); // 아래에서부터 촘촘하게 위로 쌓음
                  return (
                    <g key={layer}>
                      {/* 기본 막대선 */}
                      <rect x="-10" y={yPos} width="20" height="2" />
                      {/* 음(0)일 경우 가운데를 흰색 선으로 잘라 끊어진 막대(⚋) 표현 */}
                      {!isYang && (
                        <rect x="-2" y={yPos - 0.5} width="4" height="3" fill="#ffffff" />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 막대 바로 위에 위치하는 한자 텍스트 (완벽한 단일 원 구조) */}
              {/* 텍스트가 회전축에 맞춰 바르게 서 있도록 고정하되, 가독성을 위해 각도 보정 */}
              <text
                x="0"
                y="-32"
                textAnchor="middle"
                style={{
                  fontFamily: 'Noto Serif KR, serif',
                  fontSize: '10px',
                  fill: '#222222'
                }}
                transform={`rotate(${-angle > 90 && -angle < 270 ? 180 : 0}, 0, -30)`}
              >
                {item.name}
              </text>

            </g>
          );
        })}
      </g>
    </svg>
  );
}