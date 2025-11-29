import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BorrowPage.css'; // 스타일 파일

function BorrowPage() {
  const navigate = useNavigate();
  
  // --- 상태 관리 (State) ---
  const [items, setItems] = useState([]); // 전체 물품 리스트
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 현재 탭
  const [cart, setCart] = useState(new Set()); // 장바구니 (중복방지 Set 사용)
  
  // 사용자 입력 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    department: '',
    phone: ''
  });

  // 기존 departments 변수는 삭제하거나 빈 배열로 초기화
  const [departments, setDepartments] = useState([]);

  // --- 1. 데이터 가져오기 (API 연동) ---
  useEffect(() => {
    axios.get('/api/items') // Proxy 덕분에 http://192.168.0.50:5050/api/items 로 요청됨
      .then(response => {
        if(response.data.status === 'success') {
          setItems(response.data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("데이터 로드 실패:", err);
        alert("물품 목록을 불러오는데 실패했습니다.");
        setLoading(false);
      });

      // [추가됨] 학과 목록 가져오기
      axios.get('/api/departments')
      .then(response => {
        if(response.data.status === 'success') {
          setDepartments(response.data.data);
        }
      })
      .catch(err => console.error("학과 로드 실패:", err));
  }, []);

  // --- 2. 카테고리 처리 ---
  // 존재하는 카테고리 추출 (중복제거)
  const categories = ['전체', ...new Set(items.map(item => item['카테고리']))];
  
  // 현재 선택된 카테고리의 물품만 필터링
  const filteredItems = selectedCategory === '전체' 
    ? items 
    : items.filter(item => item['카테고리'] === selectedCategory);

  // --- 3. 핸들러 함수들 ---
  
  // 물품 클릭 시 장바구니 토글
  const toggleItem = (itemName, stock) => {
    if (stock <= 0) return; // 재고 없으면 클릭 불가

    const newCart = new Set(cart);
    if (newCart.has(itemName)) {
      newCart.delete(itemName); // 이미 있으면 제거
    } else {
      newCart.add(itemName); // 없으면 추가
    }
    setCart(newCart);
  };

  // 입력 폼 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.size === 0) {
      alert("물품을 최소 1개 이상 선택해주세요!");
      return;
    }

    const payload = {
      ...formData,
      selected_items: Array.from(cart)
    };

    try {
      const response = await axios.post('/api/borrow', payload);
      
      if (response.data.status === 'success') {
        // --- 날짜 계산 로직 추가 ---
        const today = new Date();
        const returnDay = new Date();
        returnDay.setDate(today.getDate() + 7); // 7일 뒤

        // 날짜 포맷 (YYYY-MM-DD)
        const formatDate = (d) => d.toISOString().split('T')[0];

        // --- 성공 페이지로 데이터 들고 이동! ---
        navigate('/success', { 
          state: { 
            items: Array.from(cart),
            date: formatDate(today),
            returnDate: formatDate(returnDay)
          } 
        });
        
      } else {
        alert("실패: " + response.data.message);
      }
    } catch (error) {
      console.error("신청 에러:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="container">로딩 중...</div>;

  return (
    <div className="container">
      <h1>물품 대여</h1>
      <p>원하는 물품을 선택(클릭)한 후 아래 정보를 입력해주세요.</p>

      {/* 카테고리 탭 */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 물품 리스트 그리드 */}
      <div className="item-grid">
        {filteredItems.map((item, idx) => {
          const isSelected = cart.has(item['물품']);
          const isOutOfStock = item['재고현황'] <= 0;
          
          return (
            <div 
              key={idx} 
              className={`item-card ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}`}
              onClick={() => toggleItem(item['물품'], item['재고현황'])}
            >
              <h3>{item['물품']}</h3>
              <p>남은 수량: {isOutOfStock ? '품절' : item['재고현황'] + '개'}</p>
              {isSelected && <div className="check-mark">✔</div>}
            </div>
          );
        })}
      </div>

      {/* 선택된 물품 확인 */}
      <div className="cart-summary">
        <h3>선택된 물품:</h3>
        {cart.size === 0 ? (
          <span style={{color:'#999'}}>선택된 물품이 없습니다.</span>
        ) : (
          <div className="tags">
            {Array.from(cart).map(name => <span key={name} className="tag">{name}</span>)}
          </div>
        )}
      </div>

      <hr className="divider"/>

      {/* 신청 폼 */}
      <form onSubmit={handleSubmit} className="borrow-form">
        <h3>신청자 정보</h3>
        <div className="form-group">
          <input 
            type="text" name="name" placeholder="이름" required 
            onChange={handleInputChange} 
          />
          <input 
            type="text" name="student_id" placeholder="학번 (예: 202312345)" required 
            onChange={handleInputChange}
          />
          <select name="department" required onChange={handleInputChange} defaultValue="">
            <option value="" disabled>학과 선택</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <input 
            type="tel" name="phone" placeholder="전화번호 (01012345678)" required 
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={cart.size === 0}>
          대여 신청하기
        </button>
      </form>
    </div>
  );
}

export default BorrowPage;