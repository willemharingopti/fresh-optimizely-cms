/**
 * CMS content keys + routing config for the site, created via the `cms` CLI.
 * Content is fetched by GUID (not path) so it never collides with the other
 * demo sites on the shared CMS instance.
 */
export const SITE_KEYS = {
  home: "c32b391bfa754b0eaf15721fc7cc2fc6",
  about: "5faf1d56ba4e4f2ebc43f178c18b637c",
  blog: "f3167111dc654e1e8bbf897b2999aaf0",
}

/**
 * URL prefix (as Optimizely Graph resolves it for the `fresh` application) under
 * which our articles live. The app maps the Home entry point to "/", so article
 * URLs render as "/blog/<slug>/".
 */
export const BLOG_URL_PREFIX = "/blog/"
