<template>
  <div style="width: 100%;height: 100%;">
    <form2 ref="form"
           v-if="!isEmpty"
           :comp="comp"
           :is-view="true"
           :form-to-api-data="ganttLinkResponse"
           :data-source="dataSource"
           :data-source-array="dataSourceArray"
           add-btn-name="添加"
           @form-add="formAdd"
           @form-submit="formSubmit"
           @form-edit="formEdit"
           @form-delete="formDelete">
      <template #source="{ scope }">
        <span v-if="(typeof scope.hasAtt === 'boolean' && scope.hasAtt) || (typeof scope.hasAtt === 'string' && scope.hasAtt === 'true')">
          <i class="el-icon-paperclip"
             @click.stop="showModal(scope)"></i>
        </span>
      </template>
      <template #sourceView="{ scope }">
        <span>{{ renderTaskInfo(scope).name }}</span>
        <span v-if="renderTaskInfo(scope).hasAttr"
              style="padding-left: 4px"
              @click.stop="showModal(scope, true)">
          <i class="el-icon-paperclip"></i>
        </span>
        <span style="font-size: 12px; padding: 2px 8px; margin-left: 10px"
              :style="{ background: renderTaskInfo(scope).color || '#999' }">{{ renderTaskInfo(scope).text }}</span>
      </template>
    </form2>
    <div v-if="isEmpty"
         style="height: 100%;width:100%;display: flex; justify-content: center; align-items: center;">
      <el-empty class="custom_empty"
                :image-size="100"></el-empty>
    </div>
    <common-dialog :title="dialogTitle"
                   v-if="dialogVisible"
                   :visible="dialogVisible"
                   :show-handle-btn="false"
                   width="36%"
                   :dialog-height="300"
                   :dialog-config="dialogConfig"
                   @close="dialogVisible = false">
      <template #dialog>
        <div style="padding: 10px">
          <common-file-view :upload-files="uploadFiles"
                            :file-download-key="{ id: 'id', fileName: 'fileName' }"></common-file-view>
        </div>
      </template>
    </common-dialog>
  </div>
</template>
<style scoped>
.custom_empty {
  padding: 0;
}
</style>
<script>
import Form2 from '../form2'
import { P8Dialog as CommonDialog, P8FileView as CommonFileView } from 'p8-components-ui'

import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
import { linksEditCheck } from '@/assets/commonJS/ganttJS/changeGantt'
export default {
  name: 'DependenceEdit',
  components: {
    Form2,
    CommonFileView,
    CommonDialog
  },
  props: {
    taskId: {
      type: String,
      default: null
    },
    ganttName: {
      type: String,
      default: null
    },
    formWidth: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  watch: {
    taskId (val) {
      this.getLinkDatas(this.taskId)
    }
  },
  data () {
    const dataSource = [
      // 单个表单所需的元素对象
      {
        type: 'selectIcon',
        labelText: '',
        labelWidth: '0',
        fieldName: 'type',
        placeHolder: '选择标识',
        colLayout: 'doubleCol',
        optionUrl: {
          noApiOptionsToRender: true,
          label: 'icon',
          value: 'type'
        },
        options: [],
        colSpan: 3
        // eventHandle: { change: 'iconSelectHandle' }
      },
      {
        type: 'treeSelect', // 控件类型--treeSelect 一般用于类似部门树形结构
        labelText: '',
        labelWidth: '0',
        defaultValue: [],
        optionUrl: {
          // api: 'departmentManger.deptTree',
          params: { deptId: '' },
          pId: 'parent', // 平行数据处理成树形数据的依据 -- 值为pId时可以不声明,
          noApiOptionsToRender: true, // 此字段作用: 当选择数据不根据api请求, 但是数据又需要在页面加载完成时进行处理后更新,导致下拉数据不展示. 传递此字段为true
          label: 'name',
          value: 'id'
        },
        fieldName: 'source',
        placeholder: '选择任务',
        colLayout: 'singleCol',
        clearable: true,
        defaultExpandAll: true,
        multiple: false,
        disabled: false,
        checkStrictly: true,
        treeData: [], // 树形控件的某项禁用-- 数据中存在 disabled:true 时直接禁用
        colSpan: 10,
        readonly: false, // input输入筛选数据
        scopedSlots: { customRender: 'custom' },
        eventHandle: { treeSelectClear: 'treeSelectClear' }
      },
      {
        type: 'number',
        labelText: '滞后(天):',
        labelWidth: '80px',
        fieldName: 'lag',
        colLayout: 'doubleCol',
        placeholder: '',
        colSpan: 5
      }
    ]
    return {
      comp: this, // 用来绑定页面上form中元素触发的事件
      ganttLinkResponse: [], // 当前组件展示的表单数据
      dataSource,
      isEmpty: false,
      dataSourceArray: [], // !!! 这是一个二维数组: 每一项都是一个dataSource; 在存在数据渲染的时候需要自己手动更新 dataSourceArray, 并为每一个dataSource(Array)下每一个元素对象定义 'elementOpacity': true
      dialogTitle: '',
      dialogVisible: false,
      oldLinkDatas: [],
      dialogConfig: {
        'close-on-click-modal': false,
        'append-to-body': true
      },
      uploadFiles: [],
      tempOptions: [
        { icon: 'p8 icon-wanchengzhikaishi', type: '0' },
        { icon: 'p8 icon-kaishizhikaishi', type: '1' },
        { icon: 'p8 icon-wanchengzhiwancheng', type: '2' },
        { icon: 'p8 icon-kaishizhiwancheng', type: '3' }
      ],
      statusStyle: [
        { status: '6020', text: '未开始', color: '#f85359' },
        { status: '6050', text: '进行中', color: '#1bbf9e' },
        { status: '6070', text: '已完成', color: '#1890ff' }
      ]
    }
  },
  mounted () {
    this.getLinkDatas(this.taskId)
  },
  methods: {
    getLinkDatas (taskId) {
      const that = this
      this.$api['planGanttManager.getDependenceByTaskId']({ taskId: taskId, planChangeDetailId: this.vueThis.changeRecordId }).then((res) => {
        that.dataSource[0].options = that.tempOptions // 更新default dataSource中下拉框的数据
        that.dataSource[1].treeData = that.vueThis.dependentDatas
        let datas = []
        if (res && Array.isArray(res.ganttLinkResponse) && res.ganttLinkResponse.length > 0) {
          that.isEmpty = false
          that.ganttLinkResponse = res.ganttLinkResponse
          datas = res.ganttLinkResponse
        } else {
          that.isEmpty = true
        }
        // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
        if (
          that.ganttName === 'changeGantt' &&
          JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
          that.vueThis.newTaskMap[taskId] &&
          that.vueThis.newTaskMap[taskId].updateInfo &&
          that.vueThis.newTaskMap[taskId].updateInfo.indexOf('links') !== -1
        ) {
          datas = that.vueThis.newTaskMap[taskId].links
          that.ganttLinkResponse = that.vueThis.newTaskMap[taskId].links
        }
        that.oldLinkDatas = datas
        // 存在已保存的数据, 需对 dataSourceArray 进行处理, 并为元素加上默认属: elementOpacity字段为true
        if (datas && datas.length > 0) {
          datas.forEach((item, index) => {
            that.$set(item, 'target', taskId) // 更新已保存数据中的target
            const dataSourceTemp = this.dataSource.map((ditem) => {
              that.$set(ditem, 'elementOpacity', true)
              return ditem
            })
            that.dataSourceArray.push(JSON.parse(JSON.stringify(dataSourceTemp))) // push中逻辑防止表单数据相互影响
          })
        }
      })
    },
    formAdd (params) {
      // 添加: 重新计算选择逻辑
      this.ganttLinkResponse = params.formToApiData
      this.$set(this.ganttLinkResponse[params.currentIndex], 'target', this.taskId) // 更新对应索引的target
      this.dataSourceArray = params.dataSourceArray
      this.sourceSelectRules()
    },
    formSubmit (params) {
      // 单个form提交回调
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      const thisDp = GanttObject.getDpObject(that.ganttName)
      const task = ganttObject.getTask(that.taskId)
      if (that.ganttName && that.ganttName === 'changeGantt') {
        // 变更逻辑处理
        linksEditCheck(that.oldLinkDatas, params.formToApiData, that.vueThis, task, ganttObject)
        that.oldLinkDatas = that.ganttLinkResponse
      } else {
        const delLink = params.formToApiData[params.currentIndex]
        let message = '保存失败！'
        let type = 'error'
        that.$api['planGanttManager.saveDependence']({ id: delLink.id, taskId: that.taskId })
          .then(function (res) {
            if (res) {
              params.formToApiData.splice(params.currentIndex, 1)
              params.dataSourceArray.splice(params.currentIndex, 1)
              params.formToApiData.push(res)
              that.dataSourceArray.push(res)
              thisDp.ignore(function () {
                ganttObject.addLink(res)
              })
              message = '保存成功！'
              type = 'success'
            }
          })
          .catch(function (error) {
            console.error('error' + error)
          })
        that.$message({
          message: message,
          type: type
        })
      }
    },
    formEdit () {
      // 单个form编辑
      this.sourceSelectRules()
    },
    formDelete (params) {
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      const thisDp = GanttObject.getDpObject(that.ganttName)
      const task = ganttObject.getTask(that.taskId)
      if (that.ganttName && that.ganttName === 'changeGantt') {
        // 变更逻辑处理
        params.formToApiData.splice(params.currentIndex, 1)
        params.dataSourceArray.splice(params.currentIndex, 1)
        that.ganttLinkResponse = params.formToApiData
        that.dataSourceArray = params.dataSourceArray
        linksEditCheck(that.oldLinkDatas, that.ganttLinkResponse, that.vueThis, task, ganttObject)
        that.oldLinkDatas = that.ganttLinkResponse
      } else {
        const delLink = params.formToApiData[params.currentIndex]
        if (delLink.id) {
          let message = '删除失败！'
          let type = 'error'
          that.$api['planGanttManager.removePlanGanttLink']({ id: delLink.id })
            .then(function (res) {
              if (res) {
                params.formToApiData.splice(params.currentIndex, 1)
                params.dataSourceArray.splice(params.currentIndex, 1)
                that.ganttLinkResponse = params.formToApiData
                that.dataSourceArray = params.dataSourceArray
                thisDp.ignore(function () {
                  ganttObject.deleteLink(delLink.id)
                })
                message = '删除成功！'
                type = 'success'
              }
            })
            .catch(function (error) {
              console.error('error' + error)
            })
          that.$message({
            message: message,
            type: type
          })
        } else {
          params.formToApiData.splice(params.currentIndex, 1)
          params.dataSourceArray.splice(params.currentIndex, 1)
          that.ganttLinkResponse = params.formToApiData
          that.dataSourceArray = params.dataSourceArray
        }
      }
    },
    showModal (scope, isView) {
      /**
       * 任务树形选择自定义元素触发的事件
       *    当前行禁用时不能触发事件
       *    disabled 存在Boolean和String两种类型 Boolean[true:禁用, false: 不禁用] String["true":禁用, "false": 不禁用]
       */
      const that = this
      if (!isView) {
        const keys = Object.keys(scope)
        if (keys.indexOf('disabled') !== -1) {
          const value = scope.disabled
          const valueType = typeof value
          if ((valueType === 'boolean' && value) || (valueType === 'string' && value === 'true')) {
            return false
          }
        }
      }
      that.dialogTitle = scope.name || '附件信息'
      that.dialogVisible = true
      that.uploadFiles = []
      that.$api['planGanttManager.outputInfo']({ taskId: scope.id })
        .then(function (res) {
          if (res) {
            let datas = res
            // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
            if (
              (that.ganttName === 'changeGantt' || that.ganttName === 'analysisGantt') &&
              JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
              that.vueThis.newTaskMap[scope.id] &&
              that.vueThis.newTaskMap[scope.id].updateInfo.indexOf('output') !== -1
            ) {
              datas = that.vueThis.newTaskMap[scope.id].output
            }
            if (datas && datas.length > 0) {
              datas.forEach(function (item) {
                if (item.uploadFiles != null && Object.keys(item.uploadFiles).length > 0) {
                  item.uploadFiles.forEach(function (a) {
                    that.uploadFiles.push(a)
                  })
                }
              })
            }
          }
        })
        .catch(function (error) {
          console.error('error' + error)
        })
    },
    renderTaskInfo (scope) {
      /**
       * 任务信息渲染
       */
      const source = scope.source
      const currentSource = this.vueThis.dependentDatas.filter((item) => item.id === source)
      if (!currentSource.length) {
        console.error('依赖关系-view渲染失败')
      }
      const statusInfo = this.statusStyle.filter((item) => item.status === currentSource[0].status)
      if (statusInfo.length) {
        currentSource[0] = { ...currentSource[0], ...statusInfo[0] }
      }
      return currentSource[0]
    },
    treeSelectClear (val, index) {
      this.sourceSelectRules()
    },
    sourceSelectRules () {
      /**
       * 任务选择 校验
       */
      if (this.ganttLinkResponse && this.ganttLinkResponse.length) {
        if (this.ganttLinkResponse.length === 1) {
          this.sourceRulesInitHandle(this.taskId)
        }
        const sourceIds = [this.taskId] // 默认taskId
        const sourceParents = []
        this.ganttLinkResponse.forEach((item, index) => {
          const sourceId = item.source
          if (sourceId) {
            sourceIds.push(sourceId)
          }
          this.dataSourceArray.forEach((dataSourceItem, dataSourceIndex) => {
            const treeData = dataSourceItem[1].treeData // 获取单个dataSource中treeSelect的下拉数据
            treeData.forEach((treeItem, treeIndex) => {
              // 校验附件
              const ganttObject = GanttObject.getGanttObject(this.ganttName)
              if (ganttObject.getTask(treeItem.id)) {
                const task = ganttObject.getTask(treeItem.id)
                treeItem.hasAtt = task.hasAtt && task.hasAtt > 0 ? 'true' : 'false'
              }
              /**
               * 任务本身 和 任务本身下的子任务 以及 任务的直线父级, 当前任务的前置任务的所有子 不可选
               */
              this.$set(treeItem, 'disabled', Object.keys(treeItem).indexOf('disabled') !== -1 ? treeItem.disabled : false)
              if (sourceParents.indexOf(treeItem.id) !== -1 && sourceParents.indexOf(treeItem.parent) === -1) {
                sourceParents.push(treeItem.parent)
              }
              if (sourceIds.indexOf(treeItem.id) !== -1 || sourceIds.indexOf(treeItem.parent) !== -1 || sourceParents.indexOf(treeItem.id) !== -1) {
                this.$set(treeItem, 'disabled', true)
              }
              if (sourceIds.indexOf(treeItem.id) !== -1 && sourceParents.indexOf(treeItem.parent) === -1) {
                sourceParents.push(treeItem.parent)
              }
            })
          })
        })
      }
    },
    sourceRulesInitHandle (id) {
      // 初次tree处理
      if (!id) {
        return
      }
      const treeData = this.dataSourceArray[0][1].treeData
      const filterTreeItem = treeData.filter((item) => item.id === id)
      if (filterTreeItem && filterTreeItem.length) {
        this.$set(filterTreeItem[0], 'disabled', true)
        this.sourceRulesInitHandle(filterTreeItem[0].parent)
      }
    }
  }
}
</script>
