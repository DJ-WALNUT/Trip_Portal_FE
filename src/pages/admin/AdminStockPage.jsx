import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader';
import './AdminCommon.css';

function AdminStockPage() {
  const [items, setItems] = useState([]);
  
  // 신규 추가 폼 상태
  const [newItem, setNewItem] = useState({ name: '', count: 0, category: '' });

  useEffect(() => {
    axios.get('/api/items').then(res => setItems(res.data.data));
  }, []);

  // 재고 수량 변경 (입력하는 순간 상태 반영)
  const handleStockChange = (index, val) => {
    const newItems = [...items];
    newItems[index]['재고현황'] = val;
    setItems(newItems);
  };

  // 변경된 재고 전체 저장
  const saveAllStock = async () => {
    try {
      await axios.post('/api/admin/stock/update', { items });
      alert("재고가 전체 저장되었습니다.");
    } catch (err) {
      alert("저장 실패");
    }
  };

  // 신규 물품 추가
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/stock/add', newItem);
      alert("추가되었습니다.");
      window.location.reload(); // 새로고침
    } catch (err) {
      alert("추가 실패");
    }
  };
  
  // 물품 삭제
  const handleDeleteItem = async (name) => {
      if(window.confirm(`'${name}'을(를) 정말 삭제하시겠습니까?`)) {
          try {
              await axios.post('/api/admin/stock/delete', { name });
              alert("삭제되었습니다.");
              window.location.reload();
          } catch (err) {
              alert("삭제 실패");
          }
      }
  }

  return (
    <>
      <AdminHeader />
      <div className="container admin-stock-page">
        <h1>재고 현황 관리</h1>

        {/* 신규 추가 폼 */}
        <h3>신규 물품 추가</h3>
        <form onSubmit={handleAddItem} className="add-item-form">
          <input type="text" placeholder="물품명" required onChange={e=>setNewItem({...newItem, name: e.target.value})}/>
          <input type="number" placeholder="수량" required onChange={e=>setNewItem({...newItem, count: e.target.value})}/>
          <input type="text" placeholder="카테고리" required onChange={e=>setNewItem({...newItem, category: e.target.value})}/>
          <button type="submit" className="btn-return">추가</button>
        </form>
        
        <hr className="divider"/>

        {/* 재고 리스트 테이블 */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>물품명</th>
                <th>재고 (수정가능)</th>
                <th>카테고리</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item['물품']}</td>
                  <td>
                    <input 
                      type="number" 
                      value={item['재고현황']} 
                      onChange={(e) => handleStockChange(idx, e.target.value)}
                      style={{width: '60px', padding: '5px'}}
                    />
                  </td>
                  <td>{item['카테고리']}</td>
                  <td><button className="btn-delete-sm" onClick={() => handleDeleteItem(item['물품'])}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-confirm" style={{marginTop: '1rem', width: '100%'}} onClick={saveAllStock}>
          전체 재고 저장하기
        </button>
      </div>
    </>
  );
}

export default AdminStockPage;