import { useEffect, useState } from 'react';

/**
 * 아래로 스크롤하면 true(숨김), 위로 스크롤하면 false(표시).
 * - topOffset 이내(페이지 맨 위 근처)에서는 항상 표시
 * - threshold 미만의 작은 움직임(손떨림, iOS 바운스)은 무시
 * 실제로 숨길지(모바일에서만 등)는 호출하는 쪽 CSS가 정한다.
 */
export function useHideOnScroll({ threshold = 8, topOffset = 70 } = {}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= topOffset) {
        setHidden(false);
        lastY = y;
        return;
      }
      const dy = y - lastY;
      if (Math.abs(dy) < threshold) return;
      setHidden(dy > 0);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, topOffset]);

  return hidden;
}
