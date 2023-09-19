<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div style="width: 100%; height: 100%">
    <div :id="chartId"
         :style="chartDivStyle"></div>
    <drill :dialog-visible="drillVisiable"
           v-if="drillVisiable"
           :event-config="eventOption.eventConfig"
           :event-param="eventParam"
           @close="onDrillClose()"></drill>
  </div>
</template>

<script>
import drill from '@/views/Framework/ComponentsMananger/Kanban/Components/drill'
import _ from 'lodash'
import axios from 'axios'
export default {
  name: 'RenderEchart',
  inject: {
    provideParams: {
      from: 'provideParams',
      default: {}
    }
  },
  props: {
    option: {
      type: [Object, String],
      default: () => {
        return {}
      },
      require: true
    },
    appConfig: {
      type: Object
    },
    resizeTime: {
      type: Number,
      default: null
    },
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      myChart: null,
      chartId: this.genId(),
      chartInitData: {},
      chartDivStyle: {
        width: '100%',
        height: '100%',
        visibility: this.isShow
      },
      urlPrefix: '',
      remoteData: null,
      drillVisiable: false,
      eventParam: {},
      searchParams: {},
      sqlParamsList: []
    }
  },
  components: {
    drill
  },
  computed: {
    chartOption () {
      let data = this.option
      // console.log('option', this.option)
      let chartConfig = ''
      try {
        if (typeof data === 'string') {
          data = eval('(' + data + ')')
          // data = JSON.parse(option)
        }
        chartConfig = data.chart
        if (!chartConfig) {
          throw '图表配置项Option定义错误，未包含chart定义'
        }
      } catch (e) {
        console.error(e)
      }
      // console.log('chartConfig', chartConfig)
      return chartConfig
    },
    eventOption () {
      let data = this.option
      let eventOption = {}
      // console.log('data', data)
      try {
        if (typeof data === 'string') {
          data = eval('(' + data + ')')
          // data = JSON.parse(option)
        }
        eventOption = data.event
        if (!eventOption) {
          eventOption = {
            eventConfig: {}
          }
        }
      } catch (e) {
        console.error(e)
      }
      // console.log('eventOption', eventOption)
      return eventOption
    }
  },
  watch: {
    myChart: {
      handler: function (chart) {
        let _this = this
        if (chart && _this.remoteData) {
          chart.setOption({
            dataset: {
              source: _this.remoteData
            }
          })
        }
      }
    },
    remoteData: {
      handler: function (val, oldVal) {
        if (val && this.myChart) {
          let _this = this
          this.myChart.setOption({
            dataset: {
              source: _this.remoteData
            }
          })
        }
      }
    },
    resizeTime: {
      handler: function (val, oldVal) {
        // console.log('resizeTime', val)
        if (val && val != oldVal && this.myChart) {
          this.resizeChart()
        }
      }
    },
    searchParams: {
      handler: function (newValue, oldValue) {
        console.log('searchParams watch', newValue, oldValue)
        if (!_.isEqual(newValue, oldValue)) {
          this.doDataview()
        }
      },
      deep: true
    }
  },
  created () {
    let { devBaseUrl, prodBaseUrl, isDevMode } = this.$sysConfig.API_DEFAULT_CONFIG
    this.urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
    if (this.appConfig && this.appConfig.dataviewId) {
      let _this = this
      this.$api['kanbanComponent.getSqlParams']({ sqlId: this.appConfig.dataviewId, permissionVo: { router: this.$route.name, resourceId: '' } }).then((res) => {
        if (res) {
          _this.sqlParamsList = res
        }
        //动态绑定对父组件参数的监听
        this.$watch(
          'provideParams.searchParams',
          (newValue, oldValue) => {
            // console.log('searchParams watch', newValue, this.appConfig)
            if (newValue) {
              // console.log('newValue $watch:', newValue)
              let tempParams = {}
              //使用数据视图SQL中定义的参数来将父组件中传递的参数进行装配，如果父组件中参数值不存在或为空，使用SQL定义中的参数默认值进行赋值
              if (this.sqlParamsList && this.sqlParamsList.length > 0) {
                this.sqlParamsList.forEach((param) => {
                  console.log('SQLParam:', param)
                  let defaultValue = {
                    value: param.paramValue || '',
                    mode: '=',
                    relation: 'and'
                  }
                  tempParams[param.paramName] = !_.isUndefined(newValue[param.paramName]) ? newValue[param.paramName] : defaultValue
                })
                this.searchParams = tempParams
              } else {
                this.searchParams = {}
              }
            }
          },
          {
            deep: true
          }
        )
      })
      this.doDataview()
    } else if (this.appConfig.apiDataUrl) {
      this.doDataview()
    }
  },
  beforeMount () { },
  mounted () {
    // 不能在watch里编写的原因是，一开始就触发时，this.$el 组件还不存在，会造成无法渲染
    this.$watch(
      'isShow',
      (newValue, oldValue) => {
        if (newValue) {
          // console.log('$watch-initEchart', this.$el)
          this.initEchart()
        }
      },
      {
        immediate: true,
        deep: true
      }
    )
    window.addEventListener('resize', this.resizeChart)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeChart)
  },
  methods: {
    doDataview () {
      let _this = this
      if (this.appConfig.apiDataUrl) {
        let url = this.appConfig.apiDataUrl.indexOf('http') !== -1 ? this.appConfig.apiDataUrl : `${this.urlPrefix}${this.appConfig.apiDataUrl}`
        if (this.appConfig.apiDataUrl.indexOf('http') !== -1) {
          axios.post(url, this.searchParams, {
            headers: { Authorization: '' }
          }).then(function (res) {
            _this.remoteData = res.data
          }).catch(err => {
            this.$message.error('数据异常！')
          })
        } else {
          this.$ajax.post(url, this.searchParams, {
            headers: { Authorization: this.$store.getters.token }
          }).then(function (res) {
            _this.remoteData = res
          })
        }
      } else {
        this.$api['kanbanComponent.getViewData']({ sqlId: this.appConfig.dataviewId, param: this.searchParams, permissionVo: { router: this.$route.name, resourceId: '' } }).then((res) => {
          // console.log('kanbanComponent.getViewData:', res)
          if (res) {
            _this.remoteData = res
            // console.log('setremoteData')
          }
        })
      }
    },
    resizeChart () {
      // console.log('chart-resize')
      this.myChart.resize()
    },
    initEchart () {
      try {
        if (!document.getElementById(this.chartId)) {
          return
        }
        this.myChart = this.$echarts.init(document.getElementById(this.chartId))
      } catch (e) {
        console.error(e)
      }
      this.setChartOption()
      this.bindChartEvent()
      return this.myChart
    },
    setChartOption () {
      try {
        // console.log('this.chartOption', this.chartOption)
        this.myChart.setOption(this.chartOption, {
          replaceMerge: ['xAxis', 'yAxis', 'series']
        })
      } catch (e) {
        console.error(e)
      }
      return this.myChart
    },
    genId () {
      let uid = 'TestDataset' + new Date().getTime()
      let roundStr = Math.round(Math.random() * 100000)
      return uid + roundStr
    },
    bindChartEvent () {
      // console.log('bindChartEvent', this.eventOption)
      if (this.myChart && this.eventOption.eventName) {
        let _this = this
        this.myChart.on(this.eventOption.eventName, (params) => {
          let chartData = params.data
          let drillParams = this.eventOption.drillParams
          for (const key in drillParams) {
            if (chartData[drillParams[key]]) {
              _this.eventParam[key] = {
                mode: '=',
                relation: 'and',
                value: chartData[drillParams[key]]
              }
            } else if (this.searchParams[drillParams[key]]) {
              _this.eventParam[key] = this.searchParams[drillParams[key]]
            }
          }
          _this.drillVisiable = true
        })
      }
    },
    onDrillClose () {
      this.drillVisiable = false
    }
  }
}
</script>
<style lang="scss" scoped></style>
