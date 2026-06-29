import type { CmsComponent } from "../../../../graph/experience.ts"

export function Stat({ c, dark }: { c: CmsComponent; dark: boolean }) {
  return (
    <div style="text-align:center;">
      <div class="disp" style={`font-size:56px;${dark ? "color:#fff;" : ""}`}>
        {c.Heading}
      </div>
      {c.SubHeading && (
        <p
          class="bdy"
          style={dark ? "color:rgba(244,251,238,.7);" : "color:var(--t-muted);"}
        >
          {c.SubHeading}
        </p>
      )}
    </div>
  )
}
