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
      reportParams: {},
      sqlParamsList: []
    }
  },
  components: {
    drill
  },
  computed: {
    chartOption () {
      let data = this.option
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
      return chartConfig
    },
    eventOption () {
      let data = this.option
      let eventOption = {}
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
      return eventOption
    }
  },
  watch: {
    myChart: {
      handler: function (chart) {
        const _this = this
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
          const _this = this
          if (_this.remoteData[0] && _this.remoteData[0].NAME) {
            this.myChart.setOption({
              title: {
                text: _this.remoteData[0].NAME,
                left: 'center'
              },
              dataset: {
                source: _this.remoteData
              }
            })
          } else {
            this.myChart.setOption({
              title: {
                text: '',
                left: 'center'
              },
              dataset: {
                source: _this.remoteData
              }
            })
          }
        }
      }
    },
    resizeTime: {
      handler: function (val, oldVal) {
        if (val && val != oldVal && this.myChart) {
          this.resizeChart()
        }
      }
    },
    searchParams: {
      handler: function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.doDataview()
        }
      },
      deep: true
    }
  },
  created () {
    const { devBaseUrl, prodBaseUrl, isDevMode } = this.$sysConfig.API_DEFAULT_CONFIG
    this.urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
    if (this.appConfig && this.appConfig.dataviewId) {
      const _this = this
      this.$api['kanbanComponent.getSqlParams']({ sqlId: this.appConfig.dataviewId, permissionVo: { router: this.$route.name, resourceId: '' } }).then((res) => {
        if (res) {
          _this.sqlParamsList = res
        }
        // 动态绑定对父组件参数的监听
        this.$watch(
          'provideParams.searchParams',
          (newValue, oldValue) => {
            if (newValue && Object.keys(newValue).length) {
              let params = JSON.parse(JSON.stringify(newValue))
              const tempParams = {}
              // 使用数据视图SQL中定义的参数来将父组件中传递的参数进行装配，如果父组件中参数值不存在或为空，使用SQL定义中的参数默认值进行赋值
              if (this.sqlParamsList && this.sqlParamsList.length > 0) {
                this.sqlParamsList.forEach((param) => {
                  const defaultValue = {
                    value: param.paramValue || '',
                    mode: '=',
                    relation: 'and'
                  }
                  if(!_.isUndefined(newValue[param.paramName])){
                    tempParams[param.paramName] = newValue[param.paramName]
                    delete params[param.paramName]
                  } else {
                    tempParams[param.paramName] = defaultValue
                  }
                  // tempParams[param.paramName] = !_.isUndefined(newValue[param.paramName]) ? newValue[param.paramName] : defaultValue
                })
                this.searchParams = tempParams
                if (params) {
                  Object.keys(params).forEach(el => {
                    let item = params[el]
                    if (item.replaceFiled && item.replaceFiled.takeEffectCharts && item.replaceFiled.takeEffectCharts.includes(this.appConfig.id)) {
                      this.reportParams[item.replaceFiled.mapfields] = {mode: item.mode,relation: item.relation,value: item.value}
                    }
                  })
                }
              } else {
                this.searchParams = {}
              }
            } else {
              this.searchParams = {}
              this.reportParams = {}
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
      const _this = this
      if (this.appConfig.apiDataUrl) {
        const url = this.appConfig.apiDataUrl.indexOf('http') !== -1 ? this.appConfig.apiDataUrl : `${this.urlPrefix}${this.appConfig.apiDataUrl}`
        if (this.appConfig.apiDataUrl.indexOf('http') !== -1) {
          axios
            .post(url, this.searchParams, {
              headers: { Authorization: '' }
            })
            .then(function (res) {
              _this.remoteData = res.data
            })
            .catch((err) => {
              this.$message.error('数据异常！')
            })
        } else {
          this.$ajax
            .post(url, this.searchParams, {
              headers: { Authorization: this.$store.getters.token }
            })
            .then(function (res) {
              _this.remoteData = res
            })
        }
      } else {
        this.$api['kanbanComponent.getViewData']({ sqlId: this.appConfig.dataviewId, reportParam: this.reportParams, sqlParam: this.searchParams, permissionVo: { router: this.$route.name, resourceId: '' } }).then((res) => {
          if (res) {
            _this.remoteData = res
          }
        })
      }
    },
    resizeChart () {
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
        this.myChart.setOption(this.chartOption, {
          replaceMerge: ['xAxis', 'yAxis', 'series']
        })
      } catch (e) {
        console.error(e)
      }
      return this.myChart
    },
    genId () {
      const uid = 'TestDataset' + new Date().getTime()
      const roundStr = Math.round(Math.random() * 100000)
      return uid + roundStr
    },
    bindChartEvent () {
      if (this.myChart && this.eventOption.eventName) {
        let searchParams = {...this.searchParams,...this.reportParams}
        const _this = this
        this.myChart.on(this.eventOption.eventName, (params) => {
          const chartData = params.data
          const drillParams = this.eventOption.drillParams || this.eventOption.eventConfig.drillParams
          for (const key in drillParams) {
            if (chartData[drillParams[key]]) {
              _this.eventParam[key] = {
                mode: '=',
                relation: 'and',
                value: chartData[drillParams[key]]
              }
            } else if (params[drillParams[key]]) {
              //params内置的字段,如果有对应的字段封装进去
              _this.eventParam[key] = {
                mode: '=',
                relation: 'and',
                value: params[drillParams[key]]
              }
            } else if (searchParams[drillParams[key]]) {
              _this.eventParam[key] = searchParams[drillParams[key]]
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
