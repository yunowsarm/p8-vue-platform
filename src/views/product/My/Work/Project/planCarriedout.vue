<template>
  <left-center-right-layout :percentLeft="25"
                            :percentRight="100">
    <template #left>
      <div class="task-info-con">
        <pane-view paneTitle="项目计划列表"
                   icon="p8 icon-renwuxiangxixinxi">
          <template #paneTitle>
            <div v-show="isShow"
                 class="pane-title-right"
                 @click="arrowClickHandle">
              <i class="p8 icon-zuoshoujin"
                 style="color: #79bcfa;"></i>
            </div>
            <div v-show="!isShow"
                 class="pane-title-right"
                 @click="rightClickHandle">
              <i class="p8 icon-youshoujin"
                 style="color: #79bcfa;"></i>
            </div>
          </template>
        </pane-view>
        <P8TableRender ref="tableRender"
                       :key='tableKey'
                       buttonMoreLen=2
                       @planEdit="planEdit"
                       :pagination="false"
                       :record=row[0]
                       style="height: calc(100% - 35px) !important;"
                       :west-tree-param="sqlParam"
                       :reportParam="sqlParam"
                       :code="tableCode"
                       @refresh-data="refreshTable">
          <template #status="{ scope }">
            <el-tooltip effect="dark"
                        :content="getIconTitle(scope.row)"
                        :disabled="toolbarTextDisplay === '1'"
                        placement="top">
              <span v-html="getIcon(scope.row)"></span>
            </el-tooltip>
          </template>
          <template #name="{ scope }">
            <div class="underline"
                 @click="thirdMenuClick(scope.row)">{{ scope.row.NAME }}</div>
          </template>
        </P8TableRender>
      </div>
    </template>
    <template #center>
      <div class="task-operating-con">
        <pane-view :paneTitle="paneTitle"
                   icon="p8 icon-renwuxiangxixinxi">
          <template #paneTitle>
          </template>
          <template #paneInfo>
          </template>
        </pane-view>
        <PlanGantt :key="dateTime"
                   style="height: calc(100% - 42px) !important;"
                   v-if="type === 0"
                   :thirdMenuParam="thirdMenuParam"></PlanGantt>
        <kanban-view :key="dateTime"
                     v-if="type === 1"
                     :thirdMenuParam="thirdMenuParam"
                     :kanbanConfig='kanbanConfig'></kanban-view>
        <ChangeGantt :key="dateTime"
                     v-if="type === 2"
                     :thirdMenuParam="thirdMenuParam"
                     :pageType=pageType></ChangeGantt>
        <PlanWarning :key="dateTime"
                     v-if="type === 3"
                     :thirdMenuParam="thirdMenuParam"
                     :pageType=pageType></PlanWarning>
        <MonitoringGantt :key="dateTime"
                         v-if="type === 4"
                         :thirdMenuParam="thirdMenuParam"
                         :pageType=pageType></MonitoringGantt>
      </div>
    </template>
  </left-center-right-layout>
</template>
<script>
import LeftCenterRightLayout from '@/views/product/My/Work/Task/Components/layout/LeftCenterRight'
import PaneView from '@/views/product/My/Work/Task/Components/layout/Pane/index.vue'
import PlanGantt from '@/views/product/PlanGantt/index.vue'
import kanbanView from '@/views/Framework/System/KanbanDesign/kanbanView.vue'
import ChangeGantt from '@/views/product/ChangeGantt/index.vue'
import PlanWarning from '@/views/product/PlanWarning/index.vue'
import MonitoringGantt from '@/views/product/MonitoringGantt/index.vue'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'

export default {
  name: 'planExecute',
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    return {
      type: null,
      paneTitle: '暂无数据',
      thirdMenuParam: {},
      isShow: true,
      sqlParam: {},
      manageStatus: {},
      executeState: {},
      kanbanConfig: {
        id: 'e4b81011d70e484ed9ec68bcb92252b3',
        code: 'ProjectOverview'
      },
      toolbarTextDisplay: this.$store.getters.baseConfig.toolbarTextDisplay,
      dateTime: '',
      tableKey: Date.now(),
      pageType: true
    }
  },
  computed: {
  },
  created () {
    this.sqlParam.wholeDescribeId = this.row[0].WHOLE_ID
    if (this.$route.name === 'projectMonitor') {
      this.tableCode = 'myProjectPlanMonitrorList'
      this.pageType = false
    } else {
      this.tableCode = 'myProjectPlanList'
    }
    this.getIconData()
    setTimeout(() => {
      let record = this.$refs.tableRender.$refs.xTable.tableData[0]
      this.thirdMenuClick(record)
    }, 1000)
  },
  methods: {
    refreshTable () {
      this.getTableSetting()
    },
    getTableSetting () {
      let tableSettingaAll = this.$store.state.user.userSettingAll.Table ? this.$store.state.user.userSettingAll.Table : null
      console.log("🚀11111111111111111111", tableSettingaAll)
      if (tableSettingaAll) {
        let keyNew = this.$route.path + '.' + 'formGenerator.tableApply' + '.' + this.componentsConfig.code
        let key = this.$route.path + '.' + 'formGenerator.tableApply'
        // 需要兼容旧数据
        let currTableSetting = tableSettingaAll.filter((item) => item.key === keyNew)
        if (!(currTableSetting && currTableSetting.length)) {
          currTableSetting = tableSettingaAll.filter((item) => item.key === key)
        }
        console.log("22222222222222222222222", currTableSetting)
        if (currTableSetting && currTableSetting.length) {
          let columnsSetting = currTableSetting[0].value.columns
          console.log("🚀 33333333333333333333333", columnsSetting)
          const toolbarTextDisplayIndex = columnsSetting.findIndex((item) => 'toolbarTextDisplay' in item)
          console.log("🚀4444444444444444444444444444", toolbarTextDisplayIndex)
          if (toolbarTextDisplayIndex > -1 && columnsSetting[toolbarTextDisplayIndex].toolbarTextDisplay) {
            this.toolbarTextDisplay = columnsSetting[toolbarTextDisplayIndex].toolbarTextDisplay
            console.log("🚀55555555555555555555555 :", this.toolbarTextDisplay)
          } else {
            this.toolbarTextDisplay = this.$store.getters.baseConfig.toolbarTextDisplay
            console.log("66666666666666666666666 :", this.toolbarTextDisplay)
          }
        }
      } else {
        this.toolbarTextDisplay = this.$store.getters.baseConfig.toolbarTextDisplay
        console.log(this.toolbarTextDisplay, '777777777777777777777777777777');
      }
    },
    planEdit (val) {
      if (this.$refs.tableRender.selectRecords.length > 1) {
        return this.$message.warning('只能选择一条数据')
      }
      this.thirdMenuParam = this.$refs.tableRender.selectRecords[0]
      this.type = val
      if (val === 0) {
        this.paneTitle = '计划编制'
      }
      if (val === 1) {
        this.paneTitle = '计划概况'
      }
      if (val === 2) {
        this.paneTitle = '计划变更'
      }
      if (val === 3) {
        this.paneTitle = '计划预警'
      }
      if (val === 4) {
        this.paneTitle = '计划监控'
      }
      this.dateTime = new Date().getTime()
    },
    arrowClickHandle () {
      this.$bus.$emit('split-pane-left')
    },
    rightClickHandle () {
      this.isShow = true
    },
    async getIconData () {
      // 管理状态
      let manageStatus = await this.$api['dictionaryManagement.list']({ dicType: 'PLAN_MANAGE_STATUS' })
      // 执行状态
      let executeState = await this.$api['dictionaryManagement.list']({ dicType: 'EXECUTE_STATE' })
      this.manageStatus = {}
      this.executeState = {}
      manageStatus.forEach((el) => {
        this.manageStatus[el.id] = { icon: el.icon, color: el.color, meaning: el.meaning }
      })
      executeState.forEach((el) => {
        this.executeState[el.id] = { icon: el.icon, color: el.color, meaning: el.meaning }
      })
    },
    getIconTitle (row) {
      let str = ''
      let el = this.manageStatus[row.MANAGESTATUS]
      if (row.MANAGESTATUS && el && el.icon) {
        str = el.meaning
      } else {
        let item = this.executeState[row.EXECUTESTATE]
        if (item && item.icon) {
          str = item.meaning
        }
      }
      return str
    },
    getIcon (row) {
      let str = ''
      let el = this.manageStatus[row.MANAGESTATUS]
      let toolbarTextDisplay = this.toolbarTextDisplay
      console.log("wwwwwwwwwwwwwwwwwwwwwwwwww:", toolbarTextDisplay)
      if (toolbarTextDisplay === '0') {
        toolbarTextDisplay = false
      } else {
        toolbarTextDisplay = true
      }
      if (row.MANAGESTATUS && el && el.icon) {
        if (toolbarTextDisplay) {
          let color = JSON.parse(JSON.stringify(el.color))
          let arr = color.match(/[\d.]+/g).map(Number)
          let bgColor = arr.slice(0, -1).concat(0.2).toString()
          str = `<div style='display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 4px; background: rgba(${bgColor});width: -webkit-fill-available;justify-content: center;'>
            <span style='color: ${el.color}; font-weight: 500;'>${el.meaning}</span>
          </div>`
        } else {
          str = `<i class='${el.icon}' style='color: ${el.color};'></i>`
        }
      } else {
        let item = this.executeState[row.EXECUTESTATE]
        if (item && item.icon) {
          if (toolbarTextDisplay) {
            let color = JSON.parse(JSON.stringify(item.color))
            let arr = color.match(/[\d.]+/g).map(Number)
            let bgColor = arr.slice(0, -1).concat(0.2).toString()
            str = `<div style='display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 4px; background: rgba(${bgColor});width: -webkit-fill-available;justify-content: center;'>
            <span style='color: ${item.color}; font-weight: 500;'>${item.meaning}</span>
          </div>`
          } else {
            str = `<i class='${item.icon}' style='color: ${item.color};'></i>`
          }
        }
      }
      return str
    },
    thirdMenuClick (record) {
      console.log("🚀 ~ 111111111111111111111111 ~ record:", record)
      this.$refs.tableRender.$refs.xTable.$refs.table.clearCheckboxRow()
      if (this.type === null) {
        if (this.$route.name === 'projectMonitor') {
          this.type = 4
          this.paneTitle = '计划监控'
        } else {
          this.type = 0
          this.paneTitle = '计划编制'
        }
      }
      this.$refs.tableRender.$refs.xTable.$refs.table.setCheckboxRow(record, true)
      this.$refs.tableRender.selectRecords = [record]
      this.thirdMenuParam = this.$refs.tableRender.selectRecords[0]
      this.dateTime = new Date().getTime()
    },
  },
  components: {
    LeftCenterRightLayout,
    PaneView,
    PlanGantt,
    kanbanView,
    ChangeGantt,
    PlanWarning,
    FormRender,
    MonitoringGantt
  }
}
</script>
<style lang="scss" scoped>
.msg-box {
  position: absolute;
  right: 37px;
  z-index: 99999;
  top: 7px;
  font-size: 20px;
}
.secret_level {
  position: absolute;
  right: 20px;
  top: 12px;
  z-index: 9;
  font-weight: bolder;
  // top: 50%;
  // transform: translateY(-50%);
  color: red;
  font-size: larger;
}
div.task-info-con {
  height: 100%;
  background-color: #ffffff;
}
div.task-operating-con {
  height: 100%;
  div.task-manage-table {
    width: 100%;
    height: 38%;
    background-color: #ffffff;
  }
  div.task-tabs-con {
    height: 62%;
    background-color: #ffffff;
  }
}
.pane-title-right {
  float: right;
  font-size: 16px;
}
.tabsViewLayout ::v-deep .list-main .normal-header {
  display: contents !important;
  padding-top: 8px;
  z-index: 9999;
}
// ::v-deep .couerDivClass .top .card-container {
//   height: 130px !important;
// }
::v-deep .el-tabs--top .el-tabs__content {
  height: calc(100% + 44px) !important;
}
::v-deep .card-container .el-tab-pane {
  overflow: hidden !important;
}
::v-deep .group-search {
  height: 110px !important;
}
</style>
