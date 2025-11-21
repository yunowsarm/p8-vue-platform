<template>
  <div style="height: 100%; width: 100%">
    <div v-if="isDesign">
      <el-row>
        <el-col :span="12">
          <div style="width: 100%; height: 30px"></div>
        </el-col>
        <el-col :span="12">
          <div style="text-align: right;margin: 10px;">
            <el-button type="primary"
                       size="mini"
                       @click="addTemplate"><i style="position: relative; top: 2px"
                 class="p8 icon-zujianku"></i> 模版库
            </el-button>
            <el-button type="primary"
                       size="mini"
                       @click="addWidget"><i style="position: relative; top: 2px"
                 class="p8 icon-zujianku"></i> 组件库
            </el-button>
          </div>
        </el-col>
      </el-row>
      <common-dialog ref="commonDialog"
                     :title="addWidgetTitle"
                     v-if="addWidgetVisible"
                     :visible="addWidgetVisible"
                     destroy-on-close
                     :dialogHeight="500"
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
          <list-layout>
            <template #north>
              <search-form-list ref="searchWidget"
                                search-width="90%"
                                search-contain-width="90%"
                                :data-source="searchWidgetData"
                                :addFuzzySearch="true"
                                @search="searchWidget"
                                @re-set="reSetWidget"></search-form-list>
            </template>
            <template #center>
              <!-- kanbanComponent.list -->
              <common-table ref="widgetTable"
                            :params="widgetParams"
                            api="kanbanComponent.getRoleAppInfo"
                            :columns="columns"
                            :pagination="true"></common-table>
            </template>
          </list-layout>
        </template>
        <template #cs-footer>
          <el-button @click="addWidgetVisible = false">取消</el-button>
          <el-button type="primary"
                     @click="save()">确定
          </el-button>
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
                                   :min="WidgetForm.layout.minW"
                                   v-model.number="WidgetForm.layout.w"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高">
                  <el-input-number style="width: 100%"
                                   :min="WidgetForm.layout.minH"
                                   v-model.number="WidgetForm.layout.h"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="0"
                    v-if="!WidgetForm.simple">
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
                     @click="saveWidget()">保存
          </el-button>
        </template>
      </common-dialog>
      <common-dialog title="添加模版"
                     v-if="addTemplateVisible"
                     :visible="addTemplateVisible"
                     destroy-on-close
                     :dialogHeight="500"
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
          <list-layout>
            <template #north>
              <search-form-list ref="searchTemplate"
                                search-width="90%"
                                search-contain-width="90%"
                                :data-source="searchTemplateData"
                                :addFuzzySearch="true"
                                @search="searchTemplate"
                                @re-set="reSetTemplate"></search-form-list>
            </template>
            <template #center>
              <common-table ref="tableTemplate"
                            :params="templateParams"
                            api="kanbanView.list"
                            :columns="templateColumns"
                            :pagination="true">
                <template #operation="{ scope }">
                  <el-button type="text"
                             @click="preview(scope.row)">预览
                  </el-button>
                </template>
              </common-table>
            </template>
          </list-layout>
        </template>
        <template #cs-footer>
          <el-button @click="addTemplateVisible = false">取消</el-button>
          <el-button type="primary"
                     @click="templateSave()">确定
          </el-button>
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
                     @click="save()">确定
          </el-button>
        </template>
      </common-dialog>
    </div>
    <div class="scroll-area"
         :class="{ isdesign: isDesign }">
      <smart-widget-grid :style="styleObject"
                         :layout="layout"
                         class="gridWidget"
                         v-nested-scroll
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
               v-if="item.isShow == false"><span class="text">安全管理员未授权您使用该组件的权限，请与安全管理员联系获取。</span></div>
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
    </div>
  </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { SmartWidgetGrid } from 'p8-vue-smart-widget'
import {
  P8Table as CommonTable,
  P8Dialog as CommonDialog,
  P8Search as SearchFormList,
  P8ListLayout as ListLayout
} from 'p8-components-ui'
import _cloneDeep from 'lodash/cloneDeep'
import widgetItem from './widget-item.vue'
import dynamicLink from './dynamic-link.vue'
import renderView from "@/views/Framework/ComponentsMananger/Kanban/Components/renderView"
import tableRenderVue from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import AntvView from '@/views/Framework/ComponentsMananger/Kanban/Components/AntvView'
import kanbanView from '../kanbanViewPreview.vue'

export default {
  directives: {
    'nested-scroll': {
      inserted (el) {
        const initScrollHandlers = () => {
          // 使用 vxe-table--body-wrapper 选择器，这是实际包含滚动条的元素
          const bodyWrappers = el.querySelectorAll('.vxe-table--body-wrapper');
          if (bodyWrappers.length > 0) {
            const handleWheel = (event) => {
              // 获取当前滚动容器
              const container = event.currentTarget;
              const { scrollTop, scrollHeight, clientHeight } = container;

              // 判断滚动方向和是否到达边界
              const isScrollingUp = event.deltaY < 0;
              const isScrollingDown = event.deltaY > 0;
              const isAtTop = scrollTop <= 0;
              const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
              // 如果在顶部继续向上滚动，或在底部继续向下滚动，则传递事件给父容器
              if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
                // 查找父级滚动容器
                const parent = el.closest('.gridWidget');
                if (parent) {
                  // 阻止当前容器的默认滚动行为
                  // event.preventDefault();
                  // 创建新的滚动事件并分发给父容器
                  const newEvent = new WheelEvent(event.type, {
                    deltaX: event.deltaX,
                    deltaY: event.deltaY,
                    deltaZ: event.deltaZ,
                    deltaMode: event.deltaMode,
                    bubbles: true,
                    cancelable: true
                  });
                  parent.dispatchEvent(newEvent);
                }
              }
            };

            // 为每个表格滚动容器添加滚动事件监听
            bodyWrappers.forEach(wrapper => {
              wrapper.addEventListener('wheel', handleWheel, { passive: false });
            });
            return {
              handleWheel,
              containers: [...bodyWrappers]
            };
          }
          return null;
        };
        let scrollHandlers = initScrollHandlers();
        // 观察 DOM 变化，处理动态加载的表格
        const observer = new MutationObserver(() => {
          if (scrollHandlers) {
            scrollHandlers.containers.forEach(container => {
              container.removeEventListener('wheel', scrollHandlers.handleWheel);
            });
          }
          scrollHandlers = initScrollHandlers();
        });
        // 只观察当前元素内的变化
        observer.observe(el, {
          childList: true,
          subtree: true
        });
        el._nestedScroll = {
          observer,
          scrollHandlers
        };
      },
      unbind (el) {
        if (el._nestedScroll) {
          const { observer, scrollHandlers } = el._nestedScroll;
          if (observer) {
            observer.disconnect();
          }
          if (scrollHandlers) {
            scrollHandlers.containers.forEach(container => {
              container.removeEventListener('wheel', scrollHandlers.handleWheel);
            });
          }
          delete el._nestedScroll;
        }
      }
    }
  },
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
    ListLayout,
    SearchFormList,
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
      default: () => {
      }
    },
    localParames: {
      type: Object,
      default: () => {
      }
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
      widgetParams: {},
      templateParams: {
        isTerminal: '1',
        roleIdList: this.roleIds ? this.roleIds : [],
      },
      searchWidgetData: [
        {
          type: 'text', // 控件类型
          labelText: '组件名称', // 控件显示的文本
          fieldName: 'name',
          placeholder: '请输入组件名称',
        },
        {
          type: 'text', // 控件类型
          labelText: '描述', // 控件显示的文本
          fieldName: 'compCode',
          placeholder: '请输入描述',
        },
      ],
      searchTemplateData: [
        {
          type: 'text', // 控件类型
          labelText: '模板名称', // 控件显示的文本
          fieldName: 'name',
          placeholder: '请输入模板名称',
        },
        {
          type: 'text', // 控件类型
          labelText: '描述', // 控件显示的文本
          fieldName: 'describe',
          placeholder: '请输入描述',
        },
      ],
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
          align: 'center',
          width: 50,
        },
        {
          title: '模版名称',
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
    // 组件搜索
    searchWidget (param) {
      this.widgetParams = {
        ...this.widgetParams,
        ...param
      }
      this.$nextTick(() => {
        this.$refs.widgetTable.searchData()
      })
    },
    // 重置组件搜索
    reSetWidget () {
      this.widgetParams = {}
      this.$nextTick(() => {
        this.$refs.widgetTable.searchData()
      })
    },
    // 模板搜索
    searchTemplate (param) {
      this.templateParams = {
        ...this.templateParams,
        ...param
      }
      this.$nextTick(() => {
        this.$refs.tableTemplate.searchData()
      })
    },
    // 重置模板搜索
    reSetTemplate () {
      this.templateParams = {
        isTerminal: '1',
        roleIdList: this.roleIds ? this.roleIds : [],
      }
      this.$nextTick(() => {
        this.$refs.tableTemplate.searchData()
      })
    },
    searchData (data) {
      this.tableSearchList = Array.from(new Set([...this.tableSearchList, ...data]))
      this.changeSearchConfig()
    },
    onWidgetResize (widget) {
      this.$set(this.widgetResizeStatus, widget.slot, new Date().getTime())
    },
    onLayoutUpdated (newLayout) {
    },
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
      // 计算新的容器高度
      const gridContainer = document.querySelector('.isDesign')
      if (gridContainer) {
        const items = this.widget.map(item => item.layout)
        const maxY = Math.max(...items.map(item => item.y + item.h))
        const rowHeight = 30 // 假设每行高度为30px
        const newHeight = (maxY + 2) * rowHeight // 加2行作为缓冲
        gridContainer.style.minHeight = `${newHeight}px`
        // 自动滚动到底部
        setTimeout(() => {
          gridContainer.scrollTop = gridContainer.scrollHeight
        }, 10)
      }
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
      // 重置搜索条件
      this.widgetParams = {}
      if (this.$refs.searchWidget) {
        this.$refs.searchWidget.resetForm()
      }
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
      // 重置搜索条件
      this.templateParams = {
        isTerminal: '1',
        roleIdList: this.roleIds ? this.roleIds : [],
      }
      if (this.$refs.searchTemplate) {
        this.$refs.searchTemplate.resetForm()
      }

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
    // 添加新方法：查找合适的位置
    findSuitablePosition (width, height) {
      const maxColumns = this.colNum || 12
      // 获取所有已存在的布局，包括当前批次已添加的组件
      const existingLayouts = [...this.widget, ...this.widgetList].map(item => item.layout)
      let position = { x: 0, y: 0 }

      // 检查位置是否可用
      const isPositionAvailable = (x, y, w, h) => {
        return !existingLayouts.some(layout => {
          return !(x + w <= layout.x || x >= layout.x + layout.w ||
            y + h <= layout.y || y >= layout.y + layout.h)
        })
      }

      // 从左到右、从上到下查找合适的位置
      let found = false
      let currentY = 0
      let minY = Math.min(...existingLayouts.map(l => l.y + l.h).concat([0]))

      // 从最小的 y 坐标开始查找
      currentY = minY

      while (!found) {
        for (let x = 0; x <= maxColumns - width; x++) {
          if (isPositionAvailable(x, currentY, width, height)) {
            position = { x, y: currentY }
            found = true
            break
          }
        }
        if (!found) {
          currentY++
        }
      }

      return position
    },

    // 修改 save 方法
    save () {
      const soltArr = this.widget.map(item => { return item.layout.i })
      const maxSolt = soltArr.length ? Math.max.apply(null, soltArr) : 0
      const addArr = this.$refs.widgetTable.selection

      if (addArr.length) {
        addArr.forEach((item, index) => {
          // 默认组件大小
          const width = item.defaultWidth
          const height = item.defaultHigh
          const minWidth = item.minWidth
          const minHigh = item.minHigh
          // 查找合适的位置
          const position = this.findSuitablePosition(width, height)

          this.widgetList.push({
            slot: maxSolt + index + 1,
            fullscreen: true,
            layout: {
              x: position.x,
              y: position.y,
              w: width,
              h: height,
              minW: minWidth,
              minH: minHigh,
              i: maxSolt + index + 1
            },
            component: item,
            styleObject: {},
            title: item.name
          })
        })
      }

      this.tableSearchList = []
      this.getSearchCofnfig(this.widget.concat(this.widgetList))
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
        list = list.filter(el => {
          return el.type
        })
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
  height: calc(100% - 138px) !important;
  padding-bottom: 100px; // 添加底部填充

  position: relative;
  // 确保滚动条始终可见
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  // 允许内容扩展
  &:hover {
    overflow-y: scroll !important;
    overflow-x: hidden !important;
  }
  // 确保grid容器可以扩展
  ::v-deep .vue-grid-layout {
    min-height: 100%;
    position: relative;
    padding-bottom: 100px; // 添加底部填充
  }
  ::v-deep .vxe-table--body-wrapper {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
}
// 拖拽手柄样式调整
::v-deep .vue-grid-item .resizable-handle {
  z-index: 10;
  background: transparent;
  width: 20px;
  height: 20px;
  right: 0;
  bottom: 0;
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
::v-deep .search-wrapper .search-contain {
  height: 200px;
}
</style>
