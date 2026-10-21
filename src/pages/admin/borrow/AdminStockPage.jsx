import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getDirtyItemNames } from '@/lib/stock';
import { ResponsiveTable, Button, Field, Badge, PageHeader } from '@/components/ui';
import '../AdminCommon.css';
import './AdminBorrow.css';

const cloneItems = (list) => list.map((item) => ({ ...item }));

function AdminStockPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [original, setOriginal] = useState([]);

  // 신규 추가 폼 상태
  const [newItem, setNewItem] = useState({ name: '', count: 0, category: '' });

  useEffect(() => {
    // 1. 권한 체크 (로그인 안 했으면 튕겨내기)
    if (!localStorage.getItem('isAdmin')) {
      alert("관리자 로그인이 필요합니다.");
      navigate('/admin');
      return;
    }

    axios.get('/api/items').then(res => {
      setItems(res.data.data);
      setOriginal(cloneItems(res.data.data));
    });
  }, [navigate]);

  const dirtyNames = useMemo(() => getDirtyItemNames(original, items), [original, items]);

  // 재고 수량 변경 (입력하는 순간 상태 반영)
  const handleStockChange = (index, val) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], '재고현황': val };
    setItems(newItems);
  };

  // 변경된 재고 전체 저장
  const saveAllStock = async () => {
    try {
      await axios.post('/api/admin/stock/update', { items });
      setOriginal(cloneItems(items));
      alert("재고가 전체 저장되었습니다.");
    } catch {
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
    } catch {
      alert("추가 실패");
    }
  };

  // 물품 삭제
  const handleDeleteItem = async (name) => {
    if (window.confirm(`'${name}'을(를) 정말 삭제하시겠습니까?`)) {
      try {
        await axios.post('/api/admin/stock/delete', { name });
        alert("삭제되었습니다.");
        window.location.reload();
      } catch {
        alert("삭제 실패");
      }
    }
  };

  const adminRole = localStorage.getItem('adminRole');
  const isDirty = (item) => dirtyNames.has(String(item['물품']));

  const columns = [
    {
      key: 'name',
      header: '물품명',
      primary: true,
      render: (item) => (
        <span className="stock-name">
          {item['물품']}
          {isDirty(item) && <Badge tone="neutral">수정됨</Badge>}
        </span>
      ),
    },
    {
      key: 'count',
      header: '재고 (수정가능)',
      render: (item) => (
        <input
          type="number"
          className="stock-input"
          aria-label={`${item['물품']} 재고`}
          value={item['재고현황']}
          onChange={(e) => handleStockChange(items.indexOf(item), e.target.value)}
        />
      ),
    },
    { key: 'category', header: '카테고리', render: (item) => item['카테고리'] },
    {
      key: 'remove',
      header: '삭제',
      render: (item) => (
        <Button variant="danger" aria-label={`${item['물품']} 삭제`} onClick={() => handleDeleteItem(item['물품'])}>
          삭제
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-borrow admin-stock-page">
      <PageHeader title="재고 현황 관리" description="수량을 수정한 뒤 전체 저장을 눌러야 반영됩니다." />

      {adminRole === 'master' && (
        <section className="stock-add">
          <h2 className="stock-add__title">신규 물품 추가</h2>
          <form onSubmit={handleAddItem} className="stock-add__form">
            <Field label="물품명" htmlFor="stock-new-name">
              <input id="stock-new-name" type="text" placeholder="물품명" required onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
            </Field>
            <Field label="수량" htmlFor="stock-new-count">
              <input id="stock-new-count" type="number" placeholder="수량" required onChange={e => setNewItem({ ...newItem, count: e.target.value })} />
            </Field>
            <Field label="카테고리" htmlFor="stock-new-category">
              <input id="stock-new-category" type="text" placeholder="카테고리" required onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
            </Field>
            <Button type="submit">추가</Button>
          </form>
        </section>
      )}

      {dirtyNames.size > 0 && (
        <p className="stock-dirty" role="status">저장하지 않은 변경 {dirtyNames.size}개</p>
      )}

      <ResponsiveTable
        breakpoint="lg"
        columns={columns}
        rows={items}
        rowKey={(item, i) => item['물품'] ?? i}
        rowProps={(item) => (isDirty(item) ? { 'data-dirty': 'true' } : {})}
        empty="등록된 물품이 없습니다."
      />

      <Button size="lg" block className="stock-save" onClick={saveAllStock}>
        전체 재고 저장하기
      </Button>
    </div>
  );
}

export default AdminStockPage;
