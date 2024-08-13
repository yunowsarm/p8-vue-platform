<template>
  <div class="header">
    <div class="content">
      <form-render class="formRender"
                   :data-view-id="dataViewId"
                   :record="{ desformCode: codeForm }"
                   :prop-param="propParam"
                   pageType="view"
                   v-bind="$attrs"></form-render>
      <form-list ref="form"
                 class="formList"
                 label-width="120px"
                 :data-source="dataSource"
                 :exist-default-btn="false"
                 :form="formData">
        <template #requirementAnalyst>
          <div @click="selectPeople">
            <el-input v-model="formData['requirementAnalystDisplay']"
                      readonly
                      autosize>
              <template slot="append"><i class="el-icon-link"
                   type="link"
                   :style="{ fontSize: '16px', color: '#08c' }"></i></template>
            </el-input>
          </div>
        </template>
        <template #processingTeam>
          <div @click="selectPeople">
            <el-input v-model="formData['processingTeamDisplay']"
                      readonly
                      autosize>
              <template slot="append"><i class="el-icon-link"
                   type="link"
                   :style="{ fontSize: '16px', color: '#08c' }"></i></template>
            </el-input>
          </div>
        </template>
      </form-list>
    </div>
    <!-- <div class="btn"
         v-if="!selectedApproval.yesOrNo">
      <el-button type="primary"
                 @click="handleSubmit">保存</el-button>
    </div> -->
    <select-user v-if="visible"
                 class="selectUser"
                 :visible="visible"
                 @close-dialog="closeModal"
                 :selectType="'1'"></select-user>
  </div>
</template>

<script>
import {
  P8Form as FormList,
  P8SelectUser as SelectUser
} from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
export default {
  components: {
    FormList,
    SelectUser,
    FormRender
  },
  props: {
    demandCode: {
      type: String
    },
    businessKey: {
      type: String
    },
    type: {
      type: String
    },
    sourceChannel: {
      type: String
    },
    selectedApproval: {
      type: Object
    }
  },
  data () {
    return {
      formType: this.type,
      visible: false,
      codeForm: this.demandCode, // 新建/修改表单code
      dataViewId: this.businessKey, // 修改页面id
      propParam: {}, // 将参数传至表单
      formData: {
        uploadFiles: []
      },
      dataSource: [],
      dataSourceInfo: [
        {
          type: 'text',
          labelText: '需求名称',
          fieldName: 'demandName',
          placeholder: '请输入需求名称',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'view',
          labelText: '来源渠道',
          fieldName: 'sourceChannel',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '客户名称',
          fieldName: 'customerName',
          placeholder: '请输入客户名称',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          labelText: '客户联系电话',
          type: 'text',
          fieldName: 'customerPhone',
          colLayout: 'singleCol',
          placeholder: '请输入手机或座机号码',
          tip: '手机格式如:13512341234 座机格式如:010-40020020',
          rules: [
            {
              pattern: '^(((\\+\\d{2}-)?0\\d{2,3}-\\d{7,8})|((\\+\\d{2}-)?(\\d{2,3}-)?([1][3,4,5,7,8,9][0-9]\\d{8})))$',
              message: '请输入正确的电话号码',
              trigger: 'blur'
            }
          ]
        },
        {
          labelText: '收集人联系电话',
          type: 'text',
          fieldName: 'collectorPhone',
          colLayout: 'singleCol',
          placeholder: '请输入手机或座机号码',
          tip: '手机格式如:13512341234 座机格式如:010-40020020',
          rules: [
            {
              pattern: '^(((\\+\\d{2}-)?0\\d{2,3}-\\d{7,8})|((\\+\\d{2}-)?(\\d{2,3}-)?([1][3,4,5,7,8,9][0-9]\\d{8})))$',
              message: '请输入正确的电话号码',
              trigger: 'blur'
            }
          ]
        },
        {
          type: 'text',
          labelText: '客户群',
          fieldName: 'customerGroup',
          placeholder: '请输入客户群',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'text',
          labelText: '基线产品/项目名称',
          fieldName: 'projectName',
          placeholder: '请输入基线产品/项目名称',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'select',
          labelText: '需求预分类建议',
          fieldName: 'demandSuggestions',
          fieldConfig: {},
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'demandSuggestion' }
          },
          options: [],
          colLayout: 'doubleCol'
        },
        {
          type: 'radio', // 控件类型
          labelText: '是否属于紧急需求', // 控件显示的文本
          fieldName: 'urgentNeed',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'EMERGENCY_NEED' }
          },
          options: []
        },
        {
          type: 'radio', // 控件类型
          labelText: '客户反映', // 控件显示的文本
          fieldName: 'customerFeedback',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'CUSTOMER_RESPONSE' }
          },
          options: []
        },
        {
          type: 'radio', // 控件类型
          labelText: '是否承诺', // 控件显示的文本
          fieldName: 'commitment',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'PROMISE_OR_NOT' }
          },
          options: []
        },
        {
          type: 'textarea',
          labelText: '需求背景',
          fieldName: 'demandBackground',
          colLayout: 'singleCol',
          placeholder: '请输入需求背景',
          maxlength: 250
        },
        {
          type: 'textarea',
          labelText: '需求紧迫性',
          fieldName: 'demandUrgency',
          colLayout: 'singleCol',
          placeholder: '请输入需求紧迫性',
          maxlength: 250
        },
        {
          type: 'textarea',
          labelText: '用户需求描述',
          fieldName: 'demandDescribe',
          colLayout: 'singleCol',
          placeholder: '请输入用户需求描述',
          maxlength: 250
        },
        {
          type: 'upload', // 控件类型
          labelText: '附件', // 控件显示的文本
          fieldName: 'uploadFiles',
          colLayout: 'singleCol',
          uploadConfig: {
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        },
        {
          type: 'textarea',
          labelText: '早期需求验证计划',
          fieldName: 'earlyPlan',
          colLayout: 'singleCol',
          placeholder: '请输入早期需求验证计划',
          maxlength: 250
        },
        {
          type: 'blank',
          labelText: '选择需求分析人',
          fieldName: 'requirementAnalyst',
          slotName: 'requirementAnalyst',
          colLayout: 'singleCol',
          placeholder: '选择需求分析人',
          // rules: [
          //   {
          //     required: true,
          //     message: '必选'
          //   }
          // ]
        },
        {
          type: 'datetime',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'doubleCol',
          placeholder: '请选择完成时间',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          },
          // rules: [
          //   {
          //     required: true,
          //     message: '必选'
          //   }
          // ]
        }
      ],
      dataSourceAnalyse: [
        {
          type: 'view',
          labelText: '早期需求验证计划',
          fieldName: 'earlyPlan',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'singleCol',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          }
        },
        {
          type: 'text',
          labelText: '需求关键字',
          fieldName: 'keywords',
          placeholder: '请输入需求关键字',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'radio', // 控件类型
          labelText: '客户优先级', // 控件显示的文本
          fieldName: 'priority',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'CUSTOMER_PRIORITY' }
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'radio', // 控件类型
          labelText: '产品优先级', // 控件显示的文本
          fieldName: 'productPriority',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'PRODUCT_PRIORITY' }
          },
          options: []
        },
        {
          type: 'radio', // 控件类型
          labelText: '技术优先级', // 控件显示的文本
          fieldName: 'technologyPriority',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'TECHNICAL_PRIORITY' }
          },
          options: []
        },
        {
          type: 'radio', // 控件类型
          labelText: '需求程度分类', // 控件显示的文本
          fieldName: 'demandLevel',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'DEMAND_DEGREE_ANALYSIS' }
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '需求初步验证情况',
          fieldName: 'preliminaryVerification',
          colLayout: 'singleCol',
          placeholder: '请输入需求初步验证情况',
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'select',
          labelText: '需求层次分类',
          fieldName: 'classificationDemand',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'demandSuggestion' }
          },
          colLayout: 'singleCol'
        },
        {
          type: 'radio', // 控件类型
          labelText: '需求时间窗', // 控件显示的文本
          fieldName: 'timeWindow',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'DEMAND_TIME' }
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '需求处理建议',
          fieldName: 'handlingSuggestions',
          colLayout: 'singleCol',
          placeholder: '请输入需求处理建议',
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'

            }
          ]
        },
        {
          type: 'blank',
          labelText: '建议需求处理团队',
          fieldName: 'processingTeam',
          slotName: 'processingTeam',
          placeholder: '请输入建议需求处理团队',
          colLayout: 'singleCol',
          maxlength: 100,
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'select',
          labelText: '需求处理结论',
          fieldName: 'processingConclusion',
          placeholder: '下拉选择你要的',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'HANDLING_SUGGESTIONS' }
          },
          options: [],
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        }
      ],
      dataSourceInfoView: [
        {
          type: 'view',
          labelText: '需求名称',
          fieldName: 'demandName',
          placeholder: '请输入需求名称',
          colLayout: 'singleCol',
          maxlength: 100
        },
        {
          type: 'view',
          labelText: '来源渠道',
          fieldName: 'sourceChannel',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '客户名称',
          fieldName: 'customerName',
          placeholder: '请输入客户名称',
          colLayout: 'singleCol',
          maxlength: 100
        },
        {
          labelText: '客户联系电话',
          type: 'view',
          fieldName: 'customerPhone',
          colLayout: 'singleCol'
        },
        {
          labelText: '收集人联系电话',
          type: 'view',
          fieldName: 'collectorPhone',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '客户群',
          fieldName: 'customerGroup',
          placeholder: '请输入客户群',
          colLayout: 'singleCol',
          maxlength: 100
        },
        {
          type: 'view',
          labelText: '基线产品/项目名称',
          fieldName: 'projectName',
          placeholder: '请输入基线产品/项目名称',
          colLayout: 'singleCol',
          maxlength: 200
        },
        {
          type: 'view',
          labelText: '需求预分类建议',
          fieldName: 'demandSuggestionsDisplay',
          fieldConfig: {},
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '是否属于紧急需求', // 控件显示的文本
          fieldName: 'urgentNeedDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '客户反映', // 控件显示的文本
          fieldName: 'customerFeedbackDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '是否承诺', // 控件显示的文本
          fieldName: 'commitmentDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求背景',
          fieldName: 'demandBackground',
          colLayout: 'singleCol',
          placeholder: '请输入需求背景',
          maxlength: 250
        },
        {
          type: 'view',
          labelText: '需求紧迫性',
          fieldName: 'demandUrgency',
          colLayout: 'singleCol',
          placeholder: '请输入需求紧迫性',
          maxlength: 250
        },
        {
          type: 'view',
          labelText: '用户需求描述',
          fieldName: 'demandDescribe',
          colLayout: 'singleCol',
          maxlength: 250
        },
        {
          type: 'uploadView', // 控件类型
          labelText: '附件', // 控件显示的文本
          fieldName: 'uploadFiles',
          colLayout: 'singleCol',
          uploadConfig: {
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        },
        {
          type: 'view',
          labelText: '早期需求验证计划',
          fieldName: 'earlyPlan',
          colLayout: 'singleCol',
          placeholder: '请输入早期需求验证计划',
          maxlength: 250
        },
        {
          type: 'view',
          labelText: '选择需求分析人',
          fieldName: 'requirementAnalystDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'singleCol'
        }
      ],
      dataSourceAnalyseView: [
        {
          type: 'view',
          labelText: '早期需求验证计划',
          fieldName: 'earlyPlan',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'singleCol',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          }
        },
        {
          type: 'view',
          labelText: '需求关键字',
          fieldName: 'keywords',
          placeholder: '请输入需求关键字',
          colLayout: 'singleCol',
          maxlength: 200
        },
        {
          type: 'view', // 控件类型
          labelText: '客户优先级', // 控件显示的文本
          fieldName: 'priorityDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '产品优先级', // 控件显示的文本
          fieldName: 'productPriorityDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '技术优先级', // 控件显示的文本
          fieldName: 'technologyPriorityDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '需求程度分类', // 控件显示的文本
          fieldName: 'demandLevelDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求初步验证情况',
          fieldName: 'preliminaryVerification',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求层次分类',
          fieldName: 'classificationDemandDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '需求时间窗', // 控件显示的文本
          fieldName: 'timeWindowDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求处理建议',
          fieldName: 'handlingSuggestions',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '建议需求处理团队',
          fieldName: 'processingTeamDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'view',
          labelText: '需求处理结论',
          fieldName: 'processingConclusionDisplay',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  mounted () {
    // 区分不同审批节点展示不同表单
    if (this.formType === '1') {
      this.formData.sourceChannel = this.sourceChannel
      if (this.selectedApproval.yesOrNo) {
        this.dataSource = this.dataSourceInfoView
      } else {
        this.dataSource = this.dataSourceInfo
      }
    } else {
      if (this.selectedApproval.yesOrNo) {
        this.dataSource = this.dataSourceAnalyseView
      } else {
        this.dataSource = this.dataSourceAnalyse
      }
    }
    this.viewForm()
  },
  methods: {
    viewForm () {
      this.$api['demandManagement.viewRequirement']({
        id: this.businessKey
      }).then(res => {
        if (res) {
          // debugger
          if (this.formType === '1') {
            if (res.requirementAnalyst) {
              this.formData = res
            }
          } else {
            if (res.analysisList.length > 0) {
              this.formData = res.analysisList[0]
            }
            this.$set(this.formData, 'earlyPlan', res.earlyPlan)
            this.$set(this.formData, 'requirementTime', res.requirementTime)
          }
        }
      })
    },
    selectPeople () {
      this.visible = true
    },
    closeModal (selectedRows) {
      this.visible = false
      if (selectedRows) {
        if (this.formType === '1') {
          this.$set(this.formData, 'requirementAnalystDisplay', selectedRows[0].realName)
          this.formData.requirementAnalyst = selectedRows[0].id

        } else {
          this.$set(this.formData, 'processingTeamDisplay', selectedRows[0].realName)
          this.formData.processingTeam = selectedRows[0].id
        }
      }
    },
    handleSubmit () {
      this.$refs.form.validate().then((queryParams) => {
        if (this.formType === '1') {
          this.formData.id = this.businessKey
        } else {
          this.formData.demandId = this.businessKey
        }
        this.formData.type = this.formType
        this.$api['demandManagement.saveRequirement'](this.formData).then(res => {
          if (res) {
            // this.$message.success('保存成功')
            this.viewForm()
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  height: 100% !important;
  overflow: auto;
}

.content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: baseline;
  position: relative;
}
.formRender {
  width: 50%;
}
.formList {
  width: 50%;
  ::v-deep .el-col-12 {
    height: 50px !important;
  }
}
.btn {
  position: absolute;
  bottom: 5px;
  right: 30px;
}
</style>
