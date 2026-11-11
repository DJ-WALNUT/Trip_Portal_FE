import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Field, Toggle, Button, Card, PageHeader } from '@/components/ui';
import { isSafeSurveyLink } from '@/lib/survey';
import './AdminCommon.css';
import './AdminSurvey.css';

const EMPTY_FORM = {
  title: '',
  link_url: '',
  deadline: '',
  duration: '',
  reward: '',
  content: '',
  is_public: true,
};

function AdminSurveyWritePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false); // 연속 클릭으로 같은 글이 두 번 등록되지 않게

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      alert('관리자 로그인이 필요합니다.');
      navigate('/admin');
      return;
    }
    if (!isEditMode) return;

    // 수정하려고 불러올 때는 조회수를 올리지 않는다
    axios.get(`/api/surveys/${id}`, { params: { increment: 'false' } })
      .then((res) => {
        const data = res.data;
        setFormData({
          title: data.title ?? '',
          link_url: data.link_url ?? '',
          deadline: data.deadline ?? '',
          duration: data.duration ?? '',
          reward: data.reward ?? '',
          content: data.content ?? '',
          is_public: Boolean(data.is_public),
        });
      })
      .catch((err) => {
        console.error(err);
        alert('설문조사를 불러오지 못했습니다.');
        navigate('/admin/surveys');
      });
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (savingRef.current) return;

    const body = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      link_url: formData.link_url.trim(),
      deadline: formData.deadline,
      duration: formData.duration.trim(),
      reward: formData.reward.trim(),
      is_public: formData.is_public,
    };

    if (!body.title || !body.link_url || !body.content) {
      setError('제목, 설문 링크, 내용은 필수입니다.');
      return;
    }
    if (!isSafeSurveyLink(body.link_url)) {
      setError('설문 링크는 http:// 또는 https://로 시작해야 합니다.');
      return;
    }

    setError('');
    savingRef.current = true;
    setSaving(true);
    try {
      if (isEditMode) await axios.put(`/api/surveys/${id}`, body);
      else await axios.post('/api/surveys', body);
      navigate('/admin/surveys');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error ?? '저장 중 오류가 발생했습니다.');
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="admin-survey-write">
      <PageHeader title={isEditMode ? '설문조사 수정' : '새 설문조사 등록'} />

      <Card as="form" className="admin-survey-form" onSubmit={handleSubmit} noValidate>
        <Field label="제목" htmlFor="survey-title">
          <input type="text" id="survey-title" name="title" value={formData.title} onChange={handleChange} maxLength={200} />
        </Field>
        <Field label="설문 링크" htmlFor="survey-link" hint="설문조사 하러가기 버튼을 누르면 이 주소가 새 탭으로 열립니다.">
          <input type="url" id="survey-link" name="link_url" value={formData.link_url} onChange={handleChange} placeholder="https://" maxLength={500} />
        </Field>
        <div className="admin-survey-form__row">
          <Field label="마감일" htmlFor="survey-deadline" hint="비워 두면 상시 설문으로 표시됩니다.">
            <input type="date" id="survey-deadline" name="deadline" value={formData.deadline} onChange={handleChange} />
          </Field>
          <Field label="예상 소요시간" htmlFor="survey-duration" hint="선택">
            <input type="text" id="survey-duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="3분" maxLength={30} />
          </Field>
          <Field label="보상" htmlFor="survey-reward" hint="선택">
            <input type="text" id="survey-reward" name="reward" value={formData.reward} onChange={handleChange} placeholder="추첨 기프티콘" maxLength={50} />
          </Field>
        </div>
        <Field label="내용" htmlFor="survey-content">
          <textarea id="survey-content" name="content" value={formData.content} onChange={handleChange} />
        </Field>
        <div className="admin-survey-form__toggle">
          <Toggle id="survey-public" name="is_public" checked={formData.is_public} onChange={handleChange} label="공개" />
        </div>

        {error && <p role="alert" className="admin-survey-form__error">{error}</p>}

        <div className="admin-survey-form__actions">
          <Button variant="ghost" onClick={() => navigate('/admin/surveys')}>취소</Button>
          <Button type="submit" disabled={saving}>{isEditMode ? '수정 저장' : '등록'}</Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminSurveyWritePage;
