interface IconProps {
  name: string
  size?: number
  color?: string
  class?: string
}

/** A Material Symbols (Rounded) glyph, matching the design's icon usage. */
export function Icon({ name, size, color, class: extra }: IconProps) {
  const style = [
    size ? `font-size:${size}px` : "",
    color ? `color:${color}` : "",
  ].filter(Boolean).join(";")
  return (
    <span
      class={`material-symbols-rounded${extra ? " " + extra : ""}`}
      style={style || undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
