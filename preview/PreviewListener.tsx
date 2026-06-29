import { useEffect } from "preact/hooks";

/**
 * Live-preview bridge for the Optimizely CMS editor.
 *
 * The CMS `communicationinjector.js` script dispatches an
 * `optimizely:cms:contentSaved` event on the window whenever an editor changes
 * content. Its `detail.previewUrl` carries a freshly-minted preview URL with a
 * new token (the token in the current URL is only valid ~5 minutes), so we
 * navigate to it to re-render the draft server-side. Falls back to a plain
 * reload if no URL is provided.
 *
 * This is an island (client-side only); it renders nothing.
 */
interface ContentSavedDetail {
  previewUrl?: string;
}

/**
 * @param delayMs Wait before re-navigating, to give Optimizely Graph time to
 *   re-index the just-saved content (matches the reference's PREVIEW_DELAY).
 */
export default function PreviewListener({ delayMs = 0 }: { delayMs?: number }) {
  useEffect(() => {
    const onSaved = (event: Event) => {
      const detail = (event as CustomEvent<ContentSavedDetail>).detail;
      const next = detail?.previewUrl;
      setTimeout(() => {
        if (next) {
          globalThis.location.replace(next);
        } else {
          globalThis.location.reload();
        }
      }, delayMs);
    };
    globalThis.addEventListener("optimizely:cms:contentSaved", onSaved);
    return () =>
      globalThis.removeEventListener("optimizely:cms:contentSaved", onSaved);
  }, [delayMs]);

  return null;
}
