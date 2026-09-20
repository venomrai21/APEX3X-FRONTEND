import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedTabItem { id: string; label: string; count?: number; icon?: React.ReactNode; }
export interface AnimatedTabsProps { tabs: AnimatedTabItem[]; activeTab: string; onChange: (id: string) => void; className?: string; }

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  const reduceMotion = useReducedMotion();
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    if (!tabs.length) return;
    const nextIndex = (index + tabs.length) % tabs.length;
    tabRefs.current[nextIndex]?.focus();
    onChange(tabs[nextIndex].id);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight': event.preventDefault(); focusTab(index + 1); break;
      case 'ArrowLeft': event.preventDefault(); focusTab(index - 1); break;
      case 'Home': event.preventDefault(); focusTab(0); break;
      case 'End': event.preventDefault(); focusTab(tabs.length - 1); break;
      default: break;
    }
  };

  return <div className={`flex items-center gap-1 border-b border-white/[0.08] overflow-x-auto ${className}`} role="tablist" aria-orientation="horizontal">
    {tabs.map((tab, index) => {
      const isActive = tab.id === activeTab;
      const tabId = `apex3x-tab-${tab.id}`;
      const panelId = `apex3x-tabpanel-${tab.id}`;
      return <button
        key={tab.id}
        ref={element => { tabRefs.current[index] = element; }}
        id={tabId}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={panelId}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onChange(tab.id)}
        onKeyDown={event => onKeyDown(event, index)}
        className={`relative flex items-center gap-2 py-2.5 px-4 text-xs font-medium whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060609] ${isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
      >
        {tab.icon && <span aria-hidden="true" className="opacity-80">{tab.icon}</span>}
        <span>{tab.label}</span>
        {tab.count !== undefined && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" aria-hidden="true">{tab.count}</span>}
        {isActive && <motion.span layoutId="apex3x-active-tab" aria-hidden="true" className="absolute inset-x-0 -bottom-px h-0.5 bg-white" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
      </button>;
    })}
  </div>;
};
