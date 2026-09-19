import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ children, className = '', itemClassName = '' }) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className={className}>
      <AnimatePresence initial={false} mode="popLayout">
        {children.map((child, index) => (
          <motion.div
            key={(child as React.ReactElement)?.key ?? index}
            layout={!reducedMotion}
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={reducedMotion ? { duration: 0 } : { duration: APEXMOTION.duration.standard / 1000, ease: APEXMOTION.ease.standard }}
            className={itemClassName}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
