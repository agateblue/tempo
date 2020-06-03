module.exports = {
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
      analyzerMode: process.env.BUNDLE_ANALYZE || "disabled"
    }
  },

  productionSourceMap: false,
  runtimeCompiler: true,
  configureWebpack:{
    optimization: {
      splitChunks: {
        minSize: 250000,
        maxSize: 1000000,
      }
    },

  },
  chainWebpack: config => {
    config
    .plugin('html')
    .tap(args => {
      args[0].title = 'Tempo - Find your own rythm'
      return args
    })
  },
  pwa: {
    name: 'Tempo',
    themeColor: '#422D62',
    msTileColor: '#422D62',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      importWorkboxFrom: 'local',
      // swSrc is required in InjectManifest mode.
      swSrc: 'src/service-worker.js',
      swDest: 'service-worker.js',
      exclude: []
    },
    manifestOptions: {
      display: "fullscreen",
      start_url: '.',
      description: 'Find yoour own rythm',
      scope: "/",
      categories: ["notes", "note",, "diary", "log", "health", "mood tracker"],
      icons: [
        {
          'src': 'favicon.png',
          'sizes': '192x192',
          'type': 'image/png'
        },
        {
          'src': 'favicon.png',
          'sizes': '512x512',
          'type': 'image/png'
        },
      ]
    },
    iconPaths: {
      favicon32: 'favicon.png',
      favicon16: 'favicon.png',
      appleTouchIcon: 'favicon.png',
      maskIcon: 'favicon.png',
      msTileImage: 'favicon.png'
    }
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
