import type { CmsComponent } from "../../../../graph/experience.ts"

export function Text({ c, dark }: { c: CmsComponent; dark: boolean }) {
  return (
    <h2 class="disp" style={`font-size:40px;${dark ? "color:#fff;" : ""}`}>
      {c.Content}
    </h2>
  )
}
