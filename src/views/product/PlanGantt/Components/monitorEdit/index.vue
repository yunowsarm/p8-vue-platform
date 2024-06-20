<template>
  <div style="position: relative; overflow-y: auto; overflow-x: hidden">
    <form2
      :comp="comp"
      :form-to-api-data="monitorManagerRequests"
      :data-source="dataSource"
      :data-source-array="dataSourceArray"
      add-btn-name="添加新标识"
      @form-add="formAdd"
      @form-submit="formSubmit"
      @form-edit="formEdit"
      @form-delete="formDelete"
    >
      <template #logBeginTimeView="{ scope }">
        <span>{{ scope.logBeginTime }}{{ scope.logBeginTime || scope.logEndTime ? '~' : '' }}{{ scope.logEndTime }}</span>
      </template>
    </form2>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import Form2 from '../form2'
import moment from 'moment'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import { monitorPointsEditCheck } from '@/assets/commonJS/ganttJS/changeGantt'
export default {
  name: 'MonitorEdit',
  components: {
    Form2
  },
  props: {
    taskId: {
      type: String,
      default: null
    },
    ganttName: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'taskStatusLockMap', 'planStatusLockMap'])
  },
  data() {
    const dataSource = [
      // 单个表单所需的元素对象
      {
        labelText: '',
        labelWidth: '0',
        fieldName: 'monitorId',
        placeHolder: '选择标识',
        colLayout: 'doubleCol',
        optionUrl: {
          noApiOptionsToRender: true, // 此字段作用: 当选择数据不根据api请求, 但是数据又需要在页面加载完成时进行处理后更新,导致下拉数据不展示. 传递此字段为true
          label: 'icon',
          value: 'id'
        },
        options: [],
        rules: [
          {
            required: true
          }
        ],
        type: 'selectIcon', // select选择图标
        colSpan: 3, // 元素所占宽度
        eventHandle: { change: 'iconSelectHandle' } // 当前元素触发的事: key-elementUI提供的事件名, value-当前页面绑定事件的方法
      },
      {
        type: 'datetime',
        labelText: '开始时间:',
        fieldName: 'logBeginTime',
        colLayout: 'doubleCol',
        placeholder: '计划开始时间',
        rules: [
          {
            required: true,
            message: '选择'
          }
        ],
        colSpan: 7.5, // 元素所占宽度
        elementOpacity: true, // 表单中的元素是否显示
        scopedSlots: {
          customRender: 'custom'
        },
        eventHandle: { change: 'beginDateChangeHandle' } // 当前元素触发的事件: key-elementUI提供的事件名, value-当前页面绑定事件的方法
      },
      {
        type: 'datetime',
        labelText: '完成时间:',
        fieldName: 'logEndTime',
        colLayout: 'doubleCol',
        placeholder: '计划完成时间',
        fieldConfig: {},
        rules: [
          {
            required: true,
            message: '选择'
          },
          {
            validator: () => {}
          }
        ],
        colSpan: 7.5, // 元素所占宽度
        elementOpacity: true, // 元素是否显示
        eventHandle: { change: 'endDateChangeHandle' } // 当前元素触发的事件: key-elementUI提供的事件名, value-当前页面绑定事件的方法
      }
    ]
    return {
      comp: this, // 用来绑定页面上form中元素触发的事件
      dataSource,
      dataSourceArray: [], // !!! 这是一个二维数组: 每一项都是一个dataSource; 在存在数据渲染的时候需要自己手动更新 dataSourceArray, 并为每一个dataSource(Array)下每一个元素对象定义 'elementOpacity': true
      monitorManagerRequests: [], // 当前组件展示的表单数据
      oldMonitorDatas: []
    }
  },

  mounted() {
    this.getMonitorData(this.taskId)
  },
  methods: {
    getMonitorData(taskId) {
      const that = this
      this.$api['planGanttManager.getTaskMonitorByTaskId']({ taskId: taskId }).then((res) => {
        that.dataSource[0].options = that.vueThis.monitorPointDatas // 更新default dataSource中下拉框的数据
        let datas = []
        if (res && res.monitorManagerResponses) {
          that.monitorManagerRequests = res.monitorManagerResponses
          datas = res.monitorManagerResponses
        }
        // 变更进入时先查看newTaskMap中是否存在对应值若存在，显示，否则加载任务描述数据
        if (
          that.ganttName === 'changeGantt' &&
          JSON.stringify(that.vueThis.newTaskMap) !== '{}' &&
          that.vueThis.newTaskMap[taskId] &&
          that.vueThis.newTaskMap[taskId].updateInfo &&
          that.vueThis.newTaskMap[taskId].updateInfo.indexOf('monitors') !== -1
        ) {
          that.monitorManagerRequests = that.vueThis.newTaskMap[taskId].monitors
          datas = that.vueThis.newTaskMap[taskId].monitors
        }
        that.oldMonitorDatas = datas
        // 存在已保存的标识数据, 需对 dataSourceArray 进行处理, 并为元素加上默认属: elementOpacity字段为true
        if (datas && datas.length > 0) {
          datas.forEach((item, index) => {
            const dataSourceTemp = this.dataSource.map((ditem) => {
              that.$set(ditem, 'elementOpacity', true)
              if (ditem.fieldName === 'logBeginTime') {
                ditem.colSpan = 14
                ditem.labelText = '时间'
              }
              if (ditem.fieldName === 'logEndTime') {
                ditem.colSpan = 0
                ditem.elementOpacity = false
              }
              return ditem
            })
            that.dataSourceArray.push(JSON.parse(JSON.stringify(dataSourceTemp)))
            // 对已有的保存数据 进行元素之间联动显示的逻辑
            that.iconSelectHandle(item.monitorId, index)
          })
        }
        this.monitorSelectRules()
      })
    },
    formAdd(params) {
      // from 添加
      this.monitorManagerRequests = params.formToApiData
      this.dataSourceArray = params.dataSourceArray
      this.dataSourceTimeChange('0', params.currentIndex)
      this.monitorSelectRules()
    },
    formSubmit(params) {
      // 单个form提交回调
      const that = this
      that.monitorManagerRequests = params.formToApiData
      that.dataSourceArray = params.dataSourceArray
      that.dataSourceTimeChange('1', params.currentIndex)
      if (that.ganttName) {
        const ganttObject = GanttObject.getGanttObject(that.ganttName)
        const task = ganttObject.getTask(that.taskId)
        if (that.ganttName === 'changeGantt') {
          // 变更逻辑处理
          monitorPointsEditCheck(that.oldMonitorDatas, that.monitorManagerRequests, that.vueThis, task, ganttObject)
          that.oldMonitorDatas = that.monitorManagerRequests
          that.vueThis.hasSave = true
        } else {
          const dp = GanttObject.getDpObject(that.ganttName)
          const addMon = params.formToApiData[params.currentIndex]
          that.$api['planGanttManager.monitorTimeSave']({ id: addMon.id, taskId: that.taskId, monitorId: addMon.monitorId, logBeginTime: addMon.logBeginTime, logEndTime: addMon.logEndTime })
            .then(function (res) {
              if (res) {
                that.monitorManagerRequests[params.currentIndex].id = res.id // 保存: 将返回信息中的ID回填给form数据便于数据过滤
                dp.ignore(function () {
                  if (that.monitorManagerRequests && that.monitorManagerRequests.length > 0) {
                    let ms = ''
                    that.monitorManagerRequests.forEach(function (item) {
                      ms += item.monitorId + ','
                    })
                    task.monitorPoints = ms.substring(0, ms.length - 1)
                  } else {
                    task.monitorPoints = ''
                  }
                  ganttObject.updateTask(task.id)
                })
                that.$message({
                  message: '保存成功！',
                  type: 'success'
                })
              } else {
                that.$message({
                  message: '保存失败！',
                  type: 'error'
                })
              }
            })
            .catch(function (error) {
              console.error('error' + error)
              that.$message({
                message: '保存失败！',
                type: 'error'
              })
            })
        }
      }
    },
    formEdit(params) {
      // 单个form编辑
      // 测试提出问题: 保存后的开始时间与结束时间合并至一起 处理
      this.dataSourceTimeChange('0', params.currentIndex)

      this.monitorSelectRules()
    },
    formDelete(params) {
      const that = this
      const ganttObject = GanttObject.getGanttObject(that.ganttName)
      const thisDp = GanttObject.getDpObject(that.ganttName)
      const task = ganttObject.getTask(that.taskId)
      if (that.ganttName && that.ganttName === 'changeGantt') {
        params.formToApiData.splice(params.currentIndex, 1)
        params.dataSourceArray.splice(params.currentIndex, 1)
        that.monitorManagerRequests = params.formToApiData
        that.dataSourceArray = params.dataSourceArray
        // 变更逻辑处理
        monitorPointsEditCheck(that.oldMonitorDatas, that.monitorManagerRequests, that.vueThis, task, ganttObject)
        that.oldMonitorDatas = that.monitorManagerRequests
      } else {
        const delMon = params.formToApiData[params.currentIndex]
        if (delMon.monitorId) {
          that.$api['planGanttManager.monitorTimeRemove']({ monitorId: delMon.monitorId, taskId: that.taskId })
            .then(function (res) {
              if (res && res === 'true') {
                params.formToApiData.splice(params.currentIndex, 1)
                params.dataSourceArray.splice(params.currentIndex, 1)
                that.monitorManagerRequests = params.formToApiData
                that.dataSourceArray = params.dataSourceArray
                thisDp.ignore(function () {
                  if (params.formToApiData && params.formToApiData.length > 0) {
                    const newM = []
                    params.formToApiData.forEach(function (item) {
                      newM.push(item.monitorId)
                    })
                    task.monitorPoints = newM.join(',')
                  } else {
                    task.monitorPoints = null
                  }
                  ganttObject.updateTask(that.taskId)
                })
                that.$message({
                  message: '删除成功！',
                  type: 'success'
                })
              } else {
                that.$message({
                  message: '删除失败！',
                  type: 'error'
                })
              }
            })
            .catch(function (error) {
              console.error('error' + error)
              that.$message({
                message: '删除失败！',
                type: 'error'
              })
            })
        } else {
          params.formToApiData.splice(params.currentIndex, 1)
          params.dataSourceArray.splice(params.currentIndex, 1)
          that.monitorManagerRequests = params.formToApiData
          that.dataSourceArray = params.dataSourceArray
        }
      }
    },
    iconSelectHandle(val, index) {
      // 图标选择器 select change事件
      /**
       * iconSelectHandle: select change事件
       *    val: 当前选中的值
       *    index: 对应页面form数据源[monitorManagerRequests] 和 元素数据源[dataSourceArray] 的索引
       */
      const currentFromDataSource = this.dataSourceArray[index]
      const monitorIconObj = currentFromDataSource[0]
      if (!val) {
        this.$set(currentFromDataSource[1], 'elementOpacity', true)
        this.$set(currentFromDataSource[2], 'elementOpacity', true)
        this.monitorSelectRules()
        return
      }
      const rules = { 1: false, 0: true }
      const controlInfo = monitorIconObj.options.filter((item) => item[monitorIconObj.optionUrl.value] === val)
      if (!rules[controlInfo[0].controlTimeType]) {
        this.monitorManagerRequests[index].logBeginTime = ''
        this.monitorManagerRequests[index].logEndTime = ''
      }
      this.$set(currentFromDataSource[1], 'elementOpacity', rules[controlInfo[0].controlTimeType])
      this.$set(currentFromDataSource[2], 'elementOpacity', rules[controlInfo[0].controlTimeType])
    },
    beginDateChangeHandle(val, index) {
      /**
       * 开始时间 校验
       */
      const currentFormInfo = this.monitorManagerRequests[index]
      if (!currentFormInfo.logEndTime) {
        return ''
      }
      if (moment(val).isAfter(moment(currentFormInfo.logEndTime))) {
        this.$message({
          message: '开始日期不得晚于结束日期',
          type: 'warning'
        })
        currentFormInfo.logBeginTime = ''
      }
    },
    endDateChangeHandle(val, index) {
      /**
       * 完成时间 校验
       */
      const currentFormInfo = this.monitorManagerRequests[index]
      if (!currentFormInfo.logBeginTime) {
        return ''
      }
      if (moment(val).isBefore(moment(currentFormInfo.logBeginTime))) {
        this.$message({
          message: '开始日期不得晚于结束日期',
          type: 'warning'
        })
        currentFormInfo.logEndTime = ''
      }
    },
    monitorSelectRules() {
      /**
       * 标识校验规则
       */
      if (this.monitorManagerRequests && this.monitorManagerRequests.length) {
        const monitorIds = []
        this.monitorManagerRequests.forEach((item, index) => {
          if (item.monitorId) {
            monitorIds.push(item.monitorId)
            if (this.vueThis.monitorLockMap[item.monitorId] === '1') {
              this.$set(item, 'notedit', true)
            }
          }
          const monitorIdsStr = monitorIds.join(',')
          /**
           * 标识的限制
           *    1. 唯一性: 已存在A标识, 则A标识在其他form中不可选
           *    2. 依赖性: B标识依赖A标识, 只有存在A标识时, B标识才可选
           *    3. 互斥性: C标识与B标识互斥, 存在B标识时, C标识不可选
           */
          this.dataSourceArray.forEach((dataSourceItem, dataSourceIndex) => {
            const monitorOptions = dataSourceItem[0].options // 获取单个dataSource中的图标选择数据
            monitorOptions.forEach((pointItem) => {
              this.$set(pointItem, 'disabled', false)
              if (
                monitorIdsStr.indexOf(pointItem.id) !== -1 ||
                (pointItem.relyIds && pointItem.relyIds.indexOf(monitorIdsStr) === -1) ||
                (pointItem.mutexIds && pointItem.mutexIds.indexOf(monitorIdsStr) !== -1)
              ) {
                this.$set(pointItem, 'disabled', true)
              }
              if (this.vueThis.monitorLockMap[pointItem.id] === '1') {
                // 标识加锁, 则直接禁用
                this.$set(pointItem, 'disabled', true)
              }
            })
          })
        })
      }
    },
    dataSourceTimeChange(type, currentIndex) {
      if (type === '0') {
        this.dataSourceArray[currentIndex][1].colSpan = 8
        this.dataSourceArray[currentIndex][1].labelText = '开始时间'
        this.dataSourceArray[currentIndex][2].colSpan = 8
        // this.dataSourceArray[currentIndex][2].elementOpacity = true
      } else {
        // 测试提出问题: 保存后的开始时间与结束时间合并至一起 处理
        this.dataSourceArray[currentIndex][1].colSpan = 16
        this.dataSourceArray[currentIndex][1].labelText = '时间'
        this.dataSourceArray[currentIndex][2].colSpan = 0
        this.dataSourceArray[currentIndex][2].elementOpacity = false
      }
    }
  }
}
</script>
