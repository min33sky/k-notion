import { useState, useEffect } from 'react';

/**
 * 스크롤의 위치가 화면 최상단에서 벗어났는지 확인하는 훅
 * @param threshold 한계점
 * @returns boolean true인 경우 스크롤이 최상단에서 아래로 이동함
 */
export const useScrollTop = (threshold = 10) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
};
