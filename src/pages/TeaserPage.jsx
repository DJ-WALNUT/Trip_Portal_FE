import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeaserPage.css';
import ClickSpark from '@/bits/ClickSpark';

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
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
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
          <h1 style={{fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #87ceeb)', WebkitBackgroundClip: 'text', color: 'transparent'}}>Trip Begins.</h1>
          <p style={{color: '#b0e0e6', marginBottom: '4rem', fontWeight: '300'}}>변화를 새길, 우리의 여정이 시작됩니다.</p>
          
          <div class="orb-container" style={{width: '100px', height: '100px', margin: '0 auto', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} onClick={handleEasterEgg}>
            <div class="mystic-orb" style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #fff, #00bfff)',
                boxShadow: '0 0 30px #00bfff',
                animation: 'pulse 3s infinite'
            }}></div>
            <p class="orb-hint" style={{marginTop: '15px', fontSize: '0.8rem', color: '#00bfff'}}>Click the Light</p>
          </div>

          <p style={{marginTop: '4rem', color: '#87ceeb', letterSpacing: '3px', fontSize: '0.8rem'}}>2025 Coming Soon</p>
        </div>
      )}

      {/* 2. 신청 폼 */}
      {step === 'form' && (
        <div className="form-mode slide-up">
            <div className="form-header">
                <h2>🎉 Hidden Event Found!</h2>
                <p>가장 먼저 여정에 합류하세요.</p>
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
{`1. 수집 목적: 이벤트 응모 및 경품 지급
2. 수집 항목: 이름, 학번, 학과, 전화번호
3. 보유 기간: 이벤트 종료 후 1개월 이내 파기

귀하는 개인정보 수집에 거부할 권리가 있으며, 동의 거부 시 이벤트 참여가 제한될 수 있습니다.`}
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
    </ClickSpark>
  );
}

export default TeaserPage;