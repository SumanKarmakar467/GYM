import { useEffect, useRef, useState } from "react";

const useScrollReveal = (options = {}) => {
  const { threshold = 0.12, delay = 0 } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible || !ref.current) {
      return undefined;
    }

    const node = ref.current;
    let timer = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          if (delay > 0) {
            timer = window.setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [isVisible, threshold, delay]);

  return [ref, isVisible];
};

export default useScrollReveal;
