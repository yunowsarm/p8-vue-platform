<template>
  <div class="container">
    <div class="approveContent">
      <vue-perfect-scroll class="scroll-area">
        <div class="contentTitle">
          <i class="p8 icon-fill-in-approval-comments"></i>
          审批意见
        </div>
        <div>
          <form-list v-if="formValidate"
                     ref="form"
                     label-width="120px"
                     :data-source="dataSource"
                     :exist-default-btn="false"
                     :api="saveApi"
                     :form="formData">
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
        <common-tabs class="custom-tabs"
                     type="border-card"
                     :style="{height: tabsHeight}"
                     :active-tabs="activeTabs"
                     :hasFullScreen="true"
                     :tabs-data="tabs">
          <template #approval>
            <component :style="{ height: tabsHeight}"
                       :selected-approval="selectedApproval"
                       :curr-entity-id="currEntityId"
                       :searchParams="searchParams"
                       v-if="formComp != null && formComp != '' && componentsParams"
                       :code="componentsParams.code"
                       :data-view-id="componentsParams.dataViewId"
                       :record="{ desformCode: componentsParams.codeForm }"
                       :permission-vo="componentsParams.permissionVo"
                       :layout-config="componentsParams"
                       :is="componentLoader"
                       v-bind="formCompProp"
                       :kanban-config="componentsParams" />
            <component :style="{ height: tabsHeight }"
                       :searchParams="searchParams"
                       :selected-approval="selectedApproval"
                       :curr-entity-id="currEntityId"
                       v-else-if="formComp != null && formComp != ''"
                       :is="componentLoader"
                       v-bind="formCompProp" />
          </template>
          <template #bpmn>
            <bpm-view :style="{ height: tabsHeight}"
                      v-if="selectedApproval.processDefId != ''"
                      :process-obj="{
                processDefinitionId: selectedApproval.processDefId,
                processInstanceId: selectedApproval.processInstId
              }"></bpm-view>
          </template>
          <template #history>
            <ProcessHistoryList v-if="processInstId && tabsHeight"
                                :style="{ height: historyHeight + 'px' }"
                                :table-api="historyDataApi"
                                :columns="historyColumns"
                                :process-inst-id="processInstId"
                                :business-key="businessKey"
                                :table-flex="tableFlex"></ProcessHistoryList>
          </template>
        </common-tabs>
      </vue-perfect-scroll>
    </div>
  </div>
</template>

<script>
import { P8Form as FormList, P8ProcessApproval as BpmView, Row, Col, Button, P8TreeSelect as TreeSelect, P8Dialog as CommonDialog, P8Tabs as CommonTabs } from 'p8-components-ui'

import ProcessHistoryList from '@/views/Framework/BusinessActivity/ProcessApproval/processHistoryList.vue'
import VuePerfectScroll from 'vue-perfect-scrollbar'

export default {
  name: 'History',
  components: {
    TreeSelect,
    FormList,
    BpmView,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
    CommonDialog,
    VuePerfectScroll,
    ProcessHistoryList,
    CommonTabs
  },
  props: {
    searchParams: {
      type: Object,
      default: () => { }
    },
    selectedApproval: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      tabsHeight: document.documentElement.clientHeight,
      historyHeight: document.documentElement.clientHeight - 300,
      businessId: '',
      formComp: '',
      currEntityId: '',
      formValidate: false,
      approveContentTitle: '审批内容',
      processKey: '',
      componentsParams: null,
      ar: ['domainCoordination', 'planCoordination', 'planApproveRelease'],
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
      formCompProp: {
        compType: 'approvalHistoryView',
        approveData: this.selectedApproval.approveDataObj
      },
      bpmnSnapshoot: {},
      dataSource: [],
      dataSourceDefault: [
        {
          type: 'view', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '审批意见',
          fieldName: 'approvalComment',
          colLayout: 'doubleCol',
          placeholder: '请输入审批意见'
        }
      ],
      saveApi: '',
      processInstId: '',
      businessKey: '',
      formData: {
        approvalResult: '',
        approvalComment: '',
        officeResult: '',
        officeResultText: '',
        uploadFiles: []
      },
      dataSourceTempView: [
        {
          type: 'view', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '审批意见',
          fieldName: 'approvalComment',
          colLayout: 'doubleCol',
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
      tableFlex: 240
    }
  },
  computed: {
    componentLoader () {
      const comp = this.formComp
      return () => import('@/views/' + comp)
    }
  },
  watch: {
    selectedApproval: {
      deep: true,
      handler: function (newV, oldV) {
        this.formComp = ''
        this.formData.approvalResult = newV.yesOrNo
        this.formData.approvalComment = newV.opinion
        this.processInstId = newV.processInstId
        this.businessKey = newV.businessKey
        this.processKey = newV.processKey

        if (this.ar.indexOf(this.processKey) !== -1) {
          this.historyColumns = this.historyColumnsTemp
          this.historyDataApi = 'PersonalProcessApproval.customHistoryList'
        } else {
          this.historyColumns = undefined
          this.historyDataApi = 'PersonalProcessApproval.processHistoryList'
        }

        this.formCompProp.approveData = newV.approveDataObj
        this.getBpmnSnapshootAndLoadData()
      }
    },
    approveContentTitle: {
      handler (val) {
        this.tabs[0].label = val
      },
      immediate: true
    }
  },
  created () {
    this.processKey = this.selectedApproval.processKey
    if (this.ar.indexOf(this.processKey) !== -1) {
      this.historyDataApi = 'PersonalProcessApproval.customHistoryList'
      this.historyColumns = this.historyColumnsTemp
    } else {
      this.historyDataApi = undefined
      this.historyColumns = undefined
    }
    this.formData.approvalResult = this.selectedApproval.yesOrNo
    this.formData.approvalComment = this.selectedApproval.opinion
    this.processInstId = this.selectedApproval.processInstId
    this.businessKey = this.selectedApproval.businessKey
    this.getBpmnSnapshootAndLoadData()
  },
  methods: {
    getBpmnSnapshootAndLoadData () {
      const this_ = this
      this.$api['PersonalProcessApproval.getBpmnSnapshoot']({ processInstanceId: this.processInstId }).then((res) => {
        this_.bpmnSnapshoot = res
        this.loadFormKey()
      })
    },
    loadFormKey () {
      const this_ = this
      this_.dataSource = this_.dataSourceDefault
      this_.$api['PersonalProcessApproval.getApproveContentViewUrl']({ taskId: this.selectedApproval.processTaskId }).then((res) => {
        if (res && res.length > 0) {
          const page = {}
          let inputProp = {}
          this.currEntityId = this.selectedApproval.businessKey
          res.forEach((o) => {
            if (o.variableName === 'approveContentView') {
              this_.approveContentTitle = '审批内容'
              page.url = o.value.url
              this_.formComp = o.value.url
              page.code = o.value.code
              const canEdit = o.value.canEdit
              const canView = o.value.canView

              if (canEdit && canEdit === 'canEdit') {
                this_.dataSource = this_.dataSourceTempView
                this_.formData.approvalParams = canEdit
              }
              if (canView && canView === 'canView') {
                this_.dataSource = this_.dataSourceTempView
                this_.formData.approvalParams = canView
              }
              inputProp = { ...inputProp, ...o.value }
            }
            this_.loadApprovalFormData()
            inputProp[o.variableName] = o.value
          })

          this_.formCompProp = { ...this_.formCompProp, ...inputProp, ...page, ...{ tableFlex: 240, headerVisible: false } }
          if (this_.formCompProp.approveContentView) {
            this_.componentsParams = this_.formCompProp.approveContentView.formSelector ? JSON.parse(this_.formCompProp.approveContentView.formSelector) : null
            if (this_.componentsParams) {
              this_.componentsParams.dataViewId = this_.formCompProp.customBusinessKey ? this_.formCompProp.customBusinessKey : this_.formCompProp.businessKey
              this_.asyncComponents = this_.componentsParams.url
            }
          }
        }
        this_.formValidate = true
      })
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
      console.log(this_.formData, 'this_.formData')
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
    }
  }
}
</script>

<style lang="scss" scoped>
$titleHeight: 50px;
$paddingLeft: 10px;
.container {
  height: 100%;

  .approveTitle {
    padding-left: $paddingLeft;
    height: $titleHeight;
    line-height: $titleHeight;
    border-bottom: 1px solid #eeeef0;
  }

  .approveContent {
    height: 100%;
    // overflow: auto;

    .scroll-area {
      width: 100%;
      height: 100%;
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

    .contentBody {
      height: 500px;
      div:first-child {
        height: 100%;
        position: relative;
      }
    }

    .bpmnDiagram {
      height: 500px;
    }
  }
}
.custom-tabs {
  height: calc(100% - 110px);
  // z-index: 0 !important;
  ::v-deep .el-tabs {
    border: none;
    height: 100% !important;
  }
  ::v-deep .el-tabs--top .el-tabs__content {
    height: calc(100% - 69px);
  }
}
.custom-tabs.el-tabs--top {
  height: calc(100% - 93px) !important;
  border-top: 1px solid #dcdfe6;
  box-sizing: border-box;
  ::v-deep .el-tabs__content {
    padding: 0;
  }
  ::v-deep .el-tabs__nav-wrap {
    margin-bottom: 0;
  }
  ::v-deep .el-tabs__nav.is-top {
    background: #f5f7fa;
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
</style>
