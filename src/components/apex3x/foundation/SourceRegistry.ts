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
  | 'focus-transition';

export interface APEX3XSourceMapping {
  source: APEX3XSource;
  patterns: APEX3XInteractionPattern[];
  productUses: string[];
}

/**
 * APEX3X source ingestion is behavioral, not visual.
 *
 * Unlumen contributes precision interactions and layout motion.
 * Magic UI contributes focused visual effects and ambient feedback.
 * SmoothUI contributes responsive micro-interactions and Motion patterns.
 *
 * Product code consumes APEX3X primitives/adapters only; source branding,
 * palettes and component identities never cross the product boundary.
 */
export const APEX3X_SOURCE_REGISTRY: APEX3XSourceMapping[] = [
  {
    source: 'unlumen',
    patterns: ['spring-layout', 'gesture-feedback', 'animated-list', 'animated-tabs', 'focus-transition'],
    productUses: ['command center feeds', 'navigation', 'workspace controls', 'live operational updates'],
  },
  {
    source: 'magic-ui',
    patterns: ['mouse-spotlight', 'progressive-blur', 'number-ticker'],
    productUses: ['KPI surfaces', 'intelligence cards', 'dense data surfaces'],
  },
  {
    source: 'smooth-ui',
    patterns: ['press-scale', 'hover-lift', 'gesture-feedback', 'focus-transition'],
    productUses: ['actions', 'cards', 'controls', 'connector interactions'],
  },
];

export const APEX3X_SOURCE_RULES = {
  preserve: ['interaction behavior', 'motion physics', 'composition pattern', 'accessibility behavior'],
  replace: ['colors', 'typography', 'spacing tokens', 'radius tokens', 'shadows', 'branding'],
  boundary: 'APEX3X-owned components and adapters',
} as const;
