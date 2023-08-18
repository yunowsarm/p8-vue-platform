<template>
  <form-list :label-width="labelWidth" :form="formData" :data-source="dataSource" :exist-default-btn="false"></form-list>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'ViewRender',
  components: {
    FormList
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
    labelWidth: {
      type: String,
      default: '100px'
    }
  },
  data() {
    return {
      dataSource: [],
      formData: {}
    }
  },
  async mounted() {
    let _this = this
    let res = await this.$api['formGenerator.tableGetInfo']({ reportCode: this.code })
    if (res.reportItems.length) {
      res.reportItems.map((item) => {
        if (item.isViewShow) {
          _this.dataSource.push({
            type: 'view',
            labelText: item.fieldTxt,
            fieldName: item.fieldName,
            colLayout: 'doubleCol'
          })
        }
      })
    }
    this.formData = Object.assign({}, this.record)
  }
}
</script>
