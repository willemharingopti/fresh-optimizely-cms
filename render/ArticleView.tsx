import type { JSX } from "preact"
import type { Article } from "../graph/experience.ts"
import { Icon } from "./Icon.tsx"

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase())
    .join("")
}

/**
 * Renders an ArticlePage (header meta + cover + rich-text body).
 *
 * In `edit` mode (CMS preview), each field carries `data-epi-edit="<PropertyKey>"`
 * for on-page editing — the property-level pattern used for page templates (the
 * Visual Builder composition uses block-level ids instead; see Composition.tsx).
 * Keys match the ArticlePage content type: Heading / SubHeading / Author / Body.
 */
export function ArticleView({ article: a, edit = false }: { article: Article; edit?: boolean }): JSX.Element {
  const ep = (name: string) => (edit ? name : undefined)
  return (
    <article>
      <div
        class="wrap"
        style="max-width:760px; padding-top:64px; display:flex; flex-direction:column; gap:20px;"
      >
        <a
          href="/blog"
          style="color:var(--t-link); text-decoration:none; font-size:14px; font-weight:600; display:inline-flex; align-items:center; gap:5px;"
        >
          <Icon name="arrow_back" size={16} />
          All articles
        </a>
        <h1 class="disp" style="font-size:46px;" data-epi-edit={ep("Heading")}>
          {a.heading}
        </h1>
        {a.subHeading && <p class="lead" data-epi-edit={ep("SubHeading")}>{a.subHeading}</p>}
        {a.author && (
          <div
            style="display:flex; align-items:center; gap:12px; padding:8px 0 4px;"
            data-epi-edit={ep("Author")}
          >
            <div style="width:44px; height:44px; border-radius:9999px; background:#EEFFD9; display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--t-ink);">
              {initials(a.author)}
            </div>
            <div style="font-weight:600; color:var(--t-ink); font-size:15px;">
              {a.author}
            </div>
          </div>
        )}
      </div>

      <div class="wrap" style="max-width:760px; padding-top:32px;">
        {a.image
          ? (
            <img
              src={a.image}
              alt={a.heading}
              data-epi-edit={ep("PromoImage")}
              style="width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:16px; display:block;"
            />
          )
          : (
            <div
              class="ph"
              style="aspect-ratio:16/9;"
              data-epi-edit={ep("PromoImage")}
            >
              <Icon name="image" size={44} />
            </div>
          )}
      </div>

      <div
        class="wrap cms-prose"
        style="max-width:760px; padding-top:44px; padding-bottom:80px;"
        data-epi-edit={ep("Body")}
        dangerouslySetInnerHTML={{ __html: a.bodyHtml }}
      />
    </article>
  )
}
