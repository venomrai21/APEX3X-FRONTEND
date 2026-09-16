export type APEX3XSource = 'unlumen' | 'magic-ui' | 'smooth-ui';

export type APEX3XInteractionPattern =
  | 'spring-layout' | 'gesture-feedback' | 'animated-list' | 'animated-tabs'
  | 'mouse-spotlight' | 'progressive-blur' | 'number-ticker' | 'press-scale'
  | 'hover-lift' | 'tilt' | 'expand-collapse' | 'shimmer-feedback' | 'focus-transition'
  | 'ai-conversation' | 'ai-reasoning' | 'ai-tool-call' | 'ai-task-list'
  | 'ai-approval' | 'ai-diff' | 'ai-artifact' | 'ai-context-meter' | 'dynamic-island';

export interface APEX3XSourceMapping { source: APEX3XSource; patterns: APEX3XInteractionPattern[]; sourceComponents: string[]; productUses: string[]; }

/** Behavioral ingestion ledger. A source entry is valid only when its behavior has an APEX3X implementation and a real product surface. */
export const APEX3X_SOURCE_REGISTRY: APEX3XSourceMapping[] = [
  {
    source: 'unlumen',
    patterns: ['spring-layout','gesture-feedback','animated-list','animated-tabs','tilt','expand-collapse','focus-transition'],
    sourceComponents: ['Motion Navigation Menu','Animated List','Animated Input','Animated Digits','Tilt Card','Hover Expand','Pinned List','Sidebar','Motion Tabs Menu'],
    productUses: ['application shell navigation','workspace controls','Command Center intervention feed','CRM lead/customer expansion','Brain cycle/history surfaces'],
  },
  {
    source: 'magic-ui',
    patterns: ['mouse-spotlight','progressive-blur','number-ticker','shimmer-feedback','animated-list'],
    sourceComponents: ['Magic Card','Progressive Blur','Animated List','Animated Number','Text Animate','Scroll Based Velocity'],
    productUses: ['Command Center KPI surfaces','Business Insights metrics','dense operational cards','activity and notification surfaces'],
  },
  {
    source: 'smooth-ui',
    patterns: ['press-scale','hover-lift','gesture-feedback','tilt','expand-collapse','shimmer-feedback','focus-transition','ai-conversation','ai-reasoning','ai-tool-call','ai-task-list','ai-approval','ai-diff','ai-artifact','ai-context-meter','dynamic-island'],
    sourceComponents: ['Smooth Button','Magnetic Button','Animated Input','Animated Tabs','Expandable Cards','Cursor Follow','Dynamic Island','Reveal Text','Animated Progress','AI Conversation','AI Reasoning','AI Tool Call','AI Task List','AI Approval','AI Diff','AI Artifact','AI Context Meter'],
    productUses: ['global actions and controls','connector interactions','Brain reasoning and execution trace','governed action checkpoints','AI output/artifact surfaces'],
  },
];

export const APEX3X_SOURCE_RULES = {
  preserve: ['interaction behavior','motion physics','composition pattern','accessibility behavior'],
  replace: ['colors','typography','spacing tokens','radius tokens','shadows','branding'],
  boundary: 'APEX3X-owned components, adapters and interaction primitives',
  runtime: 'Motion for animation; dnd-kit behind APEX DnD contracts; TanStack Virtual behind APEX virtualization contracts',
  policy: 'source components are adapted or recreated; product views never import source-library components directly',
  interactionPolicy: 'feature code consumes APEX contracts; underlying DnD, virtualization and gesture implementations remain replaceable',
  completion: 'registry + implementation + real product use + verification; documentation alone never counts as ingestion',
} as const;
