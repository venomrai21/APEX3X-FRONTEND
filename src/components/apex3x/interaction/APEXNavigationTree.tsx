import React from 'react';
import { ChevronRight, Folder, FolderOpen, File } from 'lucide-react';
import type { APEXNavigationNode } from './contracts';

interface VisibleNode extends APEXNavigationNode {
  level: number;
  position: number;
  setSize: number;
  parentId?: string;
}

function flatten(nodes: APEXNavigationNode[], expanded: Set<string>, level = 1, parentId?: string): VisibleNode[] {
  const result: VisibleNode[] = [];
  nodes.forEach((node, index) => {
    result.push({ ...node, level, parentId, position: index + 1, setSize: nodes.length });
    if (node.children?.length && expanded.has(node.id)) result.push(...flatten(node.children, expanded, level + 1, node.id));
  });
  return result;
}

function findNode(nodes: APEXNavigationNode[], id: string): APEXNavigationNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = node.children && findNode(node.children, id);
    if (found) return found;
  }
  return undefined;
}

export interface APEXNavigationTreeProps {
  nodes: APEXNavigationNode[];
  selectedId?: string;
  onSelect?: (node: APEXNavigationNode) => void;
  className?: string;
}

/** Accessible hierarchical navigation. Feature code supplies data; APEX owns tree semantics and keyboard behavior. */
export function APEXNavigationTree({ nodes, selectedId, onSelect, className = '' }: APEXNavigationTreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = React.useState(nodes[0]?.id);
  const refs = React.useRef(new Map<string, HTMLButtonElement>());
  const visible = React.useMemo(() => flatten(nodes, expanded), [nodes, expanded]);

  React.useEffect(() => {
    if (focusedId && !visible.some((node) => node.id === focusedId)) setFocusedId(visible[0]?.id);
  }, [focusedId, visible]);

  React.useEffect(() => {
    if (focusedId) refs.current.get(focusedId)?.focus();
  }, [focusedId]);

  const move = (delta: number) => {
    const index = visible.findIndex((node) => node.id === focusedId);
    const next = visible[Math.max(0, Math.min(visible.length - 1, index + delta))];
    if (next) setFocusedId(next.id);
  };

  const onKeyDown = (event: React.KeyboardEvent, node: VisibleNode) => {
    if (node.disabled) return;
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expanded.has(node.id);
    switch (event.key) {
      case 'ArrowDown': event.preventDefault(); move(1); break;
      case 'ArrowUp': event.preventDefault(); move(-1); break;
      case 'ArrowRight':
        event.preventDefault();
        if (hasChildren && !isExpanded) setExpanded((current) => new Set(current).add(node.id));
        else if (hasChildren) setFocusedId(node.children![0].id);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (hasChildren && isExpanded) setExpanded((current) => { const next = new Set(current); next.delete(node.id); return next; });
        else if (node.parentId) setFocusedId(node.parentId);
        break;
      case 'Home': event.preventDefault(); setFocusedId(visible[0]?.id); break;
      case 'End': event.preventDefault(); setFocusedId(visible[visible.length - 1]?.id); break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (hasChildren) setExpanded((current) => { const next = new Set(current); if (next.has(node.id)) next.delete(node.id); else next.add(node.id); return next; });
        onSelect?.(findNode(nodes, node.id) ?? node);
        break;
      }
    }
  };

  return (
    <div className={`overflow-auto overscroll-contain ${className}`} role="tree" aria-label="Navigation tree">
      {visible.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isExpanded = expanded.has(node.id);
        const selected = node.id === selectedId;
        return (
          <button
            key={node.id}
            ref={(element) => { if (element) refs.current.set(node.id, element); else refs.current.delete(node.id); }}
            type="button"
            role="treeitem"
            tabIndex={node.id === focusedId ? 0 : -1}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={selected}
            aria-level={node.level}
            aria-setsize={node.setSize}
            aria-posinset={node.position}
            disabled={node.disabled}
            onFocus={() => setFocusedId(node.id)}
            onKeyDown={(event) => onKeyDown(event, node)}
            onClick={() => {
              if (hasChildren) setExpanded((current) => { const next = new Set(current); if (next.has(node.id)) next.delete(node.id); else next.add(node.id); return next; });
              else onSelect?.(node);
            }}
            className="flex w-full min-h-8 items-center gap-2 rounded-md px-2 text-left text-sm text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--surface-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] disabled:cursor-not-allowed disabled:opacity-40 aria-selected:bg-[var(--surface-2)] aria-selected:text-[var(--text-primary)]"
            style={{ paddingLeft: `${8 + (node.level - 1) * 18}px` }}
          >
            {hasChildren ? (isExpanded ? <ChevronRight className="size-3.5 rotate-90" aria-hidden="true" /> : <ChevronRight className="size-3.5" aria-hidden="true" />) : <span className="size-3.5" />}
            {hasChildren ? (isExpanded ? <FolderOpen className="size-4" aria-hidden="true" /> : <Folder className="size-4" aria-hidden="true" />) : <File className="size-4" aria-hidden="true" />}
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
            {node.meta}
          </button>
        );
      })}
    </div>
  );
}
