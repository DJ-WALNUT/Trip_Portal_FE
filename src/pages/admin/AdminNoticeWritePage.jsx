import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Paperclip, X } from 'lucide-react';
import { Field, Toggle, Button, Card, PageHeader } from '@/components/ui';
import './AdminCommon.css';
import './AdminNotice.css';

function AdminNoticeWritePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    author: '여정 학생회',
    content: '',
    fixed: false,
    is_public: false
  });
  // [수정] 파일 상태 관리
  const [newFiles, setNewFiles] = useState([]); // 새로 추가할 파일들 (Array)
  const [existingFiles, setExistingFiles] = useState([]); // 기존에 저장된 파일들 (Array)

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    }

    // [수정] 관리자가 수정하려고 불러올 땐 조회수 증가 X
    if (isEditMode) {
        axios.get(`/api/notices/${id}`, {
            params: { increment: 'false' } // 조회수 올리지 마!
        })
            .then(res => {
                const data = res.data;
                setFormData({
                    title: data.title,
                    author: data.author,
                    content: data.content,
                    fixed: data.fixed,
                    is_public: data.is_public
                });
                // [수정] 기존 파일 목록 세팅 (백엔드가 배열로 줌)
                if (data.files) setExistingFiles(data.files);
            })
            .catch(err => {
                console.error(err);
                alert("공지사항 불러오기 중 오류가 발생했습니다.");
                navigate('/admin/notices');
            });
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // [NEW] 라디오 버튼 처리를 위한 로직
    if (type === 'radio') {
        // value가 문자열로 오므로 boolean 변환 필요 (true/false)
        setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // [수정] 파일 선택 핸들러 (다중 선택)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // FileList -> Array 변환
    setNewFiles(prev => [...prev, ...files]); // 기존 선택에 추가
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange({ target: { files: e.dataTransfer.files } });
  };

  // [수정] 새 파일 목록에서 제거
  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // [수정] 기존 파일 DB에서 삭제
  const deleteExistingFile = async (fileId) => {
    if(!window.confirm("이 파일을 정말 삭제하시겠습니까?")) return;
    try {
        await axios.delete(`/api/notices/file/${fileId}`);
        setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    } catch {
        alert("파일 삭제 실패");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
        return alert("제목과 내용은 필수입니다.");
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('author', formData.author);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('fixed', formData.fixed);
    formDataToSend.append('is_public', formData.is_public);
    // [수정] 여러 파일을 FormData에 추가 (키 이름은 'files')
    newFiles.forEach(file => {
        formDataToSend.append('files', file);
    });

    try {
        const url = isEditMode ? `/api/notices/${id}` : '/api/notices';
        // 수정(PUT) 혹은 등록(POST)
        if (isEditMode) await axios.put(url, formDataToSend);
        else await axios.post(url, formDataToSend);

        alert(isEditMode ? "공지사항이 수정되었습니다." : "새 공지사항이 등록되었습니다.");
        navigate('/admin/notices');
    } catch (err) {
        console.error(err);
        alert("오류 발생");
    }
  };

  const adminRole = localStorage.getItem('adminRole');

  return (
    <div className="admin-notice-write">
      <PageHeader title={isEditMode ? '공지사항 수정' : '새 공지사항 작성'} />

      <Card as="form" className="notice-form" onSubmit={handleSubmit}>
        {/* [NEW] 공개 범위 설정 (라디오 버튼) */}
        {adminRole === 'master' && (
          <fieldset className="notice-form__fieldset">
            <legend className="notice-form__legend">공개 설정</legend>
            <div className="segmented">
              <label className="segmented__item">
                <input type="radio" name="is_public" value="true" checked={formData.is_public === true} onChange={handleChange} />
                <span>전체 공개 (즉시 게시)</span>
              </label>
              <label className="segmented__item">
                <input type="radio" name="is_public" value="false" checked={formData.is_public === false} onChange={handleChange} />
                <span>미공개 (나중에 공개)</span>
              </label>
            </div>
          </fieldset>
        )}
        <div className="notice-fixed">
          <Toggle id="fixed" name="fixed" checked={formData.fixed} onChange={handleChange} label="상단 고정 공지로 등록" />
        </div>
        <Field label="제목" htmlFor="notice-title">
          <input type="text" id="notice-title" name="title" value={formData.title} onChange={handleChange} placeholder="제목" />
        </Field>
        <Field label="작성자" htmlFor="notice-author">
          <input type="text" id="notice-author" name="author" value={formData.author} onChange={handleChange} />
        </Field>

        {/* [수정] 다중 파일 업로드 UI */}
        <div className="ui-field field">
          <span className="field__label">첨부파일</span>

          {/* 1. 기존 파일 목록 (수정 시) */}
          {existingFiles.length > 0 && (
            <div>
              <p className="file-list__title">기존 파일</p>
              <ul className="file-list">
                {existingFiles.map(file => (
                  <li key={file.id} className="file-row">
                    <span className="file-row__name"><Paperclip size={14} aria-hidden="true" /> {file.filename}</span>
                    <Button variant="danger" onClick={() => deleteExistingFile(file.id)}>삭제</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 2. 새로 추가할 파일 목록 */}
          {newFiles.length > 0 && (
            <div>
              <p className="file-list__title">추가할 파일</p>
              <ul className="file-list">
                {newFiles.map((file, idx) => (
                  <li key={idx} className="file-row file-row--new">
                    <span className="file-row__name">{file.name}</span>
                    <Button variant="ghost" onClick={() => removeNewFile(idx)}><X size={16} aria-hidden="true" /> 취소</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. 파일 선택 / 드롭 영역 */}
          <label
            htmlFor="fileInput"
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload size={24} aria-hidden="true" />
            <span>파일을 끌어다 놓거나 눌러서 추가 (여러 개 가능)</span>
            <input
              type="file"
              id="fileInput"
              className="dropzone__input"
              multiple
              onChange={(e) => { handleFileChange(e); e.target.value = ''; }}
            />
          </label>
        </div>

        <Field label="내용" htmlFor="notice-content">
          <textarea id="notice-content" name="content" value={formData.content} onChange={handleChange} />
        </Field>

        <div className="notice-form__actions">
          <Button variant="ghost" onClick={() => navigate('/admin/notices')}>취소</Button>
          <Button type="submit">{isEditMode ? '수정 저장' : '작성 완료'}</Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminNoticeWritePage;
