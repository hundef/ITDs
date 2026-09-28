import React, { useState, useEffect } from 'react';
import { ArrowUp, ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-indigo-600/90 dark:bg-indigo-500/90 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 backdrop-blur-md border border-indigo-400/30 hover:scale-110 active:scale-95 transition-all duration-200 group focus:outline-hidden animate-slide-up"
      title="Scroll to Top"
    >
      <ChevronUp className="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
