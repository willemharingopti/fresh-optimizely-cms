import type { ArticleSummary, CmsComponent } from "../../../../graph/experience.ts"
import { Icon } from "../../../Icon.tsx"

export function ArticleList(
  { c, articles }: { c: CmsComponent; articles: ArticleSummary[] },
) {
  return (
    <div style="display:flex; flex-direction:column; gap:24px;">
      {c.Title && <h2 class="disp" style="font-size:32px;">{c.Title}</h2>}
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">
        {articles.map((a) => (
          <a
            key={a.key}
            href={`/blog/${a.slug}`}
            class="card"
            style="text-decoration:none; overflow:hidden; display:flex; flex-direction:column;"
          >
            {a.image
              ? (
                <img
                  src={a.image}
                  alt={a.heading}
                  style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;"
                />
              )
              : (
                <div
                  class="ph"
                  style="aspect-ratio:16/9; border:0; border-radius:0;"
                >
                  <Icon name="image" />
                </div>
              )}
            <div style="padding:18px; display:flex; flex-direction:column; gap:8px;">
              <h3 class="disp" style="font-size:20px;">{a.heading}</h3>
              <p class="bdy" style="color:var(--t-muted); font-size:15px;">
                {a.subHeading}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
