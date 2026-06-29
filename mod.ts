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
import type { App } from "fresh";
import { createPreviewRoute, type PreviewLayout } from "./preview/route.tsx";

export interface OptimizelyCmsOptions {
  /**
   * Layout wrapper for the preview page — e.g. the host app's `<Page>` chrome.
   * Injecting it keeps this plugin free of any imports from the app.
   */
  layout: PreviewLayout;
}

/** Register the Optimizely CMS routes (currently: Visual Builder preview). */
export function optimizelyCmsPlugin<S>(
  app: App<S>,
  options: OptimizelyCmsOptions,
): App<S> {
  // `define.page` infers a concrete data type; app.route() expects the generic
  // (unknown-data) Route shape, so cast to its exact parameter type.
  app.route(
    "/preview",
    createPreviewRoute(options.layout) as Parameters<typeof app.route>[1],
  );
  return app;
}

// --- library surface for app routes ---------------------------------------
export { loadArticles, loadExperience, loadPage } from "./graph/experience.ts";
export type {
  Article,
  ArticleSummary,
  Experience,
  PageContent,
  Section,
} from "./graph/experience.ts";
export { Composition } from "./render/Composition.tsx";
export { ArticleView } from "./render/ArticleView.tsx";
export { graphQuery } from "./graph/client.ts";
export { BLOG_URL_PREFIX, SITE_KEYS } from "./graph/siteKeys.ts";

export { PING_QUERY } from "./graph/queries.ts"
export { env, graphEndpoint, isGraphConfigured } from "./env.ts"