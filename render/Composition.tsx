import type { JSX } from "preact";
import type {
  ArticleSummary,
  CmsComponent,
  CmsLink,
  Section,
} from "../graph/experience.ts";
import {
  columnStyle,
  rowStyle,
  sectionContainerStyle,
  sectionOuterStyle,
} from "./displaySettings.ts";
import { Icon } from "./Icon.tsx";

const FEATURE_ICONS = [
  "science",
  "groups",
  "bolt",
  "target",
  "all_inclusive",
  "handshake",
  "insights",
  "rocket_launch",
];

function links(list?: (CmsLink | null)[] | null) {
  return (list ?? []).filter((l): l is CmsLink => l != null);
}

/** Resolve a CMS asset reference to its absolute URL (empty string if unset). */
function imgUrl(ref?: { url?: { default?: string | null } | null } | null) {
  return ref?.url?.default ?? "";
}

// --- per-type blocks ------------------------------------------------------
// On-page editing for Visual Builder composition is block-level: each component
// is wrapped with `data-epi-block-id` (see SectionView). The blocks themselves
// emit no per-property `data-epi-edit` markers — that pattern is reserved for
// page templates (see ArticleView), matching the reference Astro implementation.
function HeroBlock({ c }: { c: CmsComponent }) {
  const [primary, secondary] = links(c.Links);
  return (
    <div style="width:100%; display:grid; grid-template-columns:1.05fr 0.95fr; gap:60px; align-items:center;">
      <div style="display:flex; flex-direction:column; gap:22px;">
        <h1 class="disp" style="font-size:66px; color:#fff;">{c.Heading}</h1>
        {c.SubHeading && (
          <p class="lead" style="color:rgba(244,251,238,.82); max-width:34ch;">
            {c.SubHeading}
          </p>
        )}
        {(primary || secondary) && (
          <div style="display:flex; gap:14px; margin-top:6px;">
            {primary && (
              <a href={primary.url?.default ?? "#"} class="btn btn-pri">
                {primary.text}
                <Icon name="arrow_forward" size={18} />
              </a>
            )}
            {secondary && (
              <a href={secondary.url?.default ?? "#"} class="btn btn-light">
                {secondary.text}
              </a>
            )}
          </div>
        )}
      </div>
      {imgUrl(c.Image)
        ? (
          <img
            src={imgUrl(c.Image)}
            alt={c.AltText ?? c.Heading ?? ""}
            style="width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:14px;"
          />
        )
        : (
          <div
            class="ph"
            style="aspect-ratio:4/3; background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.16); color:rgba(255,255,255,.45);"
          >
            <Icon name="monitoring" size={40} />
          </div>
        )}
    </div>
  );
}

function FeatureCard({ c, icon }: { c: CmsComponent; icon: string }) {
  const [link] = links(c.Links);
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
  );
}

function StatBlock({ c, dark }: { c: CmsComponent; dark: boolean }) {
  return (
    <div style="text-align:center;">
      <div class="disp" style={`font-size:56px;${dark ? "color:#fff;" : ""}`}>
        {c.Heading}
      </div>
      {c.SubHeading && (
        <p
          class="bdy"
          style={dark ? "color:rgba(244,251,238,.7);" : "color:var(--t-muted);"}
        >
          {c.SubHeading}
        </p>
      )}
    </div>
  );
}

function CardBlock(
  { c, index, dark }: { c: CmsComponent; index: number; dark: boolean },
) {
  // Feature cards carry Body; stat cards are Heading + SubHeading only.
  return c.Body?.html
    ? <FeatureCard c={c} icon={FEATURE_ICONS[index % FEATURE_ICONS.length]} />
    : <StatBlock c={c} dark={dark} />;
}

function CollapseBlock({ c }: { c: CmsComponent }) {
  return (
    <details class="faq card" style="overflow:hidden;">
      <summary style="padding:20px 22px; display:flex; align-items:center; justify-content:space-between; gap:14px;">
        <span style="font-weight:600; font-size:17px; color:var(--t-ink);">
          {c.Heading}
        </span>
        <span
          class="material-symbols-rounded chev"
          style="color:var(--t-muted);"
          aria-hidden="true"
        >
          expand_more
        </span>
      </summary>
      {c.Body?.html && (
        <div
          style="padding:0 22px 20px;"
          class="bdy"
          dangerouslySetInnerHTML={{ __html: c.Body.html }}
        />
      )}
    </details>
  );
}

function CtaBlock({ c }: { c: CmsComponent }) {
  const list = links(c.Links);
  if (!list.length) return null;
  return (
    <div style="display:flex; gap:14px; flex-wrap:wrap; margin-top:8px;">
      {list.map((l, i) => (
        <a
          key={i}
          href={l.url?.default ?? "#"}
          class={i === 0 ? "btn btn-pri" : "btn btn-light"}
        >
          {l.text}
          {i === 0 && <Icon name="arrow_forward" size={18} />}
        </a>
      ))}
    </div>
  );
}

function TextBlock({ c, dark }: { c: CmsComponent; dark: boolean }) {
  return (
    <h2 class="disp" style={`font-size:40px;${dark ? "color:#fff;" : ""}`}>
      {c.Content}
    </h2>
  );
}

function ParagraphBlock({ c, dark }: { c: CmsComponent; dark: boolean }) {
  if (!c.Text?.html) return null;
  return (
    <div
      class="bdy cms-prose"
      style={dark
        ? "color:rgba(244,251,238,.82); font-size:19px;"
        : "color:var(--t-muted); font-size:19px;"}
      dangerouslySetInnerHTML={{ __html: c.Text.html }}
    />
  );
}

function ImageBlock({ c }: { c: CmsComponent }) {
  const url = imgUrl(c.Image);
  if (url) {
    return (
      <img
        src={url}
        alt={c.AltText ?? ""}
        style="width:100%; height:auto; border-radius:14px; display:block;"
      />
    );
  }
  return (
    <div class="ph" style="aspect-ratio:5/4; width:100%;">
      <Icon name="image" size={40} />
    </div>
  );
}

function ArticleListBlock(
  { c, articles }: { c: CmsComponent; articles: ArticleSummary[] },
) {
  return (
    <div style="display:flex; flex-direction:column; gap:24px;">
      {c.Title && <h2 class="disp" style="font-size:32px;">{c.Title}</h2>}
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">
        {articles.map((a) => (
          <a
            key={a.key}
            href={`/blog/${a.slug}`}
            class="card"
            style="text-decoration:none; overflow:hidden; display:flex; flex-direction:column;"
          >
            {a.image
              ? (
                <img
                  src={a.image}
                  alt={a.heading}
                  style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block;"
                />
              )
              : (
                <div
                  class="ph"
                  style="aspect-ratio:16/9; border:0; border-radius:0;"
                >
                  <Icon name="image" />
                </div>
              )}
            <div style="padding:18px; display:flex; flex-direction:column; gap:8px;">
              <h3 class="disp" style="font-size:20px;">{a.heading}</h3>
              <p class="bdy" style="color:var(--t-muted); font-size:15px;">
                {a.subHeading}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// --- component dispatch ---------------------------------------------------
function Block(
  { c, index, dark, articles }: {
    c: CmsComponent;
    index: number;
    dark: boolean;
    articles: ArticleSummary[];
  },
) {
  switch (c.__typename) {
    case "Hero":
      return <HeroBlock c={c} />;
    case "Card":
      return <CardBlock c={c} index={index} dark={dark} />;
    case "Collapse":
      return <CollapseBlock c={c} />;
    case "CallToAction":
      return <CtaBlock c={c} />;
    case "Text":
      return <TextBlock c={c} dark={dark} />;
    case "Paragraph":
      return <ParagraphBlock c={c} dark={dark} />;
    case "Image":
      return <ImageBlock c={c} />;
    case "ArticleList":
      return <ArticleListBlock c={c} articles={articles} />;
    default:
      return null;
  }
}

// --- section + experience -------------------------------------------------
function SectionView(
  { section, articles, edit }: {
    section: Section;
    articles: ArticleSummary[];
    edit: boolean;
  },
) {
  // Section: full-bleed background + text color + vertical spacing (vSpacing);
  // inner container width comes from gridWidth. Rows/columns lay out via flex
  // from their own display settings (gap, justify, align, gridSpan, ...).
  const { style, dark } = sectionOuterStyle(section.settings);
  let cardIndex = 0;
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
                  const idx = c.__typename === "Card" ? cardIndex++ : 0;
                  const block = (
                    <Block c={c} index={idx} dark={dark} articles={articles} />
                  );
                  return edit
                    ? (
                      <div key={idx2} data-epi-block-id={c.__nodeKey}>
                        {block}
                      </div>
                    )
                    : <div key={idx2} style="display:contents;">{block}</div>;
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Composition(
  { sections, articles = [], edit = false }: {
    sections: Section[];
    articles?: ArticleSummary[];
    /** Preview/edit mode: emit Visual Builder block ids for on-page editing. */
    edit?: boolean;
  },
): JSX.Element  {
  return (
    <>
      {sections.map((s, i) => (
        <SectionView key={i} section={s} articles={articles} edit={edit} />
      ))}
    </>
  );
}
