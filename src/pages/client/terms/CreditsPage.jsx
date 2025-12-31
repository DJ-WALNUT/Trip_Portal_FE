import React, { useEffect } from 'react';
import { Github, Code, Heart, Coffee, Layers, Server, Monitor, Database, Wrench } from 'lucide-react';

function CreditsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- 1. 프로젝트 정보 ---
  const projectInfo = {
    title: "Project Odyssey",
    subtitle: "여정의 홈페이지, '프로젝트 오디세이'",
    description: "변화를 새길, 우리의 여정이 기록하는 웹 서비스. '프로젝트 오디세이'입니다.",
    frontendUrl: "https://github.com/DJ-WALNUT/Trip_Portal_FE",
    backendUrl: "https://github.com/DJ-WALNUT/Trip_Portal_BE"
  };

  // --- 2. 멤버 소개 ---
  const members = [
    {
      role: "Lead Developer",
      name: "최원서", 
      desc: "프로젝트 기획 및 제안\n풀 스택 및 서버 관리\n컴퓨터정보공학부 21학번",
      icon: <Code size={24} color="var(--accent-blue)" />
    },
    {
      role: "Special Thanks",
      name: "가톨릭대 성심교정",
      desc: "교정 전 학우",
      icon: <Heart size={24} color="#f44336" />
    }
  ];

  // --- [수정됨] 3. 기술 스택 (카테고리별 분류) ---
  const techStack = {
    Frontend: {
      icon: <Monitor size={18} />,
      items: ["React", "Vite", "React Router", "Axios", "CSS3"]
    },
    Backend: {
      icon: <Server size={18} />,
      items: ["Python", "Flask", "Pandas", "SQLite"]
    },
    "DevOps & Tools": {
      icon: <Wrench size={18} />,
      items: ["Synology NAS", "Docker", "Apache", "Git"]
    }
  };

  // --- 스타일 정의 ---
  const styles = {
    heroSection: {
      textAlign: 'center',
      padding: '3rem 1rem',
      borderBottom: '1px dashed var(--light-gray)',
      marginBottom: '2rem',
    },
    heroTitle: {
      fontSize: '2.5rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, var(--main-navy), var(--accent-blue))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
    },
    heroDesc: {
      fontSize: '1.1rem',
      color: '#666',
      lineHeight: '1.6',
      maxWidth: '600px',
      margin: '0 auto',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '4rem',
    },
    card: {
      background: 'var(--white)',
      border: '1px solid var(--light-gray)',
      borderRadius: '16px',
      padding: '2rem',
      textAlign: 'center',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'default',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    },
    role: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: 'var(--accent-blue)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '0.5rem'
    },
    name: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: 'var(--main-navy)',
    },
    desc: {
      fontSize: '0.9rem',
      color: '#888',
      whiteSpace: 'pre-wrap', 
      wordBreak: 'keep-all', // (선택) 단어가 중간에 잘리지 않도록 함
      lineHeight: '1.4',     // (선택) 줄 간격을 조금 넓혀서 보기 좋게
    },
    iconBox: {
      background: '#f8f9fa',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem'
    },
    // [신규] 기술 스택 섹션 스타일
    techSection: {
      marginBottom: '4rem',
    },
    techCategory: {
      marginBottom: '2rem',
      textAlign: 'center'
    },
    techTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#555',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    techTag: {
      display: 'inline-block',
      padding: '0.4rem 1rem',
      margin: '0.3rem',
      borderRadius: '8px',
      background: '#f1f3f5', /* 연한 회색 배경 */
      color: 'var(--main-navy)',
      fontSize: '0.9rem',
      fontWeight: '600',
      border: '1px solid #e9ecef',
      transition: 'background 0.2s'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      paddingBottom: '3rem',
      flexWrap: 'wrap'
    },
    footerBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.8rem',
      background: 'var(--main-navy)',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '30px',
      fontSize: '1rem',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      boxShadow: '0 4px 15px rgba(0, 31, 63, 0.2)',
      minWidth: '200px',
      justifyContent: 'center'
    }
  };

  return (
    <div className="wrapper">
      <div className="content">
        <div className="container" style={{maxWidth: '1000px', margin: '2rem auto', border: 'none', boxShadow: 'none', background: 'transparent'}}>
          
          {/* 1. 히어로 섹션 */}
          <section style={styles.heroSection} className="fade-in">
            <h1 style={styles.heroTitle}>{projectInfo.title}</h1>
            <h3 style={{color: 'var(--main-navy)', marginBottom: '1rem'}}>{projectInfo.subtitle}</h3>
            <p style={styles.heroDesc}>{projectInfo.description}</p>
          </section>

          {/* 2. 멤버 소개 */}
          <section style={styles.gridContainer}>
            {members.map((member, idx) => (
              <div 
                key={idx} 
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.border = '1px solid var(--light-gray)';
                }}
              >
                <div style={styles.iconBox}>{member.icon}</div>
                <span style={styles.role}>{member.role}</span>
                <h3 style={styles.name}>{member.name}</h3>
                <p style={styles.desc}>{member.desc}</p>
              </div>
            ))}
          </section>

          {/* 3. 사용 기술 (카테고리별) */}
          <section style={styles.techSection}>
            <h4 style={{textAlign:'center', color:'#888', marginBottom:'2rem', textTransform:'uppercase', fontSize:'0.9rem', letterSpacing:'2px'}}>
              Tech Stack
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {Object.entries(techStack).map(([category, { icon, items }]) => (
                <div key={category} style={styles.techCategory}>
                  <div style={styles.techTitle}>
                    {icon} {category}
                  </div>
                  <div>
                    {items.map((tech) => (
                      <span 
                        key={tech} 
                        style={styles.techTag}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e6ea'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f1f3f5'}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. 깃허브 링크 버튼 */}
          <div style={styles.buttonContainer}>
            <a 
              href={projectInfo.frontendUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.footerBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-blue)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--main-navy)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Monitor size={20} />
              Frontend Repo
            </a>

            <a 
              href={projectInfo.backendUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.footerBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-blue)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--main-navy)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Server size={20} />
              Backend Repo
            </a>
          </div>

          <p style={{textAlign: 'center', color: '#aaa', fontSize: '0.8rem', paddingBottom: '2rem'}}>
            © 2026 CUK Engineering Student Council 'Trip'. All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
}

export default CreditsPage;