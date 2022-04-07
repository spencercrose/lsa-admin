module.exports = {
  devServer: {
    port: 3000
  },
  publicPath: '/admin/',
  chainWebpack: config => {
    config
      .plugin("html")
      .tap(args => {
        args[0].template = './src/public/index.html'
        return args
      })
  }
}
