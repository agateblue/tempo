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

  "pwa": {
    "name": "Tempo",
    "themeColor": "#422D62",
    "msTileColor": "#422D62",
    "workboxOptions": {
      "cacheId": "v0"
    }
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
