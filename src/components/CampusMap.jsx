import React from 'react';
import '../pages/client/MapPage.css'; // 스타일 파일
import { BUILDINGS, BACKGROUND_ELEMENTS } from './CampusMapData.js';

const CampusMap = ({ selectedBuilding, onBuildingClick }) => {

  const getBuildingClass = (buildingId, colorClass) => {
    const isSelected = selectedBuilding === buildingId;
    return `${colorClass} ${isSelected ? 'selected-building' : ''} building-path`;
  };

  return (
    <div className="map-wrapper">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1114.27 1155.08"
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
              
              .building-path { 
                cursor: pointer; 
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                transform-box: fill-box;
                transform-origin: center;
              }
              .building-path:hover { 
                opacity: 0.9; 
                filter: brightness(1.1);
                transform: translateY(-5px); 
              }
              .selected-building { 
                stroke: #fff; 
                stroke-width: 4px; 
                filter: drop-shadow(0 0 8px rgba(0,0,0,0.3)); 
                opacity: 1 !important;
                z-index: 999; 
              }
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