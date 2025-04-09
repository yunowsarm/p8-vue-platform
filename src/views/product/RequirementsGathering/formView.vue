<template>
  <div class="header">
    <div class="content">
      <div style="width: 50%;">
        <div class="title">{{ sourceChannel }}</div>
        <form-render class="formRender"
                     :data-view-id="dataViewId"
                     :record="{ desformCode: codeForm }"
                     :prop-param="propParam"
                     page-type="view"
                     v-bind="$attrs"></form-render>
      </div>
      <div v-if="formType === '1'"
           style="width: 50%;">
        <div class="title">市场需求信息表</div>
        <form-list ref="formInfo2"
                   :key="formKey"
                   class="formList"
                   label-width="150px"
                   :data-source="dataSource"
                   :exist-default-btn="false"
                   :form="formData">
        </form-list>
        <div class="title">预审意见</div>
        <form-list ref="formInfo3"
                   class="formList"
                   :key="formKey"
                   label-width="150px"
                   :data-source="dataSource2"
                   :exist-default-btn="false"
                   :form="formData">
          <template #requirementAnalyst>
            <div @click="selectPeople('1')">
              <el-input v-model="formData['requirementAnalystDisplay']"
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
      <div v-else
           style="width: 50%;">
        <div class="title">需求信息描述</div>
        <form-list ref="formInfo4"
                   :key="formKey"
                   class="formList"
                   label-width="150px"
                   :data-source="dataSource3"
                   :exist-default-btn="false"
                   :form="formData">
        </form-list>
        <div class="title">分析意见</div>
        <form-list ref="formInfo5"
                   :key="formKey"
                   class="formList"
                   label-width="150px"
                   :data-source="dataSource4"
                   :exist-default-btn="false"
                   :form="formData">
          <template #processingTeam>
            <el-button class="selectedBtn"
                       type="link"
                       size="small"
                       icon="user-add"
                       @click="selectPeople('2')">选择人员</el-button>
            <ul class="userList">
              <li v-for="item in selectedRows"
                  :key="item.id">
                <span>{{ item.realName }}</span>
                <i class="el-icon-circle-close"
                   @click="deleteUser(item.id)"></i>
              </li>
            </ul>
            <!-- <div @click="selectPeople">
              <el-input v-model="formData['processingTeamDisplay']"
                        readonly
                        autosize>
                <template slot="append"><i class="el-icon-link"
                     type="link"
                     :style="{ fontSize: '16px', color: '#08c' }"></i></template>
              </el-input>
            </div> -->
          </template>
        </form-list>
      </div>
    </div>
    <!-- <div class="btn"
         v-if="!selectedApproval.yesOrNo">
      <el-button type="primary"
                 @click="handleSubmit">保存</el-button>
    </div> -->
    <select-user v-if="visible"
                 class="selectUser"
                 :visibleDislogMember="visible"
                 loginFlag="1"
                 :existsData="selectedRows"
                 :isRadioSelect="isRadioSelect"
                 :disabled-row="formData.processingTeam"
                 @member-save="saveModal"
                 @member-close="closeModal"></select-user>
  </div>
</template>

<script>
import { P8Form as FormList } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import SelectUser from './selectUser.vue'
export default {
  components: {
    FormList,
    SelectUser,
    FormRender
  },
  props: {
    searchParams: {
      type: Object,
      default: () => { }
    },
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
      formKey: new Date().getTime(),
      formType: this.type,
      saveType: false,
      visible: false,
      codeForm: this.demandCode, // 新建/修改表单code
      dataViewId: this.businessKey, // 修改页面id
      propParam: {}, // 将参数传至表单
      formData: {
        uploadFiles: [],
        processingTeam: [],
        processingTeamDisplay: ''
      },
      dataSourceInfo: [
        {
          type: 'text',
          labelText: '需求名称',
          fieldName: 'demandName',
          placeholder: '请输入需求名称',
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
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
          colLayout: 'singleCol'
        },
        {
          labelText: '客户联系电话',
          type: 'text',
          fieldName: 'customerPhone',
          colLayout: 'singleCol',
          placeholder: '请输入手机或座机号码',
          tip: '手机格式如:13512341234 座机213格式如:010-40020020',
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
          maxlength: 10,
          tip:''
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
          type: 'multiple',
          labelText: '需求预分类建议',
          fieldName: 'demandSuggestionsArr',
          fieldConfig: {},
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'demandSuggestion' }
          },
          options: [],
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
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
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '需求紧迫性',
          fieldName: 'demandUrgency',
          colLayout: 'singleCol',
          placeholder: '请输入需求紧迫性',
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '用户需求描述',
          fieldName: 'demandDescribe',
          colLayout: 'singleCol',
          placeholder: '请输入用户需求描述',
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
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
        }
      ],
      dataSourceOpinion: [
        {
          type: 'blank',
          labelText: '选择需求分析人',
          fieldName: 'requirementAnalyst',
          slotName: 'requirementAnalyst',
          colLayout: 'singleCol',
          placeholder: '选择需求分析人',
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'datetime',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'singleCol',
          placeholder: '请选择完成时间',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          },
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        }
      ],
      dataSourceInfoTwo: [
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
      ],
      dataSourceAnalyse: [
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
          maxlength: 10,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
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
          maxlength: 10
        },
        {
          labelText: '客户联系电话',
          type: 'view',
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
          type: 'view',
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
          type: 'view',
          labelText: '客户群',
          fieldName: 'customerGroup',
          placeholder: '请输入客户群',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'view',
          labelText: '基线产品/项目名称',
          fieldName: 'projectName',
          placeholder: '请输入基线产品/项目名称',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'view',
          labelText: '需求预分类建议',
          fieldName: 'demandSuggestionsDisplay',
          fieldConfig: {},
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'demandSuggestion' }
          },
          options: [],
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'view', // 控件类型
          labelText: '是否属于紧急需求', // 控件显示的文本
          fieldName: 'urgentNeedDisplay',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'EMERGENCY_NEED' }
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
          type: 'view', // 控件类型
          labelText: '客户反映', // 控件显示的文本
          fieldName: 'customerFeedbackDisplay',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'CUSTOMER_RESPONSE' }
          },
          options: []
        },
        {
          type: 'view', // 控件类型
          labelText: '是否承诺', // 控件显示的文本
          fieldName: 'commitmentDisplay',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'PROMISE_OR_NOT' }
          },
          options: []
        },
        {
          type: 'view',
          labelText: '需求背景',
          fieldName: 'demandBackground',
          colLayout: 'singleCol',
          placeholder: '请输入需求背景',
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'view',
          labelText: '需求紧迫性',
          fieldName: 'demandUrgency',
          colLayout: 'singleCol',
          placeholder: '请输入需求紧迫性',
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'view',
          labelText: '用户需求描述',
          fieldName: 'demandDescribe',
          colLayout: 'singleCol',
          placeholder: '请输入用户需求描述',
          maxlength: 250,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
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
        }
      ],
      dataSourceOpinionView: [
        {
          type: 'view',
          labelText: '选择需求分析人',
          fieldName: 'requirementAnalystDisplay',
          colLayout: 'singleCol',
          placeholder: '选择需求分析人',
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        },
        {
          type: 'view',
          labelText: '需求分析要求完成时间',
          fieldName: 'requirementTime',
          colLayout: 'singleCol',
          placeholder: '请选择完成时间',
          fieldConfig: {
            valueFormat: 'yyyy-MM-dd'
          },
          rules: [
            {
              required: true,
              message: '必选'
            }
          ]
        }
      ],
      dataSourceInfoTwoView: [
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
      ],
      dataSourceAnalyseView: [
        {
          type: 'view',
          labelText: '需求关键字',
          fieldName: 'keywords',
          placeholder: '请输入需求关键字',
          colLayout: 'singleCol',
          maxlength: 10
        },
        {
          type: 'view', // 控件类型
          labelText: '客户优先级', // 控件显示的文本
          fieldName: 'priorityDisplay',
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
          type: 'view', // 控件类型
          labelText: '产品优先级', // 控件显示的文本
          fieldName: 'productPriorityDisplay',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'PRODUCT_PRIORITY' }
          },
          options: []
        },
        {
          type: 'view', // 控件类型
          labelText: '技术优先级', // 控件显示的文本
          fieldName: 'technologyPriorityDisplay',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'TECHNICAL_PRIORITY' }
          },
          options: []
        },
        {
          type: 'view', // 控件类型
          labelText: '需求程度分类', // 控件显示的文本
          fieldName: 'demandLevelDisplay',
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
          type: 'view',
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
          type: 'view',
          labelText: '需求层次分类',
          fieldName: 'classificationDemandDisplay',
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'demandSuggestion' }
          },
          colLayout: 'singleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '需求时间窗', // 控件显示的文本
          fieldName: 'timeWindowDisplay',
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
          type: 'view',
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
          type: 'view',
          labelText: '建议需求处理团队',
          fieldName: 'processingTeamDisplay',
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
          type: 'view',
          labelText: '需求处理结论',
          fieldName: 'processingConclusionDisplay',
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
      dataSource: [],
      dataSource2: [],
      dataSource3: [],
      dataSource4: [],
      selectedRows: [],
      isRadioSelect: true
    }
  },
  created() {
    this.getFiledInfo()
  },
  mounted () {
    this.formData.sourceChannel = this.sourceChannel
    // 区分不同审批节点展示不同表单
    if (this.formType === '1') {
      if (!this.selectedApproval.yesOrNo && this.searchParams.msgCatalog == "APPROVE_TYPE_02_01") {
        this.dataSource = this.dataSourceInfo
        this.dataSource2 = this.dataSourceOpinion
      } else {
        this.dataSource = this.dataSourceInfoView
        this.dataSource2 = this.dataSourceOpinionView
      }
    } else {
      if (!this.selectedApproval.yesOrNo && this.searchParams.msgCatalog == "APPROVE_TYPE_02_01") {
        this.dataSource3 = this.dataSourceInfoTwo
        this.dataSource4 = this.dataSourceAnalyse
      } else {
        this.dataSource3 = this.dataSourceInfoTwoView
        this.dataSource4 = this.dataSourceAnalyseView
      }
    }
    this.viewForm()
  },
  methods: {
    getFiledInfo(){
      this.$api['demandManagement.getFiledInfo']({fieldCode:''}).then((res) => {
        if (res && res.length > 0) {
          const dataSources = [
            this.dataSourceInfo,
            this.dataSourceOpinion,
            this.dataSourceInfoTwo,
            this.dataSourceAnalyse,
            this.dataSourceInfoView,
            this.dataSourceOpinionView,
            this.dataSourceInfoTwoView,
            this.dataSourceAnalyseView
          ];
          res.forEach(field => {
            dataSources.forEach(source => {
              source.forEach(item => {
                if (item.labelText === field.fieldName) {
                  item.tip = field.fieldTitle;
                  this.$set(item, 'tip', field.fieldTitle)
                }
              });
            });
          });
          // 强制重新渲染表单
          this.$nextTick(() => {
            this.formKey = new Date().getTime();
          });
        }
      })
    },
    approveCommit (e, msg) {
      //
      // this.$refs.form.$refs.form.$refs.parser.submitForm()
      this.handleSubmit()
    },
    viewForm () {
      this.$api['demandManagement.viewRequirement']({
        id: this.businessKey
      }).then((res) => {
        if (res) {
          // debugger
          if (this.formType === '1') {
            if (res.requirementAnalyst) {
              this.formData = res
              if (res.demandSuggestions.indexOf(',') !== -1) {
                this.formData.demandSuggestionsArr = res.demandSuggestions.split(',')
              } else {
                this.formData.demandSuggestionsArr.push(res.demandSuggestions)
              }
              this.$set(this.formData, 'sourceChannel', this.sourceChannel)
            }
          } else {
            if (res.analysisList.length > 0) {
              this.formData = res.analysisList[0]
            }
            // this.$set(this.formData, 'processingTeamDisplay', res.analysisList[0].processingTeamDisplay)
            this.$set(this.formData, 'earlyPlan', res.earlyPlan)
            this.$set(this.formData, 'requirementTime', res.requirementTime)
          }
        }
      })
    },
    selectPeople (val) {
      if (val === '1') {
        this.isRadioSelect = true
      } else {
        this.isRadioSelect = false
      }
      this.visible = true
    },
    deleteUser (id) {
      this.formData.processingTeam.splice(
        this.formData.processingTeam.findIndex((v) => v === id),
        1
      )
      this.selectedRows.splice(
        this.selectedRows.findIndex((v) => v.id === id),
        1
      )
    },
    saveModal (selectedRows) {
      this.selectedRows = selectedRows
      if (selectedRows.length > 0) {
        if (this.formType === '1') {
          if (selectedRows.length === 1) {
            this.$set(this.formData, 'requirementAnalystDisplay', selectedRows[0].realName)
            this.formData.requirementAnalyst = selectedRows[0].id
          } else {
            return this.$message.warning('只能选择一个需求分析人')
          }
        } else {
          let names = []
          let ids = []
          selectedRows.forEach((item, index) => {
            ids.push(item.id)
            names.push(item.realName)
          })
          let name = names.join(',')
          this.$set(this.formData, 'processingTeamDisplay', name)
          this.formData.processingTeam = ids
        }
      } else {
        if (this.formType === '1') {
          this.$set(this.formData, 'requirementAnalystDisplay', '')
          this.formData.requirementAnalyst = ''
        } else {
          this.formData.processingTeam = []
          this.$set(this.formData, 'processingTeamDisplay', '')
        }
      }
      this.visible = false
    },
    closeModal (selectedRows) {
      this.visible = false
    },
    handleSubmit () {
      if (this.formType === '1') {
        this.$refs.formInfo2.validate().then((queryParams) => { })
        this.$refs.formInfo3.validate().then((queryParams) => { })
        if (this.formData.demandSuggestionsArr.length > 1) {
          this.formData.demandSuggestions = this.formData.demandSuggestionsArr.join(',')
        } else {
          this.formData.demandSuggestions = this.formData.demandSuggestionsArr[0]
        }

        if
          (
          !this.formData.demandName ||
          !this.formData.demandSuggestions ||
          !this.formData.urgentNeed ||
          !this.formData.demandBackground ||
          !this.formData.demandUrgency ||
          !this.formData.demandDescribe ||
          !this.formData.requirementAnalyst ||
          !this.formData.requirementTime) {
          return false
        } else {
          this.formData.id = this.businessKey
          this.saveType = true
        }
      } else {
        this.$refs.formInfo4.validate().then((queryParams) => { })
        this.$refs.formInfo5.validate().then((queryParams) => { })
        if
          (
          !this.formData.priority ||
          !this.formData.demandLevel ||
          !this.formData.preliminaryVerification ||
          !this.formData.timeWindow ||
          !this.formData.handlingSuggestions ||
          !this.formData.processingConclusion ||
          !this.formData.processingTeam) {
          return false
        } else {
          this.formData.demandId = this.businessKey
          this.saveType = true
        }
      }
      this.formData.type = this.formType

      this.$api['demandManagement.saveRequirement'](this.formData).then((res) => {
        if (res) {
          // this.$message.success('保存成功')
          // this.viewForm()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.userList {
  background: #ffffff;
  overflow: hidden;
}
.userList li {
  float: left;
  padding: 0px 10px;
  margin: 5px;
  border-radius: 3px;
  /*border:1px solid #1890FF;*/
  border: 1px solid #e8e8e8;
}
.userList li:first-child .selectedBtn {
  border: 1px dashed #1890ff;
  height: 29px;
}
.title {
  font-size: 17px;
  font-weight: bold;
  margin: 10px 0;
}
.header {
  height: calc(100% - 50px) !important;
  overflow: auto;
}
.content {
  padding: 15px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: baseline;
  position: relative;
  height: 100%;
}
.formRender {
  height: 100%;
  overflow-y: auto;
}
.formList {
  height: 100%;
  overflow-y: auto;
  // width: 50%;
  // ::v-deep .el-col-12 {
  //   height: 50px !important;
  // }
}
.btn {
  position: absolute;
  bottom: 5px;
  right: 30px;
}
</style>
