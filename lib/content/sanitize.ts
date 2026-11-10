import sanitizeHtml from "sanitize-html";

/**
 * Cleans HTML that was written in Shopify admin (policies, later blog posts)
 * before it is shown. Formatting survives; scripts, styles, event handlers,
 * iframes and javascript: links do not.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "span", "div", "img"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    transformTags: {
      // An h1 inside page content would compete with the page's own title.
      h1: "h2",
      a: (tagName, attribs) => ({
        tagName,
        attribs: /^https?:\/\//.test(attribs.href ?? "")
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : attribs,
      }),
    },
  });
}
