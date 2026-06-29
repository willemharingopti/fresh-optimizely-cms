/**
 * Content-type registry for the Optimizely CMS SDK.
 *
 * The SDK generates GraphQL queries (and the experience `_IComponent`
 * composition fragments) from these definitions, so each type's `key` and
 * property keys must match the content types in the CMS exactly. They mirror
 * the content created via the `cms` CLI (scratchpad/cms/gen.py).
 *
 * Components must declare `compositionBehaviors` (length > 0) or the SDK's
 * `isExperienceComponent` check drops them from the composition fragment and
 * their fields never resolve inside an experience.
 *
 * Registration is idempotent and happens as a side effect of importing this
 * module (see `initContentTypeRegistry` below); import it once from the loaders.
 */
import {
  BlankExperienceContentType,
  contentType,
  initContentTypeRegistry,
} from "@optimizely/cms-sdk";

/** A link list, as used by Hero / Card / CallToAction. */
const links = {
  type: "array",
  items: { type: "link" },
} as const;

export const HeroContentType = contentType({
  key: "Hero",
  baseType: "_component",
  displayName: "Hero",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    Heading: { type: "string" },
    SubHeading: { type: "string" },
    Body: { type: "richText" },
    Image: { type: "contentReference" },
    Links: links,
  },
});

export const CardContentType = contentType({
  key: "Card",
  baseType: "_component",
  displayName: "Card",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    Heading: { type: "string" },
    SubHeading: { type: "string" },
    Body: { type: "richText" },
    Asset: { type: "contentReference" },
    Links: links,
  },
});

export const CollapseContentType = contentType({
  key: "Collapse",
  baseType: "_component",
  displayName: "Collapse",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    Heading: { type: "string" },
    Body: { type: "richText" },
  },
});

export const CallToActionContentType = contentType({
  key: "CallToAction",
  baseType: "_component",
  displayName: "Call to Action",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    Links: links,
  },
});

export const ParagraphContentType = contentType({
  key: "Paragraph",
  baseType: "_component",
  displayName: "Paragraph",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    Text: { type: "richText" },
  },
});

export const TextContentType = contentType({
  key: "Text",
  baseType: "_component",
  displayName: "Text",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    Content: { type: "string" },
  },
});

export const ImageContentType = contentType({
  key: "Image",
  baseType: "_component",
  displayName: "Image",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    AltText: { type: "string" },
    Image: { type: "contentReference" },
  },
});

export const ArticleListContentType = contentType({
  key: "ArticleList",
  baseType: "_component",
  displayName: "Article List",
  compositionBehaviors: ["elementEnabled"],
  properties: {
    Title: { type: "string" },
    NumberOfArticles: { type: "integer" },
  },
});

export const ArticlePageContentType = contentType({
  key: "ArticlePage",
  baseType: "_page",
  displayName: "Article Page",
  properties: {
    Heading: { type: "string" },
    SubHeading: { type: "string" },
    Author: { type: "string" },
    AuthorEmail: { type: "string" },
    Body: { type: "richText" },
    PromoImage: { type: "contentReference" },
  },
});

/** Every content type the site renders, registered once for query generation. */
export const CONTENT_TYPES = [
  BlankExperienceContentType,
  HeroContentType,
  CardContentType,
  CollapseContentType,
  CallToActionContentType,
  ParagraphContentType,
  TextContentType,
  ImageContentType,
  ArticleListContentType,
  ArticlePageContentType,
];

initContentTypeRegistry(CONTENT_TYPES);
