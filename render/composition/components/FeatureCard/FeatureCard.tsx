import type { CmsComponent } from "../../../../graph/experience.ts"
import { Icon } from "../../../Icon.tsx"
import { links } from "../../helpers.ts"

export function FeatureCard({ c, icon }: { c: CmsComponent; icon: string }) {
  const [link] = links(c.Links)
  return (
    <article
      class="card"
      style="padding:28px; display:flex; flex-direction:column; gap:14px; height:100%;"
    >
      <span
        class="material-symbols-rounded"
        style="font-size:30px; color:var(--t-ink); background:#EEFFD9; width:52px; height:52px; border-radius:12px; display:flex; align-items:center; justify-content:center;"
        aria-hidden="true"
      >
        {icon}
      </span>
      <h3 class="disp" style="font-size:24px;">{c.Heading}</h3>
      {c.Body?.html && (
        <div
          class="bdy"
          style="color:var(--t-muted);"
          dangerouslySetInnerHTML={{ __html: c.Body.html }}
        />
      )}
      {link && (
        <a
          href={link.url?.default ?? "#"}
          style="color:var(--t-link); text-decoration:none; font-weight:600; font-size:15px; display:inline-flex; align-items:center; gap:5px; margin-top:auto;"
        >
          {link.text ?? "Learn more"}
          <Icon name="arrow_forward" size={16} />
        </a>
      )}
    </article>
  )
}
