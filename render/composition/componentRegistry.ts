/**
 * The binding registries: content type / display template → the component that
 * renders it. This is the SDK's binding mechanism (cf. `@optimizely/cms-sdk`'s
 * `ComponentRegistry` / `initReactComponentRegistry`), specialized for Preact.
 *
 * The app registers its generated design-import (`axiom_*`) renderers via
 * `optimizelyCmsPlugin({ components, structures })`. The composition dispatch
 * resolves through them:
 *   - leaf component nodes  → by content type (`__typename`)
 *   - section/row/column    → by display-template key
 * The BlankExperience page renders through the plugin's Composition; unresolved
 * nodes fall back to the built-in blocks + default container styling.
 */
import type { ComponentChildren, JSX } from "preact"
import type { Settings } from "../displaySettings.ts"

/** Renders one leaf component instance. `c` is the Graph node (type + fields). */
// deno-lint-ignore no-explicit-any
export type CmsRenderer = (props: { c: any }) => JSX.Element | null
/** Content type name → its renderer. */
export type ComponentMap = Record<string, CmsRenderer>

/** Props a structure (section/row/column) container renderer receives. */
export interface StructureProps {
  /** The node's resolved display settings (spacing, gridSpan, background, …). */
  settings: Settings
  children: ComponentChildren
  /** Composition node key — the on-page-edit block id in preview. */
  nodeKey?: string
  /** Preview/edit mode: emit the Visual Builder block id. */
  edit?: boolean
}
/** Renders a structure container (parameterized by the node's settings). */
export type StructureRenderer = (props: StructureProps) => JSX.Element
/** Display-template key → its structure renderer. */
export type StructureMap = Record<string, StructureRenderer>

let components: ComponentMap = {}
let structures: StructureMap = {}

/** Replace the component registry — called at plugin init. */
export function setComponentRegistry(map?: ComponentMap): void {
  components = map ?? {}
}
/** Replace the structure registry — called at plugin init. */
export function setStructureRegistry(map?: StructureMap): void {
  structures = map ?? {}
}

/** The component registered for a content type, or `undefined`. */
export function resolveComponent(contentType?: string): CmsRenderer | undefined {
  return contentType ? components[contentType] : undefined
}
/** The structure renderer registered for a display-template key, or `undefined`. */
export function resolveStructure(displayTemplateKey?: string): StructureRenderer | undefined {
  return displayTemplateKey ? structures[displayTemplateKey] : undefined
}
