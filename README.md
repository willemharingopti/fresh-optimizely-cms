# @willemharingopti/fresh-optimizely-cms

Optimizely SaaS CMS integration for **Deno Fresh 2**, packaged as a Fresh plugin. It renders **Visual Builder experiences** and **ArticlePages** from Optimizely Graph (via the official `@optimizely/cms-sdk`) and wires up **Visual Builder preview / on-page editing** — including live updates.

> Replace `@willemharingopti/fresh-optimizely-cms` below with the actual published package name.

## What you get

- `optimizelyCmsPlugin(app, { layout })` — registers the `/preview` route.
- `loadPage(path, host)` — resolve published content by URL path (the CMS owns routing); returns a discriminated `PageContent` (`experience` | `article`).
- `Composition` / `ArticleView` — Preact renderers for experiences and articles.
- Visual Builder preview: draft rendering, `data-epi-block-id` / `data-epi-edit` on-page-edit markers, the communication-injector script, and a live-reload island that re-renders on `optimizely:cms:contentSaved`.

## Requirements

- Deno + **Fresh 2** with **Vite** (`@fresh/plugin-vite`).
- An Optimizely SaaS CMS instance with **Optimizely Graph** enabled (a Render Content "Single Key").
- A CMS **Application** whose hostname matches where this app is served.

## 1. Install

```sh
deno add jsr:@willemharingopti/fresh-optimizely-cms
deno install   # Vite needs node_modules (nodeModulesDir: "manual")
```

The package depends on `npm:@optimizely/cms-sdk`; `deno install` pulls it in.

## 2. Environment variables

Set these in `.env` (loaded by `main.ts` via `@std/dotenv/load`):

| Variable                      | Required    | Purpose                                                         |
| ----------------------------- | ----------- | --------------------------------------------------------------- |
| `OPTIMIZELY_GRAPH_SINGLE_KEY` | yes         | Graph single key (published reads + preview metadata)           |
| `OPTIMIZELY_GRAPH_GATEWAY`    | no          | Graph gateway (default `https://cg.optimizely.com`)             |
| `OPTIMIZELY_CMS_URL`          | for preview | CMS instance URL — source of the communication-injector script  |
| `OPTIMIZELY_DEV_MODE`         | no          | `true` disables Graph's query cache so edits show on reload     |
| `OPTIMIZELY_PREVIEW_DELAY`    | no          | ms to wait after a save before re-fetching (Graph re-index lag) |

## 3. Configure Vite

The preview live-reload island ships inside this package, so declare it as an island specifier for the Fresh Vite plugin to bundle + hydrate it:

```ts
// vite.config.ts
import { defineConfig } from "vite"
import { fresh } from "@fresh/plugin-vite"

export default defineConfig({
  plugins: [
    fresh({
      islandSpecifiers: [
        "jsr:@willemharingopti/fresh-optimizely-cms/preview/PreviewListener.tsx",
      ],
    }),
  ],
})
```

## 4. Register the plugin

Pass your app's layout (the chrome the preview page should render inside):

```ts
// main.ts
import "@std/dotenv/load"
import { App, staticFiles } from "fresh"
import { optimizelyCmsPlugin } from "@willemharingopti/fresh-optimizely-cms"
import { Page } from "./components/layout/Page.tsx" // your layout

export const app = new App()
app.use(staticFiles())

optimizelyCmsPlugin(app, { layout: Page }) // registers /preview
app.fsRoutes()
```

`layout` is any component accepting `{ label?: string; children }`. The plugin's `/preview` route is registered programmatically and therefore does **not** use `routes/_app.tsx` — it injects its own stylesheet via `<Head>`, so make sure your global CSS is reachable at the URL your layout links.

## 5. Add the catch-all route

The CMS owns routing. One catch-all resolves any path; the request origin (`ctx.url.origin`) identifies the application and its entry point.

```tsx
// routes/[...path].tsx
import { HttpError, page } from "fresh"
import { ArticleView, Composition, loadPage, type PageContent } from "@willemharingopti/fresh-optimizely-cms"
import { Page } from "../components/layout/Page.tsx"

export const handler = {
  async GET(ctx: { params: Record<string, string>; url: URL; req: Request }) {
    const raw = ctx.params.path ?? ""
    const path = raw ? `/${raw.replace(/\/+$/, "")}/` : "/"
    const content = await loadPage(path, ctx.url.origin, ctx.req.signal)
    if (!content) throw new HttpError(404)
    return page<{ content: PageContent }>({ content })
  },
}

export default function CmsPage({ data }: { data: { content: PageContent } }) {
  const { content } = data
  return (
    <Page>
      {content.kind === "experience"
        ? (
          <Composition
            sections={content.sections}
            articles={content.articles}
          />
        )
        : <ArticleView article={content.article} />}
    </Page>
  )
}
```

Fresh's catch-all does not match `/`, so add a one-line root alias:

```ts
// routes/index.tsx
export { default, handler } from "./[...path].tsx"
```

## 6. Configure the CMS

In the CMS, on your Application:

1. **Hostnames** — add the host this app is served on (e.g. `http://localhost:8000`). It must match `ctx.url.origin` at runtime; `loadPage` scopes path resolution to that host, which also prevents collisions with other sites on a shared instance.
2. **Live Preview** — enable **Use Preview Tokens** and set the preview URL format to `{host}/preview?key={key}&ver={version}&loc={locale}&ctx={context}`.

## Content model

The renderers handle a fixed catalog of content types: the `BlankExperience` composition (`Hero`, `Card`, `Collapse`, `CallToAction`, `Paragraph`, `Text`, `Image`, `ArticleList`) and `ArticlePage`. These must exist in your CMS with matching property keys; the plugin registers their definitions with the SDK for query
generation. Unknown component types render nothing.

## API

| Export                                                           | Description                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `optimizelyCmsPlugin(app, { layout })`                           | Register the `/preview` route                                       |
| `loadPage(path, host, signal?)`                                  | Resolve published content by path → `PageContent \| null`           |
| `loadExperience(key, signal?)` / `loadArticles(prefix, signal?)` | Key-based loaders (e.g. for a connectivity check)                   |
| `Composition` / `ArticleView`                                    | Preact renderers                                                    |
| `graphQuery(query, vars)`                                        | Raw GraphQL escape hatch (never throws)                             |
| Types                                                            | `PageContent`, `Experience`, `Section`, `Article`, `ArticleSummary` |

## Notes

- The `host` passed to `loadPage` **must include the scheme** (`http://localhost:8000`, not `localhost:8000`) and match the CMS hostname.
- Behind a TLS-terminating proxy, ensure `ctx.url.origin` reflects the public host the CMS application is configured with.
- Published pages use the single key; only `/preview` uses the Bearer token.
