<template>
  <left-center-right-layout :percentLeft="35"
                            :percentRight="60"
                            :type="true"
                            v-if="isRouterShow && innerWidth> 600">
    <template #left>
      <div class="task-info-con">
        <!-- 任务详情信息 -->
        <task-info-view></task-info-view>
      </div>
    </template>
    <template #center>
      <div class="task-operating-con">
        <div class="task-manage-table">
          <!-- 管理要素 -->
          <task-manage-view :approveType="true"
                            :btnType="btnType"></task-manage-view>
        </div>
        <div class="task-tabs-con">
          <!-- 进度反馈-未完成原因 -->
          <task-tabs-view :approveType="true"
                          :btnType="btnType"></task-tabs-view>
        </div>
      </div>
    </template>
    <template #right>
      <div class="task-info-related-con">
        <!-- 关联任务 -->
        <task-relation-view></task-relation-view>
      </div>
    </template>
  </left-center-right-layout>
  <div v-else
       style="height: 100%; overflow: auto;">
    <!-- 任务详情信息 -->
    <task-info-view :allStatus="thirdMenuParamTemp.allStatus"></task-info-view>
    <!-- 管理要素 -->
    <task-manage-view :thirdMenuParam="thirdMenuParam"
                      @onClick="onClick"></task-manage-view>
    <!-- 进度反馈-未完成原因 -->
    <task-tabs-view v-show="isShow"></task-tabs-view>
    <!-- 关联任务 -->
    <task-relation-view></task-relation-view>
  </div>
</template>
<script>
import LeftCenterRightLayout from './layout/LeftCenterRight'
import TaskTabsView from './taskOperating/TaskTabs'
import TaskInfoView from './taskInfo'
import TaskManageView from './taskManage/index'
import TaskRelationView from './taskRelation/index'
import { getTaskStatusInfo } from '@/utils/commonBusiness'
export default {
  name: 'planExecute',
  provide () { // 使用 provide对深层组件进行数据信息传递 例:taskOperating/Progress.vue中 inject搭配computed接收数据
    return {
      getPlanInfo: () => this.thirdMenuParamTemp
    }
  },
  props: {
    businessKey: {
      type: String
    },
    pageType: {
      type: String,
      default: 'view'
    },
    reportParam: {
      type: Object,
      default () {
        return {}
      }
    },
    btnType: {
      type: Boolean
    }
  },
  data () {
    return {
      innerWidth: window.innerWidth,
      isRouterShow: false,
      secretLevel: '机密',
      taskId: this.businessKey ? this.businessKey : this.reportParam.TASK_ID || this.reportParam.ID,
      thirdMenuParamTemp: {
        pageType: this.pageType,
        TASKID: this.businessKey ? this.businessKey : this.reportParam.TASK_ID || this.reportParam.ID
      },
      isShow: true
    }
  },
  mounted () {
    this.reload()
  },
  methods: {
    onClick (isShow) {
      this.isShow = isShow
    },
    reload () {
      getTaskStatusInfo({ currentStatus: 'all' }).then(data => {
        this.thirdMenuParamTemp.allStatus = data
      })
      this.$api['taskManager.getTaskByIdByCapitalization']({ taskId: this.taskId }).then(res => {
        if (res) {
          this.thirdMenuParamTemp = { ...res, ...this.thirdMenuParamTemp }
          this.isRouterShow = true
        }
      })
    }
  },
  components: {
    LeftCenterRightLayout,
    TaskTabsView,
    TaskInfoView,
    TaskManageView,
    TaskRelationView
  }
}
</script>
<style lang="scss" scoped>
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
  overflow: auto;
}
div.task-operating-con {
  height: 100%;
  div.task-manage-table {
    width: 100%;
    height: 50%;
    background-color: #ffffff;
  }
  div.task-tabs-con {
    height: 50%;
    background-color: #ffffff;
  }
}
div.task-info-related-con {
  height: 100%;
  background-color: #ffffff;
}
@media screen and (min-width: 300px) and (max-width: 600px) {
  .hidden-content {
    top: 80%;
    z-index: 999999;
  }
}
</style>
