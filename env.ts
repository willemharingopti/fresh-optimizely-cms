/**
 * Centralised, typed access to the Optimizely environment variables.
 * Values come from the process environment, populated from `.env` by
 * `main.ts` (`@std/dotenv/load`) and the Fresh Vite plugin in dev.
 */

function read(name: string): string | undefined {
  const v = Deno.env.get(name);
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export interface iEnv {
  cmsUrl?: string,
  graphGateway: string,
  graphSingleKey?: string,
  graphAppKey?: string,
  graphSecret?: string,
  devMode: boolean
  /** ms to wait after a CMS save before re-fetching preview (Graph re-index lag). */
  previewDelay: number
}

export const env: iEnv = {
  cmsUrl: read("OPTIMIZELY_CMS_URL"),
  graphGateway: read("OPTIMIZELY_GRAPH_GATEWAY") ?? "https://cg.optimizely.com",
  graphSingleKey: read("OPTIMIZELY_GRAPH_SINGLE_KEY"),
  graphAppKey: read("OPTIMIZELY_GRAPH_APP_KEY"),
  graphSecret: read("OPTIMIZELY_GRAPH_SECRET"),
  devMode: read("OPTIMIZELY_DEV_MODE") === "true",
  /** ms to wait after a CMS save before re-fetching preview (Graph re-index lag). */
  previewDelay: Number(read("OPTIMIZELY_PREVIEW_DELAY") ?? "0") || 0,
};

/** True when we have enough config to talk to Optimizely Graph for published content. */
export function isGraphConfigured(): boolean {
  return Boolean(env.graphSingleKey);
}

/**
 * The Content v2 GraphQL endpoint base URL (no auth in the URL). The Optimizely
 * SDK `GraphClient` authenticates via headers — `epi-single <key>` for published
 * reads, `Authorization: Bearer <token>` for preview — so the key never goes in
 * the query string. Used for both published and preview requests.
 */
export function graphContentUrl(): string {
  const base = env.graphGateway.replace(/\/+$/, "");
  return `${base}/content/v2`;
}

/** Published endpoint with the single key inlined — for the graph:ping probe display. */
export function graphEndpoint(): string {
  return `${graphContentUrl()}?auth=${env.graphSingleKey ?? ""}`;
}

/** Base URL of the CMS instance (trailing slash trimmed), for editor scripts. */
export function cmsBaseUrl(): string | undefined {
  return env.cmsUrl?.replace(/\/+$/, "");
}
