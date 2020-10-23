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
    manifestOptions: {
      start_url: "../",
    },
    appleMobileWebAppStatusBarStyle: "black",
    appleMobileWebAppCapable: "yes",
    name: "Homer Dashboard",
    short_name: "Homer",
    theme_color: "#3367D6",
    icons: [
      {
        src: "./icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "./icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "./icons/icon-any.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "./icons/icon-any.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "./icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "./icons/safari-pinned-tab.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "monochrome",
      },
    ],
    iconPaths: {
      favicon32: "assets/icons/favicon-32x32.png",
      favicon16: "assets/icons/favicon-16x16.png",
      appleTouchIcon: "assets/icons/icon-maskable.png",
      maskIcon: "assets/icons/safari-pinned-tab.svg",
      msTileImage: "assets/icons/icon-any.png",
    },
  },
};
