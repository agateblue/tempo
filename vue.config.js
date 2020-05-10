var IgnorePlugin =  require("webpack").IgnorePlugin;

module.exports = {
  configureWebpack: {
    plugins: [
      new IgnorePlugin(/(^fs$|cptable|jszip|xlsx|^es6-promise$|^net$|^tls$|^forever-agent$|^tough-cookie$|cpexcel|^path$|^request$|react-native|^vertx$)/)
    ],
  },
  runtimeCompiler: true,
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
    workboxOptions: {
      cacheId: process.env['VUE_APP_CACHE_ID'] || 'v0',
    },
  },
}
