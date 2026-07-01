import type { JSX } from "preact"
import type { CmsComponent } from "../../graph/experience.ts"
import { resolveComponent } from "./componentRegistry.ts"

// --- component dispatch ---------------------------------------------------
export interface BlockProps {
  c: CmsComponent
}

/**
 * Render one leaf component by resolving its content type (`__typename`) in the
 * registry the app supplied via `optimizelyCmsPlugin({ components })`. The plugin
 * ships no built-in blocks: every composition component is a registered
 * (generated) renderer. An unregistered type renders nothing.
 */
export function Block({ c }: BlockProps): JSX.Element | null {
  const Component = resolveComponent(c.__typename)
  return Component ? <Component c={c} /> : null
}
