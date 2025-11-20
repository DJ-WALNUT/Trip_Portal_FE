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
    <div className="teaser-wrapper">
      {/* 배경 효과 */}
      <div className="teaser-bg"></div>
      
      {/* 1. 인트로 (이스터에그) */}
      {step === 'intro' && (
        <div className="teaser-content intro fade-in">
          <h1 className="teaser-title">Trip Begins.</h1>
          <p className="teaser-subtitle">변화를 새길, 우리의 여정이 시작됩니다.</p>
          
          <div className="orb-container" onClick={handleEasterEgg}>
            <div className="mystic-orb"></div>
            <p className="orb-hint">Click the Light</p>
          </div>

          <p className="teaser-date">2025 Coming Soon</p>
        </div>
      )}

      {/* 2. 신청 폼 */}
      {step === 'form' && (
        <div className="teaser-content form-mode slide-up">
          <h2>🎉 Hidden Event Found!</h2>
          <p className="desc">가장 먼저 여정에 합류하세요.</p>

          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="이름" value={formData.name} onChange={handleChange} required />
            <input type="text" name="student_id" placeholder="학번 (숫자만)" value={formData.student_id} onChange={handleChange} required pattern="\d*" />
            <select name="department" value={formData.department} onChange={handleChange} required>
              <option value="" disabled>학과 선택</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="tel" name="phone" placeholder="전화번호 (01012345678)" value={formData.phone} onChange={handleChange} required pattern="\d{11}" maxLength="11" />

            <div className="agreement-box">
              <p><strong>[개인정보 수집·이용 동의]</strong><br/>1. 목적: 이벤트 응모 및 경품 지급<br/>2. 항목: 이름, 학번, 학과, 전화번호<br/>3. 보유기간: 이벤트 종료 후 1개월 이내 파기</p>
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