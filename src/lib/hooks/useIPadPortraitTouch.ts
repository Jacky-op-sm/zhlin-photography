'use client';

import { useEffect, useState } from 'react';

const IPAD_PORTRAIT_TOUCH_QUERY =
  '(min-width: 768px) and (max-width: 1366px) and (orientation: portrait) and (hover: none) and (pointer: coarse)';

function computeFallbackMatch() {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth >= 768 &&
    window.innerWidth <= 1366 &&
    window.innerHeight > window.innerWidth &&
    navigator.maxTouchPoints > 0
  );
}

export function useIPadPortraitTouch() {
  const [isIPadPortraitTouch, setIsIPadPortraitTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(IPAD_PORTRAIT_TOUCH_QUERY);
    const updateMode = () => {
      setIsIPadPortraitTouch(query.matches || computeFallbackMatch());
    };

    updateMode();
    query.addEventListener('change', updateMode);
    window.addEventListener('resize', updateMode, { passive: true });

    return () => {
      query.removeEventListener('change', updateMode);
      window.removeEventListener('resize', updateMode);
    };
  }, []);

  return isIPadPortraitTouch;
}
