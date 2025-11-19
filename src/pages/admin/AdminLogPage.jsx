import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminLogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/logs').then(res => setLogs(res.data.data));
  }, []);

  const downloadExcel = () => {
    // 백엔드에서 파일 다운로드 처리
    window.location.href = 'http://192.168.0.50:5050/api/admin/download_log'; // 시놀로지 IP 확인 필요
  };

  return (
    <>
      <AdminHeader />
      <div className="container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h1>전체 대여 기록</h1>
            <button onClick={downloadExcel} className="btn-excel">엑셀 다운로드 💾</button>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>학번</th>
                <th>대여물품</th>
                <th>상태</th>
                <th>대여일</th>
                <th>반납일</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx}>
                  <td>{log['이름']}</td>
                  <td>{log['학번']}</td>
                  <td>{log['대여물품']}</td>
                  <td>{log['대여현황']}</td>
                  <td>{log['대여시각']}</td>
                  <td>{log['반납시각']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminLogPage;