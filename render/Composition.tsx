import type { JSX } from "preact"
import type { ArticleSummary, Section } from "../graph/experience.ts"
import { columnStyle, rowStyle, sectionContainerStyle, sectionOuterStyle } from "./displaySettings.ts"
import { Block } from "./composition/dispatch.tsx"

// --- section + experience -------------------------------------------------
function SectionView(
  { section, articles, edit }: {
    section: Section
    articles: ArticleSummary[]
    edit: boolean
  },
) {
  // Section: full-bleed background + text color + vertical spacing (vSpacing);
  // inner container width comes from gridWidth. Rows/columns lay out via flex
  // from their own display settings (gap, justify, align, gridSpan, ...).
  const { style, dark } = sectionOuterStyle(section.settings)
  let cardIndex = 0
  return (
    // In edit mode, tag the section and each component with their composition
    // node keys so the Visual Builder editor can map DOM elements to nodes.
    <section style={style} data-epi-block-id={edit ? section.key : undefined}>
      <div style={sectionContainerStyle(section.settings)}>
        {section.rows.map((row, ri) => (
          <div key={ri} style={rowStyle(row.settings)}>
            {row.columns.map((col, ci) => (
              <div key={ci} style={columnStyle(col.settings)}>
                {col.components.map((c, idx2) => {
                  const idx = c.__typename === "Card" ? cardIndex++ : 0
                  const block = <Block c={c} index={idx} dark={dark} articles={articles} />
                  return edit
                    ? (
                      <div key={idx2} data-epi-block-id={c.__nodeKey}>
                        {block}
                      </div>
                    )
                    : <div key={idx2} style="display:contents;">{block}</div>
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export function Composition(
  { sections, articles = [], edit = false }: {
    sections: Section[]
    articles?: ArticleSummary[]
    /** Preview/edit mode: emit Visual Builder block ids for on-page editing. */
    edit?: boolean
  },
): JSX.Element {
  return (
    <>
      {sections.map((s, i) => <SectionView key={i} section={s} articles={articles} edit={edit} />)}
    </>
  )
}
