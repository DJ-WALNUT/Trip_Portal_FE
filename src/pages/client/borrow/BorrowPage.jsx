import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import dayjs from '../../../lib/dayjs';
import './BorrowPage.css'; // 스타일 파일

function BorrowPage() {
  const navigate = useNavigate();
  
  // --- 상태 관리 (State) ---
  const [items, setItems] = useState([]); // 전체 물품 리스트
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 현재 탭
  const [searchTerm, setSearchTerm] = useState(''); // [추가] 검색어 상태
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

  // 하단 고정 바: 신청 폼이 화면에 보이면 숨김
  const formRef = useRef(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

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

  // 신청 폼이 화면에 들어왔는지 감시
  useEffect(() => {
    if (loading || !formRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFormVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [loading]);

  // --- 2. 카테고리 처리 ---
  const categories = ['전체', ...new Set(items.map(item => item['카테고리']))];
  
  // [수정] 검색어와 카테고리를 동시에 고려한 필터링 + 재고 유무로 분리
  // (재고 있는 물품은 카드로, 재고 없는 물품은 아래에 작게 표시)
  const { inStockItems, outOfStockItems } = useMemo(() => {
    const filtered = items.filter(item => {
      const matchesCategory = selectedCategory === '전체' || item['카테고리'] === selectedCategory;
      const matchesSearch = item['물품'].toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    return {
      inStockItems: filtered.filter(item => Number(item['재고현황']) > 0),
      outOfStockItems: filtered.filter(item => Number(item['재고현황']) <= 0),
    };
  }, [items, selectedCategory, searchTerm]);

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

  // 하단 바 버튼: 신청 폼으로 이동 후 첫 입력칸에 포커스
  const scrollToForm = () => {
    const form = formRef.current;
    if (!form) return;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.querySelector('input[name="name"]')?.focus({ preventScroll: true });
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
        // 1. 한국 시간 기준 오늘(신청일)
        const todayKST = dayjs().tz().startOf('day');
        // 2. 한국 시간 기준 4일 뒤(반납 예정일)
        const returnDayKST = todayKST.add(4, 'day');
        // 3. 날짜 포맷 함수 (YYYY-MM-DD)
        const formatDate = (dObj) => dObj.format('YYYY-MM-DD');

        // --- 성공 페이지로 데이터 들고 이동! ---
        navigate('/success', { 
          state: { 
            items: Array.from(cart),
            date: formatDate(todayKST),      // 오늘 날짜
            returnDate: formatDate(returnDayKST) // 4일 뒤 날짜
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
      <p style={{marginBottom:'0.5rem'}}>원하는 물품을 선택(클릭)한 후 아래 정보를 입력해주세요.</p>

      {/* [추가] 검색 바 영역 */}
      <div className="search-container" style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <input 
          type="text" 
          className="search-input"
          placeholder="빌리고 싶은 물품명을 검색하세요..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            borderRadius: '18px',
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
        />
        <Search 
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} 
          size={18} 
        />
      </div>

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
      {inStockItems.length + outOfStockItems.length === 0 ? (
        <div className="item-empty">검색 결과가 없습니다.</div>
      ) : (
        <>
          {inStockItems.length > 0 && (
            <div className="item-grid">
              {inStockItems.map(item => {
                const isSelected = cart.has(item['물품']);
                return (
                  <div
                    key={item['물품']}
                    className={`item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleItem(item['물품'], item['재고현황'])}
                  >
                    <h3>{item['물품']}</h3>
                    <p>남은 수량: <strong>{item['재고현황']}개</strong></p>
                    {isSelected && <div className="check-mark">✔</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* 재고 없는 물품: 선택 불가이므로 작게 모아서 표시 */}
          {outOfStockItems.length > 0 && (
            <div className="out-of-stock">
              <h4>재고 없음 <span>{outOfStockItems.length}</span></h4>
              <ul>
                {outOfStockItems.map(item => (
                  <li key={item['물품']}>{item['물품']}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* 선택된 물품 확인 */}
      <div className="cart-summary">
        <h3>선택된 물품:</h3>
        {cart.size === 0 ? (
          <span style={{color:'#999'}} className='none'>선택된 물품이 없습니다.</span>
        ) : (
          <div className="tags">
            {Array.from(cart).map(name => <span key={name} className="tag">{name}</span>)}
          </div>
        )}
      </div>

      <hr className="divider" />

      {/* 신청 폼 */}
      <form onSubmit={handleSubmit} className="borrow-form" ref={formRef}>
        <h3 style={{marginBottom:'0.5rem'}}>신청자 정보</h3>
        <div className="form-group">
          <input 
            type="text" name="name" placeholder="이름" required 
            onChange={handleInputChange} 
          />
          <input 
            type="number" name="student_id" placeholder="학번 (예: 202312345)" min="200000000" max="209909099" required 
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
        <button type="submit" className="submit-btn borrow" disabled={cart.size === 0} >
          대여 신청하기
        </button>
      </form>

      {/* 하단 고정 바: 물품을 고르면 나타나고, 신청 폼이 보이면 사라짐 */}
      <div className={`borrow-bar ${cart.size > 0 && !isFormVisible ? 'show' : ''}`} aria-hidden={cart.size === 0 || isFormVisible}>
        <div className="borrow-bar-info">
          <strong>{cart.size}개 선택</strong>
          <span>{Array.from(cart).join(', ')}</span>
        </div>
        <button type="button" onClick={scrollToForm} tabIndex={cart.size > 0 && !isFormVisible ? 0 : -1}>
          신청 정보 입력
        </button>
      </div>
    </div>
  );
}

export default BorrowPage;