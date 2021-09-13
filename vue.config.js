const manifestOptions = require("./public/assets/manifest.json");

module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule("yaml")
      .test(/\.ya?ml$/)
      .use("raw-loader")
      .loader("raw-loader")
      .end();
  },
  publicPath: "",
  pwa: {
    manifestPath: "assets/manifest.json",
    manifestCrossorigin: "use-credentials",
    appleMobileWebAppStatusBarStyle: "black",
    appleMobileWebAppCapable: "yes",
    name: manifestOptions.name,
    themeColor: manifestOptions.theme_color,
    manifestOptions,
    iconPaths: {
      favicon32: "assets/icons/favicon-32x32.png",
      favicon16: "assets/icons/favicon-16x16.png",
      appleTouchIcon: "assets/icons/icon-maskable.png",
      maskIcon: "assets/icons/safari-pinned-tab.svg",
      msTileImage: "assets/icons/icon-any.png",
    },
  },
};
