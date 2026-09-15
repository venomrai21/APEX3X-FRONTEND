# APEX3X component-source ingestion

Unlumen UI, Magic UI, and SmoothUI are source systems for **interaction behavior and composition**, not product identities. APEX3X owns the implementation, visual system, business semantics, accessibility contract, and product usage.

## Implemented ingestion

| Source | Behavior family | APEX3X implementation | Real product surfaces |
|---|---|---|---|
| Unlumen UI | spring/layout motion, animated lists, navigation, tabs, hover/tilt, expand/collapse | `src/components/apex3x/adapters` + `foundation/InteractionPrimitives.tsx` | application shell, Command Center, Leads, Customers, Brain |
| Magic UI | spotlight, animated metrics, progressive visual feedback, dense data motion | `APEXSpotlight`, `APEXMetric`, `ProgressiveBlur`, animated numeric/list adapters | Command Center KPI surfaces, data cards, activity surfaces |
| SmoothUI | press/hover feedback, animated controls, progress, expandable surfaces, AI/agent presentation | APEX interaction primitives + `foundation/AgentSurfaces.tsx` | global controls, Connector Kernel, Brain reasoning/tool/task/approval/artifact surfaces |

## Agent interaction family

SmoothUI's AI/agent interaction patterns are represented as APEX-owned surfaces for:

- conversation containers
- reasoning disclosure
- tool-call state
- task execution state
- approval checkpoints
- before/after diffs
- artifacts
- context meters
- dynamic status islands

These surfaces are **presentation components only**. They do not execute tools, authorize actions, hold credentials, or bypass the APEX backend.

## Boundary

`source behavior → APEX3X adapter/foundation → real product surface → verified interaction`

Product code imports from `src/components/apex3x`. Source-library components are never imported directly. Source colors, typography, spacing, radius, shadows, and branding are not adopted. The product remains strictly monochrome until explicitly authorized otherwise. Existing `motion` is the only animation runtime.

## Completion rule

A source component/pattern is not considered ingested merely because it is listed in a registry or copied into a file. It requires:

1. a source behavior/pattern mapping;
2. an APEX3X-owned implementation or adapter;
3. at least one real product use;
4. no source visual-identity leakage; and
5. verification of the resulting interaction.

The registry in `foundation/SourceRegistry.ts` is the architectural ledger; the product views are the usage evidence.
