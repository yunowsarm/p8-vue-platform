<template>
  <left-center-right-layout :percentRight="65"
                            v-if="isRouterShow">
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
          <task-manage-view :thirdMenuParam="thirdMenuParam"></task-manage-view>
        </div>
        <div class="task-tabs-con">
          <!-- 进度反馈-未完成原因 -->
          <task-tabs-view></task-tabs-view>
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
</template>
<script>
import LeftCenterRightLayout from './layout/LeftCenterRight'
import TaskTabsView from './taskOperating/TaskTabs'
import TaskInfoView from './taskInfo'
import TaskManageView from './taskManage/index'
import TaskRelationView from './taskRelation/index'
export default {
  name: 'planExecute',
  provide () { // 使用 provide对深层组件进行数据信息传递 例:taskOperating/Progress.vue中 inject搭配computed接收数据
    return {
      getPlanInfo: () => this.thirdMenuParamTemp
    }
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  watch: {
    thirdMenuParam: {
      handler (val) {
        this.thirdMenuParamTemp = val
      },
      immediate: true,
      deep: true
    },
    $route (val, oldVal) {
      this.reload()
    }
  },
  data () {
    return {
      isRouterShow: false,
      secretLevel: '机密',
      thirdMenuParamTemp: this.thirdMenuParam
    }
  },
  created () {
  },
  mounted () {
    this.reload()
  },
  methods: {
    reload () {
      this.isRouterShow = true
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
div.task-info-related-con {
  height: 100%;
  background-color: #ffffff;
}
</style>
