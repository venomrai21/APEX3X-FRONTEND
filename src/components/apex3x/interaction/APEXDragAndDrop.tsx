import React from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export interface APEXDragProviderProps {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: () => void;
}

export function APEXDragProvider({ children, onDragStart, onDragEnd, onDragCancel }: APEXDragProviderProps) {
  const pointer = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const keyboard = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
  const sensors = useSensors(pointer, keyboard);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Grabbed ${String(active.id)}.`,
          onDragOver: ({ active, over }) => over ? `${String(active.id)} is over ${String(over.id)}.` : `${String(active.id)} is no longer over a drop target.`,
          onDragEnd: ({ active, over }) => over ? `${String(active.id)} dropped on ${String(over.id)}.` : `${String(active.id)} dropped.`,
          onDragCancel: ({ active }) => `Drag cancelled for ${String(active.id)}.`,
        },
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
    </DndContext>
  );
}

export function APEXDragHandle({ label = 'Drag item' }: { label?: string }) {
  return <button type="button" className="inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-[var(--text-muted)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] active:cursor-grabbing" aria-label={label} title={label}>><GripVertical className="size-4" aria-hidden="true" /></button>;
}

export function APEXDraggable({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  return <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform) }} className={isDragging ? 'opacity-50' : ''} {...attributes} {...listeners}>{children}</div>;
}

export function APEXDropTarget({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className={`rounded-lg border border-dashed border-[var(--border-subtle)] transition-colors ${isOver ? 'bg-[var(--surface-2)] ring-1 ring-[var(--border-strong)]' : ''} ${className}`}>{children}</div>;
}

export interface APEXSortableListProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, handle: React.ReactNode) => React.ReactNode;
  direction?: 'vertical' | 'horizontal';
}

function SortableItem<T extends { id: string }>({ item, index, renderItem }: { key?: React.Key; item: T; index: number; renderItem: APEXSortableListProps<T>['renderItem'] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const handle = <button type="button" {...attributes} {...listeners} className="inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-[var(--text-muted)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] active:cursor-grabbing" aria-label={`Drag ${item.id}`}><GripVertical className="size-4" aria-hidden="true" /></button>;
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? 'z-10 opacity-60' : ''}>{renderItem(item, index, handle)}</div>;
}

export function APEXSortableList<T extends { id: string }>({ items, onChange, renderItem, direction = 'vertical' }: APEXSortableListProps<T>) {
  const strategy = direction === 'horizontal' ? horizontalListSortingStrategy : verticalListSortingStrategy;
  const [activeId, setActiveId] = React.useState<string | null>(null);

  return (
    <APEXDragProvider
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex >= 0 && newIndex >= 0) onChange(arrayMove(items, oldIndex, newIndex));
      }}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={strategy}>
        <div className={direction === 'horizontal' ? 'flex gap-2' : 'flex flex-col gap-1'}>
          {items.map((item, index) => <SortableItem key={item.id} item={item} index={index} renderItem={renderItem} />)}
        </div>
      </SortableContext>
      <DragOverlay>{activeId ? <div className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-none">{activeId}</div> : null}</DragOverlay>
    </APEXDragProvider>
  );
}
