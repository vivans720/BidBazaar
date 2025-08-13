import React from "react";
import { useLenis } from "../../context/LenisContext";

const SmoothScrollLink = ({
  to,
  children,
  className = "",
  offset = 0,
  duration = 1.2,
  ...props
}) => {
  const { scrollTo } = useLenis();

  const handleClick = (e) => {
    e.preventDefault();

    if (to.startsWith("#")) {
      // Scroll to element with ID
      const target = document.querySelector(to);
      if (target) {
        scrollTo(target, {
          offset,
          duration,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    } else if (typeof to === "number") {
      // Scroll to specific position
      scrollTo(to, {
        offset,
        duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  };

  return (
    <a
      href={typeof to === "string" ? to : "#"}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

export default SmoothScrollLink;
