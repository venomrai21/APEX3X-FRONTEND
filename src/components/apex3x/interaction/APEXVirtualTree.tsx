import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import type { APEXNavigationNode } from './contracts';

interface FlatNode extends APEXNavigationNode { level: number; parentId?: string; position: number; setSize: number; }
function flatten(nodes: APEXNavigationNode[], expanded: Set<string>, level = 1, parentId?: string): FlatNode[] {
  const result: FlatNode[] = [];
  nodes.forEach((node, index) => {
    result.push({ ...node, level, parentId, position: index + 1, setSize: nodes.length });
    if (node.children?.length && expanded.has(node.id)) result.push(...flatten(node.children, expanded, level + 1, node.id));
  });
  return result;
}

export interface APEXVirtualTreeProps {
  nodes: APEXNavigationNode[];
  selectedId?: string;
  onSelect?: (node: APEXNavigationNode) => void;
  onLoadChildren?: (node: APEXNavigationNode) => Promise<APEXNavigationNode[]>;
  estimateSize?: number;
  className?: string;
}

export function APEXVirtualTree({ nodes, selectedId, onSelect, onLoadChildren, estimateSize = 36, className = '' }: APEXVirtualTreeProps) {
  const [treeNodes, setTreeNodes] = React.useState(nodes);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = React.useState(nodes[0]?.id);
  const refs = React.useRef(new Map<string, HTMLButtonElement>());
  React.useEffect(() => setTreeNodes(nodes), [nodes]);
  const flat = React.useMemo(() => flatten(treeNodes, expanded), [treeNodes, expanded]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({ count: flat.length, getScrollElement: () => scrollRef.current, estimateSize: () => estimateSize, overscan: 8, getItemKey: (index) => flat[index].id });

  React.useEffect(() => {
    const index = flat.findIndex((node) => node.id === focusedId);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
  }, [focusedId, flat, virtualizer]);
  React.useEffect(() => { if (focusedId) refs.current.get(focusedId)?.focus(); }, [focusedId]);

  const toggle = async (node: FlatNode) => {
    const next = new Set(expanded);
    if (next.has(node.id)) next.delete(node.id);
    else {
      if (!node.children?.length && onLoadChildren) {
        setLoading((current) => new Set(current).add(node.id));
        try {
          const children = await onLoadChildren(node);
          if (children.length) {
            const addChildren = (list: APEXNavigationNode[]): APEXNavigationNode[] => list.map((item) => item.id === node.id ? { ...item, children } : { ...item, children: item.children ? addChildren(item.children) : item.children });
            setTreeNodes(addChildren(treeNodes));
          }
        } finally { setLoading((current) => { const result = new Set(current); result.delete(node.id); return result; }); }
      }
      next.add(node.id);
    }
    setExpanded(next);
  };

  const move = (delta: number) => {
    const index = flat.findIndex((node) => node.id === focusedId);
    const next = flat[Math.max(0, Math.min(flat.length - 1, index + delta))];
    if (next) setFocusedId(next.id);
  };

  return <div ref={scrollRef} role="tree" aria-label="Hierarchical navigation" className={`overflow-auto overscroll-contain ${className}`}>
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
      {virtualizer.getVirtualItems().map((virtual) => {
        const node = flat[virtual.index];
        const hasChildren = Boolean(node.children?.length) || Boolean(onLoadChildren);
        const isExpanded = expanded.has(node.id);
        return <button
          key={node.id}
          ref={(element) => { if (element) refs.current.set(node.id, element); else refs.current.delete(node.id); }}
          type="button"
          role="treeitem"
          tabIndex={node.id === focusedId ? 0 : -1}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={node.id === selectedId}
          aria-level={node.level}
          aria-setsize={node.setSize}
          aria-posinset={node.position}
          disabled={node.disabled || loading.has(node.id)}
          onFocus={() => setFocusedId(node.id)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
            else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
            else if (event.key === 'ArrowRight') { event.preventDefault(); if (hasChildren && !isExpanded) void toggle(node); else if (node.children?.[0]) setFocusedId(node.children[0].id); }
            else if (event.key === 'ArrowLeft') { event.preventDefault(); if (hasChildren && isExpanded) void toggle(node); else if (node.parentId) setFocusedId(node.parentId); }
            else if (event.key === 'Home') { event.preventDefault(); setFocusedId(flat[0]?.id); }
            else if (event.key === 'End') { event.preventDefault(); setFocusedId(flat[flat.length - 1]?.id); }
            else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (hasChildren) void toggle(node); else onSelect?.(node); }
          }}
          onClick={() => { if (hasChildren) void toggle(node); else onSelect?.(node); }}
          className="absolute left-0 top-0 flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--surface-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] aria-selected:bg-[var(--surface-2)] aria-selected:text-[var(--text-primary)]"
          style={{ transform: `translateY(${virtual.start}px)`, paddingLeft: `${8 + (node.level - 1) * 18}px` }}
        >
          {hasChildren ? <ChevronRight className={`size-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} aria-hidden="true" /> : <span className="size-3.5" />}
          {hasChildren ? (isExpanded ? <FolderOpen className="size-4" aria-hidden="true" /> : <Folder className="size-4" aria-hidden="true" />) : <File className="size-4" aria-hidden="true" />}
          <span className="min-w-0 flex-1 truncate">{node.label}</span>
        </button>;
      })}
    </div>
  </div>;
}
