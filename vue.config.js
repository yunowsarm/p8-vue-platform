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
      config.optimization.minimizer('terser').use(TerserPlugin, [
        {
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.warn'],
              pure_getters: true,
              unused: true,
              collapse_vars: true
            },
            mangle: {
              properties: false,
              keep_fnames: false,
              keep_classnames: false,
              toplevel: false
            },
            format: {
              comments: false, // 移除注释
              beautify: false
            }
          },
          extractComments: false, // 不将注释提取到单独的文件中
          parallel: true
        }
      ])
    }
    // config.output.filename(`js/[name].[hash:8].${version}.js`).end()
    // config.output.chunkFilename(`js/[name].[hash:8].${version}.js`).end()
    // 在你的 chainWebpack 中修改
    config.output.filename(`js/[name].[contenthash:8].${version}.js`).end()
    config.output.chunkFilename(`js/[name].[contenthash:8].${version}.js`).end()
    // 生产环境特定优化
    // if (process.env.NODE_ENV === 'production') {
    //   // 启用预加载和预获取优化
    //   config.plugin('preload').use(require('@vue/preload-webpack-plugin'), [
    //     {
    //       rel: 'preload',
    //       include: 'initial',
    //       fileBlacklist: [/\.map$/, /hot-update\.js$/]
    //     }
    //   ])

    //   // 压缩CSS
    //   config.optimization.minimize(true)
    // }
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
    module: {
      rules: [
        {
          test: /\.md$/,
          use: [
            {
              loader: 'html-loader'
            },
            {
              loader: 'markdown-loader',
              options: {
                preset: 'default',
                typographer: false,
                quotes: false,
                html: true,
                breaks: true,
                linkify: false
              }
            }
          ]
        }
      ]
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
        minSize: 500000, // 提高最小分割体积至20KB，避免过小 chunk
        maxSize: 1000000, // 尝试分割大于250KB的 chunk
        minChunks: 1,
        maxAsyncRequests: 20, // 适当控制异步请求数
        maxInitialRequests: 10, // 适当控制初始请求数
        automaticNameDelimiter: '~',
        hidePathInfo: true,
        cacheGroups: {
          // 1. 核心Vue生态单独分包（变化极少）
          vueCore: {
            name: 'vue-core',
            test: /[\\/]node_modules[\\/](vue|vue-router|vuex|@vue)[\\/]/,
            priority: 100,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true
          },

          // 2. Element UI单独分包
          elementUI: {
            name: 'element-ui',
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            priority: 90,
            chunks: 'all',
            enforce: true
          },

          // 3. ECharts相关单独分包（通常体积较大）
          echarts: {
            name: 'echarts',
            test: /[\\/]node_modules[\\/](echarts|echarts-gl|echarts-liquidfill)[\\/]/,
            priority: 80,
            chunks: 'all'
          },

          // 4. 其他较大的第三方库单独分包
          largeVendors: {
            name: 'large-vendors',
            test: /[\\/]node_modules[\\/](monaco-editor|vxe-table|tinymce|video\.js|xlsx|@antv)[\\/]/,
            priority: 70,
            chunks: 'all'
          },

          // 5. 工具库单独分包
          utils: {
            name: 'utils',
            test: /[\\/]node_modules[\\/](lodash|moment|pinyin-pro|brace)[\\/]/,
            priority: 60,
            chunks: 'all'
          },
          componentsUI: {
            name: 'p8-components-ui',
            test: /[\\/]node_modules[\\/](p8-components-ui|p8-dhtmlx-gantt|p8-lowcode)[\\/]/,
            priority: 10,
            chunks: 'all'
          },
          dhtmlxGantt: {
            name: 'p8-dhtmlx-gantt',
            test: /[\\/]node_modules[\\/](p8-dhtmlx-gantt)[\\/]/,
            priority: 10,
            chunks: 'all'
          },
          lowcode: {
            name: 'p8-lowcode',
            test: /[\\/]node_modules[\\/](p8-lowcode)[\\/]/,
            priority: 10,
            chunks: 'all'
          },
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 50,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // 7. 业务公共代码
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: 20,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      },
      // 将 webpack 的运行时代码提取为单独 chunk，利于缓存:cite[4]:cite[7]
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`
      }
    },
    plugins: [new SplitChunksPlugin(), new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn|en/)]
  },
  pluginOptions: {
    // webpackBundleAnalyzer: {
    //   analyzerMode: process.env.NODE_ENV === 'production' ? 'server' : 'disabled',
    //   openAnalyzer: false,
    //   generateStateFile: true
    // }
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
