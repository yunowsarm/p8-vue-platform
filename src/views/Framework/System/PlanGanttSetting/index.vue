<template>
  <div>
    <form-list :api="saveApi"
               :data-source="dataSource"
               :form="formData"
               ref="form"
               :is-custom-validate="true"
               @custom-validate="customValidate"
               labelWidth="150">
      <template #taskRealDateWrite>
        <el-popover class="pop_left"
                    trigger="hover">
          <p>
            系统时间：服务端时间，不可修改<br />
            手动选择时间：可手动修改为系统当前及之前时间
          </p>
          <i slot="reference"
             class="el-icon-question" />
        </el-popover>
        <el-radio-group v-model="formData.taskRealDateWrite"
                        @input="input">
          <el-radio-button label="系统时间"></el-radio-button>
          <el-radio-button label="手动选择时间"></el-radio-button>
        </el-radio-group>
      </template>
    </form-list>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  components: { FormList },
  data () {
    return {
      saveApi: 'PlanGanttSetting.saveSchedulingBasicConfig',
      formData: {
        content: '',
        defaultMode: '',
        taskRealDateWrite: '系统时间'
      },
      dataSource: [
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
        },
        {
          type: 'radio',
          fieldName: 'defaultMode',
          labelText: '按钮展示模式',
          colLayout: 'singleCol',
          options: [
            {
              label: '标签页',
              value: 'tabs'
            },
            {
              label: '多行',
              value: 'double'
            },
            {
              label: '单行',
              value: 'single'
            }
          ]
        },
        {
          type: 'blank',
          fieldName: 'taskRealDateWrite',
          slotName: 'taskRealDateWrite',
          labelText: '任务实际完成时间填写限制设置',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  created () {
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then(res => {
      this.formData.content = res.autoScheduling.content
      this.formData.defaultMode = res.defaultMode.content
      if (res.taskRealDateWrite.content === '1') {
        this.formData.taskRealDateWrite = '手动选择时间'
      } else {
        this.formData.taskRealDateWrite = '系统时间'
      }
    })
  },
  methods: {
    input (val) {
      this.formData.taskRealDateWrite = val
    },
    customValidate (saveParams) {
      if (saveParams.taskRealDateWrite === '系统时间') {
        saveParams.taskRealDateWrite = '0'
      } else {
        saveParams.taskRealDateWrite = '1'
      }
      this.$refs.form.submitForm(saveParams, this.saveApi)
    }
  }
}
</script>

<style lang="scss" scoped>
.pop_left {
  position: absolute;
  left: 167px;
}
</style>