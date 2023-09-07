<template>
  <div>
    <form-list ref="form" @rendered="rendered" :data-source="dataSource" :form="modifyData" :is-view="true">
      <!--<template #icons v-if="icon" >
              <a-tag color="blue">
                  <a-icon :type="icon" > </a-icon>
              </a-tag>
    </template> -->
    </form-list>
  </div>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'PlanMonitorDetails',
  components: {
    FormList
  },
  props: {
    record: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      advanced: false,
      queryParam: {},
      dataList: [],
      icon: '',
      constantMarkType: '',
      dataSource: [
        {
          type: 'view',
          fieldName: 'pointName',
          labelText: '标识名称',
          placeholder: '请输入标识名称',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '图标',
          slotName: 'icons',
          colLayout: 'singleCol'
        },
        {
          labelText: '排序号',
          type: 'view',
          fieldName: 'indexNo',
          placeholder: '请输入排序号',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '时间控制', // 提示信息：“时间控制”为开启状态时，该标识在任务中使用时，将需要能够单独保存开始和结束时间，与任务开始和结束时间为两套时间。
          fieldName: 'controlTimeType',
          defaultValue: '1',
          colLayout: 'doubleCol',
          options: [
            {
              label: '是',
              value: '0'
            },
            {
              label: '否',
              value: '1'
            }
          ]
        },
        {
          type: 'view',
          labelText: '固定标识', // 提示信息：“固定标识”为开启状态时，该标识不可删除。一般是由于实施阶段进行二次开发，需要强制通过ID操作标识。
          fieldName: 'constantMarkType',
          colLayout: 'singleCol',
          options: [
            {
              label: '是',
              value: '0'
            },
            {
              label: '否',
              value: '1'
            }
          ]
        },
        {
          type: 'view',
          fieldName: 'constantMarkReason',
          labelText: '固定原因',
          placeholder: '请输入固定原因',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '项目类型',
          defaultValue: [],
          fieldName: 'monitorPointClassifyIds',
          placeholder: '请选择项目类型',
          colLayout: 'singleCol',
          multiple: true,
          treeData: []
        },
        {
          labelText: '系统角色',
          type: 'view',
          fieldName: 'monitorPointRoleIds',
          options: [],
          colLayout: 'singleCol',
          defaultValue: []
        },
        {
          labelText: '依赖标识', // 提示信息:依赖标识是指在计划编辑时，当某任务已经选择了依赖标识后该标识才可以选择，任务取消依赖标识时，给予确认框提示依赖关系后，选择确定删除的情况下该标识自动取消，该属性的编辑关系为单项关系。
          type: 'view',
          fieldName: 'monitorPointRelyIds',
          options: [],
          colLayout: 'singleCol',
          defaultValue: []
        },
        {
          labelText: '互斥标识', // 提示信息：互斥标识指在计划编辑时，当某任务已经选择了该标识互斥列表中的标识时，该标识不可被选择，该属性的编辑关系为双向关系。例:A与B为互斥关系，修改A或修改B时，都应显示可编辑该关系。
          type: 'view',
          fieldName: 'monitorPointMutexIds',
          options: [],
          colLayout: 'singleCol',
          defaultValue: []
        },
        {
          type: 'view', // 控件类型
          fieldName: 'describes',
          labelText: '标识描述',
          placeholder: '请输入标识描述',
          colLayout: 'singleCol'
        }
      ],
      modifyData: [],
      monitorPoint: [],
      monitorPointMutexId: []
    }
  },
  mounted() {},
  methods: {
    rendered() {
      this.fetch(this.record)
      if (this.record.id && this.record.id !== '') {
        this.getPlanLogoData(this.record)
      }
    },
    tableRefresh(param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.error('异步失败的操作')
        })
    },
    fetch(record) {
      const that = this
      that.monitorPointMutexId = [] // 互斥标识
      that.$api['PlanMonitor.getMonitorPointData']({ checkId: record.id }).then((res) => {
        const data = res
        that.monitorPoint = data
      })
    },
    getPlanLogoData(record) {
      const that = this
      that.modifyData = that.deepClone(record)
      that.modifyData.id = record.id
      that.modifyData.pointName = record.name
      that.icon = record.icon
      if (that.modifyData.constantMarkType === '0') {
        that.modifyData.constantMarkType = '是'
        that.dataSource[5].type = 'view'
      } else if (that.modifyData.constantMarkType === '1') {
        that.modifyData.constantMarkType = '否'
        that.dataSource[5].type = 'hidden'
      }
      if (that.modifyData.controlTimeType === '0') {
        that.modifyData.controlTimeType = '是'
      } else if (that.modifyData.controlTimeType === '1') {
        that.modifyData.controlTimeType = '否'
      }

      that.modifyData.monitorPointClassifyId = [] // 项目类型
      if (record.monitorPointClassifyList.length === 0) {
        that.modifyData.monitorPointClassifyIds = ''
      } else {
        record.monitorPointClassifyList.forEach(function (item) {
          that.modifyData.monitorPointClassifyId.push(item.kProjectClassify.name)
          that.modifyData.monitorPointClassifyIds = that.modifyData.monitorPointClassifyId.toString()
        })
      }
      that.modifyData.monitorPointRoleId = [] // 系统角色
      if (record.monitorPointRoleList.length === 0) {
        that.modifyData.monitorPointRoleIds = ''
      } else {
        record.monitorPointRoleList.forEach(function (item) {
          that.modifyData.monitorPointRoleId.push(item.role.name)
          that.modifyData.monitorPointRoleIds = that.modifyData.monitorPointRoleId.toString()
        })
      }
      that.modifyData.monitorPointRelyId = [] // 依赖标识
      that.modifyData.monitorPointMutexId = [] // 互斥标识
      that.$api['PlanMonitor.getMonitorPointData']({ checkId: record.id }).then((res) => {
        const data = res
        that.monitorPoint = data
        if (record.monitorPointRelyList.length === 0) {
          that.modifyData.monitorPointRelyIds = ''
        } else {
          record.monitorPointRelyList.forEach(function (item) {
            for (let i = 0; i < that.monitorPoint.length; i++) {
              if (item.monitorPointRely.id === that.monitorPoint[i].value) {
                that.modifyData.monitorPointRelyId.push(that.monitorPoint[i].label)
                that.modifyData.monitorPointRelyIds = that.modifyData.monitorPointRelyId.toString()
              }
            }
          })
        }
        if (record.monitorPointMutexList.length === 0) {
          that.modifyData.monitorPointMutexIds = ''
        } else {
          record.monitorPointMutexList.forEach(function (item) {
            for (let i = 0; i < that.monitorPoint.length; i++) {
              if (item.monitorPointMutex.id === that.monitorPoint[i].value) {
                that.modifyData.monitorPointMutexId.push(that.monitorPoint[i].label)
                that.modifyData.monitorPointMutexIds = that.modifyData.monitorPointMutexId.toString()
              }
            }
          })
        }
        that.$refs.form.setViewFields(that.modifyData)
      })
    },
    deepClone(obj) {
      const cloneObj = {} // 在堆内存中新建一个对象
      for (const key in obj) {
        // 遍历参数的键
        if (typeof obj[key] === 'object') {
          cloneObj[key] = this.deepClone(obj[key]) // 值是对象就再次调用函数
        } else {
          cloneObj[key] = obj[key] // 基本类型直接复制值
        }
      }
      return cloneObj
    }
  }
}
</script>
