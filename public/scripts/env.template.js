// Vite does not natively support arbritrary environment variables at runtime. As a workaround,
// this file acts as a template to populate window.env.
(function (window) {
  window.env = window.env || {};

  // Replaced by entrypoint.sh
  __VITE_INJECT__

})(window);
