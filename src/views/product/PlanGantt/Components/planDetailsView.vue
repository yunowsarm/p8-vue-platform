<template>
  <div style="height: 100%">
    <div class="couerDivClass" id="couerDiv">
      <div class="top" :style="{ height: changeInfoHeight }">
        <form-render page-type="view"
                       :data-view-id="businessKey"
                       :record="{ desformCode: desformCode }"></form-render>
      </div>
      <el-button type="primary" size="mini" @click="approveViewDetail">{{ '查看计划详情' }}</el-button>
      <ApproveViewDetail
        v-if="isApproveViewDetailView"
        :plan-info-id="businessKey"
        :create-page="createPage"
        :read-only-visible="readOnlyVisible"
        :approve-content-view="approveContentView"
        :is-view="isApproveViewDetailView"
        @close="closeApproveViewDetail"
      ></ApproveViewDetail>
    </div>
  </div>
</template>
<style lang="scss">
.couerDivClass {
  height: calc(100% - 2px) !important;
  padding-top: 1px;
  box-sizing: border-box;
  overflow: scroll;
  overflow-x: hidden;
  overflow-y: hidden;
  z-index: 2 !important;
}
.top {
  position: relative;
  margin-bottom: 8px;
  background: $base-white-color;
  border: 1px solid $base-line-color;
  border-radius: 6px;
  overflow: hidden;
}
.bottom {
  height: calc(100% - 250px);
  position: relative;
  border: 1px solid $base-line-color;
  border-radius: 6px;
  box-shadow: 5px 5px 13px $base-bg-shadow;
  background: $base-white-color;
  overflow: hidden;
}
.approve_view .el-col {
  height: auto !important;
}
</style>
<script>
import { Select, Option, Button } from 'p8-components-ui'
import formRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit'
import ApproveViewDetail from './approveViewDetail'
export default {
  name: 'SubmitChange',
  components: {
    'el-select': Select,
    'el-option': Option,
    'el-button': Button,
    ApproveViewDetail,
    formRender
  },
  props: {
    approveContentView: {
      type: Object,
      default: null
    },
    businessKey: {
      type: String,
      default: null
    },
    desformCode: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      title: '计划变更提交',
      readOnlyVisible: true,
      hasPlanInfoId: false,
      isApproveViewDetailView: false,
      createPage: 'planChange',
      planInfoId: '',
      changeInfoHeight: '320px',
      existCustomBtn: true,
      dialogConfig: {
        modal: false
      },
      optionsW: [
        { label: '是', value: '0' },
        { label: '否', value: '1' }
      ],
      otherParam: {
        id: ''
      }
    }
  },
  watch: {
    deep: true,
    immediate: true
  },
  methods: {
    rendered() {
      const that = this
      if (that.approveContentView.changeId) {
      }
    },
    selectChange() {
    },
    approveViewDetail() {
      this.isApproveViewDetailView = true
    },
    closeApproveViewDetail() {
      this.isApproveViewDetailView = false
    }
  },
  mounted() {
  }
}
</script>
