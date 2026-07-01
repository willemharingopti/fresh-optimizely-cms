import type { ComponentChildren, JSX } from "preact"
import type { NodeStyle, Section } from "../graph/experience.ts"
import { resolveStructure } from "./composition/componentRegistry.ts"
import { Block } from "./composition/dispatch.tsx"

/**
 * Render a structure node (section / row / column) through its registered
 * renderer, resolved by display-template key. The renderer owns the container
 * markup + styling (parameterized by the node's display settings). An
 * unresolved node renders its children bare so content still shows.
 */
function StructureNode(
  { node, edit, children }: { node: NodeStyle; edit: boolean; children: ComponentChildren },
): JSX.Element {
  const Renderer = resolveStructure(node.displayTemplateKey)
  if (!Renderer) return <>{children}</>
  return (
    <Renderer settings={node.settings} nodeKey={node.key} edit={edit}>
      {children}
    </Renderer>
  )
}

function SectionView({ section, edit }: { section: Section; edit: boolean }): JSX.Element {
  return (
    <StructureNode node={section} edit={edit}>
      {section.rows.map((row, ri) => (
        <StructureNode key={ri} node={row} edit={edit}>
          {row.columns.map((col, ci) => (
            <StructureNode key={ci} node={col} edit={edit}>
              {col.components.map((c, i) =>
                edit
                  ? (
                    <div key={i} data-epi-block-id={c.__nodeKey}>
                      <Block c={c} />
                    </div>
                  )
                  : <Block key={i} c={c} />
              )}
            </StructureNode>
          ))}
        </StructureNode>
      ))}
    </StructureNode>
  )
}

export function Composition(
  { sections, edit = false }: {
    sections: Section[]
    /** Preview/edit mode: emit Visual Builder block ids for on-page editing. */
    edit?: boolean
  },
): JSX.Element {
  return (
    <>
      {sections.map((s, i) => <SectionView key={i} section={s} edit={edit} />)}
    </>
  )
}
