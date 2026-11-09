import React, { useEffect, useRef, useState } from 'react';
import '../pages/client/MapPage.css'; // 스타일 파일
import { BUILDINGS, BACKGROUND_ELEMENTS } from './CampusMapData.js';
import { BUILDINGS_BOX, fitViewBox, padBox, shiftUp } from './campusMapView';

// 건물 영역(+여유)을 화면에 맞출 기준. 지도 칸 크기가 바뀔 때마다 이 영역이 꽉 차도록 viewBox를 다시 잡는다.
// shiftUp: 지도를 칸 안에서 살짝 위로 올려 상단의 길만 있는 부분을 덜 보이게 한다 (SHIFT_UP_RATIO).
const FOCUS = shiftUp(padBox(BUILDINGS_BOX));
const FOCUS_ASPECT = FOCUS.w / FOCUS.h;

const CampusMap = ({ selectedBuilding, onBuildingClick }) => {
  const wrapperRef = useRef(null);
  const [viewBox, setViewBox] = useState(() => fitViewBox(FOCUS, FOCUS_ASPECT));

  // 기기 화면비/회전/창 크기와 관계없이 건물 영역이 지도 칸을 최대한 채우도록 맞춘다
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewBox(fitViewBox(FOCUS, width / height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const getBuildingClass = (buildingId, colorClass) => {
    const isSelected = selectedBuilding === buildingId;
    return `${colorClass} ${isSelected ? 'selected-building' : ''} building-path`;
  };

  return (
    <div className="map-wrapper" ref={wrapperRef}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={viewBox}
        className="campus-map-svg"
      >
        <defs>
          <style>
            {`
              .cls-1{fill:#6eb3bc;}.cls-2{fill:#34a295;}.cls-3{fill:#c76577;}
              .cls-4{fill:#8e3160;}.cls-5{fill:#9f2e29;}.cls-6{fill:#c9a063;}
              .cls-7{fill:#c2446d;}.cls-8{fill:#53873f;}.cls-9{stroke-width:13px;}
              .cls-9,.cls-10{fill:none;stroke:#c3b7b4;stroke-miterlimit:10;}
              .cls-11{fill:#a1ad66;opacity:.7;}.cls-10{stroke-width:30px;}
              .cls-12{fill:#8c558c;}.cls-13{fill:#52883e;}.cls-14{fill:#187286;}
              .cls-15{fill:#d68734;}.cls-16{fill:#268970;}.cls-17{fill:#7796b0;}
              .cls-18{fill:#bf4a40;}
            `}
          </style>
        </defs>

        {/* --- 1. 배경/장식 레이어 --- */}
        <g id="Background_Layer" style={{ pointerEvents: 'none' }}>
          {BACKGROUND_ELEMENTS.map((el, idx) => {
            const uniqueKey = `bg-${idx}`; // key는 여기서 별도로 관리
            const { type, ...domProps } = el; // type과 나머지 props 분리

            if (type === 'path') return <path key={uniqueKey} {...domProps} />;
            if (type === 'line') return <line key={uniqueKey} {...domProps} />;
            if (type === 'circle') return <circle key={uniqueKey} {...domProps} />;
            return null;
          })}
        </g>

        {/* --- 2. 건물 레이어 --- */}
        <g id="Buildings_Layer">
          {BUILDINGS.map((building) => {
            // key는 elementProps에 넣지 않고 map의 JSX에서 직접 할당
            const elementProps = {
              id: building.id,
              className: getBuildingClass(building.id, building.className),
              onClick: (e) => {
                e.stopPropagation();
                onBuildingClick(building.id);
              }
            };

            const renderShape = () => {
              if (building.type === 'path') {
                return <path {...elementProps} d={building.d} />;
              }
              if (building.type === 'rect') {
                return (
                  <rect 
                    {...elementProps} 
                    x={building.x} 
                    y={building.y} 
                    width={building.width} 
                    height={building.height} 
                    rx={building.rx || 0} 
                    ry={building.ry || 0} 
                  />
                );
              }
              if (building.type === 'circle') {
                return (
                  <circle 
                    {...elementProps} 
                    cx={building.cx} 
                    cy={building.cy} 
                    r={building.r} 
                  />
                );
              }
              return null;
            };

            // transform이 있으면 그룹으로 감싸기
            if (building.transform) {
              return (
                <g key={building.id} transform={building.transform}>
                  {renderShape()}
                </g>
              );
            }

            return <React.Fragment key={building.id}>{renderShape()}</React.Fragment>;
          })}
        </g>
      </svg>
    </div>
  );
};

export default CampusMap;