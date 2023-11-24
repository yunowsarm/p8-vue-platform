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
import { Chart } from '@antv/g2';
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
    },
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      myChart: null,
      chartId: this.genId(),
      chartInitData: {},
      chartDivStyle: {
        width: '99%',
        height: '99%',
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
      let chartConfig = ''
      try {
        if (typeof data === 'string') {
          data = eval('(' + data + ')')
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
          // transitionType为进度图，为true则转换进度title
          if (this.myChart.children[1].value.style.transitionType) {
            let obj = Object.assign({}, this.myChart.children[1].value.style)
            this.myChart.children[1].value.style.text = Math.round(_this.remoteData[0][this.myChart.children[1].value.style.text] * 100) + '%'
            this.myChart.data([1, _this.remoteData[0][obj.text]])
          } else {
            this.myChart.data(_this.remoteData)
          }
          this.myChart.render();
        }
      }
    },
    remoteData: {
      handler: function (val, oldVal) {
        const _this = this
        if (val && this.myChart) {
          // transitionType为进度图，为true则转换进度title
          if (this.myChart.children[1].value.style.transitionType) {
            let obj = Object.assign({}, this.myChart.children[1].value.style)
            this.myChart.data([1, val[0][obj.text]])
            this.myChart.children[1].value.style.text = Math.round(_this.remoteData[0][this.myChart.children[1].value.style.text] * 100) + '%'
          } else {
            this.myChart.data(val)
          }
          this.myChart.render()
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
            if (newValue) {
              const tempParams = {}
              // 使用数据视图SQL中定义的参数来将父组件中传递的参数进行装配，如果父组件中参数值不存在或为空，使用SQL定义中的参数默认值进行赋值
              if (this.sqlParamsList && this.sqlParamsList.length > 0) {
                this.sqlParamsList.forEach((param) => {
                  const defaultValue = {
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
          this.initEchart()
        }
      },
      {
        immediate: true,
        deep: true
      }
    )
    window.addEventListener('resize', this.resizeChart)
    this.myChart.forceFit()
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
        this.$api['kanbanComponent.getViewData']({ sqlId: this.appConfig.dataviewId, param: this.searchParams, permissionVo: { router: this.$route.name, resourceId: '' }, sqlParam: { planInfoId: this.thirdMenuParam.ID } }).then((res) => {
          if (res) {
            _this.remoteData = res
          }
        })
      }
    },
    resizeChart () {
      this.myChart.forceFit()
    },
    initEchart () {
      try {
        if (!document.getElementById(this.chartId)) {
          return
        }
        this.myChart = new Chart({
          container: this.chartId
        })
        this.myChart.options({ ...this.chartOption })
        this.myChart.render();
      } catch (e) {
        console.error(e)
      }
      this.bindChartEvent()
      return this.myChart
    },
    genId () {
      const uid = 'TestDataset' + new Date().getTime()
      const roundStr = Math.round(Math.random() * 100000)
      return uid + roundStr
    },
    bindChartEvent () {
      if (this.myChart && this.eventOption.eventName) {
        const _this = this
        this.myChart.on(this.eventOption.eventName, (params) => {
          const chartData = params.data.data
          const drillParams = this.eventOption.drillParams
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
