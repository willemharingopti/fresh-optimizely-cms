/**
 * Standalone GraphQL document for the lightweight connectivity probe used by
 * `deno task graph:ping`. Page/experience reads are SDK-generated in
 * `plugins/optimizely-cms/experience.ts`.
 */
export const PING_QUERY: string = /* GraphQL */ `
query Ping { __schema { queryType { name } } }
`
