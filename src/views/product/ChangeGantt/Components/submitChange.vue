<template>
  <common-dialog :title="title" @close="handleCancel" :visible="visible" :dialog-config="dialogConfig" :show-handle-btn="false" :dialog-height="460">
    <template #dialog>
      <form-list
        ref="form"
        @rendered="rendered"
        @saved="saved"
        :form="formData"
        :data-source="dataSource"
        :is-custom-validate="isCustomValidate"
        @custom-validate="customValidate"
        :api="saveApi"
        :other-param="otherParam"
      >
      </form-list>
      <selectApproveUserBeforehand
        v-if="isSelectApproveUserBeforehandView"
        :is-select-approve-user-beforehand-view="isSelectApproveUserBeforehandView"
        :select-user-beforehand-data-source="selectUserBeforehandDataSource"
        :select-user-beforehand-form-data="selectUserBeforehandFormData"
        @close-modal="closeSelectApproveUserBeforehand"
        @commit="commitSelectApproveUserBeforehand"
      ></selectApproveUserBeforehand>
    </template>
  </common-dialog>
</template>
<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'

import SelectApproveUserBeforehand from '@/views/Framework/BusinessActivity/ProcessApproval/selectApproveUserBeforehand'
import { nextApproveUserBeforehandPlanChange } from '@/assets/commonJS/BusinessActivity/nextApproveUserBeforehandPlanChange'
export default {
  name: 'SubmitChange',
  components: {
    FormList,
    CommonDialog,
    SelectApproveUserBeforehand
  },
  props: {
    sendDataList: {
      type: Array,
      default: () => []
    },
    projectCategory: {
      type: String,
      default: ''
    },
    monitorPoints: {
      type: String,
      default: ''
    },
    projectClassification: {
      type: String,
      default: ''
    },
    projectTaskId: {
      type: String,
      default: ''
    },
    changeId: {
      type: String,
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    },
    createPage: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: ''
    },
    planInfoId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      saveApi: 'planChange.changeRecordInfoSave',
      isCustomValidate: true,
      title: '计划变更提交',
      isSelectApproveUserBeforehandView: false,
      selectUserBeforehandDataSource: [],
      selectUserBeforehandFormData: {},
      isBeforehand: true, // 是否预先设置审批人模式
      saveParams: {},
      dialogConfig: {
        modal: false
      },
      dataSource: [
        {
          type: 'select',
          labelText: '变更原因分类',
          fieldName: 'changeType',
          colLayout: 'singleCol',
          placeholder: '选择变更原因分类',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'ADJUST_ClASSIFY' },
            label: 'label',
            value: 'value'
          },
          rules: [
            {
              required: true,
              message: '必填'
            }
          ],
          options: []
        },
        {
          labelText: '原因描述',
          type: 'textarea',
          fieldName: 'reason',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          },
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'select',
          labelText: '变更原因',
          fieldName: 'reasonChange',
          colLayout: 'singleCol',
          placeholder: '选择变更原因',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'CHANGE_REASON_MANAGEMENT' }
          },
          options: []
        },
        {
          type: 'upload',
          labelText: '附件', // 控件显示的文本
          fieldName: 'uploadFiles',
          defaultValue: [],
          colLayout: 'singleCol',
          uploadConfig: {
            // , // 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
            // limit: 1
          },
          listType: 'secret' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        },
        {
          labelText: '影响分析',
          type: 'textarea',
          fieldName: 'measure',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: '6'
          }
        },
        {
          type: 'select',
          labelText: '是否记录变更',
          fieldName: 'weatherChange',
          colLayout: 'singleCol',
          placeholder: '选择排程类型',
          options: [
            { label: '是', value: '0' },
            { label: '否', value: '1' }
          ]
        }
      ],
      modify: {},
      otherParam: {
        id: ''
      },
      formData: {
        weatherChange: '0',
        reasonChange: '',
        uploadFiles: []
      },
      isBig: null,
      sourceTemplate: {
        approveNodeUsers: {
          type: 'select',
          labelText: '审批人',
          fieldName: 'SYS_ROLE070',
          placeholder: '选择节点审批人',
          colLayout: 'singleCol',
          fieldConfig: {
            multiple: false,
            disabled: false
          },
          options: [],
          rules: [
            {
              required: true
            }
          ]
        }
      },
      releaseMenuParams: {}
    }
  },
  methods: {
    rendered() {
      const that = this
      if (that.changeId) {
        this.$api['planChange.changeRecordInfo']({ id: that.changeId })
          .then(function (res) {
            if (res) {
              that.formData.changeType = res.changeType
              that.formData.reason = res.reason
              that.formData.measure = res.measure
              that.formData.weatherChange = res.weatherChange
              that.formData.reasonChange = res.reasonChange
              that.otherParam = { id: res.id, planInfoId: res.planInfoId }
              that.formData = Object.assign({}, that.formData)
            }
          })
          .catch(function (error) {
            console.error(error)
          })
      }
    },
    customValidate(saveParams) {
      saveParams.projectCategory = this.projectCategory
      saveParams.monitorPoints = this.monitorPoints
      saveParams.projectClassification = this.projectClassification
      saveParams.businessKey = this.projectTaskId
      const businessIds = []
      businessIds.push(this.projectTaskId)
      this.releaseMenuParams = { ...saveParams, businessIds }
      this.saveParams = saveParams
      if (this.sendDataList.length > 0) {
        const taskWithMaxSecretGrade = this.sendDataList.reduce((maxTask, currentTask) => {
          if (!maxTask || currentTask.secretGrade > maxTask.secretGrade) {
            return currentTask
          }
          return maxTask
        }, null)
        this.isBig = this.saveParams.uploadFiles.some((item) => item.confidentialite > taskWithMaxSecretGrade.secretGrade)
        if (this.isBig) {
          this.$message.warning('附件的密级高于任务的密级！')
        } else {
          if (this.isBeforehand) {
            this.nextApproveUserBeforehand(saveParams)
          } else {
            this.$refs.form.submitForm(saveParams, this.saveApi)
          }
        }
      } else {
        this.$api['planChange.changeRecordClassification']({ id: this.id }).then((res) => {
          this.isBig = this.saveParams.uploadFiles.some((item) => item.confidentialite > res)
          console.log(this.isBig, '222222')
          if (this.isBig) {
            this.$message.warning('附件的密级高于任务的密级！')
          } else {
            if (this.isBeforehand) {
              this.nextApproveUserBeforehand(saveParams)
            } else {
              this.$refs.form.submitForm(saveParams, this.saveApi)
            }
          }
        })
      }
    },
    saved(res) {
      if (res && res.processInstanceIds && res.processInstanceIds.length > 0) {
        this.$emit('save-success', res)
      }
    },
    handleCancel() {
      this.$emit('save-success', true)
    },
    nextApproveUserBeforehand(saveParams) {
      // 标识 1008 月重点计划
      const monitorPoints = saveParams.monitorPoints
      // 1 所级 ； 0 非所级
      const projectCategory = saveParams.projectCategory
      // PROJECT_CLASSIFICATION_0_01 科研生产 ； PROJECT_CLASSIFICATION_0_02 专题计划
      const projectClassification = saveParams.projectClassification
      // 科研生产项目项目类别为
      // “所级项目”中任务变更流程，使用月度重点标识区分，
      //      标记为月度重点标识的任务变更流程为：部门领导-业务主管部门领导-发展计划部领导-业务主管所领导-发展计划部-项目主管， key1 planChangeApproveNonMonthPoints
      //      标记为非月度重点任务变更流程：部门领导-项目主管， key2 planChangeApproveMonthPoints
      // “非所级项目”计划变更流程为：责任人-部门领导 key3 planChangeApproveNonFactory
      const that = this
      let processDefinitionKey = ''
      processDefinitionKey = 'planChangeApprove'
      this.saveParams.processDefinitionKey = processDefinitionKey
      nextApproveUserBeforehandPlanChange.initDataSource(processDefinitionKey, that).then((res) => {
        if (res === true) {
          that.isSelectApproveUserBeforehandView = true
        }
      })
    },
    closeSelectApproveUserBeforehand() {
      this.isSelectApproveUserBeforehandView = false
    },
    commitSelectApproveUserBeforehand(fullParams) {
      if (!this.saveParams.id && !this.saveParams.planInfoId) {
        this.saveParams.id = this.id
        this.saveParams.planInfoId = this.planInfoId
      }
      this.saveParams.beforehandParams = { ...fullParams }
      this.$refs.form.submitForm(this.saveParams, this.saveApi)
    },
    initDataSourceDept: function (processDefinitionKey, vueInstance) {
      vueInstance.$api['planChange.queryCurrentDept']({})
        .then((res) => {
          vueInstance.selectUserBeforehandDataSource = []
          vueInstance.sourceTemplate.approveNodeUsers.options = res
          vueInstance.selectUserBeforehandDataSource.push(vueInstance.sourceTemplate.approveNodeUsers)
          vueInstance.isSelectApproveUserBeforehandView = true
        })
        .catch(function (err) {
          console.error(error)
        })
    }
  }
}
</script>
