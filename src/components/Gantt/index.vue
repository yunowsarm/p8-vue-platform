<template>
  <div style="height: 100%" id="planGantt">
    <GanttToolBar v-if="showToolBar" :button-datas="customButtonData" :panel-data="panelData" :selected-tasks="selectedTasks" :gantt-object="ganttObject">
      <template v-for="name in slotList" #[name]="scope">
        <slot :name="name" :row-num="scope.rowNum"></slot>
      </template>
    </GanttToolBar>
    <P8Gantt
      ref="p8Gantt"
      v-bind="$attrs"
      v-on="$listeners"
      :style="{ height: ganttHeight }"
      :data="ganttData"
      :columns="customColumns"
      :button-datas="customButtonData"
      :dictionary="dictionary"
      :right-menu="customRightMenu"
      :on-gantt-init="onGanttInit"
      :update-task="updateTask"
      @getSelectTasks="getSelectTasks"
      :view-type="layoutType"
      :on-before-edit="onGanttBeforeEdit"
      :on-task-db-click="onTaskDbClick"
      @clickSelectTask="getSelectTask"
    />
    <el-drawer :title="importExcelTitle" :append-to-body="true" size="50%" :wrapper-closable="false" :destroy-on-close="true" @closed="importExcelClosed" :visible.sync="importExcel">
      <import-excel @save-success="importExcelClosed" :task-id="selectTaskId" v-bind="importExcelConfig"></import-excel>
    </el-drawer>
    <CommonButtonBarSetting
      v-if="rightMenuConfigVisible"
      :visible="rightMenuConfigVisible"
      title="菜单配置"
      :panel-data="panelData"
      :command-button-data="customButtonData"
      @submit="submitButtonBarSetting"
      @hidden="rightMenuConfigVisible = false"
    />
  </div>
</template>

<script>
import { Drawer } from 'element-ui'
import { P8Gantt } from 'p8-components-ui'
import ImportExcel from './importExcel'
import moment from 'moment'
import GanttToolBar from './GanttToolBar'
import CommonButtonBarSetting from './CommonButtonBarSetting'
import { defaultColumn } from './defaultConfig/defaultColumn'
import { TabsLayout, DoubleLayout, SingleLayout, RightMenuData } from './defaultConfig/defaultButtonLayout'
import { defaultButtonData } from './defaultConfig/defaultButtonData'
import { requestUrl, deepClone } from '@/utils/common.js'
import { mapGetters } from 'vuex'

export default {
  name: 'GanttComponent',
  data() {
    return {
      ganttData: {},
      dictionary: {},
      customButtonData: defaultButtonData,
      ganttObject: null,
      selectedTasks: [],
      createNum: 1,
      colName: '',
      importExcel: false,
      customColumns: defaultColumn,
      resourceColumns: [],
      importExcelTitle: 'Excel文件导入',
      layoutType: this.viewType, // 视图类型，默认只显示列表
      rightMenuConfigVisible: false
    }
  },
  components: {
    'el-drawer': Drawer,
    ImportExcel,
    P8Gantt,
    CommonButtonBarSetting,
    GanttToolBar
  },
  props: {
    comp: {
      type: Object,
      default: () => {}
    },
    planInfoId: {
      type: String,
      default: ''
    },
    api: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default: () => {}
    },
    data: {
      type: Object,
      default: () => {}
    },
    columns: {
      type: Array,
      default: () => []
    },
    rightMenu: {
      type: Array,
      default: () => []
    },
    toolBtn: {
      type: Array,
      default: () => []
    },
    toolBarLayout: {
      // type: Object,
      default: () => {}
    },
    showToolBar: {
      type: Boolean,
      default: true
    },
    createApi: {
      type: String,
      default: ''
    },
    updateApi: {
      type: String,
      default: ''
    },
    onBeforeEdit: {
      type: Function,
      default: () => {}
    },
    deleteApi: {
      type: String,
      default: ''
    },
    exportExcelApi: {
      type: String,
      default: ''
    },
    importExcelConfig: {
      type: Object,
      default: () => {}
    },
    viewType: {
      type: String,
      default: 'grid'
    }
  },
  computed: {
    selectTaskId() {
      if (this.selectedTasks.length > 0) {
        return this.selectedTasks[0].id
      } else {
        return ''
      }
    },
    ganttHeight() {
      if (!this.showToolBar) {
        return '100%'
      }
      if (this.ganttButtonMode === 'tabs') {
        return 'calc(100% - 170px)'
      }
      if (this.ganttButtonMode === 'double') {
        return 'calc(100% - 92px)'
      }
      if (this.ganttButtonMode === 'single') {
        return 'calc(100% - 85px)'
      }
      return '100%'
    },
    panelData() {
      if (this.ganttButtonMode === 'tabs') {
        return this.toolBarLayout.TabsLayout.length > 0 ? this.toolBarLayout.TabsLayout : TabsLayout
      }
      if (this.ganttButtonMode === 'double') {
        return this.toolBarLayout.DoubleLayout.length > 0 ? this.toolBarLayout.DoubleLayout : DoubleLayout
      }
      if (this.ganttButtonMode === 'single') {
        return this.toolBarLayout.SingleLayout.length > 0 ? this.toolBarLayout.SingleLayout : SingleLayout
      }
      return []
    },
    slotList() {
      const arr = []
      this.panelData.forEach((item) => {
        if (item.groups && item.groups.length > 0) {
          item.groups.forEach((ele) => {
            if (typeof ele.buttonConfigs === 'string') {
              arr.push(ele.buttonConfigs)
            }
          })
        }
      })
      return arr
    },
    customRightMenu() {
      // 数据库数据 > 传入的数据 > 默认数据
      return this.ganttRightButtons.length ? this.ganttRightButtons : this.rightMenu.length ? this.rightMenu : RightMenuData
    },
    ...mapGetters(['ganttButtonMode', 'ganttRightButtons'])
  },
  watch: {
    data(val) {
      this.handleData(val)
    },
    params: {
      handler(val) {
        this.getDataList()
      },
      deep: true
    }
  },
  created() {
    if (this.api) {
      this.getDataList()
    }
    // 覆盖默认的列配置
    if (this.columns.length > 0) {
      this.customColumns = this.columns
    }
    // 覆盖默认按钮配置
    if (this.toolBtn.length > 0) {
      this.customButtonData = this.toolBtn
    }
  },
  methods: {
    getDataList() {
      this.$api[this.api](this.params).then((res) => {
        if (res) {
          this.handleData(res)
        }
      })
      this.$nextTick(() => {
        this.$store.dispatch('setVueThis', this)
      })
    },
    handleData(val) {
      const data = deepClone(val)
      this.ganttData = {
        tasks: data.tasks || [],
        links: data.links || [],
        resources: data.resources || []
      }
      this.dictionary = data
      if (data.tasks) delete this.dictionary.tasks
      if (data.links) delete this.dictionary.links
      if (data.resources) delete this.dictionary.resources
      this.comp.dictionary = this.dictionary
    },
    createTask(num, parent, save) {
      if (this.createApi) {
        const params = {
          name: '新任务',
          parent: parent.id,
          planInfoId: this.planInfoId,
          insertNum: num,
          insertType: 'Child',
          type: 'task',
          autoScheduling: '2',
          createPage: 'compile'
        }
        this.$api[this.createApi](params).then((res) => {
          this.getDataList()
        })
      } else {
        this.$emit('create-task', num, parent, save)
      }
    },
    updateTask(task) {
      if (this.updateApi) {
        let data = deepClone(task)
        data = this.timeTransform(data)
        this.$api[this.updateApi](data).then((res) => {})
      } else {
        this.$emit('update-task', task)
      }
    },
    // 将数据中的时间全部格式化
    timeTransform(task) {
      for (const key in task) {
        const tempTime = new Date(task[key])
        if (task[key] && !isNaN(tempTime.getTime()) && tempTime instanceof Date && tempTime.getTime() > 1262278800000) {
          task[key] = moment(task[key]).format('YYYY-MM-DD HH:mm:ss')
        }
      }
      return task
    },
    deleteTask(ids) {
      if (this.deleteApi) {
        this.$api[this.deleteApi]({ id: ids[0] }).then((res) => {
          this.$message.success('删除成功！')
        })
      } else {
        this.$emit('delete-task', ids)
      }
    },
    onGanttInit(ganttObject) {
      this.ganttObject = ganttObject
      this.$emit('ganttInit', ganttObject)
    },
    getSelectTasks(tasks) {
      this.selectedTasks = tasks
      this.$emit('')
    },
    onGanttBeforeEdit(ele, ganttObject) {
      this.colName = ele.columnName
      return this.onBeforeEdit(ele, ganttObject)
    },
    onTaskDbClick(id, e) {
      this.$emit('on-task-db-click', id, e, this.colName)
    },
    importExcelClosed() {
      const that = this
      this.importExcel = false
      that.ganttObject.eachSelectedTask(function (id) {
        if (that.ganttObject.isTaskExists(id)) {
          that.ganttObject.unselectTask(id)
        }
      })
      this.getDataList()
    },
    submitButtonBarSetting(updateValues, requestOtherParams) {
      const _this = this
      const params = [
        {
          id: requestOtherParams.id,
          key: requestOtherParams.key,
          description: requestOtherParams.description,
          type: requestOtherParams.type,
          value: JSON.stringify({
            type: updateValues.type,
            rightBtns: updateValues.rightBtns
          })
        }
      ]
      const url = requestUrl(requestOtherParams.saveApi)
      /** 使用$ajax请求: 是因为 this.$api请求会将请求参数处理成对象, 而保存设置接口请求参数为数组 */
      _this.$ajax
        .post(url, params, { headers: { Authorization: this.$store.getters.token } })
        .then((res) => {
          // 更新vuex
          this.$store.commit('SET_SETTING_ALL', res)
        })
        .catch((err) => {
          console.error('user.setting.save--err', err)
        })
      this.rightMenuConfigVisible = false
    },
    getSelectTask(task) {
      console.log('🚀 ~ file: index.vue:309 ~ getSelectTask ~ task:', task)
    }
  }
}
</script>

<style></style>
