import type { CmsComponent } from "../../../../graph/experience.ts"
import { Icon } from "../../../Icon.tsx"
import { imgUrl, links } from "../../helpers.ts"

// On-page editing for Visual Builder composition is block-level: each component
// is wrapped with `data-epi-block-id` (see SectionView). The blocks themselves
// emit no per-property `data-epi-edit` markers — that pattern is reserved for
// page templates (see ArticleView), matching the reference Astro implementation.
export function Hero({ c }: { c: CmsComponent }) {
  const [primary, secondary] = links(c.Links)
  return (
    <div style="width:100%; display:grid; grid-template-columns:1.05fr 0.95fr; gap:60px; align-items:center;">
      <div style="display:flex; flex-direction:column; gap:22px;">
        <h1 class="disp" style="font-size:66px; color:#fff;">{c.Heading}</h1>
        {c.SubHeading && (
          <p class="lead" style="color:rgba(244,251,238,.82); max-width:34ch;">
            {c.SubHeading}
          </p>
        )}
        {(primary || secondary) && (
          <div style="display:flex; gap:14px; margin-top:6px;">
            {primary && (
              <a href={primary.url?.default ?? "#"} class="btn btn-pri">
                {primary.text}
                <Icon name="arrow_forward" size={18} />
              </a>
            )}
            {secondary && (
              <a href={secondary.url?.default ?? "#"} class="btn btn-light">
                {secondary.text}
              </a>
            )}
          </div>
        )}
      </div>
      {imgUrl(c.Image)
        ? (
          <img
            src={imgUrl(c.Image)}
            alt={c.AltText ?? c.Heading ?? ""}
            style="width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:14px;"
          />
        )
        : (
          <div
            class="ph"
            style="aspect-ratio:4/3; background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.16); color:rgba(255,255,255,.45);"
          >
            <Icon name="monitoring" size={40} />
          </div>
        )}
    </div>
  )
}
