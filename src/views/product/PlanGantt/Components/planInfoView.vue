<template>
  <div>
    <form-list ref="form" @rendered="rendered" :form="formData" :data-source="dataSource" :other-param="otherParam" :exist-default-btn="false"> </form-list>
  </div>
</template>
<script>
import moment from 'moment'
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'PlanView',
  components: {
    FormList
  },
  props: {
    planInfoId: [String, Object],
    businessKey: String
  },
  data() {
    return {
      labelWidth: 'auto',
      dataSource: [
        {
          type: 'view',
          labelText: '项目',
          slotName: 'select-project',
          fieldName: 'name',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '计划编号',
          fieldName: 'planCode',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '计划密级',
          fieldName: 'secretGrades',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '专题计划',
          fieldName: 'specialPlanDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '计划名称',
          fieldName: 'planName',
          colLayout: 'singleCol'
        },

        {
          type: 'view',
          labelText: '计划开始时间',
          fieldName: 'beginTime',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '计划完成时间',
          fieldName: 'endTime',
          colLayout: 'doubleCol'
        },
        // {
        //   type: 'view',
        //   labelText: '预计起始时间',
        //   fieldName: 'forecastBeginTime',
        //   colLayout: 'doubleCol'
        // },
        // {
        //   type: 'view',
        //   labelText: '预计完成时间',
        //   fieldName: 'forecastEndTime',
        //   colLayout: 'doubleCol'
        // },
        {
          type: 'view',
          labelText: '排序号',
          fieldName: 'indexNo',
          colLayout: 'singleCol'
        }
      ],
      otherParam: {},
      modify: {},
      formData: {}
    }
  },
  methods: {
    rendered() {
      const that = this
      if (that.planInfoId || that.businessKey) {
        const params = that.planInfoId || { planInfoId: that.businessKey }
        this.$api['planInfoManager.getPlanInfo'](params)
          .then(function (res) {
            if (res) {
              that.formData.name = res.name
              that.formData.planCode = res.planCode
              that.formData.planName = res.planName
              that.formData.dutyGroupName = res.dutyGroupName
              that.formData.indexNo = res.indexNo
              that.formData.groupL = res.groupL
              that.formData.groupLF = res.groupLF
              that.formData.dispatcher = res.dispatcher
              that.formData.dispatcherF = res.dispatcherF
              that.formData.member = res.member
              that.formData.secretGrades = res.secretGrades
              that.formData.specialPlanDisplay = res.specialPlanDisplay
              that.formData.beginTime = moment(res.planBeginDate).format('YYYY-MM-DD')
              that.formData.endTime = moment(res.planEndDate).format('YYYY-MM-DD')
              // that.formData.forecastBeginTime = moment(res.forecastBeginDate).format('YYYY-MM-DD')
              // that.formData.forecastEndTime = moment(res.forecastEndDate).format('YYYY-MM-DD')
              that.formData = Object.assign({}, that.formData)
            }
          })
          .catch(function (error) {
            console.error(error)
          })
      }
    },
    closeModal() {
      this.selectProjectVisible = false
    }
  },
  watch: {
    planInfoId() {
      this.rendered()
    }
  }
}
</script>
