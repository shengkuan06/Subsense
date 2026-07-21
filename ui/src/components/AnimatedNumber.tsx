import React, { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // Animation duration in milliseconds
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function AnimatedNumber({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = prevValueRef.current;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic: f(t) = 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const current = startValue + easeProgress * (endValue - startValue);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(animFrame);
    };
  }, [value, duration]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <>
      {prefix}
      {formatted}
      {suffix}
    </>
  );
}
