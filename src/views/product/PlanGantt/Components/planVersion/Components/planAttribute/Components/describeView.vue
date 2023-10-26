<template>
  <div style="position: relative;height: 600px;">
    <form-list ref="form"
               @rendered="rendered"
               form-layout="vertical"
               :dataSource="dataSource"
               :api="saveApi"
               :other-param="otherParam"
               :exist-default-btn="existDefaultBtn"
               :exist-custom-btn="existCustomBtn"
               :form="formData">
    </form-list>
  </div>
</template>
<style scoped>
</style>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'PlanDescribeView',
  components: {
    FormList
  },
  props: {
    taskId: {
      type: String,
      default: null
    },
    versionType: {
      type: String,
      default: null
    },
    versionId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      saveApi: '',
      existDefaultBtn: false,
      existCustomBtn: true,
      dataSource: [
        {
          labelText: '任务名称',
          type: 'view',
          fieldName: 'name',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '责任人',
          fieldName: 'ownerName',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '完成形式',
          fieldName: 'completeForm',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '计量单位',
          fieldName: 'measurementUnit',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '数量',
          fieldName: 'quantity',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '工期',
          fieldName: 'duration',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '计划开始时间',
          fieldName: 'startDate',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '计划完成时间',
          fieldName: 'endDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '预计开始时间',
          type: 'view',
          fieldName: 'forecastBeginDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '预计完成时间',
          type: 'view',
          fieldName: 'forecastEndDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '实际开始时间',
          type: 'view',
          fieldName: 'realBeginDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '实际完成时间',
          type: 'view',
          fieldName: 'realEndDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '任务描述',
          type: 'view',
          fieldName: 'describes'
        },
        {
          labelText: '备注',
          type: 'view',
          fieldName: 'remark'
        }
      ],
      formData: {},
      otherParam: {
        activityInfoId: ''
      }
    }
  },
  watch: {
    taskId (val) {
      this.rendered()
    }
  },
  computed: {

  },
  mounted () {

  },
  methods: {
    rendered () {
      if (this.taskId && this.taskId !== '') {
        this.getDescribeData()
      }
    },
    getDescribeData () {
      let that = this
      // 获取描述信息
      that.$api['planGanttManager.getDescribesVersionData']({ taskId: that.taskId, versionId: that.versionId, versionType: that.versionType }).then(function (res) {
        if (res) {
          that.formData = Object.assign({}, res)
        }
      }).catch(function (error) {
        console.error('error' + error)
      })
    }
  }
}
</script>
