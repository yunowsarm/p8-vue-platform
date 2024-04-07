<template>
  <form-list ref="form"
             :dataSource="dataSource"
             :existDefaultBtn="false"
             :existCustomBtn="true"
             :form="formData">
    <template #customBtn>
      <el-button @click="cancel">关 闭</el-button>
    </template>
  </form-list>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'ActivityDesc',
  inject: ['getPlanInfo'],
  components: {
    FormList
  },
  props: {
    activityDescData: {
      type: Array
    }
  },
  data () {
    const dataSource = [
      {
        type: 'view',
        labelText: '任务名称',
        fieldName: 'name',
        colLayout: 'singleCol'
      },
      {
        type: 'view',
        labelText: '计划开始时间',
        fieldName: 'planBeginDate',
        colLayout: 'doubleCol'
      },
      {
        type: 'view',
        labelText: '计划完成时间',
        fieldName: 'planEndDate',
        colLayout: 'doubleCol'
      },
      {
        type: 'view',
        labelText: '排程类型',
        fieldName: 'autoSchedulingDisplay',
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
        labelText: '任务类型',
        fieldName: 'planTypeDisplay',
        colLayout: 'doubleCol'
      },
      {
        type: 'view',
        labelText: '责任人',
        fieldName: 'realName',
        colLayout: 'doubleCol'
      },
      {
        type: 'view',
        labelText: '预计开始时间',
        fieldName: 'forecastBeginDate',
        colLayout: 'doubleCol'
      },
      {
        type: 'view',
        labelText: '预计完成时间',
        fieldName: 'forecastEndDate',
        colLayout: 'doubleCol'
      }, {
        type: 'view',
        labelText: '实际开始时间',
        fieldName: 'realBeginDate',
        colLayout: 'doubleCol'
      },
      {
        type: 'view',
        labelText: '实际完成时间',
        fieldName: 'realEndDate',
        colLayout: 'doubleCol'
      },
      {
        type: 'view',
        labelText: '任务描述',
        fieldName: 'description',
        colLayout: 'singleCol'
      }
    ]
    return {
      dataSource,
      formData: {
        name: '',
        duration: '',
        description: ''
      }
    }
  },
  mounted () {
    this.formData = this.activityDescData[0]
  },
  methods: {
    cancel () {
      this.$emit('editSaveOK')
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-form-item__content > .view {
  background: #f5f8fb;
}
</style>
