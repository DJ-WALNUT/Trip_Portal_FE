// src/pages/admin/AdminInstagramPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminInstagramPage() {
  const [posts, setPosts] = useState([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);

  // 배포 환경 도메인
  const BASE_URL = import.meta.env.PROD ? 'https://trip-api.cukeng.kr' : '';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
        const res = await axios.get('/api/instagram/posts');
        setPosts(res.data.data);
    } catch(err) {
        console.error(err);
    }
  };

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
    } catch(err) {
        alert("업로드 실패");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("삭제하시겠습니까?")) return;
    try {
        await axios.delete(`/api/instagram/${id}`);
        fetchPosts();
    } catch(err) {
        alert("삭제 실패");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="container">
        <h1>인스타그램 관리</h1>
        <p>메인 페이지 우측에 표시될 이미지를 직접 업로드합니다. (최신 7개 노출)</p>

        {/* 업로드 폼 */}
        <form className="add-item-form" onSubmit={handleSubmit} style={{alignItems:'flex-end'}}>
            <div style={{flex:1}}>
                <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>인스타 게시물 링크</label>
                <input
                    type="text" 
                    placeholder="https://instagram.com/p/..." 
                    value={linkUrl} 
                    onChange={(e)=>setLinkUrl(e.target.value)}
                    style={{width:'100%', minHeight:'47px'}}
                />
            </div>
            <div style={{flex:1}}>
                <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>이미지 파일 (1:1 비율 권장)</label>
                <input 
                    type="file" 
                    onChange={(e)=>setFile(e.target.files[0])}
                    accept="image/*"
                />
            </div>
            <button type="submit" className="btn-write">등록</button>
        </form>

        {/* 목록 */}
        <div style={{display:'flex', gap:'15px', flexWrap:'wrap', marginTop:'30px'}}>
            {posts.map(post => (
                <div key={post.id} style={{border:'1px solid #ddd', borderRadius:'8px', padding:'10px', width:'200px'}}>
                    <div style={{width:'100%', height:'200px', overflow:'hidden', borderRadius:'4px', marginBottom:'10px'}}>
                        <img 
                            src={post.imgUrl.startsWith('http') ? post.imgUrl : `${BASE_URL}${post.imgUrl}`} 
                            alt="insta" 
                            style={{width:'100%', height:'100%', objectFit:'cover'}}
                        />
                    </div>
                    <a href={post.link} target="_blank" rel="noreferrer" style={{display:'block', fontSize:'0.8rem', color:'blue', marginBottom:'10px', textOverflow:'ellipsis', overflow:'hidden', whiteSpace:'nowrap'}}>
                        {post.link}
                    </a>
                    <button className="btn-delete" style={{width:'100%'}} onClick={() => handleDelete(post.id)}>삭제</button>
                </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default AdminInstagramPage;