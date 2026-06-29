import type { CmsComponent } from "../../../../graph/experience.ts"
import { Icon } from "../../../Icon.tsx"
import { imgUrl } from "../../helpers.ts"

export function Image({ c }: { c: CmsComponent }) {
  const url = imgUrl(c.Image)
  if (url) {
    return (
      <img
        src={url}
        alt={c.AltText ?? ""}
        style="width:100%; height:auto; border-radius:14px; display:block;"
      />
    )
  }
  return (
    <div class="ph" style="aspect-ratio:5/4; width:100%;">
      <Icon name="image" size={40} />
    </div>
  )
}
