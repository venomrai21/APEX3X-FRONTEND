import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedTabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface AnimatedTabsProps {
  tabs: AnimatedTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * APEX3X adaptation boundary for animated tab behavior.
 * Interaction pattern is inspired by SmoothUI Animated Tabs;
 * visual tokens and product semantics remain APEX3X-owned.
 */
export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`flex items-center gap-1 border-b border-white/[0.08] overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 py-2.5 px-4 text-xs font-medium whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060609] ${
              isActive
                ? 'text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.icon && <span className="opacity-80">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-white/[0.06] text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <motion.span
                layoutId="apex3x-active-tab"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-amber-500"
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
