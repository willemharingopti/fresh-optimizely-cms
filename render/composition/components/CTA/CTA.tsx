import type { CmsComponent } from "../../../../graph/experience.ts"
import { Icon } from "../../../Icon.tsx"
import { links } from "../../helpers.ts"

export function CTA({ c }: { c: CmsComponent }) {
  const list = links(c.Links)
  if (!list.length) return null
  return (
    <div style="display:flex; gap:14px; flex-wrap:wrap; margin-top:8px;">
      {list.map((l, i) => (
        <a
          key={i}
          href={l.url?.default ?? "#"}
          class={i === 0 ? "btn btn-pri" : "btn btn-light"}
        >
          {l.text}
          {i === 0 && <Icon name="arrow_forward" size={18} />}
        </a>
      ))}
    </div>
  )
}
