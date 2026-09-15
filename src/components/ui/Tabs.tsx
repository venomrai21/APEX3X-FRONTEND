import React from 'react';
import { AnimatedTabs } from '../apex3x/adapters/AnimatedTabs';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * APEX3X-owned Tabs primitive.
 * The interaction implementation is isolated behind the APEX3X adapter boundary.
 */
export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => (
  <AnimatedTabs
    tabs={tabs}
    activeTab={activeTab}
    onChange={onChange}
    className={className}
  />
);
