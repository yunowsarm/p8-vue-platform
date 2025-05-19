<template>
  <div>
    <form-list ref="form"
               @rendered="rendered"
               @saved="() => {}"
               :data-source="dataSource"
               :form="record"
               api=""
               :exist-default-btn="false">
      <template slot="btn">
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'SchedulerTaskView',
  components: {
    FormList
  },
  props: {
    record: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      dataSource: [
        {
          type: 'view',
          labelText: '名称',
          fieldName: 'name',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '类型',
          fieldName: 'type',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: 'classPath',
          fieldName: 'classPath',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: 'method',
          fieldName: 'method',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '参数',
          fieldName: 'params',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '时机',
          fieldName: 'timing',
          formatter (row, column, cellValue, index) {
            let v = ''
            switch (cellValue) {
              case 'immediately':
                v = '立即执行+定时轮询'
                break
              case 'polling':
                v = '定时轮询'
                break
            }
            return v
          }
        },
        {
          type: 'view',
          labelText: '定时策略',
          fieldName: 'cron',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '描述',
          fieldName: 'description',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
    rendered () {
      this.$refs.form.setViewFields(this.record)
    }
  }
}
</script>

<style scoped>
::v-deep .el-form-item__content > .view {
  background: #f5f8fb !important;
}
</style>
