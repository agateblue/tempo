module.exports = {
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
