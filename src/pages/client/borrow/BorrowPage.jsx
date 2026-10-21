import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from '../../../lib/dayjs';
import { Spinner } from '@/components/ui';
import StepIndicator from './StepIndicator';
import BorrowItemStep from './BorrowItemStep';
import BorrowFormStep from './BorrowFormStep';
import './BorrowPage.css'; // 스타일 파일

function BorrowPage() {
  const navigate = useNavigate();

  // --- 상태 관리 (State) ---
  const [items, setItems] = useState([]); // 전체 물품 리스트
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 현재 탭
  const [searchTerm, setSearchTerm] = useState(''); // [추가] 검색어 상태
  const [cart, setCart] = useState(new Set()); // 장바구니 (중복방지 Set 사용)
  const [step, setStep] = useState(1); // 1: 물품 선택, 2: 정보 입력
  const [submitting, setSubmitting] = useState(false); // 신청 중 (중복 제출 방지)
  const submittingRef = useRef(false);

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

  // 2단계에서만 브라우저 뒤로가기(popstate)를 1단계 복귀로 처리한다
  useEffect(() => {
    if (step !== 2) return undefined;
    const onPop = () => setStep(1);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [step]);

  const goToForm = () => {
    setStep(2);
    window.history.pushState({ borrowStep: 2 }, '');
    window.scrollTo(0, 0);
  };
  const goBack = () => window.history.back();

  // --- 2. 카테고리 처리 ---
  const categories = ['전체', ...new Set(items.map(item => item['카테고리']))];

  // [수정] 검색어와 카테고리를 동시에 고려한 필터링
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === '전체' || item['카테고리'] === selectedCategory;
      const matchesSearch = item['물품'].toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
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

  // 입력 폼 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    if (cart.size === 0) {
      alert("물품을 최소 1개 이상 선택해주세요!");
      return;
    }

    const payload = {
      ...formData,
      selected_items: Array.from(cart)
    };

    submittingRef.current = true;
    setSubmitting(true);
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
          },
          replace: true
        });

      } else {
        alert("실패: " + response.data.message);
      }
    } catch (error) {
      console.error("신청 에러:", error);
      alert("서버 통신 중 오류가 발생했습니다.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) return <div className="borrow-page"><Spinner /></div>;

  return (
    <div className="borrow-page">
      <h1 className="borrow-title">물품 대여</h1>
      <StepIndicator current={step} />
      <div className="borrow-body">
        {step === 1 ? (
          <BorrowItemStep
            categories={categories}
            selectedCategory={selectedCategory}
            onCategory={setSelectedCategory}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            items={filteredItems}
            cart={cart}
            onToggle={toggleItem}
            onNext={goToForm}
          />
        ) : (
          <BorrowFormStep
            cart={cart}
            departments={departments}
            formData={formData}
            onChange={handleInputChange}
            onBack={goBack}
            onEditItems={goBack}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

export default BorrowPage;
