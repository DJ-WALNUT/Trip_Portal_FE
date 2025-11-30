import React, { useState, useMemo } from 'react';
import { 
  Search, Instagram, ExternalLink, 
  School, BookOpen, Cpu, Globe, 
  Microscope, HeartPulse, Palette, Pill,
  Users, CheckCircle, Music
} from 'lucide-react';
import './DepartmentPage.css';

const DepartmentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // --- Data Definition ---
  const generalOrgs = [
    { name: "가톨릭대 공식 인스타", id: "lovecuk", icon: <CheckCircle size={20} /> },
    { name: "가톨릭대 총학생회", id: "cuk_student", icon: <Users size={20} /> },
    { name: "중앙선거관리위원회", id: "cuk_vote", icon: <CheckCircle size={20} /> },
    { name: "중앙축제기획단", id: "festival_cuk", icon: <Music size={20} /> },
  ];

  const collegesData = [
    {
      category: "공학",
      name: "공과대학",
      icon: <Cpu size={18} />,
      instas: ["cuk.engineering"],
      departments: [
        { name: "공과대학 선거관리위원회", id: "cuk_engineering_vote" },
        { name: "정보통신전자공학부", id: "cuk.ice" },
        { name: "컴퓨터정보공학부", id: "cuk.csie" },
        { name: "미디어기술콘텐츠학과", id: "cuk_mtc" },
        { name: "에너지환경공학과", id: "cuk_energy_envtech" },
        { name: "생명공학과", id: "cuk_biotech" },
        { name: "인공지능학과", id: "cuk_ai_" },
        { name: "데이터사이언스학과", id: "cuk_datascience" },
        { name: "바이오메디컬화학공학과", id: "cuk_bmce" },
        { name: "바이오메디컬소프트웨어학과", id: "cuk_bmsw" },
        { name: "바이오로직스공학부", id: "" },
        { name: "AI의공학과", id: "" },
      ]
    },
    {
      category: "정경",
      name: "정경대학",
      icon: <Globe size={18} />,
      instas: ["cuk_newspring"],
      departments: [
        { name: "회계학과", id: "cuk_accounting" },
        { name: "국제학부", id: "cuk_sis" },
        { name: "법학과", id: "cuk_law_" },
        { name: "경제학과", id: "cuk_economics" },
        { name: "행정학과", id: "cuk_pa_30" },
        { name: "경영학과", id: "cuk_business20" },
        { name: "글로벌경영학과", id: "cuk_globalbiz" },
        { name: "국제경영학과", id: "cuk.intbiz" },
        { name: "세무회계금융학과", id: "cuk_taf" },
        { name: "IT파이낸스학과", id: "cuk_itf" },
      ]
    },
    {
      category: "인문",
      name: "인문대학",
      icon: <BookOpen size={18} />,
      instas: ["cuk_humanities"],
      departments: [
        { name: "인문대학 선거관리위원회", id: "cukhm_vote" },
        { name: "국어국문학과", id: "cuk_kll" },
        { name: "국사학과", id: "cuk_history" },
        { name: "철학과", id: "cuk_philosophy" },
        { name: "영어영문학부", id: "cuk_english" },
        { name: "일어일본문화학과", id: "cuk_japan" },
        { name: "중국언어문화학과", id: "cuk_chinese" },
        { name: "프랑스어문화학과", id: "cuk_fr" },
        { name: "음악과", id: "cuk_music" },
      ]
    },
    {
      category: "사회",
      name: "사회과학대학",
      icon: <Users size={18} />,
      instas: ["cuk_apple_"],
      departments: [
        { name: "심리학과", id: "cuk_psychology" },
        { name: "사회학과", id: "cuk_socio" },
        { name: "사회복지학과", id: "socialwelfare_cuk" },
        { name: "특수교육과", id: "cuk__vrse" },
      ]
    },
    {
      category: "자연",
      name: "이과대학",
      icon: <Microscope size={18} />,
      instas: ["cuk_ns"],
      departments: [
        { name: "이과대학 선거관리위원회", id: "cukns_vote" },
        { name: "물리학과", id: "cuk__physics" },
        { name: "화학과", id: "cuk_chemistry" },
        { name: "수학과", id: "cuk.math" },
        { name: "의생명과학과", id: "cuk_med_bioscience" },
      ]
    },
    {
      category: "생활",
      name: "생활과학대학",
      icon: <Palette size={18} />,
      instas: ["cuk_living.sciences"],
      departments: [
        { name: "의류학과", id: "cukcnt" },
        { name: "공간디자인소비자학과", id: "cuk_gongso" },
        { name: "아동학과", id: "cuk_children" },
        { name: "식품영양학과", id: "cuk_foodnutrition" },
      ]
    },
    {
      category: "약학",
      name: "약학대학",
      icon: <Pill size={18} />,
      instas: [],
      departments: [
        { name: "약학과", id: "catholicpharmacy" },
      ]
    },
    {
      category: "기타",
      name: "자유전공학부",
      icon: <School size={18} />,
      instas: [],
      departments: [
        { name: "자유전공학부", id: "cuk_dls_" }
      ]
    }
  ];

  // --- Helper Functions ---
  const cleanId = (id) => id ? id.replace('@', '') : '';

  // 탭 목록 생성 (아이콘 매핑)
  const tabs = [
    { id: 'All', label: '전체보기', icon: <School size={16} /> },
    ...collegesData.map(col => ({ 
      id: col.category, 
      label: col.name.replace('대학', '').replace('학부', ''), // 탭 이름 짧게
      icon: col.icon 
    }))
  ];

  // --- Filtering Logic ---
  const filteredContent = useMemo(() => {
    // 1. 검색어가 있을 때: 탭 무시하고 전체에서 검색
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      
      const matchedGeneral = generalOrgs.filter(org => 
        org.name.includes(searchTerm) || org.id.includes(searchTerm)
      );

      const matchedColleges = collegesData.map(college => {
        const isCollegeMatch = college.name.includes(searchTerm);
        const matchedDepts = college.departments.filter(dept => 
          dept.name.includes(searchTerm) || (dept.id && dept.id.includes(searchTerm))
        );

        if (isCollegeMatch || matchedDepts.length > 0) {
          return {
            ...college,
            departments: isCollegeMatch ? college.departments : matchedDepts
          };
        }
        return null;
      }).filter(Boolean);

      return { general: matchedGeneral, colleges: matchedColleges, mode: 'search' };
    }

    // 2. 검색어가 없을 때: 탭에 따라 필터링
    return {
      general: generalOrgs, // 중앙 기구는 항상 상단 노출 (또는 'All'일 때만 노출 등 정책 결정 가능)
      colleges: activeTab === 'All' 
        ? collegesData 
        : collegesData.filter(col => col.category === activeTab),
      mode: 'tab'
    };
  }, [searchTerm, activeTab]);

  return (
    <div className="dept-page-container">
      
      {/* Header Area */}
      <header className="page-header">
        <div className="page-title">
          <h2>학과/조직도</h2>
          <p>가톨릭대학교의 단과대별 모든 학과를 한 곳에서 모아보세요.</p>
        </div>
        
        <div className="search-container">
          <input 
            type="text" 
            className="search-input"
            placeholder="학과명, 단과대 또는 ID 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
      </header>

      {/* Category Tabs (Hide when searching) */}
      {!searchTerm && (
        <nav className="category-filter">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`filter-chip ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {/* 1. Featured Section (Central Orgs) */}
      {filteredContent.general.length > 0 && (
        <section>
          {searchTerm && <div className="section-label">중앙 기구 / 공식</div>}
          {/* 탭 모드일 때는 'All' 탭이거나 검색 중일 때만 중앙기구 보여주기 (선택사항) 
              여기서는 항상 보여주되, 탭 선택 시 시각적 분리를 위해 'All'이 아닐 땐 숨길 수도 있음.
              현재는 항상 노출하도록 설정함. */}
          {(activeTab === 'All' || searchTerm) && (
             <div className="featured-grid">
             {filteredContent.general.map((org, idx) => (
               <a 
                 key={idx}
                 href={`https://instagram.com/${cleanId(org.id)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="featured-card"
               >
                 <div className="featured-info">
                   <h3>{org.name}</h3>
                   <span>@{cleanId(org.id)}</span>
                 </div>
                 <div className="featured-icon">
                   {org.icon}
                 </div>
               </a>
             ))}
           </div>
          )}
        </section>
      )}

      {/* 2. Colleges & Departments Grid */}
      {filteredContent.colleges.length > 0 ? (
        <section>
          {searchTerm && <div className="section-label">단과대 및 학과</div>}
          
          <div className="grid-container">
            {filteredContent.colleges.map((college, idx) => (
              <div key={idx} className="org-card">
                {/* Card Header */}
                <div className="card-header">
                  <span className="card-title flex items-center gap-2">
                    {college.icon} {college.name}
                  </span>
                  {/* College Rep Instas */}
                  <div className="flex flex-col gap-1 items-end">
                    {college.instas.map((insta, i) => (
                      <a 
                        key={i}
                        href={`https://instagram.com/${cleanId(insta)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="college-insta-link"
                      >
                        <Instagram size={12} />
                        {cleanId(insta)}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Departments List */}
                <div className="dept-list">
                  {college.departments.map((dept, dIdx) => (
                    dept.id ? (
                      <a 
                        key={dIdx}
                        href={`https://instagram.com/${cleanId(dept.id)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="dept-item"
                      >
                        <span className="dept-name">{dept.name}</span>
                        <span className="dept-id">
                          @{cleanId(dept.id)} <ExternalLink size={12} />
                        </span>
                      </a>
                    ) : (
                      <div key={dIdx} className="dept-item" style={{cursor: 'default', opacity: 0.6}}>
                        <span className="dept-name">{dept.name}</span>
                        <span className="dept-id" style={{fontSize: '0.75rem'}}>(계정 없음)</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Empty State */
        <div className="empty-state">
          <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3>검색 결과가 없습니다</h3>
          <p>다른 키워드로 검색해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;