import React, { useState, useEffect } from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { useLenis } from "../../context/LenisContext";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { lenis, scrollTo } = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = (e) => {
      setIsVisible(e.scroll > 300);
    };

    // Guard in case of multiple mounts
    lenis.on && lenis.on("scroll", handleScroll);

    return () => {
      lenis.off && lenis.off("scroll", handleScroll);
    };
  }, [lenis]);

  const scrollToTop = () => {
    scrollTo(0, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTopButton;
