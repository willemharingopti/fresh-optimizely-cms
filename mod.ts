/**
 * Optimizely SaaS CMS integration, packaged as a Fresh 2 plugin.
 *
 * Register it on your App:
 *   import { optimizelyCmsPlugin } from "./plugins/optimizely-cms/mod.ts";
 *   optimizelyCmsPlugin(app);
 *
 * This registers the Visual Builder `/preview` route. The SDK client config and
 * content-type registry are wired as import side effects (see ./graph.ts →
 * ./contentTypes.ts), driven by ./env.ts.
 *
 * The data loaders, renderers, content keys, and types are re-exported here for
 * the app's own page routes to import.
 */
import type { App } from "fresh"
import { initContentTypeRegistry } from "@optimizely/cms-sdk"
import { createPreviewRoute, type PreviewLayout } from "./preview/route.tsx"
import { CONTENT_TYPES } from "./graph/contentTypes.ts"
import {
  type ComponentMap,
  setComponentRegistry,
  setStructureRegistry,
  type StructureMap,
} from "./render/composition/componentRegistry.ts"

/** The SDK content-type registry input (results of `contentType(...)`). */
export type ContentTypeList = Parameters<typeof initContentTypeRegistry>[0]

export interface OptimizelyCmsOptions {
  /**
   * Layout wrapper for the preview page — e.g. the host app's `<Page>` chrome.
   * Injecting it keeps this plugin free of any imports from the app.
   */
  layout: PreviewLayout
  /**
   * Extra content types to register alongside the built-in blocks — e.g. the
   * design-import `axiom_*` types the app defines. The SDK's composition query
   * only fetches fields for registered types, so pass them here (an array, or a
   * function returning one) so their data resolves. Keeps design-specific types
   * in the app rather than the generic plugin.
   */
  contentTypes?: ContentTypeList | (() => ContentTypeList)
  /**
   * Leaf component renderers, keyed by content type (`axiom_Hero`, …). The
   * plugin ships no built-in blocks: every composition component resolves here.
   * These are the generated design-import components.
   */
  components?: ComponentMap
  /**
   * Structure (section / row / column) renderers, keyed by display-template key
   * (`axiom-row-split`, …). Each is a parameterized container that reads the
   * node's display settings. The BlankExperience page itself is rendered by the
   * plugin's Composition shell.
   */
  structures?: StructureMap
}

/** Register the Optimizely CMS preview route + any app-provided content types. */
export function optimizelyCmsPlugin<S>(
  app: App<S>,
  options: OptimizelyCmsOptions,
): App<S> {
  // `init` replaces the registry, so re-register the built-ins together with the
  // app's extras. (The built-ins alone are also registered as an import side
  // effect, which still covers standalone loader use such as `graph:ping`.)
  const extra = typeof options.contentTypes === "function" ? options.contentTypes() : options.contentTypes
  if (extra && extra.length) initContentTypeRegistry([...CONTENT_TYPES, ...extra])

  // Bind the generated renderers: leaf components by content type, structure
  // (section/row/column) by display-template key. The plugin ships none itself.
  setComponentRegistry(options.components)
  setStructureRegistry(options.structures)

  // `define.page` infers a concrete data type; app.route() expects the generic
  // (unknown-data) Route shape, so cast to its exact parameter type.
  app.route(
    "/preview",
    createPreviewRoute(options.layout) as Parameters<typeof app.route>[1],
  )
  return app
}

// --- library surface for app routes ---------------------------------------
export { loadArticles, loadExperience, loadPage } from "./graph/experience.ts"
export type { Article, ArticleSummary, CmsComponent, Experience, NodeStyle, PageContent, Section } from "./graph/experience.ts"
export { Composition } from "./render/Composition.tsx"
export { ArticleView } from "./render/ArticleView.tsx"
export { graphQuery } from "./graph/client.ts"

// The registry contracts the generated renderers are typed against, plus the
// binding key types.
export type {
  CmsRenderer,
  ComponentMap,
  StructureMap,
  StructureProps,
  StructureRenderer,
} from "./render/composition/componentRegistry.ts"

// Shared layout vocabulary: the generated structure renderers reuse these to
// turn a node's display settings into container styles (gap, gridSpan, width,
// background, vSpacing, …), so the setting→style mapping stays in one place.
export {
  colorStyle,
  columnStyle,
  rowStyle,
  sectionContainerStyle,
  sectionOuterStyle,
} from "./render/displaySettings.ts"
export type { ColorStyle, Settings } from "./render/displaySettings.ts"

// Re-exported so the app defines content types against the SAME SDK instance
// (shared registry), then passes them via `optimizelyCmsPlugin({ contentTypes })`.
export { contentType } from "@optimizely/cms-sdk"

export { PING_QUERY } from "./graph/queries.ts"
export { env, graphEndpoint, isGraphConfigured } from "./env.ts"
