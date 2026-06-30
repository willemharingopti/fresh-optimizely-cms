import type { JSX } from "preact"
import type { ArticleSummary, CmsComponent } from "../../graph/experience.ts"
import { ArticleList } from "./components/ArticleList/ArticleList.tsx"
import { Card } from "./components/Card/Card.tsx"
import { Collapse } from "./components/Collapse/Collapse.tsx"
import { CTA } from "./components/CTA/CTA.tsx"
import { Hero } from "./components/Hero/Hero.tsx"
import { Image } from "./components/Image/Image.tsx"
import { Paragraph } from "./components/Paragraph/Paragraph.tsx"
import { Text } from "./components/Text/Text.tsx"

// --- component dispatch ---------------------------------------------------
export interface BlockProps {
  c: CmsComponent
  index: number
  dark: boolean
  articles: ArticleSummary[]
}

const richText = (v: unknown) => (typeof v === "string" ? { html: v } : v)
const firstOf = (v: unknown) => (Array.isArray(v) ? v[0] : v)
const asLinks = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => (typeof x === "string" ? { text: x, url: { default: "#" } } : x)) : v

/**
 * Bridge design-import (`axiom_`) content onto the canonical fields the base
 * block components read. The importer flattens/renames some fields (rich text as
 * a plain string, `Text.html` → `Text_html`, a single string emitted as an
 * array, link labels without URLs), so realign them here. No-op for native
 * content (only applied when an `axiom_` prefix was stripped).
 */
function normalizeAxiom(type: string, c: CmsComponent): CmsComponent {
  const r = c as unknown as Record<string, unknown> // importer fields aren't on the typed shape
  let patch: Record<string, unknown> = {}
  switch (type) {
    case "Paragraph":
      patch = { Text: r.Text ?? r.Text_html }
      break
    case "Text":
      patch = { Content: firstOf(r.Content) }
      break
    case "Collapse":
      patch = { Body: richText(r.Body) }
      break
    case "Card":
      patch = { Body: richText(r.Body), Links: asLinks(r.Links) }
      break
  }
  return { ...c, ...patch } as CmsComponent
}

/** Standard rendering, dispatched on content type — unchanged default look.
 * `axiom_`-prefixed content types are design-specific variants of the base
 * blocks (e.g. `axiom_Hero`), so strip the prefix and dispatch to the same
 * renderer; plain base-type names are unaffected. */
function StandardBlock({ c, index, dark, articles }: BlockProps) {
  const type = c.__typename?.replace(/^axiom_/, "") ?? ""
  // only design-import content (a prefix was stripped) needs field realignment
  const cc = type === c.__typename ? c : normalizeAxiom(type, c)
  switch (type) {
    case "Hero":
      return <Hero c={cc} />
    case "Card":
      return <Card c={cc} index={index} dark={dark} />
    case "Collapse":
      return <Collapse c={cc} />
    case "CallToAction":
      return <CTA c={cc} />
    case "Text":
      return <Text c={cc} dark={dark} />
    case "Paragraph":
      return <Paragraph c={cc} dark={dark} />
    case "Image":
      return <Image c={cc} />
    case "ArticleList":
      return <ArticleList c={cc} articles={articles} />
    default:
      return null
  }
}

/**
 * `axiom-` display-template variants, keyed by `displayTemplateKey` verbatim.
 *
 * A variant only belongs here when it needs genuinely different render
 * *structure* from the standard block. Variants that differ only in display
 * settings + theme tokens need no entry — they render through `StandardBlock`
 * and re-style from the CMS settings on their node. Add entries as a generic,
 * versioned capability when a design's handover calls for new structure, e.g.:
 *   "axiom-hero-spotlight": (p) => <HeroBlock c={p.c} />,
 */
const AXIOM_VARIANTS: Record<string, (p: BlockProps) => JSX.Element | null> = {}

/**
 * Render a component. Standard/Default templates and unregistered `axiom-`
 * templates render the standard block as-is; a registered `axiom-` template
 * renders its variant.
 */
export function Block(props: BlockProps) {
  const key = props.c.__template
  if (key && key.startsWith("axiom-") && AXIOM_VARIANTS[key]) {
    return AXIOM_VARIANTS[key](props)
  }
  return <StandardBlock {...props} />
}
