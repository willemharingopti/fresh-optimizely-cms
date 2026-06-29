import type { CmsComponent } from "../../../../graph/experience.ts"
import { FEATURE_ICONS } from "../../helpers.ts"
import { FeatureCard } from "../FeatureCard/FeatureCard.tsx"
import { Stat } from "../Stat/Stat.tsx"

export function Card(
  { c, index, dark }: { c: CmsComponent; index: number; dark: boolean },
) {
  // Feature cards carry Body; stat cards are Heading + SubHeading only.
  return c.Body?.html ? <FeatureCard c={c} icon={FEATURE_ICONS[index % FEATURE_ICONS.length]} /> : <Stat c={c} dark={dark} />
}
