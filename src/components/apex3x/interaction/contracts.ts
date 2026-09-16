import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode, RefObject } from 'react';

export type APEXSidebarState = 'expanded' | 'collapsed' | 'mobile-open' | 'hidden';

export interface APEXIconButtonProps {
  label: string;
  tooltip?: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export interface APEXNavigationNode {
  id: string;
  label: string;
  disabled?: boolean;
  children?: APEXNavigationNode[];
  href?: string;
  meta?: ReactNode;
}

export interface APEXVirtualItemRenderContext<T> {
  item: T;
  index: number;
  measureRef: (element: HTMLElement | null) => void;
  style: CSSProperties;
}

export interface APEXPersistentStateOptions<T> {
  key: string;
  initial: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export interface APEXPointerGesture {
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  startTime: number;
  axis: 'horizontal' | 'vertical' | null;
  active: boolean;
}

export interface APEXDragHandleProps {
  listeners?: Record<string, unknown>;
  attributes?: Record<string, unknown>;
  tabIndex?: number;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

export type APEXPointerHandler = (event: PointerEvent<HTMLElement>) => void;
export type APEXRef<T extends HTMLElement> = RefObject<T | null>;
