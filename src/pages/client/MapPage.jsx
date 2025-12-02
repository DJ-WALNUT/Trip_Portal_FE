import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building, ArrowRight } from 'lucide-react';
import CampusMap from '../../components/CampusMap'; // 위에서 만든 컴포넌트
import './MapPage.css';

// --- 데이터 정의 (건물 ID와 매칭) ---
const buildingsData = {
  "kim": {
    name: "김수환관 (K관)",
    description: "정문에서 가장 가까우며 교내 상권의 중심입니다.",
    facilities: [
    ]
  },
  "stephano": {
    name: "김수환관 (K관, 스테파노 기숙사)",
    description: "4~15층까지 기숙사이며 그 아래층에는 일반 강의실과 식당, 편의점 등이 있습니다.",
    facilities: [
    ]
  },
  "andrea": {
    name: "안드레아관 (A관)",
    description: "안드레아 기숙사로 불리기도 하며, 세 추기경의 이름을 딴 김수환관, 약학관(정진석 추기경 약학관)에 이어 세번째로 대한민국 추기경의 이름(세례명)을 따왔습니다.",
    facilities: [
    ]
  },
  "maria": {
    name: "마리아관 (M관)",
    description: "인문계열, 사회계열의 과사무실 및 강의실들이 입주해 있습니다.",
    facilities: [
      { name: "대강당", loc: "M101" },
      { name: "우체국", loc: "M1F" },
      { name: "보건실", loc: "M203" }
    ]
  },
  "nicols": {
    name: "니콜스관 (N관)",
    description: "건물 이름은 성심여대의 초대 학장이었던 바바라 니콜스 수녀의 이름에서 유래했습니다.",
    facilities: [
      { name: "교무처", loc: "N201" },
      { name: "입학처", loc: "N205" },
      { name: "총장실", loc: "N301" }
    ]
  },
  "bambino": {
    name: "밤비노관 (BA관)",
    description: "건물 이름은 '작은 예수'의 의미입니다. 2007년 사이언스관이 국제관 공사로 인해 철거되면서 강의 공간이 부족해지자 주차장을 없애고 그 자리에 급하게 세워졌습니다.",
    facilities: [
    ]
  },
  "dasol": {
    name: "다솔관 (D관)",
    description: "다윗의 용기와 솔로몬의 지혜를 줄여 '다솔'로 부릅니다.",
    facilities: [
    ]
  },
  "virtus": {
    name: "비르투스관 (V관)",
    description: "건물 이름은 라틴어로 덕성을 뜻합니다.",
    facilities: [
    ]
  },
  "sophie_barat": {
    name: "소피이바라관 (학생미래인재관 B관)",
    description: "어느 학교 학생회관이 그렇듯이 각종 편의 시설과 동아리방, 총학, 학생회가 입주해 있습니다.",
    facilities: [
    ]
  },
  "smurf_garden": {
    name: "하늘동산 (스머프동산)",
    description: "정식 명칭은 하늘동산이지만 재학생들은 주로 스머프동산이라고 부릅니다.",
    facilities: [
    ]
  },
  "michael1": {
    name: "미카엘관 (행정동, HB관)",
    description: "2004년에 지어진 본관건물로 행정동은 4층, 교수연구동은 9층입니다.",
    facilities: [
    ]
  },
  "michael2": {
    name: "미카엘관 (교수연구동, T관)",
    description: "2004년에 지어진 본관건물로 행정동은 4층, 교수연구동은 9층입니다.",
    facilities: [
    ]
  },
  "veritas": {
    name: "베리타스관 (중앙도서관, L관)",
    description: "정식 이름은 진리를 뜻하는 라틴어인 베리타스관이지만 학생들은 중도(중앙도서관)라 부릅니다.",
    facilities: [
    ]
  },
  "sungsim": {
    name: "성심관 (SH관)",
    description: "성심교정 최북단 건물",
    facilities: [
      { name: "메이커스페이스", loc: "SH201" },
    ]
  },
  "pharmacy": {
    name: "약학관 (NP관)",
    description: "정식이름은 정진석 추기경 약학관 입니다.",
    facilities: [
      { name: "사감실", loc: "S101" },
      { name: "식당", loc: "B1" }
    ]
  },
  "concert_hall": {
    name: "콘서트홀 (CH관)",
    description: "1,500석 규모의 공연장과 강의실이 있는 건물입니다.",
    facilities: [
    ]
  },
  "main-stadium": {
    name: "대운동장",
    description: "아우름제, 체육대회 등 주요 행사가 열리는 운동장입니다.",
    facilities: [
    ]
  },
  "paulus": {
    name: "바오로관 (P관)",
    description: "학교 신부님들의 숙소. 그 외 구성원들은 출입 할 일이 없는 곳 입니다.",
    facilities: [
    ]
  },
  "international": {
    name: "국제교류관 (I관)",
    description: "외국인 교수들을 위한 숙소. 이름 탓에 국제관과 혼동하기 쉽습니다.",
    facilities: [
    ]
  },
  "church": {
    name: "예수성심성당 (C관)",
    description: "성심당이 아닙니다. 성심성당 입니다. 학교 구성원 누구나 이용할 수 있는 교내 성당입니다.",
    facilities: [
    ]
  },
};

const MapPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  // 지도에서 건물 클릭 핸들러
  const handleBuildingClick = (id) => {
    // 이미 선택된 걸 다시 누르면 해제, 아니면 선택
    setSelectedBuildingId(prev => prev === id ? null : id);
  };

  // 렌더링할 정보 결정
  const displayContent = useMemo(() => {
    // 1. 건물이 선택되었을 때
    if (selectedBuildingId && buildingsData[selectedBuildingId]) {
      return {
        type: 'building',
        data: buildingsData[selectedBuildingId]
      };
    }
    
    // 2. 검색어가 있을 때 (건물명 or 시설명 검색)
    if (searchTerm) {
      // 간단한 검색 로직 구현
      const results = Object.entries(buildingsData).filter(([key, bldg]) => {
        return bldg.name.includes(searchTerm) || 
               bldg.facilities.some(f => f.name.includes(searchTerm));
      });
      return { type: 'search', data: results };
    }

    // 3. 기본 상태
    return { type: 'default', data: null };
  }, [selectedBuildingId, searchTerm]);

  return (
    <div className="map-page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h2>성심지도</h2>
          <p>지도를 클릭하여 건물별 행정지원실과 편의시설을 확인하세요.</p>
        </div>
        
        <div className="search-container">
          <input 
            type="text" 
            className="search-input"
            placeholder="건물명 또는 부서명 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedBuildingId(null); // 검색 시 선택 해제
            }}
          />
          <Search className="search-icon" size={20} />
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <CampusMap 
          selectedBuilding={selectedBuildingId} 
          onBuildingClick={handleBuildingClick} 
        />
      </section>

      {/* Info List Section */}
      <section className="info-section">
        
        {/* Case 1: 건물 선택됨 */}
        {displayContent.type === 'building' && (
          <div className="building-detail-card animate-fade-in">
            <div className="detail-header">
              <h3>{displayContent.data.name}</h3>
              <p>{displayContent.data.description}</p>
            </div>
            <div className="facility-grid">
              {displayContent.data.facilities.map((fac, idx) => (
                <div key={idx} className="facility-item">
                  <span className="fac-name">{fac.name}</span>
                  <span className="fac-loc"><MapPin size={14}/> {fac.loc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case 2: 검색 결과 */}
        {displayContent.type === 'search' && (
          <div className="search-results">
            <div className="section-label">검색 결과 ({displayContent.data.length})</div>
            {displayContent.data.map(([id, bldg]) => (
              <div key={id} className="result-item" onClick={() => setSelectedBuildingId(id)}>
                <span className="bldg-name">{bldg.name}</span>
                <ArrowRight size={16} />
              </div>
            ))}
          </div>
        )}

        {/* Case 3: 기본 안내 */}
        {displayContent.type === 'default' && (
          <div className="empty-state">
            <Building size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>지도의 건물을 클릭해보세요</h3>
            <p>건물별 상세 시설 정보가 이곳에 표시됩니다.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MapPage;