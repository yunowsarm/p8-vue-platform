<template>
  <!-- 启动流程 -->
  <form-list
    ref="form"
    v-if="isSelectApproveUserBeforehandView"
    label-width="150px"
    :data-source="selectUserBeforehandDataSource"
    :form="selectUserBeforehandFormData"
    :is-custom-validate="isCustomValidate"
    @saved="saved"
    @custom-validate="customValidate"
    @form-data-change="formDataChange"
  ></form-list>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
import { nextApproveUserBeforehand } from '@/assets/commonJS/BusinessActivity/nextApproveUserBeforehand'
export default {
  name: 'PlanningChanges',
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      releaseMenuParams: {},
      isSelectApproveUserBeforehandView: false,
      selectUserBeforehandDataSource: [],
      selectUserBeforehandFormData: {},
      isCustomValidate: true,
      fullParams: {}
    }
  },
  components: {
    FormList
  },
  mounted() {
    this.nextApproveUserBeforehand('projectPlanningApproveChanges')
  },
  methods: {
    tabClick(tabs) {
      if (tabs.index === '0') {
        this.dataViewId = this.row[0].PROJECTID
      } else {
        this.dataViewId = this.row[0].ID
      }
    },
    nextApproveUserBeforehand(processDefinationTwoKey) {
      const that = this
      nextApproveUserBeforehand.initDataSource(processDefinationTwoKey, that).then((res1) => {
        if (res1 === true) {
          that.isSelectApproveUserBeforehandView = true
        }
      })
    },
    // 关闭流程
    closeSelectApproveUserBeforehand() {
      this.isSelectApproveUserBeforehandView = false
    },
    saved() {
      this.$emit('close')
    },
    formDataChange() {},
    // 提交审批
    customValidate(fullParams) {
      const that = this
      this.releaseMenuParams.beforehandParams = { ...fullParams }
      this.releaseMenuParams.businessId = [this.row[0].ID]
      this.releaseMenuParams.processDefinitionKey = 'projectPlanningApproveChanges'
      this.$api['ProjectInitiationManagement.commitApprove'](this.releaseMenuParams)
        .then(function (res) {
          if (res.result && res.result === 'false') {
            that.$message({
              type: 'error',
              message: res.message
            })
          } else {
            that.$message({
              message: '提交成功',
              type: 'success'
            })
            that.saved()
          }
        })
        .catch(function (error) {
          console.error(error)
        })

      that.isSelectApproveUserBeforehandView = false
    }
  }
}
</script>
