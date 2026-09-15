# APEX3X component-source ingestion

Unlumen UI, Magic UI, and SmoothUI are **source systems for interaction behavior**, not product identities.

## Current ingestion map

| Source | Ingested behavior | APEX3X application |
|---|---|---|
| Unlumen UI | spring reveals, layout motion, animated lists, precision transitions | global view entry, Command Center intervention feed, APEX3X adapters |
| Magic UI | cursor-follow spotlight, animated numeric surfaces, progressive visual feedback | Command Center KPI surfaces, APEX3X interaction foundation |
| SmoothUI | press feedback, hover lift, Motion-based micro-interactions | global APEX3X buttons and interaction primitives |

## Boundary

- Product code imports from `src/components/apex3x`.
- No product view imports an external library component directly.
- Library colors, typography, branding, shadows, and visual identity are not adopted.
- APEX3X remains strictly monochrome until the product owner explicitly authorizes color.
- Existing `motion` is the runtime animation engine; no second animation engine is introduced.
- Real business data remains the source of displayed values. Source libraries provide behavior only.

## Ingestion rule

`source behavior → APEX3X adapter/foundation → real product surface → verified interaction`

A component is not considered ingested merely because a file exists. It must have an APEX3X boundary and at least one real product use.
