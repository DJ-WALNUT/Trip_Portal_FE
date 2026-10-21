// src/pages/admin/AdminInstagramPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ExternalLink } from 'lucide-react';
import { Field, Button, Card, PageHeader, EmptyState } from '@/components/ui';
import './AdminCommon.css';
import './AdminNotice.css';

function AdminInstagramPage() {
  const [posts, setPosts] = useState([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);

  // 배포 환경 도메인
  const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';

  const fetchPosts = async () => {
    try {
        const res = await axios.get('/api/instagram/posts');
        setPosts(res.data.data);
    } catch(err) {
        console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!file || !linkUrl) return alert("이미지와 링크를 모두 입력해주세요.");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('link_url', linkUrl);

    try {
        await axios.post('/api/instagram', formData);
        alert("등록되었습니다!");
        setLinkUrl('');
        setFile(null);
        fetchPosts(); // 목록 갱신
    } catch {
        alert("업로드 실패");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("삭제하시겠습니까?")) return;
    try {
        await axios.delete(`/api/instagram/${id}`);
        fetchPosts();
    } catch {
        alert("삭제 실패");
    }
  };

  return (
    <div className="admin-instagram">
      <PageHeader title="인스타그램 관리" description="메인 페이지 우측에 표시될 이미지를 직접 업로드합니다. (최신 7개 노출)" />

      {/* 업로드 폼 */}
      <Card as="form" className="insta-add" onSubmit={handleSubmit}>
        <Field label="인스타 게시물 링크" htmlFor="insta-link">
          <input
            id="insta-link"
            type="text"
            placeholder="https://instagram.com/p/..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </Field>
        <Field label="이미지 파일 (1:1 비율 권장)" htmlFor="insta-file">
          <input
            id="insta-file"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
        </Field>
        <div className="notice-form__actions">
          <Button type="submit">등록</Button>
        </div>
      </Card>

      {/* 목록 */}
      {posts.length === 0 ? (
        <EmptyState title="등록된 게시물이 없습니다." />
      ) : (
        <ul className="insta-grid">
          {posts.map(post => (
            <li key={post.id} className="insta-card">
              <div className="insta-card__img">
                <img
                  src={post.imgUrl.startsWith('http') ? post.imgUrl : `${BASE_URL}${post.imgUrl}`}
                  alt="인스타그램 게시물"
                />
              </div>
              <a className="insta-card__link" href={post.link} target="_blank" rel="noreferrer">
                <ExternalLink size={14} aria-hidden="true" /> {post.link}
              </a>
              <Button variant="danger" block onClick={() => handleDelete(post.id)}>
                <Trash2 size={16} aria-hidden="true" /> 삭제
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminInstagramPage;
