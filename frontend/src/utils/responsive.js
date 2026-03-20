// Responsive utility functions for mobile-first design
import { useState, useEffect } from 'react';

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(getCurrentScreenSize());

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getCurrentScreenSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: screenSize === 'sm' || screenSize === 'xs',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl',
    screenSize
  };
};

const getCurrentScreenSize = () => {
  if (typeof window === 'undefined') return 'md';
  
  const width = window.innerWidth;
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
};

// Mobile-first responsive classes
export const responsiveClasses = {
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 px-4 sm:py-12 sm:px-6 lg:px-8',
  
  // Grid
  grid: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    responsive: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  },
  
  // Text sizes
  text: {
    heading: 'text-2xl sm:text-3xl lg:text-4xl',
    subheading: 'text-xl sm:text-2xl lg:text-3xl',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm'
  },
  
  // Spacing
  spacing: {
    padding: 'p-4 sm:p-6 lg:p-8',
    margin: 'm-4 sm:m-6 lg:m-8',
    gap: 'gap-4 sm:gap-6 lg:gap-8'
  },
  
  // Cards
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6',
  
  // Buttons
  button: {
    primary: 'w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
    secondary: 'w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm'
  },
  
  // Forms
  form: {
    input: 'w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2',
    group: 'space-y-4 sm:space-y-6'
  },
  
  // Navigation
  nav: {
    mobile: 'lg:hidden',
    desktop: 'hidden lg:flex',
    responsive: 'flex flex-col lg:flex-row lg:items-center lg:space-x-6'
  },
  
  // Tables
  table: {
    container: 'overflow-x-auto -mx-4 sm:mx-0',
    wrapper: 'inline-block min-w-full align-middle',
    table: 'min-w-full divide-y divide-gray-200 dark:divide-gray-700'
  },
  
  // Modals and overlays
  modal: {
    overlay: 'fixed inset-0 z-50 overflow-y-auto',
    content: 'relative mx-auto max-w-lg w-full m-4 sm:m-8',
    header: 'px-4 py-3 sm:px-6 sm:py-4',
    body: 'px-4 py-3 sm:px-6 sm:py-4',
    footer: 'px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-800'
  }
};

// Device detection utilities
export const deviceUtils = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  },
  
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  },
  
  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  },
  
  isTouchDevice: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

// Mobile-specific optimizations
export const mobileOptimizations = {
  // Touch-friendly tap targets
  tapTarget: 'min-h-[44px] min-w-[44px]',
  
  // Swipe gestures
  swipeContainer: 'overflow-x-auto scrollbar-hide touch-pan-x',
  
  // Mobile keyboard optimization
  inputOptimization: 'text-base sm:text-sm', // Larger on mobile to prevent zoom
  
  // Mobile viewport handling
  viewportMeta: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">',
  
  // Safe area for notched devices
  safeArea: 'pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right'
};

// Responsive image utilities
export const imageUtils = {
  // Lazy loading with responsive sources
  responsiveImage: (src, alt, sizes = ['sm', 'md', 'lg']) => {
    return {
      src,
      alt,
      loading: 'lazy',
      className: 'w-full h-auto object-cover',
      sizes: sizes.map(size => `(max-width: ${breakpoints[size]}) ${size}px`).join(', ')
    };
  },
  
  // Picture element for art direction
  pictureElement: (images, alt) => {
    return {
      images,
      alt,
      className: 'w-full h-auto object-cover'
    };
  }
};

// Performance optimizations for mobile
export const performanceUtils = {
  // Debounce for scroll events
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle for resize events
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Intersection observer for lazy loading
  createIntersectionObserver: (callback, options = {}) => {
    if (typeof window === 'undefined') return null;
    
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
  }
};

// Accessibility utilities for mobile
export const accessibilityUtils = {
  // Focus management
  trapFocus: (element) => {
    if (typeof document === 'undefined') return;
    
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });
  },
  
  // Screen reader announcements
  announce: (message) => {
    if (typeof document === 'undefined') return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }
};

export default {
  breakpoints,
  useResponsive,
  responsiveClasses,
  deviceUtils,
  mobileOptimizations,
  imageUtils,
  performanceUtils,
  accessibilityUtils
};
