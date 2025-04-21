<template>
  <form-list ref="form"
             class="form"
             :data-source="dataSource"
             @rendered="rendered"
             label-width="90px"
             :exist-default-btn="false"
             :form="formData"> </form-list>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'ApproverForm',
  props: {
    businessKey: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      formData: {},
      dataSource: [
        {
          type: 'view',
          labelText: '标题',
          colLayout: 'doubleCol',
          fieldName: 'title'
        },
        {
          type: 'view',
          labelText: '类型',
          colLayout: 'doubleCol',
          fieldName: 'typeDisplay'
        },
        {
          type: 'view',
          labelText: '待办事项内容',
          colLayout: 'singleCol',
          fieldName: 'content'
        },
        {
          type: 'view',
          labelText: '责任人',
          colLayout: 'doubleCol',
          fieldName: 'dutyUserName'
        },
        {
          type: 'view',
          labelText: '计划开始时间',
          colLayout: 'doubleCol',
          fieldName: 'planBeginDate'
        },
        {
          type: 'view',
          labelText: '计划完成时间',
          colLayout: 'doubleCol',
          fieldName: 'planEndDate'
        },
        {
          type: 'view',
          labelText: '确认人',
          colLayout: 'doubleCol',
          fieldName: 'affirmUserName'
        },
        // {
        //   type: 'view',
        //   labelText: '来源',
        //   colLayout: 'doubleCol',
        //   fieldName: 'LAIYUAN'
        // },
        {
          type: 'view',
          labelText: '状态',
          colLayout: 'doubleCol',
          fieldName: 'statusDisplay'
        },
        {
          type: 'view',
          labelText: '实际开始时间',
          colLayout: 'doubleCol',
          fieldName: 'realBeginDate'
        },
        {
          type: 'view',
          labelText: '实际完成时间',
          colLayout: 'doubleCol',
          fieldName: 'realEndDate'
        },
        {
          type: 'view',
          labelText: '完成情况',
          fieldName: 'execution',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  methods: {
    rendered () {
      if (this.businessKey) {
        this.$api['TodoList.list']({ id: this.businessKey }).then((res) => {
          this.formData = res
        })
      }
    }
  },
  components: {
    FormList
  }
}
</script>
<style lang="scss" scpoed>
// ::v-deep
.form .el-form-item__content .view {
  word-break: break-word;
}
</style>
