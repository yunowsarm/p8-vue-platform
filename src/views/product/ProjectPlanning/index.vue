<template>
  <list-layout>
    <template #north>
      <el-button v-if="row[0].STATUS === '1004'" type="primary" @click="saveMyExperience()">提交变更</el-button>
    </template>
    <template #center>
      <tabs-navigation-preview :layout-config="layoutConfig" :data-view-id="dataViewId" @tabClick="tabClick" :prop-param="propParam"></tabs-navigation-preview>
    </template>
    <template #drawer-panel>
      <!-- 启动流程 -->
      <selectApproveUserBeforehand
        v-if="isSelectApproveUserBeforehandView"
        :is-select-approve-user-beforehand-view="isSelectApproveUserBeforehandView"
        :select-user-beforehand-data-source="selectUserBeforehandDataSource"
        :select-user-beforehand-form-data="selectUserBeforehandFormData"
        @close-modal="closeSelectApproveUserBeforehand"
        @commit="commitSelectApproveUserBeforehand"
      ></selectApproveUserBeforehand>
    </template>
  </list-layout>
</template>
<script>
import TabsNavigationPreview from '@/views/Framework/ComponentsMananger/Layout/Components/TabsNavigation/V1.0/view/index'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
import SelectApproveUserBeforehand from '@/views/Framework/BusinessActivity/ProcessApproval/selectApproveUserBeforehand'
import { nextApproveUserBeforehand } from '@/assets/commonJS/BusinessActivity/nextApproveUserBeforehand'
export default {
  name: 'PlanWarning',
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
      propParam: {
        ID: this.row[0].ID,
        PROJECTID: this.row[0].PROJECTID
      },
      dataViewId: this.row[0].PROJECTID,
      layoutConfig: {
        layoutCode: 'PM_PLANNING_LAYOUT',
        layoutVersion: 'latest'
      }
    }
  },
  components: {
    SelectApproveUserBeforehand,
    TabsNavigationPreview,
    ListLayout
  },
  created() {},
  methods: {
    saveMyExperience(row, btn) {
      this.nextApproveUserBeforehand('projectPlanningApproveChanges')
    },
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
    // 提交审批
    commitSelectApproveUserBeforehand(fullParams) {
      const that = this
      this.releaseMenuParams.beforehandParams = { ...fullParams }
      this.releaseMenuParams.businessId = [this.row[0].ID]
      this.releaseMenuParams.processDefinitionKey = 'projectPlanningApproveChanges'
      this.$api['formGenerator.commitApprove'](this.releaseMenuParams)
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
            // if (that.tableType === 0) {
            //   that.$refs.table.searchData()
            // } else {
            //   that.$refs.xTable.searchData()
            // }
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
