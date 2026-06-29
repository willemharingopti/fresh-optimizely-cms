import type { CmsLink } from "../../graph/experience.ts"

export const FEATURE_ICONS = [
  "science",
  "groups",
  "bolt",
  "target",
  "all_inclusive",
  "handshake",
  "insights",
  "rocket_launch",
]

export function links(list?: (CmsLink | null)[] | null) {
  return (list ?? []).filter((l): l is CmsLink => l != null)
}

/** Resolve a CMS asset reference to its absolute URL (empty string if unset). */
export function imgUrl(ref?: { url?: { default?: string | null } | null } | null) {
  return ref?.url?.default ?? ""
}
