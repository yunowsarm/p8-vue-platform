<template>
  <!-- <common-tabs type="border-card"
               class="custom-tabs"
               activeTabs="slot0"
               :tabsData="tabsData">
    <template v-for="(item,index) in renderKanbanData"
              #[`slot${index}`]>
    </template>
  </common-tabs> -->
  <normal-layout :header-visible="searchFormConfig.length > 0"
                 :normal-layout="normalLayout">
    <template #north>
      <search-form-list ref="search"
                        :data-source="searchFormConfig"
                        @search="onSearch"
                        @re-set="onReset"></search-form-list>
    </template>
    <template #center>
      <VuePerfectScrollbar class="scroll-area">
        <widget-grid :key="renderTime"
                     v-bind="$attrs"
                     v-on="$listeners"
                     :local-parames="localParames"
                     :draggable="false"
                     shadow="never"
                     :widget="getWidget"
                     :resizable="false"
                     :is-design="false"
                     :thirdMenuParam="thirdMenuParam"
                     style="height: 100%">
        </widget-grid>
      </VuePerfectScrollbar>
    </template>
  </normal-layout>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import SearchFormList from '@/views/Framework/ComponentsMananger/Grid/Components/intellSearchFormList'
import { P8NormalLayoutV1 as NormalLayout } from 'p8-components-ui'
import widgetGrid from './Components/widget-grid.vue'
import _cloneDeep from 'lodash/cloneDeep'
import mixin from './Components/mixin'
// import _ from 'lodash'
export default {
  name: 'KanbanView',
  mixins: [mixin],
  provide () {
    return {
      provideParams: this.provideParams
    }
  },
  props: {
    renderData: {
      type: Array,
      default: () => {
        return []
      }
    },
    localParames: {
      type: Object,
      default: () => {
        return {}
      }
    },
    apiParames: {
      type: Object,
      default: () => {
        return {}
      }
    },
    api: {
      type: String,
      default: 'kanbanView.list'
    },
    // id: {
    //   type: String,
    //   default: ''
    // },
    // code: {
    //   type: String,
    //   default: ''
    // },
    widget: {
      type: Array,
      default: () => {
        return []
      }
    },
    kanbanConfig: {
      type: Object,
      default: () => {
        return {}
      }
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
      renderTime: new Date().getTime(),
      widgetData: [],
      formData: {
        name: '',
        code: '',
        describe: '',
        indexNo: 0,
        style: '',
        queryConfig: '',
        widgets: []
      },
      normalLayout: {
        west: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
        center: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24 }
      },
      provideParams: {
        searchParams: {}
      },
      id: '',
      code: ''
    }
  },

  components: {
    widgetGrid,
    NormalLayout,
    SearchFormList,
    VuePerfectScrollbar
  },

  computed: {
    tabsData () {
      if (this.renderData && Object.keys(this.renderData).length > 0) {
        return this.renderData.map((item, index) => {
          return { label: item.name, name: 'slot' + index }
        })
      }
      return []
    },
    renderKanbanData () {
      // console.log('renderKanbanData computed:', this.renderData, this.formData, this.$options.data().formData)
      return this.renderData[0] || this.formData || this.$options.data().formData
    },
    getId () {
      return this.id || ''
    },
    getCode () {
      return this.code || ''
    },
    getWidget () {
      return this.widget.length ? this.widget : this.widgetData
    },
    searchFormConfig () {
      let homePageRecord = this.renderKanbanData
      homePageRecord = homePageRecord || {}
      let configJson = {}
      if (typeof homePageRecord.queryConfig === 'string' && homePageRecord.queryConfig != '') {
        configJson = eval('(' + homePageRecord.queryConfig + ')')
        // data = JSON.parse(option)
      }
      let searchForm = []
      if (configJson.enabled) {
        searchForm = configJson.searchForm
      }
      return searchForm
    }
  },
  watch: {
    $route: {
      handler (val) {
        this.id = val.meta.id
        this.code = val.meta.code
        this.reload()
        this.getKanbanData()
      },
      immediate: true
    },
    kanbanConfig: {
      handler (val) {
        this.id = val.id
        this.code = val.code
        this.reload()
        this.getKanbanData()
      },
      immediate: true
    }
  },
  created () {
    this.getKanbanData()
  },

  beforeMount () { },

  mounted () {
  },

  methods: {
    reload () {
      this.renderTime = new Date().getTime()
    },
    async getKanbanData () {
      this.getId &&
        (await this.$api[this.api]({ ...{ id: this.getId, page: {} }, ...this.apiParames, permissionVo: { router: this.$route.name, resourceId: '' } })
          .then((res) => {
            // this.getCode && this.$api['kanbanView.list']({ code: this.getCode, page: {} }).then(res => {
            if (res.records.length) {
              const record = res.records[0]
              !record.widgets && (record.widgets = [])
              !record.style && (record.style = '')
              !record.queryConfig && (record.queryConfig = '')
              this.formData = _cloneDeep({ ...this.formData, ...record })
              this.widgetData = this.formData.widgets.map((i) => {
                i.style = this.strToObj(i.style)
                i.layout = this.strToObj(i.layout, { x: 0, y: 0, w: 4, h: 3, i: '0' })
                return i.layout
              })
            }
          })
          .catch((e) => { }))
    },
    onSearch (param) {
      // let _this = this
      // Object.keys(param).forEach((key) => {
      //   _this.$set(_this.searchParams, key, param[key])
      // })
      // Object.assign(_this.searchParams, param)
      // _this.searchParams = param
      this.provideParams.searchParams = param
      // console.log('onSearch:', this.provideParams.searchParams)
      // console.log('_provided:', this._provided.provideParams)
    },
    onReset () {
      this.provideParams.searchParams = {}
     }
  }
}
</script>
<style lang="scss" scoped>
.custom-tabs.el-tabs--top {
  ::v-deep .el-tabs__content {
    padding: 0;
  }

  padding: 0 !important;
}
</style>
