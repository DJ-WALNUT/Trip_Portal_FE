import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminTeaserPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    // 데이터 불러오기
    axios.get('/api/admin/teaser')
      .then(res => {
        if (res.data.status === 'success') {
            setEntries(res.data.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <AdminHeader />
      <div className="container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h1>티저 이벤트 응모 현황</h1>
            <span style={{color:'#666'}}>총 {entries.length}명 응모</span>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>응모시각</th>
                <th>이름</th>
                <th>학번</th>
                <th>학과</th>
                <th>전화번호</th>
                <th>동의여부</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center'}}>아직 응모 내역이 없습니다.</td></tr>
              ) : entries.map((row, idx) => (
                <tr key={idx}>
                  <td>{row['신청시각']}</td>
                  <td>{row['이름']}</td>
                  <td>{row['학번']}</td>
                  <td>{row['학과']}</td>
                  <td>{row['전화번호']}</td>
                  <td style={{color: row['동의여부'] === 'Y' ? 'green' : 'red', fontWeight:'bold'}}>
                    {row['동의여부']}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminTeaserPage;