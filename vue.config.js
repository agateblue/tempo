const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

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
    plugins: [
      new MonacoWebpackPlugin({
        languages: ["yaml"],//configure your languages here
        features: ["coreCommands", "find"],
      }),
    ],
  },
  chainWebpack: config => {
    config
    .plugin('html')
    .tap(args => {
      args[0].title = 'Tempo - Find your own rythm'
      return args
    })
    config.resolve.alias.set(
      "vscode",
      path.resolve(
        "./node_modules/monaco-languageclient/lib/vscode-compatibility"
      )
    );
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
      display: "standalone",
      start_url: '.',
      description: 'Find your own rhythm',
      scope: "/",
      categories: ["notes", "note",, "diary", "log", "health", "mood tracker"],
      icons: [
        {
          'src': 'icon.png',
          'sizes': '192x192',
          'type': 'image/png'
        },
        {
          'src': 'icon.png',
          'sizes': '512x512',
          'type': 'image/png'
        },
      ]
    },
    iconPaths: {
      favicon32: 'icon.png',
      favicon16: 'icon.png',
      appleTouchIcon: 'icon.png',
      maskIcon: 'icon.png',
      msTileImage: 'icon.png'
    }
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
