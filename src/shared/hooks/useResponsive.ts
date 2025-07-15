import { useEffect, useState } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

type UseResponsiveReturn = {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  isHydrated: boolean;
};

export const useResponsive = (): UseResponsiveReturn => {
  // Start with desktop as default to prevent hydration mismatch
  // Most users are on desktop and this prevents layout shift
  const [width, setWidth] = useState(1024); // Default to desktop width
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated and set actual width
    setIsHydrated(true);
    setWidth(window.innerWidth);

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpoint = (width: number): Breakpoint => {
    if (width < 600) {
      return 'mobile';
    }
    if (width <= 1024) {
      return 'tablet';
    }
    if (width < 1280) {
      return 'desktop';
    }
    return 'largeDesktop';
  };

  const breakpoint = getBreakpoint(width);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'largeDesktop',
    isLargeDesktop: breakpoint === 'largeDesktop',
    width,
    isHydrated,
  };
};
