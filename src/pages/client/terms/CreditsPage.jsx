import React, { useEffect } from 'react';
import { Code, Heart, Server, Monitor, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import './Terms.css';

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
      icon: <Code size={24} color="var(--color-saegil)" />
    },
    {
      role: "Special Thanks",
      name: "가톨릭대 성심교정",
      desc: "교정 전 학우",
      icon: <Heart size={24} color="var(--tone-overdue-fg)" />
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

  return (
    <div className="credits-page">
      <PageHeader title="크레딧" />

      <section className="credits-page__hero">
        <h2 className="credits-page__hero-title">{projectInfo.title}</h2>
        <h3 className="credits-page__hero-sub">{projectInfo.subtitle}</h3>
        <p className="credits-page__hero-desc">{projectInfo.description}</p>
      </section>

      <section className="credits-page__members">
        {members.map((member) => (
          <div key={member.name} className="credits-page__member">
            <div className="credits-page__icon">{member.icon}</div>
            <span className="credits-page__role">{member.role}</span>
            <h3 className="credits-page__name">{member.name}</h3>
            <p className="credits-page__desc">{member.desc}</p>
          </div>
        ))}
      </section>

      <section className="credits-page__tech">
        <h4 className="credits-page__tech-heading">Tech Stack</h4>
        <div className="credits-page__tech-grid">
          {Object.entries(techStack).map(([category, { icon, items }]) => (
            <div key={category} className="credits-page__tech-cat">
              <div className="credits-page__tech-title">{icon} {category}</div>
              <div>
                {items.map((tech) => (
                  <span key={tech} className="credits-page__tag">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="credits-page__links">
        <a href={projectInfo.frontendUrl} target="_blank" rel="noopener noreferrer" className="credits-page__link">
          <Monitor size={20} />
          Frontend Repo
        </a>
        <a href={projectInfo.backendUrl} target="_blank" rel="noopener noreferrer" className="credits-page__link">
          <Server size={20} />
          Backend Repo
        </a>
      </div>

      <p className="credits-page__copy">
        © 2026 CUK Engineering Student Council 'Trip'. All rights reserved.
      </p>
    </div>
  );
}

export default CreditsPage;
