<template>
  <el-dialog title="查看经费节点"
             width="30%"
             :visible="visible"
             append-to-body
             destroy-on-close
             @close="handleCancel">

    <form-list ref="form"
               :dataSource="dataSource"
               @rendered="rendered"
               :existDefaultBtn="existDefaultBtn"
               :form="formData">
    </form-list>

  </el-dialog>
</template>
<script>
import { Dialog, P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'addRevenueView',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    otherParam: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      existDefaultBtn: false,
      formData: {},
      dataSource: [

        {
          type: 'view',

          fieldName: 'name',
          labelText: '经费节点名称:',
          colLayout: 'singleCol',
          style: {
            'color': '#80BDFF'
          }
        },
        {
          type: 'view',
          labelText: '经费节点类型:',
          fieldName: 'planType',
          colLayout: 'singleCol',
          style: {
            'color': '#80BDFF'
          }
        },
        {
          type: 'view',
          fieldName: 'money',
          labelText: '经费节点金额:',
          colLayout: 'singleCol',
          style: {
            'color': '#80BDFF'
          }
        },
        {
          type: 'view',
          labelText: '经费节点时间:',
          fieldName: 'years',
          colLayout: 'singleCol',
          style: {
            'color': '#80BDFF'
          }
        }
      ]

    }
  },
  components: {
    'el-dialog': Dialog,
    FormList
  },
  created () {
    this.formData = Object.assign({}, this.otherParam)
  },
  mounted () {

  },
  methods: {
    rendered () {
    },
    handleCancel () {
      this.$emit('close-dialog', this.otherParam)
    }
  }
}
</script>

<style lang="scss">
</style>
