import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminNoticeWritePage() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = Boolean(id);
  const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';

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
    } catch(err) {
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
    <>
      <AdminHeader />
      <div className="container">
        <h1>{isEditMode ? '공지사항 수정' : '새 공지사항 작성'}</h1>
        
        <form className="notice-form-container" onSubmit={handleSubmit}>
            {/* [NEW] 공개 범위 설정 (라디오 버튼) */}
            {adminRole === 'master' && (
                <div className="form-group">
                    <label>공개 설정</label>
                    <div style={{display:'flex', gap:'20px', padding:'10px', background:'#f8f9fa', borderRadius:'8px', border:'1px solid #eee'}}>
                        <label style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', fontWeight:'normal'}}>
                            <input type="radio" name="is_public" value="true" checked={formData.is_public === true} onChange={handleChange} />
                            📢 전체 공개 (즉시 게시)
                        </label>
                        <label style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', fontWeight:'normal'}}>
                            <input type="radio" name="is_public" value="false" checked={formData.is_public === false} onChange={handleChange} />
                            🔒 미공개 (나중에 공개)
                        </label>
                    </div>
                </div>
            )}
            <div className="checkbox-group">
                <input type="checkbox" id="fixed" name="fixed" checked={formData.fixed} onChange={handleChange} />
                <label htmlFor="fixed">🔔 상단 고정 공지로 등록</label>
            </div>
            <div className="form-group">
                <label>제목</label>
                <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} placeholder="제목" />
            </div>
            <div className="form-group">
                <label>작성자</label>
                <input type="text" name="author" className="form-input" value={formData.author} onChange={handleChange} />
            </div>
            
            {/* [수정] 다중 파일 업로드 UI */}
            <div className="form-group">
                <label>첨부파일</label>
                
                {/* 1. 기존 파일 목록 (수정 시) */}
                {existingFiles.length > 0 && (
                    <div style={{marginBottom: '10px'}}>
                        <p style={{fontSize:'0.9rem', fontWeight:'bold', marginBottom:'5px'}}>💾 기존 파일:</p>
                        {existingFiles.map(file => (
                            <div key={file.id} className="current-file-box" style={{marginBottom:'5px'}}>
                                <span className="file-icon">📎</span>
                                <span className="file-name">{file.filename}</span>
                                <button type="button" className="btn-file-delete" onClick={() => deleteExistingFile(file.id)}>✖ 삭제</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. 새로 추가할 파일 목록 */}
                {newFiles.length > 0 && (
                    <div style={{marginBottom: '10px'}}>
                         <p style={{fontSize:'0.9rem', fontWeight:'bold', marginBottom:'5px'}}>➕ 추가할 파일:</p>
                         {newFiles.map((file, idx) => (
                            <div key={idx} className="current-file-box" style={{marginBottom:'5px', backgroundColor:'#fff3cd', borderColor:'#ffeeba'}}>
                                <span className="file-name">{file.name}</span>
                                <button type="button" className="btn-file-delete" onClick={() => removeNewFile(idx)}>✖ 취소</button>
                            </div>
                         ))}
                    </div>
                )}

                {/* 3. 파일 선택 버튼 */}
                <div className="file-upload-wrapper">
                    <input type="file" id="fileInput" onChange={handleFileChange} className="file-input-hidden" multiple />
                    <label htmlFor="fileInput" className="file-upload-btn">📂 파일 추가하기 (여러 개 가능)</label>
                </div>
            </div>

            <div className="form-group">
                <label>내용</label>
                <textarea name="content" className="form-textarea" value={formData.content} onChange={handleChange} />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => navigate('/admin/notices')}>취소</button>
                <button type="submit" className="btn-save">{isEditMode ? '수정 저장' : '작성 완료'}</button>
            </div>
        </form>
      </div>
    </>
  );
}

export default AdminNoticeWritePage;