/**
 * Load Visual Builder experiences and articles from Optimizely Graph via the
 * `@optimizely/cms-sdk` client and shape them for rendering.
 *
 * The SDK generates the GraphQL from the content-type registry (./contentTypes.ts):
 *   - `getContent({ key })` resolves an experience plus its full composition tree
 *     (experience → section → row → column → component), which we flatten below.
 *   - `getItems({ key })` enumerates a parent's child pages (the blog's articles).
 *
 * Published reads use the single key; preview reads pass a CMS-issued preview
 * token + draft version. `loadPage` resolves a page by URL path scoped to the
 * requesting `host` (so the CMS owns routing); child/preview reads still fetch
 * by GUID. The host scope avoids colliding with the other demo sites on this
 * shared CMS instance (an unscoped "/" matches every site's home).
 */
import { client } from "./client.ts"
import type { Settings } from "../render/displaySettings.ts"

// --- shaped types ---------------------------------------------------------
export interface CmsLink {
  text?: string | null
  target?: string | null
  url?: { default?: string | null } | null
}

/** A CMS content reference to an asset (image/media); `url.default` is absolute. */
export interface CmsImage {
  url?: { default?: string | null } | null
}

export interface CmsComponent {
  __typename: string
  /** Composition node key — used as the on-page-edit block id in preview. */
  __nodeKey?: string
  Heading?: string | null
  SubHeading?: string | null
  Body?: { html?: string | null } | null
  Text?: { html?: string | null } | null
  Content?: string | null
  AltText?: string | null
  Title?: string | null
  NumberOfArticles?: number | null
  Links?: (CmsLink | null)[] | null
  /** Asset references (Hero/Image use `Image`, Card uses `Asset`). */
  Image?: CmsImage | null
  Asset?: CmsImage | null
}

/** A composition structure node's styling inputs (display settings + template). */
export interface NodeStyle {
  /** Composition node key — the on-page-edit block id in preview. */
  key?: string
  /** e.g. DefaultSection / DefaultRow / DefaultColumn. */
  displayTemplateKey?: string
  /** Raw display-setting key→value pairs the CMS editor configured. */
  settings: Settings
}

export interface Column extends NodeStyle {
  components: CmsComponent[]
}
export interface Row extends NodeStyle {
  columns: Column[]
}
export interface Section extends NodeStyle {
  name: string
  rows: Row[]
}
export interface Experience {
  displayName: string
  sections: Section[]
}

export interface ArticleSummary {
  key: string
  heading: string
  subHeading: string
  author: string
  url: string
  slug: string
  /** PromoImage asset URL (absolute), if set. */
  image: string
}

export interface Article extends ArticleSummary {
  authorEmail: string
  bodyHtml: string
}

// --- helpers --------------------------------------------------------------
interface RawNode {
  key?: string | null
  displayName?: string | null
  displayTemplateKey?: string | null
  displaySettings?:
    | ({ key?: string | null; value?: string | null } | null)[]
    | null
  nodes?: (RawNode | null)[] | null
  component?: CmsComponent | null
}

interface RawArticle {
  Heading?: string
  SubHeading?: string
  Author?: string
  AuthorEmail?: string
  Body?: { html?: string }
  PromoImage?: { url?: { default?: string } } | null
  _metadata: {
    key: string
    version?: string
    status?: string
    url?: { default?: string }
  }
}

/** Collapse a node's `displaySettings` array into a key→value dictionary. */
function settingsOf(node: RawNode): Settings {
  const dict: Settings = {}
  for (const kv of node.displaySettings ?? []) {
    if (kv?.key && kv.value) dict[kv.key] = kv.value
  }
  return dict
}

/** Shared NodeStyle fields (key + template + settings) for a structure node. */
function nodeStyle(node: RawNode): {
  key?: string
  displayTemplateKey?: string
  settings: Settings
} {
  return {
    key: node.key ?? undefined,
    displayTemplateKey: node.displayTemplateKey ?? undefined,
    settings: settingsOf(node),
  }
}

function childNodes(node: RawNode | null | undefined): RawNode[] {
  return (node?.nodes ?? []).filter((n): n is RawNode => n != null)
}

function parseComposition(comp: RawNode | null | undefined): Section[] {
  const sections: Section[] = []
  for (const sec of childNodes(comp)) {
    const rows: Row[] = []
    for (const rowNode of childNodes(sec)) {
      const columns: Column[] = []
      for (const colNode of childNodes(rowNode)) {
        const components = childNodes(colNode)
          .filter((n) => n.component?.__typename)
          .map((n) => ({ ...n.component!, __nodeKey: n.key ?? undefined }))
        if (components.length) {
          columns.push({ ...nodeStyle(colNode), components })
        }
      }
      if (columns.length) rows.push({ ...nodeStyle(rowNode), columns })
    }
    sections.push({ name: sec.displayName ?? "", ...nodeStyle(sec), rows })
  }
  return sections
}

function toArticle(a: RawArticle): Article {
  const url = a._metadata.url?.default ?? ""
  return {
    key: a._metadata.key,
    heading: a.Heading ?? "",
    subHeading: a.SubHeading ?? "",
    author: a.Author ?? "",
    authorEmail: a.AuthorEmail ?? "",
    bodyHtml: a.Body?.html ?? "",
    image: a.PromoImage?.url?.default ?? "",
    url,
    slug: slugFromUrl(url),
  }
}

function slugFromUrl(url: string): string {
  return url.replace(/\/+$/, "").split("/").pop() ?? ""
}

/** A child page as returned by `getItems` (metadata only). */
interface ChildLink {
  _metadata?: { key: string; url?: { default?: string } | null } | null
}

/** Run an SDK call without throwing — log and fall back so pages stay up. */
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    console.error("Optimizely Graph load failed:", (err as Error).message)
    return null
  }
}

async function loadArticleByKey(key: string): Promise<Article | null> {
  const item = await safe(() => client().getContent({ key }))
  return item ? toArticle(item as RawArticle) : null
}

// --- published loaders ----------------------------------------------------
export async function loadExperience(
  key: string,
  signal?: AbortSignal,
): Promise<Experience | null> {
  if (signal?.aborted) return null
  const item = await safe(() => client().getContent({ key }))
  if (!item?.composition) return null
  return {
    displayName: item._metadata?.displayName ?? "",
    sections: parseComposition(item.composition),
  }
}

/**
 * Articles that are children of the given content, by its key — e.g. the
 * resolved (or previewed) Blog experience. The article list renders the children
 * of the page it lives on, so the parent key comes from the content being
 * rendered rather than any site-specific identifier.
 */
export async function loadArticles(
  parentKey: string,
  signal?: AbortSignal,
): Promise<ArticleSummary[]> {
  if (signal?.aborted) return []
  const children = (await safe(() => client().getItems({ key: parentKey }))) as
    | ChildLink[]
    | null
  const articles = await Promise.all(
    (children ?? []).map((c) => c?._metadata?.key ? loadArticleByKey(c._metadata.key) : null),
  )
  return articles.filter((a): a is Article => a != null)
}

function hasArticleList(sections: Section[]): boolean {
  return sections.some((s) => s.rows.some((r) => r.columns.some((col) => col.components.some((c) => c.__typename === "ArticleList"))))
}

/** Resolved page content for the catch-all route. */
export type PageContent =
  | {
    kind: "experience"
    displayName: string
    sections: Section[]
    articles: ArticleSummary[]
  }
  | { kind: "article"; article: Article }

/**
 * Resolve published content by URL path, scoped to `host` (the requesting
 * application's origin, e.g. http://localhost:8000). The host identifies which
 * CMS application — and thus which entry point — the path resolves against, so
 * the site routes entirely from the CMS instead of hard-coded keys.
 */
export async function loadPage(
  path: string,
  host: string,
  signal?: AbortSignal,
): Promise<PageContent | null> {
  if (signal?.aborted) return null
  // deno-lint-ignore no-explicit-any
  const items = (await safe(() => client().getContentByPath(path, { host }))) as
    | any[]
    | null
  const item = items?.[0]
  if (!item) return null

  const types: string[] = item._metadata?.types ?? []
  if (types.includes("_Experience")) {
    const sections = parseComposition(item.composition)
    const articles = hasArticleList(sections) && item._metadata?.key ? await loadArticles(item._metadata.key, signal) : []
    return {
      kind: "experience",
      displayName: item._metadata?.displayName ?? "",
      sections,
      articles,
    }
  }
  if (types.includes("ArticlePage")) {
    return { kind: "article", article: toArticle(item as RawArticle) }
  }
  return null
}

// --- preview loaders (draft content via preview token) --------------------

/** Fetch a specific draft version by key, authenticated with the preview token. */
function loadPreviewItem(
  key: string,
  version: string | null,
  previewToken: string,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  return safe(() =>
    client().getContent(
      { key, ...(version ? { version } : {}) },
      { previewToken },
    )
  )
}

/** Load a draft experience by key + version using the CMS preview token. */
export async function loadExperiencePreview(
  key: string,
  version: string | null,
  previewToken: string,
  signal?: AbortSignal,
): Promise<Experience | null> {
  if (signal?.aborted) return null
  const item = await loadPreviewItem(key, version, previewToken)
  if (!item?.composition) return null
  return {
    displayName: item._metadata?.displayName ?? "",
    sections: parseComposition(item.composition),
  }
}

/** Load a draft article by key + version using the CMS preview token. */
export async function loadArticlePreview(
  key: string,
  version: string | null,
  previewToken: string,
  signal?: AbortSignal,
): Promise<Article | null> {
  if (signal?.aborted) return null
  const item = await loadPreviewItem(key, version, previewToken)
  return item ? toArticle(item as RawArticle) : null
}
