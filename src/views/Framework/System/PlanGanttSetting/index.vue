<template>
  <div>
    <form-list :api="saveApi"
               :data-source="dataSource"
               :form="formData"
               ref="form"
               :is-custom-validate="true"
               @custom-validate="customValidate"
               labelWidth="150px">
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
      <template #planRightButton>
        <div class="transferContent">
          <el-transfer v-model="formData.planRightButton"
                       :data="buttonListInLeft"
                       filterable
                       :props="{ key: 'buttonId', label: 'title' }"
                       :titles="['功能列表', '右键菜单']">
            <span slot-scope="{ option }">
              <i :class="option.icon"></i>
              <span>{{ option.title }}</span>
            </span>
          </el-transfer>
        </div>
      </template>
    </form-list>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
import { CommandButtonBarData } from '@/assets/commonJS/ganttJS/commandButtonBarData'
// import { deepClone } from '@/utils/common'
import { getButtonData } from '@/components/gantt/Components/CommonButtonBarSetting/func.js'
export default {
  components: { FormList },
  data () {
    return {
      saveApi: 'PlanGanttSetting.saveSchedulingBasicConfig',
      formData: {
        content: '',
        defaultMode: 'tabs',
        taskRealDateWrite: '系统时间',
        taskFinish: '自动'
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
        },
        {
          type: 'radioButton',
          fieldName: 'taskFinish',
          labelText: '父任务完成方式',
          colLayout: 'singleCol',
          options: [
            {
              label: '手动',
              value: '手动'
            },
            {
              label: '自动',
              value: '自动'
            }
          ]
        },
        {
          type: 'blank',
          fieldName: 'planRightButton',
          labelText: '右键功能区',
          slotName: 'planRightButton',
          colLayout: 'singleCol',
        },
      ],
      buttonListInLeft: [],
      valueBtns: []
    }
  },
  created () {
    let that = this
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then(res => {
      this.formData.content = res.autoScheduling.content
      this.formData.defaultMode = res.defaultMode.content
      this.formData.taskFinish = res.taskFinish.content
      if (res.taskRealDateWrite.content === '1') {
        this.formData.taskRealDateWrite = '手动选择时间'
      } else {
        this.formData.taskRealDateWrite = '系统时间'
      }
      if (res.planRightButton && res.planRightButton.content) {
        let rightBtns = JSON.parse(res.planRightButton.content)
        this.formData.planRightButton = rightBtns.map((btn) => {
          return btn.buttonId
        })
      }
      that.formData = Object.assign({}, this.formData)
      this.buttonListInLeft = getButtonData(CommandButtonBarData)
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
      let rightBtns = []
      this.buttonListInLeft.forEach((btn) => {
        if (this.formData.planRightButton.includes(btn.buttonId)) {
          rightBtns.push(btn)
        }
      })
      saveParams.planRightButton = JSON.stringify(rightBtns)
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