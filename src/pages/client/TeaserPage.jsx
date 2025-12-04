import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeaserPage.css';
import ClickSpark from '@/bits/ClickSpark';
import Snowfall from 'react-snowfall';

const snowflakeImg = document.createElement('img');
snowflakeImg.src = '/images/snowflake.png';
const snowflakeImages = [snowflakeImg];

function TeaserPage() {
  const [step, setStep] = useState('intro'); // intro -> form -> done
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    department: '',
    phone: '',
    agreed: false
  });
  const [isSystemSnowOn, setIsSystemSnowOn] = useState(false); // 관리자가 켰는지
  const [isUserSnowOn, setIsUserSnowOn] = useState(true); // 사용자가 켰는지

  // 학과 소개 페이지로 이동하기 위한 훅 (만약 a태그 쓸거면 필요 없음)
  const navigate = useNavigate();

  // 학과 목록 가져오기 (기존 API 재활용)
  useEffect(() => {
    axios.get('/api/departments')
      .then(res => {
        if (res.data.status === 'success') setDepartments(res.data.data);
      })
    // [신규] 시스템 눈송이 설정 확인
    axios.get('/api/system/snowfall')
      .then(res => {
        if (res.data.status === 'success') {
          setIsSystemSnowOn(res.data.enabled);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // 추가 함수: 배경 클릭 시 닫기
  const handleBackdropClick = (e) => {
    // 클릭된 요소(e.target)가 배경(e.currentTarget)과 같을 때만 닫음
    // (폼 내부를 클릭했을 때는 닫히지 않도록 함)
    if (e.target === e.currentTarget) {
      setStep('intro');
    }
  };

  // 이스터에그 클릭
  const handleEasterEgg = () => {
    setStep('form');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!/^\d+$/.test(formData.student_id)) return alert('학번은 숫자만 입력해주세요.');
    if (!/^\d{11}$/.test(formData.phone)) return alert('전화번호는 숫자 11자리만 입력해주세요.');
    if (!formData.agreed) return alert('개인정보 제공에 동의해야 합니다.');

    try {
      const res = await axios.post('/api/teaser/entry', formData);
      if (res.data.status === 'success') {
        {/* alert('🎉 응모가 완료되었습니다! 확인을 누르면 메인 화면으로 돌아갑니다.'); */}
        setStep('done'); // 초기화
        setFormData({ name: '', student_id: '', department: '', phone: '', agreed: false });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 학과 소개 페이지로 이동 함수
  const goToDepartmentInfo = () => {
    // 1. 리액트 라우터 사용 시:
    navigate('/teaser/departments'); 
    // 2. 혹은 일반 링크 이동 시:
    // window.location.href = '/department-info';
  };

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
    <div className="teaser-page">
      {/* [신규] 눈송이 컴포넌트 & 사용자 제어 UI */}
      {isSystemSnowOn && (
        <>
          {/* 사용자가 켰을 때만 눈이 내림 */}
          {isUserSnowOn && (
            <Snowfall 
              style={{ position: 'absolute', zIndex: 1 }} 
              snowflakeCount={70}
              images={snowflakeImages} 
              // [팁] 이미지는 기본 원형 눈보다 작게 보일 수 있으니 크기를 조금 키워주면 좋습니다.
              radius={[5, 20]}
            />
          )}

          {/* 우측 하단 고정 체크박스 */}
          <div className="snow-control-box fade-in">
            <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)'}}>
              <input 
                type="checkbox" 
                checked={isUserSnowOn} 
                onChange={(e) => setIsUserSnowOn(e.target.checked)}
                style={{ accentColor: '#87ceeb', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{fontSize: '0.9rem', fontWeight: 'bold'}}>❄️ 눈 내리기</span>
            </label>
          </div>
        </>
      )}
        <div className="circle-container">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
        </div>
      
      {/* 1. 인트로 (이스터에그) */}
      {step === 'intro' && (
        <div className="teaser-content intro fade-in" style={{zIndex: 10, textAlign: 'center', color: 'white'}}>
          <h1 style={{fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #87ceeb)', WebkitBackgroundClip: 'text', color: 'transparent'}}>Trip Begins</h1>
          <p style={{color: '#b0e0e6', marginBottom: '4rem', fontWeight: '300'}}>변화를 새길, 우리의 여정</p>
          
          <div className="orb-container" style={{width: '100px', height: '100px', margin: '0 auto', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} onClick={handleEasterEgg}>
            <div className="mystic-orb" style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #fff, #00bfff)',
                boxShadow: '0 0 30px #00bfff',
                animation: 'pulse 3s infinite'
            }}></div>
            <p className="orb-hint" style={{marginTop: '15px', fontSize: '0.8rem', color: '#00bfff'}}>Click the Light</p>
          </div>

          <p style={{marginTop: '4rem', color: '#87ceeb', letterSpacing: '3px', fontSize: '0.8rem'}}>Welcome to Trip!</p>
          <p style={{color: '#87ceeb', marginTop: '3rem', fontWeight: '450'}}><a href='/teaser/departments'>단과대별 학과 인스타 미리보기</a></p>
        </div>
      )}

      {/* 2. 신청 폼 */}
      {step === 'form' && (
        <div 
            className="form-backdrop fade-in" 
            onClick={handleBackdropClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검은 배경
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 50 // 인트로보다 높게
            }}
        >
        <div className="form-mode slide-up">
            <div className="form-header">
                <h2>🎉 Come Join Us!</h2>
                <p>이 여정의 시작을 함께해요!</p>
            </div>

          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleChange} required />
            <input type="number" name="student_id" placeholder="학번 (9자리 숫자)" min="200000000" max="209909099" value={formData.student_id} onChange={handleChange} required pattern="\d*" />
            <select name="department" value={formData.department} onChange={handleChange} required>
              <option value="" disabled>학과 선택</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="tel" name="phone" placeholder="전화번호 (01012345678)" value={formData.phone} onChange={handleChange} required pattern="\d{11}" maxLength="11" />

            <div className="agreement-box">
              <h4>[개인정보 수집·이용 동의]</h4>
              <div className="agreement-text">
{`[여정]은 '공과대학 출범 티저페이지 사전응모 추첨행사' 진행을 위하여 『개인정보보호법』 제15조에 의거하여 아래와 같이 개인정보를 수집·이용하고자 합니다. 내용을 자세히 읽으신 후 동의 여부를 결정하여 주십시오.

1. 개인정보의 수집 및 이용 목적
· 이벤트 참여 확인, 추첨 및 당첨자 선정
· 경품(기프티콘 등) 발송 및 교내 예산 집행 증빙자료(수령 확인) 활용

2. 수집하는 개인정보의 항목
· 필수항목: 성명, 학번, 학과, 전화번호(휴대전화)
· 기입한 정보가 일치하지 않거나 누락된 경우 이벤트 참여 및 경품 수령이 불가할 수 있습니다

3. 개인정보의 보유 및 이용 기간
· 낙첨자: 이벤트 종료 및 추첨 완료 후 즉시 파기
· 당첨자: 관련 법령 및 교내 예산 회계 규정에 따른 증빙서류 보존 기간(5년)까지 보관 후 파기

귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부할 경우 이벤트 참여 및 경품 추첨 대상에서 제외될 수 있습니다.`}
              </div>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" name="agreed" checked={formData.agreed} onChange={handleChange} />
              <span>위 내용을 확인하였으며 동의합니다.</span>
            </label>

            <button type="submit" className="btn-submit">응모하기</button>
            <button type="button" className="btn-back" onClick={() => setStep('intro')}>돌아가기</button>
          </form>
        </div>
      </div>
      )}

      {/* [추가] 3. 완료 및 유도 (done) */}
      {step === 'done' && (
        <div 
            className="form-backdrop fade-in" 
            onClick={handleBackdropClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검은 배경
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 50 // 인트로보다 높게
            }}
        >
          <div className="form-mode slide-up" style={{textAlign: 'center'}}>
            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎫</div>
            <h2 style={{fontSize: '1.8rem', color: '#e0f2f7', marginBottom: '0.5rem'}}>응모가 완료되었습니다!</h2>
            <p style={{color: '#b0e0e6', marginBottom: '2rem', lineHeight: '1.6'}}>
              런칭 이벤트에 참여해 주셔서 감사합니다.<br/>
              추첨 결과는 개별 문자로 안내드릴 예정입니다.
            </p>

            <div style={{background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem'}}>
              <p style={{color: '#fff', fontWeight: 'bold', marginBottom: '10px'}}>잠깐! 우리 학과 소식은 어디서 보지?</p>
              <p style={{fontSize: '0.9rem', color: '#ccc', marginBottom: '0'}}>
                단과대별 학과 인스타그램을 한곳에 모았습니다.<br/>
                미리 확인하고 팔로우 해보세요!
              </p>
            </div>

            <button 
              onClick={goToDepartmentInfo} 
              className="btn-submit" 
              style={{background: 'linear-gradient(135deg, #ffd700, #d8a200ff)', color: '#000'}}
            >
              학과 인스타 모아보기 👉
            </button>
                
            <p 
              onClick={() => setStep('intro')} 
              style={{marginTop: '20px', cursor: 'pointer', color: '#aaa', fontSize: '0.8rem', textDecoration: 'underline'}}
            >
              처음 화면으로
            </p>
          </div>
        </div>
      )}
    </div>
    </ClickSpark>
  );
}

export default TeaserPage;