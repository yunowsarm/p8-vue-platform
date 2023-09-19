<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <normal-layout class="process-approval-layout"
                 :header-visible="false"
                 :full-height="true"
                 :normal-layout="layoutConfig">
    <template #west>
      <pending-list :approved-task-id="approvedTaskId"
                    :refresh-flag="refreshFlag"
                    @itemClick="select"
                    ref="pending"></pending-list>
    </template>
    <template #center>
      <approval v-if="pendingSelected"
                :selected-approval="pendingSelected"
                :data-source="approveDataSource"
                @approved="approved" />
      <claim v-else-if="claimSelected"
             :selected-approval="claimSelected"
             @approved="approved" />
      <history v-else-if="historySelected"
               :selected-approval="historySelected" />
      <span v-else
            class="span-bg"></span>
    </template>
  </normal-layout>
</template>

<script>
import { P8NormalLayoutV1 as NormalLayout } from 'p8-components-ui'
import PendingList from './pendingList'
import Approval from './approval'
import Claim from './claim'
import History from './history'

export default {
  name: 'ProcessApproval',
  components: {
    NormalLayout,
    PendingList,
    Approval,
    Claim,
    History
  },
  data () {
    return {
      pendingSelected: null,
      approveDataSource: [],
      claimSelected: null,
      historySelected: null,
      approvedTaskId: '',
      layoutConfig: {
        west: {
          xs: 11,
          sm: 11,
          md: 11,
          lg: 11,
          xl: 11
        },
        center: {
          xs: 13,
          sm: 13,
          md: 13,
          lg: 13,
          xl: 13
        }
      },
      refreshFlag: 1
    }
  },
  computed: {},
  methods: {
    // refreshHandle (flag) {
    //   this.refreshFlag = flag
    // },
    select (r) {
      // debugger
      const options = [{ label: '通过', value: '1' }]
      if (r && (r.isMultipleInstance === '0' || r.taskDefKey.indexOf('notMultiInstance') !== -1)) {
        options.push({ label: '完善计划', value: '0' })
      }
      this.approveDataSource = [
        {
          type: 'radio', // 控件类型
          labelText: '审批结果', // 控件显示的文本
          fieldName: 'approvalResult',
          colLayout: 'doubleCol',
          options: options,
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
          colLayout: 'doubleCol',
          placeholder: '请输入审批意见'
        }
      ]
      this.pendingSelected = r
    },
    // historySelect (r) {
    //   this.historySelected = r
    // },
    approved (taskId) {
      this.approvedTaskId = taskId
      this.$emit('approved')
    }
  }
}
</script>

<style lang="scss" scoped>
.process-approval-layout.normal-layout {
  ::v-deep .normal-west {
    .scroll-area {
      height: 100% !important;
    }
  }
}
.refresh-style {
  position: absolute;
  right: 10px;
  top: 4px;
  z-index: 10;
}
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background: url(../../../../assets/image/common/table_bg.png) no-repeat;
  background-size: 300px;
  background-position: center;
  margin-top: 25px;
}
</style>
