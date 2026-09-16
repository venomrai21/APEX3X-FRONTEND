import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface APEXVirtualListProps<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number, measureRef: (node: HTMLElement | null) => void) => React.ReactNode;
  ariaLabel?: string;
}

/** APEX-owned virtualization contract. The underlying virtualizer can evolve without feature code changing. */
export function APEXVirtualList<T>({
  items,
  estimateSize = 48,
  overscan = 6,
  className = '',
  getItemKey,
  renderItem,
  ariaLabel,
}: APEXVirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  });

  return (
    <div ref={parentRef} className={`relative overflow-auto overscroll-contain ${className}`} role={ariaLabel ? 'list' : undefined} aria-label={ariaLabel}>
      <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index, virtualizer.measureElement)}
          </div>
        ))}
      </div>
    </div>
  );
}
