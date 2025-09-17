/**
 * GLOBAL VUE CLI CONFIGURATIONS
 */
const webpack = require('webpack')
const { defineConfig } = require('@vue/cli-service')
const SplitChunksPlugin = require('webpack').optimize.SplitChunksPlugin
let version = require('./package.json')['version']
version = 'V' + version
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
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
  chainWebpack(config) {
    if (process.env.NODE_ENV === 'production') {
      // 仅在生产环境启用
      config.plugin('compression').use(CompressionPlugin, [
        {
          test: /\.(js|css|html|svg)$/, // 匹配要压缩的文件类型
          threshold: 10240, // 对超过10k的文件进行压缩
          minRatio: 0.8, // 压缩比小于0.8时才压缩
          deleteOriginalAssets: false // 不删除原始文件
        }
      ])
    }
    config.output.filename(`js/[name].[hash:8].${version}.js`).end()
    config.output.chunkFilename(`js/[name].[hash:8].${version}.js`).end()
  },
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : undefined,
    // 关闭缓存，与下一个配置二选其一
    // cache: false,
    // 开启缓存
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true
    },
    // 以下第三方包，不会被打入组件包，但是要求使用组件的项目必须包含这些依赖
    externals:
      process.env.ENV === 'packaging'
        ? {
            'element-ui': 'element-ui',
            'p8-components-ui': 'p8-components-ui',
            'p8-lowcode': 'p8-lowcode',
            'p8-vue-smart-widget': 'p8-vue-smart-widget',
            'vxe-table': 'vxe-table',
            'p8-dhtmlx-gantt': 'p8-dhtmlx-gantt',
            'vue-quill-editor': 'vue-quill-editor',
            'vxe-pc-ui': 'vxe-pc-ui',
            'video.js': 'video.js',
            'echarts-gl': 'echarts-gl',
            'echarts-liquidfill': 'echarts-liquidfill',
            tinymce: 'tinymce',
            pinyin: 'pinyin',
            moment: 'moment',
            'monaco-editor': 'monaco-editor',
            echarts: 'echarts',
            xlsx: 'xlsx',
            '@antv/g2': '@antv/g2',
            brace: 'brace',
            lodash: 'lodash'
          }
        : {},
    // 分割打包文件大小
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
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
      },
      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i, // 匹配所有 js 文件
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.error']
            },
            format: {
              comments: false // 移除注释
            }
          },
          extractComments: false // 不将注释提取到单独的文件中
        })
      ]
    },
    plugins: [new SplitChunksPlugin(), new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|en/)]
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      analyzerMode: 'disabled',
      openAnalyzer: false,
      generateStateFile: true
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
