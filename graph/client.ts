/**
 * Central Optimizely Graph client, backed by the official `@optimizely/cms-sdk`.
 *
 * `config()` is called once (lazily) with the single key + Content v2 URL, and
 * `client()` hands out the shared `GraphClient`. Importing this module also
 * registers the content types (see ./contentTypes.ts) so the SDK can
 * generate the typed queries / composition fragments used by ./experience.ts.
 *
 * Published reads authenticate as `epi-single <key>`; preview/draft reads pass a
 * CMS-issued preview token, which the SDK sends as `Authorization: Bearer`.
 *
 * `graphQuery()` remains for the lightweight `graph:ping` connectivity probe,
 * which runs a raw GraphQL document rather than a content query.
 */
import { config, getClient, type GraphClient } from "@optimizely/cms-sdk"
import "./contentTypes.ts" // registers content types as a side effect
import { env, graphContentUrl, isGraphConfigured } from "../env.ts"

let configured = false
function ensureConfigured() {
  if (!configured) {
    config({
      apiKey: env.graphSingleKey ?? "",
      graphUrl: graphContentUrl(),
      // Disable Optimizely Graph's server-side query cache in dev so freshly
      // published edits show on reload; keep it on in production.
      cache: !env.devMode,
    })
    configured = true
  }
}

/** The shared, lazily-configured Optimizely Graph client. */
export function client(): GraphClient {
  ensureConfigured()
  return getClient()
}

export interface GraphResult<T> {
  data: T | null
  errors?: { message: string }[]
  /** The query text, for the dev debug panel. */
  query: string
}

/**
 * Execute a raw GraphQL query against Optimizely Graph via the SDK client.
 * Never throws — the SDK's network/HTTP/GraphQL errors are caught and returned
 * in `errors`. Content reads go through ./experience.ts; this is for the
 * connectivity probe (`deno task graph:ping`).
 */
export async function graphQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<GraphResult<T>> {
  if (!isGraphConfigured()) {
    return {
      data: null,
      errors: [{ message: "OPTIMIZELY_GRAPH_SINGLE_KEY is not configured." }],
      query,
    }
  }
  try {
    const data = await client().request(query, variables) as T
    return { data: data ?? null, query }
  } catch (err) {
    return {
      data: null,
      errors: [{ message: `Graph request failed: ${(err as Error).message}` }],
      query,
    }
  }
}
