import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface APEX3XSidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface APEX3XSidebarSection {
  title: string;
  items: APEX3XSidebarItem[];
}

export interface SidebarProps {
  sections: APEX3XSidebarSection[];
  activeKey: string;
  onSelect: (key: string) => void;
  onMobileSelect?: () => void;
  mobile?: boolean;
}

/**
 * APEX3X adaptation boundary for sidebar interaction.
 * Inspired by Unlumen Sidebar patterns; layout, tokens, and product semantics remain APEX3X-owned.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeKey,
  onSelect,
  onMobileSelect,
  mobile = false,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div className={mobile ? 'space-y-4' : 'flex-1 overflow-y-auto p-2.5 space-y-4'}>
      {sections.map((section) => (
        <div key={section.title} className="space-y-0.5">
          <p className="px-2.5 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
            {section.title}
          </p>
          {section.items.map((item) => {
            const isActive = activeKey === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.key);
                  onMobileSelect?.();
                }}
                className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090e] ${
                  isActive
                    ? 'text-amber-300 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="apex3x-sidebar-active"
                    className="absolute inset-0 rounded-lg bg-amber-500/15 border border-amber-500/30"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 500, damping: 38 }
                    }
                  />
                )}
                <span className="relative z-10 flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-amber-400' : 'text-zinc-500'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge && (
                  <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.08] font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
