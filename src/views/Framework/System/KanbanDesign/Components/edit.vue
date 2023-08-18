<template>
  <el-row style="height: 100%">
    <el-col style="height:100%"
            :xs="globalLayout.left.xs"
            :sm="globalLayout.left.sm"
            :md="globalLayout.left.md"
            :lg="globalLayout.left.lg"
            :xl="globalLayout.left.xl">
      <div style="position:relative;height:100%">
        <widget-grid :widget.sync="widget"
                     :row-height="50"
                     :margin="[5, 5]"
                     :padding="[5, 5]"
                     :style-object="{height:'calc(100% - 32px)'}"
                     @setSearchConfig="setSearchConfig"
                     :is-static="isStatic">
        </widget-grid>
        <div class="splitBtn"
             @click="splitClick">
          <i class="p8 icon-right"
             :class="{ rotate: !expand }"></i>
        </div>
      </div>
    </el-col>
    <el-col class="right-panel"
            :xs="globalLayout.right.xs"
            :sm="globalLayout.right.sm"
            :md="globalLayout.right.md"
            :lg="globalLayout.right.lg"
            :xl="globalLayout.right.xl">
      <div class="tabs">
        <right-panel :save-api="saveApi"
                     ref="rightForm"
                     :widgets="widget"
                     :edit-form-data="formData"></right-panel>
      </div>
      <div class="form-btn">
        <el-button type="info"
                   class="el-btn"
                   @click="showHelp">帮助</el-button>
        <el-button type="primary"
                   class="el-btn"
                   @click="handleViews">预览</el-button>
        <el-button type="primary"
                   class="el-btn"
                   @click="handleSubmit">保存</el-button>
      </div>
      <Dialog title="看板预览"
              :visible="kanbanViewVisible"
              :show-handle-btn="false"
              :dialog-config="{}"
              @isfullscreen="isfullscreen"
              @close="kanbanViewVisible = false"
              width="50%">
        <template #dialog>
          <kanban-view v-if="kanbanViewVisible"
                       ref="kanbanView"
                       :id="record.id"
                       :code="record.code"
                       :render-data="[deepCopyFormData]"
                       :widget="deepCopyWidget"
                       :style-object="deepCopyFormData.style ? { ...JSON.parse(deepCopyFormData.style), ...{ height: '100%', width: '100%' } } : {}"
                       :row-height="50"
                       :margin="[5, 5]"
                       :padding="[5, 5]"
                       :is-static="true"
                       :is-design="false"></kanban-view>
        </template>
      </Dialog>
      <Dialog title="帮助"
              :visible="helpVisible"
              :show-handle-btn="false"
              @close="helpVisible = false">
        <template #dialog>
          <help></help>
        </template>
      </Dialog>
    </el-col>
  </el-row>
</template>

<script>
import { P8Dialog as Dialog } from 'p8-components-ui'
import widgetGrid from './widget-grid.vue'
import RightPanel from './right-panel'
import _cloneDeep from 'lodash/cloneDeep'
import mixin from './mixin'
import kanbanView from '../kanbanView.vue'
import help from './help'

export default {
  name: 'KanbanEidt',
  mixins: [mixin],
  components: {
    Dialog,
    widgetGrid,
    RightPanel,
    kanbanView,
    help
  },
  props: {
    record: {
      type: Object,
      default: () => {
      }
    }
  },
  computed: {
    deepCopyFormData () {
      return _cloneDeep(this.formData)
    },
    deepCopyWidget () {
      // console.log(this.widget)
      return _cloneDeep(this.widget)
    }
  },
  data () {
    return {
      saveApi: 'kanbanView.save',
      expand: true,
      globalLayout: {
        left: {
          xs: 14,
          sm: 16,
          md: 18,
          lg: 19,
          xl: 20
        },
        right: {
          xs: 10,
          sm: 8,
          md: 6,
          lg: 5,
          xl: 4
        }
      },
      isStatic: false,
      styleObject: {
        height: '100%',
        'overflow-y': 'auto'
      },
      widget: [
        // {
        //   index: 0,
        //   slot: '0',
        //   title: '22',
        //   fullscreen: true,
        //   layout: { x: 0, y: 0, w: 4, h: 3, i: '0' },
        //   component: {
        //     url: 'Dashboard/Components/DashChart2'
        //   },
        //   styleObject: {
        //     backgroundColor: 'rgba(19, 206, 102,1)'
        //   }
        // }
      ],
      formData: {
        name: '',
        code: '',
        describe: '',
        indexNo: 0,
        style: '',
        queryConfig: '',
        widgets: []
      },
      kanbanViewVisible: false,
      helpVisible: false
    }
  },
  mounted () {
    this.$nextTick(this.rendered())
  },
  methods: {
    onLayoutUpdated (newLayout) {
      // console.log(JSON.stringify(newLayout))
    },
    onMove (params) {
      // console.log(params)
    },
    onResize (params) {
      // console.log(params)
    },
    outResize (params) {
    },
    splitClick () {
      if (this.expand) {
        this.globalLayout = {
          left: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 24
          },
          right: {
            xs: 0,
            sm: 0,
            md: 0,
            lg: 0,
            xl: 0
          }
        }
      } else {
        this.globalLayout = {
          left: {
            xs: 14,
            sm: 16,
            md: 18,
            lg: 19,
            xl: 20
          },
          right: {
            xs: 10,
            sm: 8,
            md: 6,
            lg: 5,
            xl: 4
          }
        }
      }

      this.expand = !this.expand
    },
    rendered () {
      // 所有表单元素渲染后调用rendered
      if (this.record.id) {
        this.getFormData()
      }
    },
    getFormData () {
      // let obj = { 'id': '6cc38d6d1c5cd75cd8655470e04b5be0', 'name': '6', 'describe': '6', 'indexNo': 6, 'customItem1': null, 'customItem2': null, 'customItem3': null, 'customItem4': null, 'customItem5': null, 'widgets': [{ 'id': '941b8f0a394e965da2fa5446eddd55a7', 'homepageId': '6cc38d6d1c5cd75cd8655470e04b5be0', 'appId': '', 'name': '', 'layout': '{\\"x\\":0,\\"y\\":0,\\"w\\":4,\\"h\\":3,\\"i\\":\\"0\\",\\"moved\\":false}', 'layoutObj': { 'index': 0, 'slot': 0, 'title': '22', 'fullscreen': true, 'layout': { 'x': 0, 'y': 0, 'w': 4, 'h': 3, 'i': '0', 'moved': false }, 'component': { 'url': 'Dashboard/Components/DashChart2' }, 'styleObject': { 'backgroundColor': 'rgba(19, 206, 102,1)' } }, 'style': '\\"\\"', 'app': null, 'itemCreateTime': '2021-07-28 10:00:04', 'itemModifyTime': null, 'customItem1': null, 'customItem2': null, 'customItem3': null, 'customItem4': null, 'customItem5': null }], 'page': null, 'style': '{"backgroundColor": "rgba(231, 20, 20, 0)"}' }
      // this.$api['kanbanView.list']({ id: this.record.id }).then(res => {
      //   if (res.records.length) {
      //     let record = res.records[0]
      //     !record.widgets && (record.widgets = [])
      //     !record.style && (record.style = '')
      //       this.formData = _cloneDeep({ ...this.formData, ...record })
      //       this.widget = this.formData.widgets.map(i => {
      //         i.style = this.strToObj(i.style)
      //         i.layout = this.strToObj(i.layout, { x: 0, y: 0, w: 4, h: 3, i: '0' })
      //         return i.layout
      //       })
      //   }
      // }).catch(e => { })
      !this.record.widgets && (this.record.widgets = [])
      !this.record.style && (this.record.style = '')
      !this.record.queryConfig && (this.record.queryConfig = '')
      this.formData = _cloneDeep({ ...this.formData, ...this.record })
      this.widget = this.formData.widgets.map(i => {
        // console.log('getFormData', i.layout)
        i.style = this.strToObj(i.style)
        i.layout = this.strToObj(i.layout, { x: 0, y: 0, w: 4, h: 3, i: '0' })
        return i.layout
      })
    },
    handleSubmit () {
      let _this = this
      this.$refs.rightForm.getSubmitData().then((submitData) => {
        submitData.widgets = this.widget.map((item) => {
          let component = item.component
          let obj = {
            appId: component.id || '',
            name: component.name || '',
            layout: JSON.stringify(item || ''),
            style: JSON.stringify(item.styleObject || '')
          }
          item.id && (obj.id = item.id)
          submitData.id && (obj.homepageId = submitData.id)
          return obj
        })
        this.$refs.rightForm.doSubmit(submitData, _this.saveApi)
      })
      // this.$refs.form.validate().then((queryParams) => {

      // })
    },
    handleViews () {
      this.formData = this.$refs.rightForm.getFormData()
      this.kanbanViewVisible = true
    },
    isfullscreen () {
      // this.$refs.kanbanView.reload()
    },
    showHelp () {
      this.helpVisible = true
    },
    setSearchConfig (jsonStr) {
      this.formData.queryConfig = jsonStr
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-area {
  position: relative;
}
.el-button--mini {
  margin-right: 15px;
}
.splitBtn {
  width: 0px;
  height: 100%;
  float: right;
  // position:relative;
  cursor: pointer;

  > i {
    background: $base-light-color;
    color: $base-white-color;
    font-size: 10px;
    position: absolute;
    top: 40%;
    width: 10px;
    height: 60px;
    line-height: 60px;
    border-radius: 0px 10px 10px 0px;
    z-index: 99;
    right: 0;
  }
}

.rotate {
  transform: rotate(180deg);
  -ms-transform: rotate(180deg); /* Internet Explorer */
  -moz-transform: rotate(180deg); /* Firefox */
  -webkit-transform: rotate(180deg); /* Safari 和 Chrome */
  -o-transform: rotate(180deg); /* Opera */
}

.right-panel {
  position: relative;
  height: 100%;
}

.tabs {
  height: calc(100% - 42px);
  position: relative;
}

.form-btn {
  height: 40px;
  width: 100%;
  border-top: 1px solid $base-line-color;
  position: absolute;
  text-align: right;
  bottom: 0;

  .el-btn {
    margin: 5px 5px;
  }
}
</style>
