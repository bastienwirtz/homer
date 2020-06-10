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
    appleMobileWebAppStatusBarStyle: "black",
    appleMobileWebAppCapable: "yes",
    name: "Homer Dashboard",
    short_name: "Homer",
    theme_color: "#3367D6",
    icons: [
      {
        src: "./assets/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "./assets/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "./assets/icons/android-chrome-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "./assets/icons/android-chrome-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "./assets/icons/apple-touch-icon-60x60.png",
        sizes: "60x60",
        type: "image/png",
      },
      {
        src: "./assets/icons/apple-touch-icon-76x76.png",
        sizes: "76x76",
        type: "image/png",
      },
      {
        src: "./assets/icons/apple-touch-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        src: "./assets/icons/apple-touch-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "./assets/icons/apple-touch-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "./assets/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "./assets/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "./assets/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "./assets/icons/msapplication-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "./assets/icons/mstile-150x150.png",
        sizes: "150x150",
        type: "image/png",
      },
    ],
    iconPaths: {
      favicon32: "assets/icons/favicon-32x32.png",
      favicon16: "assets/icons/favicon-16x16.png",
      appleTouchIcon: "assets/icons/apple-touch-icon-152x152.png",
      maskIcon: "assets/icons/safari-pinned-tab.svg",
      msTileImage: "assets/icons/msapplication-icon-144x144.png",
    },
  },
};
