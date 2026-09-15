export type APEX3XSource = 'unlumen' | 'magic-ui' | 'smooth-ui';

export type APEX3XInteractionPattern =
  | 'spring-layout'
  | 'gesture-feedback'
  | 'animated-list'
  | 'animated-tabs'
  | 'mouse-spotlight'
  | 'progressive-blur'
  | 'number-ticker'
  | 'press-scale'
  | 'hover-lift'
  | 'tilt'
  | 'expand-collapse'
  | 'shimmer-feedback'
  | 'focus-transition';

export interface APEX3XSourceMapping {
  source: APEX3XSource;
  patterns: APEX3XInteractionPattern[];
  sourceComponents: string[];
  productUses: string[];
}

/**
 * APEX3X source ingestion is behavioral, not visual.
 * Public source catalogs are treated as reference material; APEX3X owns the
 * implementation boundary, visual identity, accessibility contract and usage.
 */
export const APEX3X_SOURCE_REGISTRY: APEX3XSourceMapping[] = [
  {
    source: 'unlumen',
    patterns: ['spring-layout', 'gesture-feedback', 'animated-list', 'animated-tabs', 'tilt', 'expand-collapse', 'focus-transition'],
    sourceComponents: ['Motion Navigation Menu', 'Animated List', 'Animated Input', 'Animated Digits', 'Tilt Card', 'Hover Expand', 'Pinned List', 'Sidebar', 'Motion Tabs Menu'],
    productUses: ['command center feeds', 'navigation', 'workspace controls', 'live operational updates', 'data-detail expansion'],
  },
  {
    source: 'magic-ui',
    patterns: ['mouse-spotlight', 'progressive-blur', 'number-ticker', 'shimmer-feedback', 'animated-list'],
    sourceComponents: ['Magic Card', 'Progressive Blur', 'Animated List', 'Animated Number', 'Text Animate', 'Scroll Based Velocity'],
    productUses: ['KPI surfaces', 'intelligence cards', 'dense data surfaces', 'activity feeds'],
  },
  {
    source: 'smooth-ui',
    patterns: ['press-scale', 'hover-lift', 'gesture-feedback', 'tilt', 'expand-collapse', 'shimmer-feedback', 'focus-transition'],
    sourceComponents: ['Smooth Button', 'Magnetic Button', 'Animated Input', 'Animated Tabs', 'Expandable Cards', 'Cursor Follow', 'Dynamic Island', 'Reveal Text', 'Animated Progress'],
    productUses: ['actions', 'cards', 'controls', 'connector interactions', 'status feedback'],
  },
];

export const APEX3X_SOURCE_RULES = {
  preserve: ['interaction behavior', 'motion physics', 'composition pattern', 'accessibility behavior'],
  replace: ['colors', 'typography', 'spacing tokens', 'radius tokens', 'shadows', 'branding'],
  boundary: 'APEX3X-owned components and adapters',
  runtime: 'existing Motion dependency; no additional animation engine',
  policy: 'source components are adapted or recreated; product views never import source-library components directly',
} as const;
