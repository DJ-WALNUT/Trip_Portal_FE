import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeaserPage.css';

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

  // 학과 목록 가져오기 (기존 API 재활용)
  useEffect(() => {
    axios.get('/api/departments')
      .then(res => {
        if (res.data.status === 'success') setDepartments(res.data.data);
      })
      .catch(err => console.error(err));
  }, []);

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
        alert('🎉 응모가 완료되었습니다! 확인을 누르면 메인 화면으로 돌아갑니다.');
        setStep('intro'); // 초기화
        setFormData({ name: '', student_id: '', department: '', phone: '', agreed: false });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="teaser-page">
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
        </div>
      )}

      {/* 2. 신청 폼 */}
      {step === 'form' && (
        <div className="form-mode slide-up">
            <div className="form-header">
                <h2>🎉 Come Join Us!</h2>
                <p>이 여정의 시작을 함께해요!</p>
            </div>

          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleChange} required />
            <input type="text" name="student_id" placeholder="학번 (숫자만)" value={formData.student_id} onChange={handleChange} required pattern="\d*" />
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
      )}
    </div>
  );
}

export default TeaserPage;