// Header names are case-insensitive, so they are lowercased before merging and
// each source overrides the previous one whatever its casing. Unset values are
// skipped: a card must not replace a configured header with `undefined`.
function mergeHeaders(...sources) {
  const merged = {};
  for (const source of sources) {
    for (const [name, value] of Object.entries(source ?? {})) {
      if (value !== undefined && value !== null) {
        merged[name.toLowerCase()] = value;
      }
    }
  }
  return merged;
}

export default function fetchOptions({ proxy, item, init }) {
  const options = {};

  if (proxy?.useCredentials) {
    options.credentials = "include";
  }

  if (item?.useCredentials !== undefined) {
    options.credentials = item.useCredentials === true ? "include" : "omit";
  }

  Object.assign(options, init);

  options.headers = mergeHeaders(proxy?.headers, item?.headers, init?.headers);

  return options;
}
