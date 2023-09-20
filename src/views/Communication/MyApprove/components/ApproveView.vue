<template>
  <div class="container">
    <div class="approveContent">
      <common-tabs class="custom-tabs"
                   type="border-card"
                   :active-tabs="activeTabs"
                   :tabs-data="tabs">
        <template #approval>
          <component ref="approveContent"
                     :style="{ height: tabsHeight }"
                     :is="componentUrl"
                     v-if="formComp != null && formComp != '' && componentsParams"
                     :code="componentsParams.code"
                     :data-view-id="componentsParams.dataViewId"
                     :record="{ desformCode: componentsParams.codeForm }"
                     :permission-vo="componentsParams.permissionVo"
                     :layout-config="componentsParams"
                     v-bind="formCompProp"
                     :kanban-config="componentsParams" />
          <component ref="approveContent"
                     :style="{ height: tabsHeight }"
                     :selected-approval="selectedApproval"
                     :curr-entity-id="currEntityId"
                     v-else-if="formComp != null && formComp != ''"
                     :is="componentLoader"
                     v-bind="formCompProp"
                     :approval-result="formData.approvalResult"
                     @approve-submit="approveSubmit"
                     @selection-ids="selectionIdsByApprovalResult" />
        </template>
        <template #bpmn>
          <bpm-view v-if="selectedApproval.processDefId != ''"
                    :style="{ height: tabsHeight }"
                    :process-obj="{
              processDefinitionId: selectedApproval.processDefId,
              processInstanceId: selectedApproval.processInstId
            }"
                    @getIsWarnApprove="getIsWarnApprove"></bpm-view>
        </template>
        <template #history>
          <ProcessHistoryList v-if="processInstId"
                              :style="{ height: tabsHeight }"
                              :table-api="historyDataApi"
                              :columns="historyColumns"
                              :process-inst-id="processInstId"
                              :business-key="businessKey"
                              :table-flex="tableFlex"></ProcessHistoryList>
        </template>
      </common-tabs>
    </div>
    <div class="approveTitle">
      <template title="填写审批意见">
        <div class="contentTitle">
          <i class="el-icon-edit-outline"></i>
          填写审批意见{{ signText }}
        </div>
        <div>
          <form-list v-if="formValidate"
                     ref="form"
                     label-width="120px"
                     @rendered="rendered"
                     @saved="saved"
                     :data-source="dataSource"
                     :exist-default-btn="false"
                     :api="saveApi"
                     :is-custom-validate="isCustomValidate"
                     @custom-validate="customValidate"
                     :form="formData"
                     @form-data-change="formDataChange">
            <template #uploadFiles>
              <div class="edit-outputdata-view">
                <ul class="file-list">
                  <li v-for="item in formData.uploadFiles"
                      :key="item.id">
                    <p>
                      <span class="filename"
                            @click="downloadOutputRequsetFile(item)">
                        {{ item.fileName }}
                      </span>
                    </p>
                  </li>
                </ul>
              </div>
            </template>
          </form-list>
        </div>
      </template>
      <el-row>
        <!-- <el-col :span="20" class="flex-left">
                  {{selectedApproval.processName}}{{selectedApproval.startTime}}
              </el-col> -->
        <el-col :span="24"
                style="text-align: right">
          <el-button style="margin: 8px 10px 0 0"
                     type="primary"
                     @click="handleSubmit">提交审批</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
// import { axiosRequestSucessFunc } from '@/config/interceptors/axios'
import { P8Form as FormList, P8ProcessApproval as BpmView, Row, Col, Button, P8TreeSelect as TreeSelect, P8Dialog as CommonDialog, P8Tabs as CommonTabs } from 'p8-components-ui'
import ProcessHistoryList from '@/views/Framework/BusinessActivity/ProcessApproval/processHistoryList.vue'
export default {
  name: 'Approval',
  components: {
    TreeSelect,
    FormList,
    BpmView,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
    CommonDialog,
    ProcessHistoryList,
    CommonTabs
  },
  props: {
    selectedApproval: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      tabsHeight: document.documentElement.clientHeight - 380 + 'px',
      saveApi: 'PersonalProcessApproval.saveResult',
      formComp: '',
      currEntityId: '',
      formCompProp: {},
      businessId: '',
      formValidate: false,
      isCustomValidate: true,
      processKey: '',
      taskId: '',
      ar: ['domainCoordination', 'planCoordination', 'planApproveRelease'],
      updatePlanDataSource: ['domainCoordination', 'planCoordination', 'planApproveRelease'],
      historyDataApi: undefined,
      historyColumns: undefined,
      historyColumnsTemp: [
        {
          title: '序号',
          type: 'index',
          align: 'center'
        },
        {
          title: '计划名称',
          dataIndex: 'businessChildName',
          sortable: false,
          align: 'left'
        },
        {
          title: '审批意见',
          dataIndex: 'opinion',
          sortable: false,
          align: 'left'
        },
        {
          title: '审批结果',
          dataIndex: 'yesOrNo',
          sortable: false,
          width: '100px',
          align: 'center'
        },
        {
          title: '审批人',
          dataIndex: 'approveUser',
          sortable: false,
          width: '100px',
          align: 'center'
        },
        {
          title: '审批节点',
          dataIndex: 'processTaskName',
          sortable: false,
          align: 'center'
        },
        {
          title: '审批时间',
          dataIndex: 'approvalTime',
          sortable: false,
          width: '140px',
          align: 'center'
        }
      ],
      isWarnApprove: '',
      taskNodeList: [],
      planInfoArray: [],
      approvalResultText: '操作',
      dialogConfig: {
        beforeClose: this.handleCancel,
        destroyOnClose: 'true',
        modal: false
      },
      saveParams: {},
      sourceTemplate: {
        processInstanceEl: {
          type: 'text',
          labelText: '审批流程',
          fieldName: 'businessName',
          disabled: true,
          colLayout: 'singleCol',
          fieldConfig: {
            disabled: true
          }
        },
        approveNode: {
          type: 'select',
          labelText: '审批节点',
          fieldName: 'nextTaskNodeId',
          options: [],
          multiple: false,
          disabled: true,
          placeholder: '选择节点',
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: true
          }
        },
        approveNodeUsers: {
          type: 'treeSelect',
          labelText: '审批人',
          fieldName: '',
          placeholder: '选择节点审批人',
          colLayout: 'doubleCol',
          treeData: []
        }
      },
      formData: {
        taskId: '',
        processInstance: '',
        approvalResult: '',
        processKey: '',
        officeResult: '',
        officeResultText: '',
        approvalParams: '',
        sendMsg: '',
        businessKey: '',
        approveData: {},
        approvalComment: undefined,
        uploadFiles: []
      },
      processInstId: '',
      businessKey: '',
      signText: '',
      dataSource: [],
      dataSourceDefault: [
        {
          type: 'radio', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'singleCol',
          options: [
            {
              label: '通过',
              value: '1'
            },
            {
              label: '驳回',
              value: '0'
            }
          ],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '审批意见',
          fieldName: 'approvalComment',
          colLayout: 'singleCol',
          placeholder: '请输入审批意见'
        }
      ],
      dataSourceDefaultPlan: [
        {
          type: 'radio', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'singleCol',
          options: [
            {
              label: '通过',
              value: '1'
            },
            {
              label: '完善计划',
              value: '0'
            }
          ],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '审批意见',
          fieldName: 'approvalComment',
          colLayout: 'singleCol',
          placeholder: '请输入审批意见'
        }
      ],
      dataSourceSign: [
        {
          type: 'radio', // 控件类型
          labelText: '会签结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'singleCol',
          options: [
            {
              label: '通过',
              value: '1'
            }
          ],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '会签意见',
          fieldName: 'approvalComment',
          colLayout: 'singleCol',
          placeholder: '请输入会签意见'
        }
      ],
      dataSourceTemp: [
        {
          type: 'radio', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'singleCol',
          options: [
            {
              label: '通过',
              value: '1'
            },
            {
              label: '完善计划',
              value: '0'
            }
          ],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '审批意见',
          fieldName: 'approvalComment',
          colLayout: 'singleCol',
          placeholder: '请输入审批意见'
        },
        {
          type: 'radio',
          labelText: '所长办公会审议',
          fieldName: 'officeResult',
          colLayout: 'singleCol',
          options: [
            {
              label: '通过',
              value: '1'
            },
            {
              label: '不通过',
              value: '0'
            }
          ],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'upload',
          labelText: '上传附件',
          fieldName: 'uploadFiles',
          colLayout: 'singleCol',
          uploadConfig: {
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      dataSourceTempView: [
        {
          type: 'radio', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'singleCol',
          options: [
            {
              label: '通过',
              value: '1'
            },
            {
              label: '完善计划',
              value: '0'
            }
          ],
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '审批意见',
          fieldName: 'approvalComment',
          colLayout: 'singleCol',
          placeholder: '请输入审批意见'
        },
        {
          type: 'view',
          labelText: '所长办公会审议',
          fieldName: 'officeResultText',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '型号调度上传文件',
          fieldName: 'uploadFiles',
          slotName: 'uploadFiles',
          colLayout: 'singleCol'
        }
      ],
      tabs: [
        {
          label: '审批内容',
          name: 'approval',
          icon: 'icon-shenpineirong'
        },
        {
          label: '流程跟踪视图',
          name: 'bpmn',
          icon: 'icon-liuchenggenzongshitu'
        },
        {
          label: '审批历史',
          name: 'history',
          icon: 'icon-shenpilishi'
        }
      ],
      activeTabs: 'approval',
      tableFlex: 315,
      componentsParams: null,
      asyncComponents: ''
    }
  },
  computed: {
    componentLoader () {
      const comp = this.formComp

      return () => import('@/views/' + comp)
    },
    componentUrl () {
      if (this.asyncComponents) {
        return () => import(`@/views/${this.asyncComponents}.vue`)
      }
    }
  },
  watch: {
    selectedApproval: {
      deep: true,
      handler: function (newV, oldV) {
        this.formComp = ''
        this.processInstId = newV.processInstId
        this.businessKey = newV.businessKey
        this.processKey = newV.processKey
        this.taskId = newV.processTaskId

        if (this.ar.indexOf(this.processKey) !== -1) {
          this.historyColumns = this.historyColumnsTemp
          this.historyDataApi = 'PersonalProcessApproval.customHistoryList'
        } else {
          this.historyColumns = undefined
          this.historyDataApi = 'PersonalProcessApproval.processHistoryList'
        }

        this.approvalResultText = '操作'
        this.loadFormKey()
        this.loadApprovalForm()
      }
    }
  },
  created () {
    this.loadFormKey()
    this.loadApprovalForm()
  },
  mounted () {
    this.processKey = this.selectedApproval.processKey
    if (this.ar.indexOf(this.processKey) !== -1) {
      this.historyDataApi = 'PersonalProcessApproval.customHistoryList'
      this.historyColumns = this.historyColumnsTemp
    } else {
      this.historyDataApi = undefined
      this.historyColumns = undefined
    }
    this.processInstId = this.selectedApproval.processInstId
    this.businessKey = this.selectedApproval.businessKey
    this.taskId = this.selectedApproval.processTaskId
  },
  methods: {
    getIsWarnApprove (isWarnApprove) {
      this.isWarnApprove = isWarnApprove
    },
    handleSubmit (e) {
      if (!this.formData.approvalResult) {
        this.$message({ message: '请选择审批结果', type: 'warning' })
        return
      }

      if (this.formData.approvalParams && this.formData.approvalParams === 'canEdit' && !this.formData.officeResult) {
        this.$message({ message: '请选择所长办公会审议结果', type: 'warning' })
        return
      }

      const msg = '确定' + this.approvalResultText + '吗？'

      const this_ = this

      if (this_.$refs.approveContent.approveCommitVerification instanceof Function) {
        this_.$refs.approveContent.approveCommitVerification(e, msg)
      } else {
        this_
          .$confirm(msg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          .then(() => {
            this.$refs.form.handleSubmit(e)
          })
          .catch(() => { })
      }
    },
    approveSubmit (e, msg) {
      if (msg) {
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$refs.form.handleSubmit(e)
          })
          .catch(() => { })
      } else {
        this.$refs.form.handleSubmit(e)
      }
    },
    customValidate (saveParams) {
      this.saveParams = saveParams
      this.$refs.form.submitForm(this.saveParams, this.saveApi)
    },
    rendered () {
      // this.$refs.form.setViewFields({ 'none': 'none' })
      this.formData.taskId = this.selectedApproval.processTaskId
      this.formData.processInstance = this.selectedApproval.processInstId
    },
    saved (result) {
      const this_ = this
      if (result && result.isComplete === false) {
        const formCompTemp = this.formComp
        this.formComp = null
        this.formComp = formCompTemp
      } else {
        this_.$emit('approved', this_.formData.taskId)
      }
    },
    isUpdatePlanDataSource () {
      let result = false
      const processKey = this.selectedApproval.processKey
      if (this.updatePlanDataSource.indexOf(processKey) !== -1) {
        result = true
      }
      return result
    },
    loadFormKey () {
      const this_ = this
      if (this.isUpdatePlanDataSource()) {
        this_.dataSource = this_.dataSourceDefaultPlan
      } else {
        this_.dataSource = this_.dataSourceDefault
      }
      this_.formData.approvalParams = ''
      this_.formData.sendMsg = ''
      this_.signText = ''
      this.$api['PersonalProcessApproval.getApproveContentViewUrl']({ taskId: this.selectedApproval.processTaskId }).then((res) => {
        if (res && res.length > 0) {
          const page = {}
          let inputProp = {}
          this.currEntityId = this.selectedApproval.businessKey
          res.forEach((o) => {
            if (o.variableName === 'approveContentView') {
              page.url = o.value.url
              console.log(o.value.url, '----------我的路径ppppppppppp')
              this_.formComp = o.value.url
              page.code = o.value.code
              const canEnd = o.value.canEnd
              const canEdit = o.value.canEdit
              const canView = o.value.canView
              const sendMsg = o.value.sendMsg
              const sign = o.value.sign
              this_.formData.sendMsg = sendMsg
              if (canEnd && canEnd === 'canEnd') {
                this_.formData.approvalParams = canEnd
              }
              if (canEdit && canEdit === 'canEdit') {
                this_.dataSource = this_.dataSourceTemp
                this_.formData.approvalParams = canEdit
              }
              if (canView && canView === 'canView') {
                this_.dataSource = this_.dataSourceTempView
                this_.formData.approvalParams = canView
              }
              if (sign && sign === 'sign') {
                this_.dataSource = this_.dataSourceSign
                this_.signText = '(会签)'
              }
              this_.loadApprovalFormData()
              inputProp = { ...inputProp, ...o.value }
            }
            inputProp[o.variableName] = o.value
          })

          this_.formCompProp = { ...inputProp, ...page, ...{ taskId: this_.taskId, tableFlex: this.tableFlex, headerVisible: false, pageType: 'view' } }
          if (this_.formCompProp.approveContentView) {
            this_.componentsParams = this_.formCompProp.approveContentView.formSelector ? JSON.parse(this_.formCompProp.approveContentView.formSelector) : null
            if (this_.componentsParams) {
              this_.componentsParams.dataViewId = this_.formCompProp.customBusinessKey ? this_.formCompProp.customBusinessKey : this_.formCompProp.businessKey
              this_.asyncComponents = this_.componentsParams.url
            }
          }
          console.log(this_.componentsParams, '====componentsParams')
        }
        this_.formValidate = true
      })
    },
    loadApprovalForm () {
      this.formData.approvalComment = undefined
      this.formData.approvalResult = this.dataSource[0].options.length === 1 ? '1' : ''
      this.formData.taskId = this.selectedApproval.processTaskId
      this.formData.processInstance = this.selectedApproval.processInstId
      this.formData.processKey = this.selectedApproval.processKey
      this.formData.businessKey = this.selectedApproval.businessKey
    },
    loadApprovalFormData () {
      const this_ = this
      if (this_.formData.approvalParams && (this_.formData.approvalParams === 'canView' || this_.formData.approvalParams === 'canEdit')) {
        this_.$api['ProjectApply.getWholeCopyClearly']({ wholeDescribeId: this_.selectedApproval.businessKey }).then((res) => {
          if (res) {
            this_.formData.officeResult = res.officeResult
            this_.formData.officeResultText = res.officeResultText
            this_.formData.uploadFiles = res.uploadFiles
          }
        })
      } else {
        this_.formData.officeResult = ''
        this_.formData.officeResultText = ''
        this_.formData.uploadFiles = []
      }
    },
    downloadOutputRequsetFile (item) {
      // 输出要求-文件下载
      if (item.id) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' })
          .then((backJson) => {
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(new Blob([backJson.data]))
            link.download = item.fileName
            document.body.appendChild(link)

            link.click()
            window.URL.revokeObjectURL(link.href)
            document.body.removeChild(link)
          })
          .finally(() => {
            // this.search.exportLoading = false
          })
      }
    },
    formDataChange (formSub) {
      if (formSub.formData.approvalResult === '1') {
        this.approvalResultText = '通过'
      }
      if (formSub.formData.approvalResult === '0') {
        if (this.isUpdatePlanDataSource()) {
          this.approvalResultText = '完善计划'
        } else {
          this.approvalResultText = '驳回'
        }
      }
      if (formSub.formData.approvalResult === '0' && (this.formData.approvalComment === undefined || this.formData.approvalComment === this.$store.state.project.baseConfig.defaultCommentYes)) {
        // this.formData.approvalComment = this.$store.state.project.baseConfig.defaultCommentNo
        this.formData = Object.assign({}, this.formData, { approvalComment: this.$store.state.project.baseConfig.defaultCommentNo })
      }
      if (formSub.formData.approvalResult === '1' && (this.formData.approvalComment === undefined || this.formData.approvalComment === this.$store.state.project.baseConfig.defaultCommentNo)) {
        // this.formData.approvalComment = this.$store.state.project.baseConfig.defaultCommentYes
        this.formData = Object.assign({}, this.formData, { approvalComment: this.$store.state.project.baseConfig.defaultCommentYes })
      }
    },
    selectionIdsByApprovalResult (approveData) {
      this.formData.approveData = approveData
    }
  }
}
</script>

<style lang="scss" scoped>
$titleHeight: 80px;
$paddingLeft: 10px;
.container {
  height: 100%;

  // .approveTitle {
  //   padding-left: $paddingLeft;
  // }

  .approveContent {
    height: calc(100% - #{$titleHeight} - 147px);
    overflow: auto;
    .bpmnDiagram {
      height: 500px;
    }
    .contentBody {
      height: 100%;
    }
  }
}
.custom-tabs {
  ::v-deep.el-tabs {
    border: none;
  }
  height: calc(100% - 40px);
}
.custom-tabs.el-tabs--top {
  height: calc(100% - 128px) !important;
  border: 0px;
  box-sizing: border-box;
  ::v-deep .el-tabs__content {
    padding: 0;
    overflow: auto;
  }
  ::v-deep .el-tabs__nav-wrap {
    margin-bottom: 0;
  }
  ::v-deep .el-tabs__nav.is-top {
    background: #f5f7fa;
  }
  ::v-deep .el-row.formBtn {
    border-top: 0px;
  }
}
.edit-outputdata-view {
  background-color: rgba(239, 239, 239, 0.5);
  position: relative;
  min-height: 40px;
  .file-list {
    li {
      box-sizing: border-box;
      list-style: decimal;
      padding: 0 10px;
      margin-left: 20px;
      p {
        margin: 0;
        padding: 0;
      }
      p span.filename {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
.contentTitle {
  border-bottom: 1px solid #efefef;
  padding-left: $paddingLeft;
  height: 40px;
  width: 100%;
  background: #f4f9ff;
  line-height: 40px;
  font-size: 14px;
  box-sizing: border-box;
}
</style>
