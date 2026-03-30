import React from 'react';
import './OrganPage.css'; // 전용 CSS 파일 (아래 참고)

function DepartmentPage() {
  return (
    <div className="wrapper">
      <div className="content container department-page-container">
        <div className="page-header">
          <h2>조직도</h2>
        </div>

        <div className="organization-chart-wrapper">
          {/* public 폴더는 루트 경로(/)로 접근합니다. */}
          <img 
            src="/images/trip_organ.png" 
            alt="여정 학생회 조직도" 
            className="organization-chart-image"
          />
        </div>
        
        {/* (선택 사항) 조직도에 대한 간단한 설명을 추가할 수 있습니다. */}
        <div className="organization-description">
           <p>2026학년도 제4대 공과대학 학생회 [여정]은 공대장을 필두로 총 5개의 부서로 구성되어 있습니다.</p>
        </div>
        <div className="organization-description">
           <strong>총괄집행단</strong>
           <p>운영, 행사, 총무 등 학생회 집행 업무 전반을 담당하는 단위입니다.</p>
        </div>
        <div className="organization-description">
           <strong>공대기획단</strong>
           <p>작성 중 입니다</p>
        </div>
        <div className="organization-description">
           <strong>문화기획단</strong>
           <p>작성 중 입니다</p>
        </div>
        <div className="organization-description">
           <strong>사무복지단</strong>
           <p>작성 중 입니다</p>
        </div>
        <div className="organization-description">
           <strong>행정지원단</strong>
           <p>작성 중 입니다</p>
        </div>
      </div>
    </div>
  );
}

export default DepartmentPage;