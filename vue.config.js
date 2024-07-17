/**
 * GLOBAL VUE CLI CONFIGURATIONS
 */
const webpack = require('webpack')
const { defineConfig } = require('@vue/cli-service')
const SplitChunksPlugin = require('webpack').optimize.SplitChunksPlugin
let version = require("./package.json")["version"];
version = 'V' + version

module.exports = defineConfig({
  runtimeCompiler: true,
  lintOnSave: false,
  productionSourceMap: false,
  // 取消接口报错后的webpack弹框
  devServer: {
    client: {
      overlay: false
    }
  },
  chainWebpack (config) {
    config.output.filename(`js/[name].[hash:8].${version}.js`).end();
    config.output.chunkFilename(`js/[name].[hash:8].${version}.js`).end();
    config.plugin('extract-css').tap((args) => {
      args[0].filename = `css/[name].[hash:8].${version}.css`;
      args[0].chunkFilename = `css/[name].[hash:8].${version}.css`;
      return args;
    });
  },
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : undefined,
    // 开启缓存
    // cache: false,
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true
    },
    // 分割打包文件大小
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        // maxSize: 0,
        minChunks: 2,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    },
    plugins: [new SplitChunksPlugin(), new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|en/)]
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      analyzerMode: 'disabled',
      openAnalyzer: false
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "@/assets/commonStyle/common.scss";',
        sassOptions: {
          // 取消dart scss关于计算替换的提示信息
          quietDeps: true,
          // 解决element图标乱码
          outputStyle: 'expanded'
        }
      }
    }
  }
})
