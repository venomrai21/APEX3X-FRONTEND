import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { formatMoney } from '../../../currency';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  currency?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  decimals = 0,
  currency,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduceMotion) { setDisplay(value); return; }
    const start = display;
    const delta = value - start;
    if (!delta) return;
    const startTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + delta * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduceMotion]);

  const formatted = currency
    ? formatMoney(display, currency)
    : display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return <motion.span className={className} aria-live="polite" initial={false}>{prefix}{formatted}{suffix}</motion.span>;
};
