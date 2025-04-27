<template>
  <div>
    <form-list :api="saveApi" :data-source="dataSource" :form="formData" ref="form" :is-custom-validate="true" @custom-validate="customValidate" @saved="saved" labelWidth="150px">
      <template #taskRealDateWrite>
        <el-popover class="pop_left" trigger="hover">
          <p>
            系统时间：服务端时间，不可修改<br />
            手动选择时间：可手动修改为系统当前及之前时间
          </p>
          <i slot="reference" class="el-icon-question" />
        </el-popover>
        <el-radio-group v-model="formData.taskRealDateWrite" @input="input">
          <el-radio-button label="系统时间"></el-radio-button>
          <el-radio-button label="手动选择时间"></el-radio-button>
        </el-radio-group>
      </template>
      <template #planRightButton>
        <div class="transferContent">
          <el-transfer v-model="formData.planRightButton" :data="buttonListInLeft" filterable :props="{ key: 'buttonId', label: 'title' }" :titles="['功能列表', '右键菜单']">
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
  data() {
    return {
      saveApi: 'PlanGanttSetting.saveOtherGlobalSettingsConfig',
      formData: {
        content: '',
        defaultMode: 'tabs',
        taskRealDateWrite: '系统时间',
        taskFinish: '自动',
        doneSign: 'completeApproval',
        displayType:'intact'
      },
      dataSource: [
        {
          type: 'radioButton',
          fieldName: 'content',
          labelText: '排程类型',
          colLayout: 'singleCol',
          tip:'根任务默认手动。',
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
          colLayout: 'singleCol',
          tip: '系统时间：服务端时间，不可修改；手动选择时间：可手动修改为系统当前及之前时间。'
        },
        {
          type: 'radioButton',
          fieldName: 'taskFinish',
          labelText: '父任务完成方式',
          tip: '自动：所有子任务都完成时，父任务自动提交完成审批。手动：所有子任务都完成时，父任务需责任人手动提交完成审批。',
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
          type: 'radio',
          fieldName: 'doneSign',
          labelText: '提前/超期完成标志',
          tip: `提交完成审批：责任人在任务执行中，发起提交完成审批时(任务状态)，
                完成审批通过：任务完成审批通过后，判定为已完成。`,
          colLayout: 'singleCol',
          options: [
            {
              label: '完成审批通过',
              value: 'completeApproval'
            },
            {
              label: '提交完成审批',
              value: 'submitApproval'
            }
          ]
        },
        {
          type: 'radio',
          fieldName: 'displayType',
          labelText: '提前/超期展示类型',
          tip: '提前/超期xx天完成：完整展示(当前默认逻辑)-/+xx天完成：-代表剩余/提前，+代表超期。',
          colLayout: 'singleCol',
          options: [
            {
              label: '提前/超期xx天完成',
              value: 'intact'
            },
            {
              label: '-/+xx天完成',
              value: 'concise'
            }
          ]
        },
        {
          type: 'blank',
          fieldName: 'planRightButton',
          labelText: '右键功能区',
          slotName: 'planRightButton',
          colLayout: 'singleCol'
        }
      ],
      buttonListInLeft: [],
      valueBtns: [],
      oldForm: {}
    }
  },
  created() {
    let that = this
    this.$api['PlanGanttSetting.getSchedulingBasicConfig']().then((res) => {
      this.formData.content = res.autoScheduling && res.autoScheduling.content ? res.autoScheduling.content : ''
      this.formData.defaultMode = res.defaultMode && res.defaultMode.content ? res.defaultMode.content : ''
      this.formData.taskFinish = res.taskFinish && res.taskFinish.content ? res.taskFinish.content : ''
      this.formData.doneSign = res.doneSign && res.doneSign.content ? res.doneSign.content : ''
      this.formData.displayType = res.displayType && res.displayType.content ? res.displayType.content : ''
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
      that.oldForm = { ...that.formData }
    })
  },
  methods: {
    input(val) {
      this.formData.taskRealDateWrite = val
    },
    async customValidate(saveParams) {
      if (this.oldForm.taskFinish == '手动' && saveParams.taskFinish == '自动') {
        let result = await this.checkTaskFinsh()
        if (!result) {
          return
        }
      }
      if (saveParams.taskRealDateWrite === '系统时间') {
        saveParams.taskRealDateWrite = '0'
      } else {
        saveParams.taskRealDateWrite = '1'
      }
      let rightBtns = []
      this.buttonListInLeft.forEach((btn) => {
        if (this.formData.planRightButton && this.formData.planRightButton.includes(btn.buttonId)) {
          rightBtns.push(btn)
        }
      })
      saveParams.planRightButton = JSON.stringify(rightBtns)
      this.$refs.form.submitForm(saveParams, this.saveApi)
    },
    saved(){
      window.myWebSocket.emit('updateConfig', '系统全局配置参数已修改')
    },
    async checkTaskFinsh () {
      return new Promise((resolve, reject) => {
        this.$confirm('设为自动后，父任务无需手动提交，但如果父任务已被设置为有输出要求或关联表单时，届时父任务责任人将无法进行维护填报，请确认是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve(true)
        }).catch(() => {
          reject(false)
        })
      })
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
