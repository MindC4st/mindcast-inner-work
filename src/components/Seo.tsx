// Applies per-route metadata on navigation.
//
// This is the SECOND line of defence, not the first. The static HTML written
// by scripts/prerender-seo.mjs is what crawlers and social scrapers actually
// read, because most of them never run JavaScript. This component keeps the
// tab title and the canonical honest during in-app navigation, and covers
// Googlebot's rendered pass.
//
// Private routes get `noindex` rather than a description. A member's dashboard
// or a bracelet token link should never reach an index, and robots.txt alone
// does not guarantee that — a URL that is linked from elsewhere can still be
// listed without being crawled. The meta tag is what actually removes it.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  SITE,
  canonicalFor,
  findPage,
  isPrivatePath,
  ogTitleFor,
  privateTitleFor,
} from "@/lib/seo";

const DEFAULT_TITLE = "Mindcast — A Weekly Gathering Without the Religion";
const DEFAULT_DESCRIPTION =
  "Everything church did well — a room, the same people, every week — without the religion. Adults, teens and children in Taupō, New Zealand.";

/** Upsert a <meta> by name or property. */
const setMeta = (keyAttr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${keyAttr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(keyAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const removeMeta = (keyAttr: "name" | "property", key: string) => {
  document.head.querySelector(`meta[${keyAttr}="${key}"]`)?.remove();
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
};

const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = findPage(pathname);
    const priv = isPrivatePath(pathname);

    document.title = page?.title ?? privateTitleFor(pathname) ?? DEFAULT_TITLE;

    if (priv) {
      // Keep these out of the index entirely. No description, no share card —
      // there is nothing here to preview and nobody should be linked in.
      setMeta("name", "robots", "noindex, nofollow");
      removeMeta("name", "description");
      removeMeta("property", "og:description");
      document.head.querySelector('link[rel="canonical"]')?.remove();
      return;
    }

    removeMeta("name", "robots");

    const description = page?.description ?? DEFAULT_DESCRIPTION;
    const title = page ? ogTitleFor(page) : DEFAULT_TITLE;
    const canonical = canonicalFor(pathname);

    setMeta("name", "description", description);
    setCanonical(canonical);

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:locale", SITE.locale);

    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
  }, [pathname]);

  return null;
};

export default Seo;
