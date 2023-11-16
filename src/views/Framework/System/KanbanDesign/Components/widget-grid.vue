<template>
  <div style="height:100%; width:100%">
    <div v-if="isDesign">
      <el-row>
        <el-col :span="12">
          <div style="width:100%; height:30px"></div>
        </el-col>
        <el-col :span="12">
          <div style="text-align:right;">
            <el-button type="primary"
                       size="mini"
                       @click="addWidget"
                       icon="el-icon-plus"></el-button>
          </div>
        </el-col>
      </el-row>
      <common-dialog ref="commonDialog"
                     :title="addWidgetTitle"
                     v-if="addWidgetVisible"
                     :visible="addWidgetVisible"
                     destroy-on-close
                     @close="handleCancel('addWidgetVisible')"
                     :show-handle-btn="false"
                     :is-view-cs-footer="true"
                     :dialog-config="{
                          modal: true,
                          appendToBody: true,
                          modalAppendToBody: true
                      }"
                     :close-on-click-modal="false"
                     :close-on-press-escape="false">
        <template #dialog>
          <!-- kanbanComponent.list -->
          <common-table ref="table"
                        :params="queryParam"
                        api="kanbanComponent.list"
                        :columns="columns"
                        :pagination="true">
          </common-table>
        </template>
        <template #cs-footer>
          <el-button @click="addWidgetVisible=false">取消</el-button>
          <el-button type="primary"
                     @click="save()">确定</el-button>
        </template>
      </common-dialog>

      <common-dialog ref="setCommonDialog"
                     :title="setWidgetTitle"
                     v-if="setWidgetVisible"
                     :visible="setWidgetVisible"
                     destroy-on-close
                     @close="handleCancel('setWidgetVisible')"
                     :show-handle-btn="false"
                     :is-view-cs-footer="true"
                     :dialog-config="{modal: true,appendToBody: true, modalAppendToBody: true}"
                     :close-on-click-modal="false"
                     :close-on-press-escape="false">
        <template #dialog>
          <el-form ref="form"
                   label-position="right"
                   size="small"
                   label-width="100px"
                   :model="WidgetForm">
            <el-row :gutter="0">
              <el-col :span="12">
                <el-form-item label="widget别名:">
                  <el-input v-model="WidgetForm.title"
                            placeholder="请输入widget别名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="隐藏头部:">
                  <el-switch v-model="WidgetForm.simple"
                             active-color="#13ce66"
                             inactive-color="#ff4949">
                  </el-switch>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="12">
                <el-form-item label="透明度和颜色:">
                  <el-color-picker v-model="WidgetForm.styleObject.backgroundColor"
                                   show-alpha></el-color-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="背景图片:">
                  <el-input v-model="WidgetForm.styleObject.backgroundImage"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="12">
                <el-form-item label="宽:">
                  <el-input-number v-model.number="WidgetForm.layout.w"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高:">
                  <el-input-number v-model.number="WidgetForm.layout.h"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
        <template #cs-footer>
          <el-button type="primary"
                     style="float: right"
                     @click="saveWidget()">保存</el-button>
        </template>
      </common-dialog>
    </div>
    <VuePerfectScrollbar class="scroll-area"
                         :class="{'isdesign':isDesign}">
      <smart-widget-grid :style="styleObject"
                         :layout="layout"
                         v-bind="$attrs"
                         :key="renderTime"
                         v-on="$listeners"
                         @layout-updated="onLayoutUpdated"
                         @layout-ready="onLayoutReady"
                         @moved="onMove"
                         @resized="onResize">
        <widget-item v-for="(item,index) in widget"
                     :ref="`widget${item.slot}`"
                     :key="item.slot"
                     :slot="item.slot"
                     :index="index"
                     v-bind="item"
                     :widget="item"
                     :is-design="isDesign"
                     :style="item.styleObject"
                     @widget-resize="onWidgetResize"
                     @on-fullscreen="onFullscreen">
          <dynamicLink v-if="item.component.functionalCategory === '1' "
                       :is-show="isLayoutReady"
                       :data="item"
                       :ref="`conten${item.slot}`"
                       :key="renderTime+item.slot"></dynamicLink>
          <render-view v-if="item.component.functionalCategory === '2' "
                       :is-show="isLayoutReady"
                       :app-config="item.component"
                       :option="item.component.jsonOptions"
                       :resize-time="widgetResizeStatus[item.slot]"
                       ref="renderView"></render-view>
          <tableRenderVue v-if="item.component.functionalCategory === '3'"
                          :code="item.component.dataviewId"
                          @searchData="searchData"></tableRenderVue>
          <AntvView v-if="item.component.functionalCategory === '4' "
                    :is-show="isLayoutReady"
                    :app-config="item.component"
                    :option="item.component.jsonOptions"
                    :resize-time="widgetResizeStatus[item.slot]"></AntvView>
        </widget-item>
      </smart-widget-grid>
    </VuePerfectScrollbar>
  </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { SmartWidgetGrid } from 'p8-vue-smart-widget'
import { P8Table as CommonTable, P8Dialog as CommonDialog } from 'p8-components-ui'
import _cloneDeep from 'lodash/cloneDeep'
import widgetItem from './widget-item.vue'
import dynamicLink from './dynamic-link.vue'
import renderView from '/src/views/Framework/ComponentsMananger/Kanban/Components/renderView'
import tableRenderVue from '../../../ComponentsMananger/Grid/Components/tableRender.vue'
import AntvView from '@/views/Framework/ComponentsMananger/Kanban/Components/AntvView'
export default {
  name: 'Widgetgrid',
  provide () {
    return {
      deleteWidget: this.deleteWidget,
      setWidget: this.setWidget,
      localParames: this.localParames
    }
  },
  components: {
    CommonTable,
    CommonDialog,
    tableRenderVue,
    SmartWidgetGrid,
    widgetItem,
    renderView,
    VuePerfectScrollbar,
    dynamicLink,
    AntvView
  },
  props: {
    widget: {
      type: Array,
      default: () => [],
      require: true
    },
    styleObject: {
      type: Object,
      default: () => { }
    },
    localParames: {
      type: Object,
      default: () => { }
    },
    isDesign: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    layout () {
      return this.widget.map(item => item.layout)
    }
  },
  watch: {
    widget: {
      handler (val) {
        this.renderConten()
      }
    }
  },
  mounted () {
  },
  data () {
    return {
      tableSearchList: [],
      searchList: [],
      widgetList: [],
      isLayoutReady: false,
      renderTime: new Date().getTime(),
      addWidgetVisible: false,
      addWidgetTitle: '添加组件',
      setWidgetVisible: false,
      WidgetForm: {
        title: '',
        simple: false,
        styleObject: {
          backgroundColor: 'rgba(255, 255, 255, 1)',
          backgroundImage: ''
        }
      },
      queryParam: { name: '' },
      setWidgetTitle: '修改widget',
      columns: [
        {
          type: 'selection',
          width: 45,
          align: 'center'
        },
        {
          title: '组件名称',
          dataIndex: 'name'
        },
        {
          title: '描述',
          dataIndex: 'compCode'
        }
      ],
      widgetResizeStatus: []
    }
  },
  methods: {
    searchData (data) {
      this.tableSearchList = Array.from(new Set([...this.tableSearchList, ...data]))
      this.changeSearchConfig()
    },
    onWidgetResize (widget) {
      // console.log('onWidgetResize', widget)
      this.$set(this.widgetResizeStatus, widget.slot, new Date().getTime())
      // console.log('this.widgetResizeStatus[widget.slot]', this.widgetResizeStatus[widget.slot])
    },
    onLayoutUpdated (newLayout) {
      // console.log('onLayoutUpdated:', JSON.stringify(newLayout))
    },
    onLayoutReady (newLayout) {
      // let delay = this.isDesign ? 1500 : 200
      let delay = 260
      let that = this
      setTimeout(() => {
        that.isLayoutReady = true
      }, delay)
      // console.log('onLayoutReady:', JSON.stringify(newLayout))
    },
    onMove (params) {
      // console.log('onMove:', params)
    },
    // 大小改变
    onResize (params) {
      // console.log('onResize:', params, 'widget:', this.$refs['widget' + params.i][0])
      // setTimeout(() => {
      //   this.$refs['widget' + params.i][0].handleRefresh()
      // }, 300)
    },
    // 放大
    onFullscreen (booleanParams, params) {
      // console.log('放大')
      // setTimeout(() => {
      //   this.$refs['conten' + params.slot][0].reload()
      // }, 300)
    },
    // 重新渲染
    renderConten () {
      this.tableSearchList = []
      this.renderTime = new Date().getTime()
    },
    // 删除
    deleteWidget (data) {
      let widgetList = JSON.parse(JSON.stringify(this.widget))
      widgetList.splice(data.index, 1)
      this.$emit('update:widget', widgetList)
      this.getSearchCofnfig(widgetList)
    },
    // 设置
    setWidget (data) {
      this.WidgetForm = _cloneDeep({ ...this.$options.data().WidgetForm, ...data })
      this.setWidgetVisible = true
    },
    // 添加组件
    addWidget () {
      this.widgetList = []
      this.addWidgetVisible = true
      // const soltArr = this.widget.map(item => { return item.layout.i })
      // const maxSolt = Math.max.apply(null, soltArr)
      // this.widgetList.push({
      //   slot: maxSolt + 1,
      //   fullscreen: true,
      //   layout: { x: 0, y: 0, w: 4, h: 4, i: maxSolt + 1 },
      //   component: {},
      //   styleObject: {},
      //   title: ''
      // })
      // this.$emit('update:widget', this.widget.concat(this.widgetList))
    },
    // 编辑保存组件设置
    saveWidget () {
      let widget = this.widget.find(item => { return item.slot === this.WidgetForm.slot })
      let widgetIndex = this.widget.findIndex(item => { return item.slot === this.WidgetForm.slot })
      let widgetList = this.widget.map(i => i)
      for (let key in this.WidgetForm) {
        widget[key] = this.WidgetForm[key]
      }
      widgetList.splice(widgetIndex, 1, widget)
      this.$emit('update:widget', widgetList)
      this.setWidgetVisible = false
    },
    handleCancel (Visible) {
      this[Visible] = false
    },
    handleFullscreen () {
      this.$refs.table.doLayout()
    },
    save () {
      const soltArr = this.widget.map(item => { return item.layout.i })
      const maxSolt = soltArr.length ? Math.max.apply(null, soltArr) : 0
      const addArr = this.$refs.table.selection
      if (addArr.length) {
        addArr.forEach((item, index) => {
          this.widgetList.push({
            slot: maxSolt + index + 1,
            fullscreen: true,
            layout: { x: 0, y: 0, w: item.defaultWidth, h: item.defaultHigh, i: maxSolt + index + 1 },
            component: item,
            styleObject: {},
            title: ''
          })
        })
      }
      // console.log('save')
      this.tableSearchList = []
      this.getSearchCofnfig(this.widget.concat(this.widgetList))
      this.$emit('update:widget', this.widget.concat(this.widgetList))
      this.addWidgetVisible = false
    },
    getSearchCofnfig (list) {
      list.forEach(el => {
        if (el.component.searchConfigValue && (el.component.functionalCategory && el.component.functionalCategory !== '3')) {
          let item
          if (el.component.searchConfigValue && el.component.searchConfigValue.indexOf('null') !== -1) {
            item = ''
          } else {
            item = JSON.parse(el.component.searchConfigValue)
          }
          if (item && item.length && item !== 'null') {
            item.forEach(val => {
              this.searchList.push({
                type: val.type, // 控件类型
                labelText: val.labelText, // 控件显示的文本
                fieldName: val.fieldName,
                mode: '=',
                selectCode: val.selectCode,
                replaceSearch: ''
              })
            })
          }
        }
      })
      this.changeSearchConfig()
    },
    changeSearchConfig () {
      if (this.searchList && this.tableSearchList) {
        let list = this.searchList.concat(this.tableSearchList)
        let newobj = {}
        list = list.reduce((preVal, curVal) => {
          newobj[curVal.fieldName] ? '' : newobj[curVal.fieldName] = preVal.push(curVal);
          return preVal
        }, [])
        let obj = {
          enabled: true,
          searchForm: list
        }
        this.$emit('setSearchConfig', JSON.stringify(obj))
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.isdesign {
  background: linear-gradient(-90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px) 10px 10px / 20px 20px, linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px) 0% 0% / 20px 20px;
  border: 1px solid #eee;
  box-sizing: content-box;
  width: calc(100% - 20px);
  margin: 0px 0px 20px 5px;
}
.scroll-area {
  height: calc(100% - 38px);
  position: relative;
}
</style>
