<script>
import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'PlanGanttSetting',
  components: {
    FormList
  },
  data () {
    return {
      saveApi: 'PlanGanttSetting.saveOtherGlobalSettingsConfig',
      dataSource: [
        {
          type: 'radioButton',
          fieldName: 'demandOptions',
          labelText: '需求管理选项',
          colLayout: 'singleCol',
          // tip:'根任务默认手动。',
          options: [
            {
              label: '标准版',
              value: '0'
            },
            {
              label: '简易版',
              value: '1'
            }
          ]
        }
      ],
      formData: {
        demandOptions: '0'
      }
    }
  },
  created () {
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then((res) => {
      if (res) {
        this.formData.demandOptions = res?.demandOptions?.content ?? '0'
      }
    })
  },
  methods: {
    saved () {
      window.myWebSocket.emit('updateConfig', '系统全局配置参数已修改')
    }
  }
}
</script>

<template>
  <form-list :api="saveApi"
             :data-source="dataSource"
             :form="formData"
             labelWidth="150px"
             @saved="saved"> </form-list>
</template>

<style scoped lang="scss"></style>
