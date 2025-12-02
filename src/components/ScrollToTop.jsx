// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 경로(pathname)가 바뀔 때마다 window 스크롤을 (0, 0)으로 이동
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}