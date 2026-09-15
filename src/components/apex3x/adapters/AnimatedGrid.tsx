import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const AnimatedGrid: React.FC<{ children: React.ReactNode; className?: string; itemClassName?: string }> = ({ children, className = '', itemClassName = '' }) => {
  const reduceMotion = useReducedMotion();
  const items = React.Children.toArray(children);
  return <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>{items.map((child, index) => <motion.div key={index} layout={!reduceMotion} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.2) }} className={itemClassName}>{child}</motion.div>)}</div>;
};
