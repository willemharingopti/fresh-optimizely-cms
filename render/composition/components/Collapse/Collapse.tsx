import type { CmsComponent } from "../../../../graph/experience.ts"

export function Collapse({ c }: { c: CmsComponent }) {
  return (
    <details class="faq card" style="overflow:hidden;">
      <summary style="padding:20px 22px; display:flex; align-items:center; justify-content:space-between; gap:14px;">
        <span style="font-weight:600; font-size:17px; color:var(--t-ink);">
          {c.Heading}
        </span>
        <span
          class="material-symbols-rounded chev"
          style="color:var(--t-muted);"
          aria-hidden="true"
        >
          expand_more
        </span>
      </summary>
      {c.Body?.html && (
        <div
          style="padding:0 22px 20px;"
          class="bdy"
          dangerouslySetInnerHTML={{ __html: c.Body.html }}
        />
      )}
    </details>
  )
}
