import type { CmsComponent } from "../../../../graph/experience.ts"

export function Paragraph({ c, dark }: { c: CmsComponent; dark: boolean }) {
  if (!c.Text?.html) return null
  return (
    <div
      class="bdy cms-prose"
      style={dark ? "color:rgba(244,251,238,.82); font-size:19px;" : "color:var(--t-muted); font-size:19px;"}
      dangerouslySetInnerHTML={{ __html: c.Text.html }}
    />
  )
}
