import { RefObject, useEffect } from "react";

export function useInfiniteScroll(
  loaderRef: RefObject<Element | null>, // ✅ accepts null
  onHit: () => void
) {
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onHit();
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(el);

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
      observer.disconnect();
    };
  }, [loaderRef, onHit]);
}
