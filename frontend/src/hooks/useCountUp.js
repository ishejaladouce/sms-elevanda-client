import { useEffect, useRef, useState } from "react";

export function useCountUp(target, { duration = 1400, delay = 0 } = {}) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now() + delay;
    let frameId;

    const tick = (now) => {
      if (now < startTime) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, delay]);

  return value;
}
