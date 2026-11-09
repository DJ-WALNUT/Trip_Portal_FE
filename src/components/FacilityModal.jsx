import React, { useEffect, useState } from 'react';
import { X, MapPin, Info } from 'lucide-react';
import FloorMap from './floorMap/FloorMap';
import { findMapRoom } from './floorMap/floorMaps';
import './FacilityModal.css';

const FacilityModal = ({ isOpen, onClose, facility }) => {
  // 배포 환경 도메인
  const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';
  const open = !!(isOpen && facility);
  const mapRoom = open ? findMapRoom(facility.loc) : null;
  const hasPhoto = !!facility?.imgUrl;

  // 평면도에 있는 곳(동방, 총동연 등)은 평면도가 기본, 사진이 있으면 탭으로 전환. 다른 시설을 열면 다시 평면도부터.
  const [viewState, setViewState] = useState({ facility: null, view: 'map' });
  const view = viewState.facility === facility ? viewState.view : 'map';
  const setView = (next) => setViewState({ facility, view: next });

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const showMap = mapRoom && (view === 'map' || !hasPhoto);

  const photo = (
    <div className="modal-image-container">
      {hasPhoto ? (
        <img src={facility.imgUrl.startsWith('http') ? facility.imgUrl : `${BASE_URL}${facility.imgUrl}`}  alt={facility.name} className="modal-image" />
      ) : (
        <div className="modal-no-image">
          <span>이미지가 없습니다</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content${mapRoom ? ' modal-content--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={facility.name}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button type="button" className="modal-close-btn" aria-label="닫기" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>

        {/* 평면도 + 사진이 있으면: 평면도 / 사진 탭 */}
        {mapRoom && hasPhoto && (
          <div className="modal-media-tabs" role="tablist" aria-label="보기 전환">
            {[['map', '평면도'], ['photo', '사진']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                className="modal-media-tab"
                onClick={() => setView(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {showMap ? <FloorMap map={mapRoom.map} label={mapRoom.label} name={facility.loc} /> : photo}

        {/* 텍스트 정보 영역 */}
        <div className="modal-body">
          <div className="modal-title-row">
            <h3>{facility.name}</h3>
            <span className="modal-badge">
              <MapPin size={14} /> {mapRoom ? `${mapRoom.map.floor} · ${facility.loc}` : facility.loc}
            </span>
          </div>

          <div className="modal-desc-box">
            <Info size={18} className="desc-icon" />
            <p>{facility.desc || "상세 설명이 없습니다."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityModal;
