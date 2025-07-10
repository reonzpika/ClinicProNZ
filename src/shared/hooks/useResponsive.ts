import { useEffect, useState } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

type UseResponsiveReturn = {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
};

export const useResponsive = (): UseResponsiveReturn => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

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
  };
};
