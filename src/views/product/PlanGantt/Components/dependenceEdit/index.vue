<template>
  <div style="width: 100%;heigth: 100%;">
    <form2 ref="form"
           :comp="comp"
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
        <span>{{ renderTaskViewInfo(scope) }}</span>
        <span>
          <!-- <i class="el-icon-paperclip"></i> -->
        </span>
        <span style="background: #999; padding: 2px 8px; margin-left: 10px">{{ renderTaskStatusHandle(scope) }}</span>
      </template>
    </form2>
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
        colSpan: 3,
        rules: [
          {
            required: true
          }
        ]
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
        colSpan: 7,
        readonly: false, // input输入筛选数据
        scopedSlots: { customRender: 'custom' },
        rules: [
          {
            required: true
          }
        ],
        eventHandle: { treeSelectClear: 'treeSelectClear' }
      },
      {
        type: 'number',
        labelText: '滞后(天):',
        labelWidth: '80px',
        fieldName: 'lag',
        colLayout: 'doubleCol',
        placeholder: '',
        colSpan: 7
      }
    ]
    return {
      comp: this, // 用来绑定页面上form中元素触发的事件
      ganttLinkResponse: [], // 当前组件展示的表单数据
      dataSource,
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
        { icon: 'p8 icon-wanchengzhikaishi', type: '0', describe: '完成-开始' },
        { icon: 'p8 icon-kaishizhikaishi', type: '1', describe: '开始-开始' },
        { icon: 'p8 icon-wanchengzhiwancheng', type: '2', describe: '完成-完成' },
        { icon: 'p8 icon-kaishizhiwancheng', type: '3', describe: '开始-完成' }
      ]
    }
  },
  mounted () {
    this.getLinkDatas(this.taskId)
  },
  methods: {
    getLinkDatas (taskId) {
      const that = this
      this.$api['planGanttManager.getDependenceByTaskId']({ taskId: taskId }).then((res) => {
        that.dataSource[0].options = that.tempOptions // 更新default dataSource中下拉框的数据
        that.dataSource[1].treeData = that.vueThis.dependentDatas
        let datas = []
        if (res && res.ganttLinkResponse.length > 0) {
          res.ganttLinkResponse.forEach(function (item) {
            datas.push(item)
          })
          that.ganttLinkResponse = datas
        }
        // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
        if (
          that.ganttName === 'changeGantt' &&
          JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
          that.vueThis.newTaskMap &&
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
      this.$set(this.ganttLinkResponse[params.currentIndex], 'issubmit', true)
      this.$nextTick(() => {
        this.$forceUpdate()
      })
      if (that.ganttName && that.ganttName === 'changeGantt') {
        // 变更逻辑处理
        linksEditCheck(that.oldLinkDatas, params.formToApiData, that.vueThis, task, ganttObject)
        that.oldLinkDatas = that.ganttLinkResponse
        that.vueThis.hasSave = true
      } else {
        const delLink = params.formToApiData[params.currentIndex]
        that.$api['planGanttManager.saveDependence']({ id: delLink.id, target: that.taskId, source: delLink.source, type: delLink.type, lag: delLink.lag })
          .then(function (res) {
            if (res) {
              that.ganttLinkResponse[params.currentIndex].id = res.id // 保存: 将返回信息中的ID回填给form数据便于数据过滤
              thisDp.ignore(function () {
                if (delLink.id) {
                  const link = ganttObject.getLink(delLink.id)
                  link.source = res.source
                  link.type = res.type
                  link.lag = res.lag
                  ganttObject.updateLink(delLink.id)
                } else {
                  ganttObject.addLink(res)
                }
              })
              if (that.vueThis.ganttName === 'changeGantt') {
                GanttObject.updateTaskNew(ganttObject, that.taskId, that.vueThis)
              } else {
                ganttObject.updateTask(that.taskId)
              }
              params.formToApiData[params.currentIndex] = { ...delLink, ...res }
              that.showMessage('保存成功！', 'success')
            } else {
              that.showMessage('保存失败！', 'error')
            }
          })
          .catch(function (error) {
            console.error('error' + error)
            that.showMessage('保存失败！', 'error')
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
                that.showMessage('删除成功！', 'success')
              } else {
                that.showMessage('删除失败！', 'error')
              }
            })
            .catch(function (error) {
              console.error('error' + error)
              that.showMessage('删除失败！', 'error')
            })
        } else {
          params.formToApiData.splice(params.currentIndex, 1)
          params.dataSourceArray.splice(params.currentIndex, 1)
          that.ganttLinkResponse = params.formToApiData
          that.dataSourceArray = params.dataSourceArray
        }
      }
    },
    showModal (scope) {
      /**
       * 任务树形选择自定义元素触发的事件
       *    当前行禁用时不能触发事件
       *    disabled 存在Boolean和String两种类型 Boolean[true:禁用, false: 不禁用] String["true":禁用, "false": 不禁用]
       */
      const that = this
      const keys = Object.keys(scope)
      if (keys.indexOf('disabled') !== -1) {
        const value = scope.disabled
        const valueType = typeof value
        if ((valueType === 'boolean' && value) || (valueType === 'string' && value === 'true')) {
          return false
        }
      }
      that.dialogTitle = scope.name
      that.dialogVisible = true
      that.uploadFiles = []
      that.$api['planGanttManager.outputInfo']({ taskId: scope.id })
        .then(function (res) {
          if (res) {
            let datas = res
            // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
            if (
              that.ganttName === 'changeGantt' &&
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
    renderTaskViewInfo (scope) {
      /**
       * 任务名称渲染
       */
      const source = scope.source
      const currentSource = this.vueThis.dependentDatas.filter((item) => item.id === source)
      return currentSource[0].name
    },
    renderTaskStatusHandle (scope) {
      /**
       * 任务状态渲染
       */
      const sourceId = scope.source
      let status
      const currentSource = this.vueThis.dependentDatas.filter((item) => item.id === sourceId)
      if (currentSource.length) {
        status = currentSource[0].status
      }
      if (status) {
        return '未开始'
      }
    },
    treeSelectClear (val, index) {
      this.sourceSelectRules()
    },
    sourceSelectRules () {
      /**
       * 任务选择 校验 17785182267ee7de7633c8abfbdb974e
       */
      if (this.ganttLinkResponse && this.ganttLinkResponse.length) {
        if (this.ganttLinkResponse.length === 1) {
          this.sourceRulesInitHandle(this.taskId)
        }
        const sourceIds = [this.taskId] // 默认taskId
        const sourceParents = []
        const currSourceLinkIdParents = ['17785182267ee7de7633c8abfbdb974e'] // 当前任务的前置 初始为前置父, 判断时会push下面子的id
        const currSourceLinkChilds = [] // 当前任务的前置的子任务id
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
               * 任务本身 和 任务本身下的子任务 以及 任务的直线父级 不可选
               */
              this.$set(treeItem, 'disabled', Object.keys(treeItem).indexOf('disabled') !== -1 ? treeItem.disabled : false)
              if (currSourceLinkIdParents.indexOf(treeItem.parent) > -1) {
                currSourceLinkIdParents.push(treeItem.id)
                currSourceLinkChilds.push(treeItem.id)
              }
              if (sourceParents.indexOf(treeItem.id) !== -1 && sourceParents.indexOf(treeItem.parent) === -1) {
                sourceParents.push(treeItem.parent)
              }
              if (sourceIds.indexOf(treeItem.id) !== -1 || sourceIds.indexOf(treeItem.parent) !== -1 || sourceParents.indexOf(treeItem.id) !== -1 || currSourceLinkChilds.indexOf(treeItem.id) !== -1) {
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
    },
    showMessage (message, type) {
      this.$message({
        message: message,
        type: type
      })
    }
  }
}
</script>
