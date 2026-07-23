/**
 * Build fetch options from a `proxy` configuration block, and the optional
 * per-item overrides that services support.
 *
 * @param {Object} proxy the global `proxy` configuration, if any.
 * @param {Object} item a service item, when the caller has one.
 * @returns {Object} options to pass to fetch().
 */
export default function fetchOptions(proxy, item) {
  const options = {};

  if (proxy?.useCredentials) {
    options.credentials = "include";
  }

  if (proxy?.headers) {
    options.headers = proxy.headers;
  }

  // Each item can override the credential settings
  if (item?.useCredentials !== undefined) {
    options.credentials = item.useCredentials === true ? "include" : "omit";
  }

  // Each item can have their own headers
  if (item?.headers) {
    options.headers = item.headers;
  }

  return options;
}
