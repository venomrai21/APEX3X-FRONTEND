import React, { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'apex3x-sidebar-collapsed';
const MOBILE_QUERY = '(max-width: 1023px)';
const EDGE_WIDTH = 28;
const DISTANCE_RATIO = 0.45;
const VELOCITY_THRESHOLD = 0.5;

type GestureMode = 'open-edge' | 'close-drawer' | null;

export const useSidebarInteraction = () => {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dragX, setDragX] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const gestureTargetRef = useRef<HTMLElement | null>(null);
  const gestureModeRef = useRef<GestureMode>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const axisLockedRef = useRef(false);
  const cancelledRef = useRef(false);

  const toggleCollapsed = useCallback(() => setCollapsed(value => {
    const next = !value;
    window.localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  }), []);

  const openMobile = useCallback(() => {
    setMobileOpen(true);
    setDragX(null);
  }, []);

  const closeMobile = useCallback((restoreFocus = true) => {
    setMobileOpen(false);
    setDragX(null);
    if (restoreFocus) window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
  }, []);

  const cancelGesture = useCallback(() => {
    pointerIdRef.current = null;
    gestureTargetRef.current = null;
    gestureModeRef.current = null;
    axisLockedRef.current = false;
    cancelledRef.current = false;
    setDragX(null);
  }, []);

  const finishGesture = useCallback((clientX: number) => {
    const mode = gestureModeRef.current;
    const width = drawerRef.current?.offsetWidth || 304;
    const elapsed = Math.max(1, performance.now() - startTimeRef.current);
    const distance = clientX - startXRef.current;
    const velocity = Math.abs(distance) / elapsed;
    const threshold = width * DISTANCE_RATIO;

    if (mode === 'open-edge') {
      if (distance >= threshold || velocity >= VELOCITY_THRESHOLD) openMobile();
      else closeMobile(false);
    } else if (mode === 'close-drawer') {
      if (distance <= -threshold || velocity >= VELOCITY_THRESHOLD) closeMobile();
      else setDragX(null);
    }
    pointerIdRef.current = null;
    gestureTargetRef.current = null;
    gestureModeRef.current = null;
    axisLockedRef.current = false;
    cancelledRef.current = false;
  }, [closeMobile, openMobile]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>, mode: Exclude<GestureMode, null>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerIdRef.current = event.pointerId;
    gestureTargetRef.current = event.currentTarget;
    gestureModeRef.current = mode;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    startTimeRef.current = performance.now();
    axisLockedRef.current = false;
    cancelledRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== event.pointerId || cancelledRef.current) return;
    const dx = event.clientX - startXRef.current;
    const dy = event.clientY - startYRef.current;
    if (!axisLockedRef.current) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        cancelledRef.current = true;
        cancelGesture();
        return;
      }
      if (Math.abs(dx) > 8) axisLockedRef.current = true;
    }
    if (!axisLockedRef.current) return;
    const width = drawerRef.current?.offsetWidth || 304;
    if (gestureModeRef.current === 'open-edge') setDragX(Math.max(0, Math.min(width, dx)) - width);
    if (gestureModeRef.current === 'close-drawer') setDragX(Math.min(0, Math.max(-width, dx)));
  }, [cancelGesture]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== event.pointerId || cancelledRef.current) return;
    finishGesture(event.clientX);
  }, [finishGesture]);

  const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    cancelGesture();
  }, [cancelGesture]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => { if (!media.matches) setMobileOpen(false); };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => {
      const first = drawerRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      first?.focus();
    });
    return () => { document.body.style.overflow = previousOverflow; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && (event.key.toLowerCase() === 'b' || (event.metaKey && event.key === '\\'))) {
        event.preventDefault();
        if (window.matchMedia(MOBILE_QUERY).matches) mobileOpen ? closeMobile() : openMobile();
        else toggleCollapsed();
        return;
      }
      if (event.key === 'Escape' && mobileOpen) {
        event.preventDefault();
        closeMobile();
        return;
      }
      if (event.key === 'Tab' && mobileOpen && drawerRef.current) {
        const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMobile, mobileOpen, openMobile, toggleCollapsed]);

  return {
    collapsed,
    mobileOpen,
    dragX,
    drawerRef,
    mobileTriggerRef,
    toggleCollapsed,
    openMobile,
    closeMobile,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    edgeWidth: EDGE_WIDTH,
  };
};
