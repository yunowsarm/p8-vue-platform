<template>
  <div style="height: 100%; width: 100%">
    <div v-if="isDesign">
      <el-row>
        <el-col :span="12">
          <div style="width: 100%; height: 30px"></div>
        </el-col>
        <el-col :span="12">
          <div style="text-align: right">
            <el-button type="primary"
                       size="mini"
                       @click="addTemplate"><i style="position: relative; top: 2px"
                 class="p8 icon-zujianku"></i> 模版库</el-button>
            <el-button type="primary"
                       size="mini"
                       @click="addWidget"><i style="position: relative; top: 2px"
                 class="p8 icon-zujianku"></i> 组件库</el-button>
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
                        api="kanbanComponent.getRoleAppInfo"
                        :columns="columns"
                        :pagination="true"> </common-table>
        </template>
        <template #cs-footer>
          <el-button @click="addWidgetVisible = false">取消</el-button>
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
                     :dialog-config="{ modal: true, appendToBody: true, modalAppendToBody: true }"
                     :close-on-click-modal="false"
                     :close-on-press-escape="false"
                     :dialog-height="dialogHeight">
        <template #dialog>
          <el-form ref="form"
                   label-position="right"
                   size="small"
                   label-width="100px"
                   :model="WidgetForm"
                   class="elForm">
            <el-row :gutter="0">
              <el-col :span="12">
                <el-form-item label="widget别名">
                  <el-input v-model="WidgetForm.title"
                            placeholder="请输入widget别名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="隐藏头部">
                  <el-radio-group v-model="WidgetForm.simple">
                    <el-radio-button :value="true"
                                     :label="true">是</el-radio-button>
                    <el-radio-button :value="false"
                                     :label="false">否</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="12">
                <el-form-item label="透明度和颜色">
                  <el-color-picker v-model="WidgetForm.styleObject.backgroundColor"
                                   show-alpha></el-color-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="背景图片">
                  <el-input v-model="WidgetForm.styleObject.backgroundImage"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="12">
                <el-form-item label="宽">
                  <el-input-number style="width: 100%"
                                   :min="0"
                                   :max="12"
                                   v-model.number="WidgetForm.layout.w"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高">
                  <el-input-number style="width: 100%"
                                   :min="0"
                                   :max="12"
                                   v-model.number="WidgetForm.layout.h"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="0">
              <el-col :span="12">
                <el-form-item label="隐藏放大">
                  <el-switch v-model="WidgetForm.magnify"
                             active-color="#13ce66"
                             inactive-color="#ff4949">
                  </el-switch>
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
      <common-dialog title="添加模版"
                     v-if="addTemplateVisible"
                     :visible="addTemplateVisible"
                     destroy-on-close
                     @close="handleCancel('addTemplateVisible')"
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
          <common-table ref="tableTemplate"
                        :params="{isTerminal: '1', roleIdList: roleIds}"
                        api="kanbanView.list"
                        :columns="templateColumns"
                        :pagination="true">
            <template #operation="{ scope }">
              <el-button type="text"
                         @click="preview(scope.row)">预览</el-button>
            </template>
          </common-table>
        </template>
        <template #cs-footer>
          <el-button @click="addTemplateVisible = false">取消</el-button>
          <el-button type="primary"
                     @click="templateSave()">确定</el-button>
        </template>
      </common-dialog>
      <common-dialog title="预览"
                     v-if="previewVisible"
                     :visible="previewVisible"
                     width="50%"
                     :dialog-height="dialogpreviewHeight"
                     destroy-on-close
                     :show-handle-btn="false"
                     @close="handleCancel('previewVisible')">
        <template #dialog>
          <kanbanView id=""
                      code=""
                      :render-data="[deepCopyFormData]"
                      :widget="deepCopyWidget"
                      :style-object="deepCopyFormData.style ? { ...JSON.parse(deepCopyFormData.style), ...{ height: '100%', width: '100%' } } : {}"
                      :row-height="50"
                      :margin="[5, 5]"
                      :padding="[5, 5]"
                      :is-static="true"
                      :is-design="false"></kanbanView>
        </template>
        <template #cs-footer>
          <el-button @click="addWidgetVisible = false">取消</el-button>
          <el-button type="primary"
                     @click="save()">确定</el-button>
        </template>
      </common-dialog>
    </div>
    <VuePerfectScrollbar class="scroll-area"
                         :class="{ isdesign: isDesign }">
      <smart-widget-grid :style="styleObject"
                         :layout="layout"
                         v-bind="$attrs"
                         :col-num="colNum"
                         :key="renderTime"
                         v-on="$listeners"
                         @layout-updated="onLayoutUpdated"
                         @layout-ready="onLayoutReady"
                         @moved="onMove"
                         @resized="onResize">
        <widget-item v-for="(item, index) in widget"
                     :ref="`widget${item.slot}`"
                     class="gridItem"
                     :key="item.slot"
                     :slot="item.slot"
                     :index="index"
                     v-bind="item"
                     :widget="item"
                     :is-design="isDesign"
                     :fullscreen="!item.magnify"
                     :style="item.styleObject"
                     @widget-resize="onWidgetResize"
                     @on-fullscreen="onFullscreen">
          <div class="noPermission"
               v-if="!item.isShow"><span class="text">安全管理员未授权您使用该组件的权限，请与安全管理员联系获取。</span></div>
          <dynamicLink v-else-if="item.component && item.component.functionalCategory === '1'"
                       :is-show="isLayoutReady"
                       :data="item"
                       :ref="`conten${item.slot}`"
                       :key="dynamicRenderTime + item.slot"></dynamicLink>
          <render-view v-else-if="item.component && item.component.functionalCategory === '2'"
                       :is-show="isLayoutReady"
                       :app-config="item.component"
                       :option="item.component.jsonOptions"
                       :resize-time="widgetResizeStatus[item.slot]"
                       ref="renderView"></render-view>
          <tableRenderVue v-else-if="item.component.functionalCategory === '3'"
                          :code="item.component.dataviewId"
                          @searchData="searchData"></tableRenderVue>
          <AntvView v-else-if="item.component.functionalCategory === '4'"
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
import renderView from "@/views/Framework/ComponentsMananger/Kanban/Components/renderView"
import tableRenderVue from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import AntvView from '@/views/Framework/ComponentsMananger/Kanban/Components/AntvView'
import kanbanView from '../kanbanViewPreview.vue'
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
    SmartWidgetGrid,
    widgetItem,
    renderView,
    VuePerfectScrollbar,
    dynamicLink,
    tableRenderVue,
    AntvView,
    kanbanView
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
      if (this.widget && this.widget.length > 0) {
        return this.widget.map((item) => {
          this.getSearchList(item)
          return item.layout
        })
      } else {
        return []
      }
    },
  },
  watch: {
    widget: {
      handler (val) {
        this.renderConten()
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      const gridElements = this.$el.querySelectorAll('[title]');
      gridElements.forEach(el => el.removeAttribute('title'));
    });
    this.roleIds = this.$store.getters.userInfo.userRoles.map(el => el.roleId)
  },
  data () {
    return {
      tableSearchList: [],
      searchList: [],
      dialogHeight: 300,
      widgetList: [],
      isLayoutReady: false,
      renderTime: new Date().getTime(),
      dynamicRenderTime: new Date().getTime(),
      addWidgetVisible: false,
      addTemplateVisible: false,
      previewVisible: false,
      addWidgetTitle: '添加组件',
      deepCopyWidget: [],
      deepCopyFormData: {},
      dialogpreviewHeight: document.documentElement.clientHeight * 0.7,
      setWidgetVisible: false,
      WidgetForm: {
        title: '',
        simple: false,
        styleObject: {
          backgroundColor: 'rgba(255, 255, 255, 1)',
          backgroundImage: ''
        },
        magnify: false
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
      templateColumns: [
        {
          type: 'selection',
          width: 45,
        },
        {
          title: '组件名称',
          align: 'center',
          dataIndex: 'name'
        },
        {
          title: '描述',
          align: 'center',
          dataIndex: 'describe'
        },
        {
          title: '操作',
          align: 'center',
          width: '80px',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
        }
      ],
      widgetResizeStatus: [],
      layoutCount: [],
      colNum: 12,
      roleIds: []
    }
  },
  methods: {
    searchData (data) {
      this.tableSearchList = Array.from(new Set([...this.tableSearchList, ...data]))
      this.changeSearchConfig()
    },
    onWidgetResize (widget) {
      this.$set(this.widgetResizeStatus, widget.slot, new Date().getTime())
    },
    onLayoutUpdated (newLayout) { },
    onLayoutReady (newLayout) {
      // let delay = this.isDesign ? 1500 : 200
      const delay = 260
      const that = this
      setTimeout(() => {
        that.isLayoutReady = true
      }, delay)
    },
    onMove (params) {
      // console.log('onMove:', params)
    },
    // 大小改变
    onResize (params) {
      // setTimeout(() => {
      //   this.$refs['widget' + params.i][0].handleRefresh()
      // }, 300)
    },
    // 放大
    onFullscreen (booleanParams, params) {
      this.dynamicRenderTime = new Date().getTime()
    },
    // 重新渲染
    renderConten () {
      this.tableSearchList = []
      this.renderTime = new Date().getTime()
    },
    // 删除
    deleteWidget (data) {
      const widgetList = JSON.parse(JSON.stringify(this.widget))
      widgetList.splice(data.index, 1)
      this.getSearchCofnfig(widgetList)
      this.$emit('update:widget', widgetList)
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
    addTemplate () {
      this.addTemplateVisible = true
    },
    preview (row) {
      this.deepCopyWidget = []
      this.deepCopyFormData = row
      this.previewVisible = true
      if (row.widgets && row.widgets.length) {
        row.widgets.forEach((el) => {
          this.deepCopyWidget.push(JSON.parse(el.layout))
        })
      }
    },
    templateSave () {
      const addArr = this.$refs.tableTemplate.selection
      this.$emit('saveTemplate', addArr)
      this.addTemplateVisible = false
    },
    // 编辑保存组件设置
    saveWidget () {
      const widget = this.widget.find((item) => {
        return item.slot === this.WidgetForm.slot
      })
      const widgetIndex = this.widget.findIndex((item) => {
        return item.slot === this.WidgetForm.slot
      })
      const widgetList = this.widget.map((i) => i)
      for (const key in this.WidgetForm) {
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
      const soltArr = this.widget.map((item) => {
        return item.layout.i
      })
      const maxSolt = soltArr.length ? Math.max.apply(null, soltArr) : 0
      const addArr = this.$refs.table.selection
      if (addArr.length) {
        addArr.forEach((item, index) => {
          this.widgetList.push({
            slot: maxSolt + index + 1,
            fullscreen: true,
            layout: {
              x: (this.layoutCount.length * 2) % (this.colNum || 12),
              y: this.layoutCount.length + (this.colNum || 12),
              w: 2,
              h: 4,
              i: maxSolt + index + 1
            },
            component: item,
            styleObject: {},
            title: item.name
          })
          this.layoutCount.push(index)
        })
      }
      this.tableSearchList = []
      this.$emit('update:widget', this.widget.concat(this.widgetList))
      this.addWidgetVisible = false
    },
    getSearchCofnfig (list) {
      list.forEach((el) => {
        if (el.component.searchConfigValue && el.component && el.component.functionalCategory && el.component.functionalCategory !== '3') {
          let item
          if (el.component.searchConfigValue && el.component.searchConfigValue.indexOf('null') !== -1) {
            item = ''
          } else {
            item = JSON.parse(el.component.searchConfigValue)
          }
          if (item && item.length && item !== 'null') {
            item.forEach((val) => {
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
        const newobj = {}
        list = list.reduce((preVal, curVal) => {
          newobj[curVal.fieldName] ? '' : (newobj[curVal.fieldName] = preVal.push(curVal))
          return preVal
        }, [])
        this.$emit('setSearchConfig', list)
      }
    },
    getSearchList (addArr) {
      const list = []
      const soltArr = this.widget.map((item) => {
        return item.layout.i
      })
      const maxSolt = soltArr.length ? Math.max.apply(null, soltArr) : 0
      const item = addArr.component
      list.push({
        slot: maxSolt + this.widgetList.length + 1,
        fullscreen: true,
        layout: { x: 0, y: 0, w: item.defaultWidth, h: item.defaultHigh, i: maxSolt + this.widgetList.length + 1 },
        component: item,
        styleObject: {},
        title: item.name
      })
      this.getSearchCofnfig(this.widget.concat(list))
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
.elForm {
  padding: 10px;
}
.gridItem {
  ::v-deep.widget-header {
    background: #f9f9f9;
    .ellis {
      font-size: 14px;
    }
  }
}
.noPermission {
  height: 100%;
  position: relative;
  .text {
    font-size: 14px;
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 垂直和水平居中 */
  }
}
</style>
