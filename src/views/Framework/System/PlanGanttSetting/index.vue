<template>
  <div>
    <P8Form :api="saveApi" :data-source="dataSource" :form="formData"></P8Form>
  </div>
</template>

<script>
import { P8Form } from 'p8-components-ui'
export default {
  components: { P8Form },
  data () {
    return {
      saveApi: 'PlanGanttSetting.saveSchedulingBasicConfig',
      formData: {
        content: ''
      },
      dataSource:[
        {
          type: 'radioButton',
          fieldName: 'content',
          labelText: '排程类型',
          colLayout: 'singleCol',
          options: [
            {
              label: '手动',
              value: '0'
            },
            {
              label: '自动',
              value: '1'
            }
          ]
        }
      ]
    }
  },
  created() {
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then(res => {
      this.formData.content = res.content
    })
  },
  methods: {
  }
}
</script>

<style>

</style>