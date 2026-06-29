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

/** Standard rendering, dispatched on content type — unchanged default look. */
function StandardBlock({ c, index, dark, articles }: BlockProps) {
  switch (c.__typename) {
    case "Hero":
      return <Hero c={c} />
    case "Card":
      return <Card c={c} index={index} dark={dark} />
    case "Collapse":
      return <Collapse c={c} />
    case "CallToAction":
      return <CTA c={c} />
    case "Text":
      return <Text c={c} dark={dark} />
    case "Paragraph":
      return <Paragraph c={c} dark={dark} />
    case "Image":
      return <Image c={c} />
    case "ArticleList":
      return <ArticleList c={c} articles={articles} />
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
