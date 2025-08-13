import { useEffect } from "react";
import { useLenis } from "../context/LenisContext";

export const useScrollToTop = () => {
  const { scrollTo } = useLenis();

  const scrollToTop = (options = {}) => {
    scrollTo(0, {
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options,
    });
  };

  return scrollToTop;
};

export const useScrollToTopOnRouteChange = () => {
  const scrollToTop = useScrollToTop();

  useEffect(() => {
    scrollToTop({ immediate: true });
  }, [scrollToTop]);
};
