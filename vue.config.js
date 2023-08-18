/**
 * GLOBAL VUE CLI CONFIGURATIONS
 */
const webpack = require('webpack')

module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|en/)]
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      analyzerMode: 'disabled',
      openAnalyzer: false
    }
  },
  chainWebpack: (config) => {
    // config.module.rule('scss')
    //   .use('style-resource')
    //   .loader('style-resources-loader')
    //   .options({
    //     patterns: [
    //       path.resolve(__dirname, './src/assets/commonStyle/common.scss')
    //     ]
    //   })
  },
  css: {
    loaderOptions: {
      sass: {
        data: '@import "@/assets/commonStyle/common.scss";'
      }
    }
  }
}
