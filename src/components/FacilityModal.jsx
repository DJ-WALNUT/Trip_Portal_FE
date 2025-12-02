import React from 'react';
import { X, MapPin, Info } from 'lucide-react';
import './FacilityModal.css';

const FacilityModal = ({ isOpen, onClose, facility }) => {
  if (!isOpen || !facility) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        {/* 이미지 영역 (이미지가 없으면 플레이스홀더) */}
        <div className="modal-image-container">
          {facility.imgUrl ? (
            <img src={facility.imgUrl} alt={facility.name} className="modal-image" />
          ) : (
            <div className="modal-no-image">
              <span>이미지가 없습니다</span>
            </div>
          )}
        </div>

        {/* 텍스트 정보 영역 */}
        <div className="modal-body">
          <div className="modal-title-row">
            <h3>{facility.name}</h3>
            <span className="modal-badge">
              <MapPin size={14} /> {facility.loc}
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