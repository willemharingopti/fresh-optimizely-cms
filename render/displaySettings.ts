/**
 * Map Visual Builder composition display settings to inline styles.
 *
 * Each composition node (section / row / column) carries a `displaySettings`
 * dictionary plus a `displayTemplateKey`. The CMS editor sets these; here we
 * translate the values into the styles our blocks render with. This mirrors the
 * reference Astro app's Section/Row/Column helpers (which emit Tailwind classes);
 * we emit inline styles instead, since the Fresh app has no Tailwind.
 *
 * These only apply inside a composition — standalone content (e.g. ArticleView)
 * never goes through here.
 */
export type Settings = Record<string, string>

export interface ColorStyle {
  /** Inline background/color declarations. */
  style: string
  /** True when the background is dark, so blocks switch to light text. */
  dark: boolean
}

/**
 * Background + matching text color from `sectionColor` / `backgroundColor`.
 *
 * Two value vocabularies are accepted, both resolved entirely from theme vars —
 * no colour values are baked in here:
 *  - Semantic intents (`neutral`, `primary`, `base_100`, …): the switch, kept for
 *    back-compat with content authored against the Visual Builder enum.
 *  - Raw theme token roles (`ink`, `surface`, `muted`, `on-ink`, …): the generic
 *    branch. The role backs the background; its paired `--t-on-<role>` (falling
 *    back to `--t-on-surface`) is the foreground; and the theme's foreground text
 *    roles are remapped to that within the section, so the shared text classes
 *    (`.disp` / `.lead` / `.bdy` / `.eyebrow`) stay legible on any background
 *    without a per-role lookup or a `dark` flag.
 */
export function colorStyle(s: Settings): ColorStyle {
  const value = s.backgroundColor || s.sectionColor || ""
  switch (value) {
    case "neutral":
      return {
        style: "background:var(--t-ink); color:var(--t-on-ink);",
        dark: true,
      }
    case "primary":
      return {
        style: "background:var(--t-primary); color:var(--t-on-primary);",
        dark: false,
      }
    case "secondary":
      return {
        style: "background:color-mix(in srgb, var(--t-primary) 14%, var(--t-surface));",
        dark: false,
      }
    case "accent":
      return {
        style: "background:var(--t-accent); color:#08251a;",
        dark: false,
      }
    case "base_100":
    case "base_200":
    case "base_300":
      return {
        style: "background:var(--t-surface); border-block:1px solid var(--t-border);",
        dark: false,
      }
    case "info":
      return { style: "background:#3b82f6; color:#fff;", dark: true }
    case "success":
      return { style: "background:#16a34a; color:#fff;", dark: true }
    case "warning":
      return {
        style: "background:var(--t-accent); color:#08251a;",
        dark: false,
      }
    case "error":
      return { style: "background:#dc2626; color:#fff;", dark: true }
  }
  // Raw theme token role → background + paired foreground, all from theme vars.
  if (/^[a-z][a-z0-9-]*$/.test(value)) {
    const fg = `var(--t-on-${value}, var(--t-on-surface))`
    return {
      style: `background:var(--t-${value}); color:${fg};` +
        ` --t-ink:${fg}; --t-muted:${fg}; --t-on-surface:${fg};`,
      dark: false,
    }
  }
  return { style: "", dark: false }
}

const px = (
  v: string | undefined,
  map: Record<string, string>,
  fallback: string,
) => (v && map[v] !== undefined ? map[v] : fallback)

// --- section ---------------------------------------------------------------
const SECTION_WIDTH: Record<string, string> = {
  default: "max-width:1200px; margin-inline:auto; padding-inline:40px;",
  narrow: "max-width:768px; margin-inline:auto; padding-inline:40px;",
  wide: "max-width:1400px; margin-inline:auto; padding-inline:40px;",
  full: "width:100%;",
}
const SECTION_VSPACE: Record<string, string> = {
  default: "48px",
  small: "32px",
  large: "96px",
  none: "0px",
}

/** Full-bleed section: background + text color + vertical spacing. */
export function sectionOuterStyle(s: Settings): ColorStyle {
  const color = colorStyle(s)
  const pad = px(s.vSpacing, SECTION_VSPACE, "48px")
  return { style: `${color.style} padding-block:${pad};`, dark: color.dark }
}

/** Inner container width (from `gridWidth`). */
export function sectionContainerStyle(s: Settings): string {
  return px(s.gridWidth, SECTION_WIDTH, SECTION_WIDTH.default)
}

// --- row -------------------------------------------------------------------
const GAP: Record<string, string> = {
  none: "0px",
  small: "8px",
  medium: "16px",
  large: "32px",
  xl: "48px",
  xxl: "80px",
}
const JUSTIFY: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
}
const ALIGN: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
}
const VMARGIN: Record<string, string> = {
  none: "0px",
  small: "8px",
  medium: "16px",
  large: "32px",
  verylarge: "80px",
}

/** Row flex container: gap / justify / align / vertical margin. */
export function rowStyle(s: Settings): string {
  const gap = px(s.contentSpacing, GAP, "24px")
  const justify = px(s.justifyContent, JUSTIFY, "flex-start")
  const align = px(s.alignItems, ALIGN, "stretch")
  const my = px(s.verticalSpacing, VMARGIN, "0px")
  const width = s.rowWidth && s.rowWidth !== "inherit" ? ` ${px(s.rowWidth, SECTION_WIDTH, "")}` : ""
  return `display:flex; flex-wrap:wrap; gap:${gap}; justify-content:${justify}; ` +
    `align-items:${align};${my !== "0px" ? ` margin-block:${my};` : ""}${width}`
}

// --- column ----------------------------------------------------------------
const MINWIDTH: Record<string, string> = {
  small: "384px",
  medium: "768px",
  large: "1024px",
}

/** Column flex item: width (gridSpan), inner gap, alignment. */
export function columnStyle(s: Settings): string {
  let basis = "flex:1 1 0;"
  const span = s.gridSpan
  if (span && span.startsWith("span")) {
    const n = Number(span.slice(4))
    if (n >= 1 && n <= 12) basis = `flex:0 1 ${((n / 12) * 100).toFixed(2)}%;`
  }
  const gap = px(s.contentSpacing, GAP, "16px")
  const justify = px(s.justifyContent, JUSTIFY, "flex-start")
  const align = px(s.alignContent, ALIGN, "stretch")
  const overflow = s.overflow === "clip" ? " overflow:hidden;" : ""
  const minw = s.minWidth && MINWIDTH[s.minWidth] ? ` min-width:${MINWIDTH[s.minWidth]};` : " min-width:220px;"
  return `display:flex; flex-direction:column; gap:${gap}; ` +
    `justify-content:${justify}; align-items:${align}; ${basis}${minw}${overflow}`
}
