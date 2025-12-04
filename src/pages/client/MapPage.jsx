import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Building, ArrowRight } from 'lucide-react';
import axios from 'axios'; // axios 임포트
import CampusMap from '../../components/CampusMap'; 
import FacilityModal from '../../components/FacilityModal';
import './MapPage.css';

const MapPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  
  // 백엔드 데이터 상태
  const [buildingsData, setBuildingsData] = useState({});
  const [loading, setLoading] = useState(true);

  // 선택된 시설 (팝업용)
  const [selectedFacility, setSelectedFacility] = useState(null);

  // 1. API 데이터 호출 (axios 사용 + 상대 경로)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // [수정] 도메인 제거 (/api/...) 및 axios 사용으로 코드 단축
        const response = await axios.get('/api/campus/info');
        
        if (response.data.status === 'success') {
          setBuildingsData(response.data.data);
        }
      } catch (error) {
        console.error("캠퍼스 정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. 화면에 표시할 콘텐츠 필터링 로직
  const displayContent = useMemo(() => {
    if (loading) return { type: 'loading' };

    // Case A: 건물이 선택된 경우
    if (selectedBuildingId && buildingsData[selectedBuildingId]) {
      return {
        type: 'building',
        data: buildingsData[selectedBuildingId]
      };
    }
    
    // Case B: 검색어가 있는 경우
    if (searchTerm) {
      // [수정] 대소문자 구분 없이 검색하기 위해 검색어를 소문자로 변환
      const lowerTerm = searchTerm.toLowerCase();

      const results = Object.entries(buildingsData).filter(([key, bldg]) => {
        // 1. 건물 이름 매칭 (예: "니콜스")
        const isBuildingMatch = bldg.name.toLowerCase().includes(lowerTerm);

        // 2. 시설 이름 또는 **위치(주소)** 매칭 (예: "입학처" or "N201")
        const isFacilityMatch = bldg.facilities.some(f => 
          f.name.toLowerCase().includes(lowerTerm) || 
          (f.loc && f.loc.toLowerCase().includes(lowerTerm)) ||// [추가됨] 여기서 주소(loc)를 검사합니다.
          (f.desc && f.desc.toLowerCase().includes(lowerTerm))
        );

        return isBuildingMatch || isFacilityMatch;
      });
      return { type: 'search', data: results };
    }

    // Case C: 기본 상태
    return { type: 'default', data: null };
  }, [selectedBuildingId, searchTerm, buildingsData, loading]);


  // 3. 시설 항목 클릭 핸들러 (팝업 오픈)
  const handleFacilityClick = (facility) => {
    setSelectedFacility(facility);
  };

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
              setSelectedBuildingId(null);
            }}
          />
          <Search className="search-icon" size={20} />
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <CampusMap 
          selectedBuilding={selectedBuildingId} 
          onBuildingClick={(id) => setSelectedBuildingId(prev => prev === id ? null : id)} 
        />
      </section>

      {/* Info List Section */}
      <section className="info-section">
        
        {displayContent.type === 'loading' && (
          <div className="empty-state">정보를 불러오는 중입니다...</div>
        )}

        {/* Case 1: 건물 상세 정보 (여기가 수정됨) */}
        {displayContent.type === 'building' && (
          <div className="building-detail-card animate-fade-in">
            <div className="detail-header">
              <h3>{displayContent.data.name}</h3>
              <p>{displayContent.data.description}</p>
            </div>
            
            <div className="facility-grid">
              {(() => {
                // [수정] 렌더링 시 검색어를 기준으로 시설을 한 번 더 필터링합니다.
                const filteredFacilities = displayContent.data.facilities.filter(fac => {
                  // 1. 검색어가 없으면 전부 보여줌
                  if (!searchTerm) return true;
                  
                  const lowerTerm = searchTerm.toLowerCase();
                  
                  // 2. 검색어가 '건물 이름' 자체에 포함되어 있다면 -> 건물 전체를 보려는 의도이므로 전부 보여줌
                  if (displayContent.data.name.toLowerCase().includes(lowerTerm)) return true;

                  // 3. 그게 아니라면, 시설 이름이나 주소가 검색어를 포함하는 것만 남김
                  return (
                    fac.name.toLowerCase().includes(lowerTerm) || 
                    (fac.loc && fac.loc.toLowerCase().includes(lowerTerm)) ||
                    (fac.desc && fac.desc.toLowerCase().includes(lowerTerm))
                  );
                });

                if (filteredFacilities.length > 0) {
                  return filteredFacilities.map((fac, idx) => (
                    <div 
                      key={idx} 
                      className="facility-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFacilityClick(fac)}
                    >
                      <span className="fac-name">{fac.name}</span>
                      <span className="fac-loc"><MapPin size={14}/> {fac.loc}</span>
                    </div>
                  ));
                } else {
                  return <div className="no-facility-msg">검색 조건에 맞는 시설이 없습니다.</div>;
                }
              })()}
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

        {/* Case 3: 기본 상태 (안내 문구) */}
        {displayContent.type === 'default' && (
          <div className="empty-state">
            <Building size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>지도의 건물을 클릭해보세요</h3>
            <p>건물별 상세 시설 정보가 이곳에 표시됩니다.</p>
          </div>
        )}
      </section>

      {/* 팝업 컴포넌트 */}
      <FacilityModal 
        isOpen={!!selectedFacility} 
        onClose={() => setSelectedFacility(null)} 
        facility={selectedFacility}
      />
    </div>
  );
};

export default MapPage;