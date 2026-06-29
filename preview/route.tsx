import type { ComponentChildren, ComponentType } from "preact"
import { Head } from "fresh/runtime"
import { createDefine, page } from "fresh"

// Plugin-local define — the preview route doesn't rely on the host app's state,
// which keeps this plugin free of any imports from the app.
const define = createDefine<Record<string, unknown>>()
import { type Article, type ArticleSummary, loadArticlePreview, loadArticles, loadExperiencePreview, type Section } from "../graph/experience.ts"
import { BLOG_URL_PREFIX } from "../graph/siteKeys.ts"
import { cmsBaseUrl, env } from "../env.ts"
import { Composition } from "../render/Composition.tsx"
import { ArticleView } from "../render/ArticleView.tsx"
import PreviewListener from "./PreviewListener.tsx"

/**
 * Layout wrapper the host app supplies for the preview page (e.g. its `<Page>`
 * chrome). Keeping it as an injected prop is what decouples this plugin from the
 * app's components.
 */
export type PreviewLayout = ComponentType<
  { label?: string; children: ComponentChildren }
>

type Data =
  | {
    kind: "experience"
    sections: Section[]
    articles: ArticleSummary[]
    edit: boolean
  }
  | { kind: "article"; article: Article; edit: boolean }
  | { kind: "error"; message: string }

/**
 * Visual Builder preview endpoint. The CMS editor opens this in an iframe with
 *   /preview?key=<key>&ver=<version>&loc=<locale>&ctx=<context>&preview_token=<jwt>
 * We use the token to read the draft version from Graph and render it with
 * on-page-edit block ids + the editor communication script.
 */
export const handler = define.handlers({
  async GET(ctx) {
    const url = ctx.url
    const key = url.searchParams.get("key")
    const version = url.searchParams.get("ver")
    const token = url.searchParams.get("preview_token")
    // On-page-edit markers belong in the editing canvas (ctx=edit), not the
    // read-only preview pane — matching the reference Astro implementation.
    const edit = url.searchParams.get("ctx") === "edit"

    if (!key || !token) {
      return page<Data>({
        kind: "error",
        message: "Open this page from the Optimizely CMS editor — a preview key and token are required.",
      })
    }

    // Try an experience first, then an article.
    const exp = await loadExperiencePreview(
      key,
      version,
      token,
      ctx.req.signal,
    )
    if (exp && exp.sections.length) {
      const articles = await loadArticles(BLOG_URL_PREFIX, ctx.req.signal)
        .catch(
          () => [],
        )
      return page<Data>({
        kind: "experience",
        sections: exp.sections,
        articles,
        edit,
      })
    }

    const article = await loadArticlePreview(
      key,
      version,
      token,
      ctx.req.signal,
    )
    if (article) return page<Data>({ kind: "article", article, edit })

    return page<Data>({
      kind: "error",
      message: "No draft content found for this key/version, or the preview token has expired.",
    })
  },
})

function EditorScript() {
  const base = cmsBaseUrl()
  if (!base) return null
  // Communication injector enables on-page editing inside the CMS editor iframe.
  return (
    <Head>
      <script src={`${base}/util/javascript/communicationinjector.js`}></script>
    </Head>
  )
}

/**
 * The site stylesheet, injected via `<Head>`. This route is registered with
 * `app.route()`, which does NOT apply `routes/_app.tsx`, so the page must bring
 * its own `<head>` links (charset comes from the default document shell).
 */
function PreviewHead() {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Preview — Optimizely</title>
      <link rel="stylesheet" href="/theme.css" />
    </Head>
  )
}

/** Build the preview page component, wrapping content in the host's layout. */
function makePreview(Layout: PreviewLayout) {
  return define.page<typeof handler>(function Preview({ data }) {
    if (data.kind === "error") {
      return (
        <Layout label="Preview">
          <PreviewHead />
          <section style="padding:120px 0;">
            <div
              class="wrap"
              style="text-align:center; display:flex; flex-direction:column; gap:12px;"
            >
              <h1 class="disp" style="font-size:34px;">Preview</h1>
              <p class="lead">{data.message}</p>
            </div>
          </section>
        </Layout>
      )
    }

    return (
      <Layout label="Preview">
        <PreviewHead />
        <EditorScript />
        <PreviewListener delayMs={env.previewDelay} />
        {data.kind === "experience"
          ? (
            <Composition
              sections={data.sections}
              articles={data.articles}
              edit={data.edit}
            />
          )
          : <ArticleView article={data.article} edit={data.edit} />}
      </Layout>
    )
  })
}

/** Build the `/preview` route definition, given the host's layout wrapper. */
export function createPreviewRoute(layout: PreviewLayout) {
  return { handler, component: makePreview(layout) }
}
