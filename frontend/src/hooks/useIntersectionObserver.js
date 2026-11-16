import { useEffect, useRef, useState } from "react";

/**
 * Small, dependency-free IntersectionObserver hook.
 *
 * - `once` disconnects after the first intersection so scrolling never
 *   produces repeated callbacks/requests.
 * - Browsers without IntersectionObserver fall back to "visible" so content
 *   is never permanently hidden.
 */
export const useIntersectionObserver = ({
      root = null,
      rootMargin = "300px 0px",
      threshold = 0,
      once = true,
      enabled = true,
} = {}) => {
      const ref = useRef(null);
      const [isIntersecting, setIsIntersecting] = useState(false);

      useEffect(() => {
            if (!enabled) return;

            const element = ref.current;
            if (!element) return;

            if (typeof IntersectionObserver === "undefined") {
                  setIsIntersecting(true);
                  return;
            }

            const observer = new IntersectionObserver(
                  (entries) => {
                        const entry = entries[0];
                        if (!entry) return;

                        if (entry.isIntersecting) {
                              setIsIntersecting(true);
                              if (once) observer.disconnect();
                        } else if (!once) {
                              setIsIntersecting(false);
                        }
                  },
                  { root, rootMargin, threshold }
            );

            observer.observe(element);
            return () => observer.disconnect();
      }, [root, rootMargin, threshold, once, enabled]);

      return { ref, isIntersecting };
};

export default useIntersectionObserver;
