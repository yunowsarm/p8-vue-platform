<template>
  <div>
    <P8Form :api="saveApi" :data-source="dataSource" :form="formData" labelWidth="150"></P8Form>
  </div>
</template>

<script>
import { P8Form } from 'p8-components-ui'
export default {
  components: { P8Form },
  data () {
    return {
      saveApi: 'projectTeamSetting.saveLoginConfig',
      formData: {
        value: ''
      },
      dataSource:[
        {
          type: 'radioButton',
          fieldName: 'value',
          labelText: '第一次登录重置密码',
          colLayout: 'singleCol',
          options: [
            {
              label: '是',
              value: '0'
            },
            {
              label: '否',
              value: '1'
            }
          ]
        }
      ]
    }
  },
  created() {
    this.$api['projectTeamSetting.getLoginConfig']().then(res => {
      this.formData.value = res.content
    })
  },
  methods: {
  }
}
</script>

<style>

</style>
