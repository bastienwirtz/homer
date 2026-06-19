// Minimal HTML sanitizer used for content coming from remote sources.
//
// Message content can be fetched from an arbitrary endpoint and is rendered
// with `v-html`. Such content is outside of the user's own config and must
// therefore be treated as untrusted: without sanitizing it, a remote endpoint
// could inject scripts or event handlers and run arbitrary JS in the dashboard
// (XSS). We strip anything that can execute code while keeping basic markup so
// the documented "content accepts HTML" behaviour still works for endpoints.

// Tags that should never make it through, regardless of attributes.
const FORBIDDEN_TAGS = ["script", "style", "iframe", "object", "embed", "link"];

// Allow http(s), mailto and relative URLs only, blocking things like
// `javascript:` or `data:` URIs that can be used to execute code.
const SAFE_URL = /^(?:https?:|mailto:|\/|\.\/|\.\.\/|#)/i;

function sanitizeNode(node) {
  // Drop comment nodes, they can be abused by some parsers.
  if (node.nodeType === Node.COMMENT_NODE) {
    node.remove();
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  if (FORBIDDEN_TAGS.includes(node.tagName.toLowerCase())) {
    node.remove();
    return;
  }

  for (const attr of [...node.attributes]) {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    // Strip every inline event handler (onclick, onerror, onload, ...).
    if (name.startsWith("on")) {
      node.removeAttribute(attr.name);
      continue;
    }

    // Only allow safe URLs for attributes that can trigger navigation/loading.
    if (
      (name === "href" || name === "src" || name === "xlink:href") &&
      !SAFE_URL.test(value.trim())
    ) {
      node.removeAttribute(attr.name);
    }
  }

  for (const child of [...node.childNodes]) {
    sanitizeNode(child);
  }
}

export function sanitizeHtml(html) {
  if (typeof html !== "string" || html === "") {
    return html;
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  for (const child of [...template.content.childNodes]) {
    sanitizeNode(child);
  }

  return template.innerHTML;
}

export default sanitizeHtml;
