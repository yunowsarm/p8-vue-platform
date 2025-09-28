<script>
import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'PlanGanttSetting',
  components: {
    FormList
  },
  data() {
    return {
      saveApi: 'PlanGanttSetting.saveOtherGlobalSettingsConfig',
      dataSource: [
        {
          type: 'radioButton',
          fieldName: 'carryOutBudgetControl',
          labelText: '任务执行时是否预算控制',
          colLayout: 'singleCol',
          // tip:'根任务默认手动。',
          options: [
            {
              label: '是',
              value: '1'
            },
            {
              label: '否',
              value: '0'
            }
          ]
        }
      ],
      formData: {
        carryOutBudgetControl: '1'
      }
    }
  },
  created() {
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then((res) => {
      if(res){
        this.formData.carryOutBudgetControl = res?.carryOutBudgetControl?.content ?? '0'
      }
    })
  },
  methods: {
    saved() {
      window.myWebSocket.emit('updateConfig', '系统全局配置参数已修改')
    }
  }
}
</script>

<template>
  <form-list :api="saveApi" :data-source="dataSource" :form="formData" labelWidth="150px" @saved="saved"> </form-list>
</template>

<style scoped lang="scss"></style>
