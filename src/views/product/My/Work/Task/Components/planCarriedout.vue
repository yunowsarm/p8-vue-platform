<template>
  <div>
    <div class="hidden-content"
         @click="open">
      <el-badge v-if="messageCount > 0"
                :value="messageCount"
                :max="99"
                class="itemNum">
        <i class="p8 icon-shejigoutong iconClass"></i>
      </el-badge>
      <i v-else
         class="p8 icon-shejigoutong iconClass"></i>
    </div>
    <communication-msg v-if="isVisibleCommunicationDrawer"
                       :thirdMenuParam="thirdMenuParam"
                       :visibleMsgDrawer="isVisibleCommunicationDrawer"
                       @visibleMsgClose="visibleMsgClose"></communication-msg>
    <left-center-right-layout :percentLeft="25"
                              :percentRight="65"
                              v-if="isRouterShow">
      <template #left>
        <div class="task-info-con">
          <!-- 任务详情信息 -->
          <task-info-view :allStatus="thirdMenuParamTemp.allStatus"></task-info-view>
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
  </div>
</template>
<script>
import CommunicationMsg from '@/components/information/index.vue';
import LeftCenterRightLayout from './layout/LeftCenterRight'
import TaskTabsView from './taskOperating/TaskTabs'
import TaskInfoView from './taskInfo'
import TaskManageView from './taskManage/index'
import TaskRelationView from './taskRelation/index'
import { getTaskStatusInfo } from '@/utils/commonBusiness'
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
import { mapGetters } from 'vuex'
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
        // 任务为审批中禁止编辑
        if (val.MANAGERSTATUS === '6406') {
          val.pageType = 'view'
        }
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
      thirdMenuParamTemp: this.thirdMenuParam,
      drawerSize: '30%',
      isVisibleCommunicationDrawer: false,
      messageCount: 0
    }
  },
  computed: {
    ...mapGetters(['taskMessageCount']),
  },
  mounted () {
    this.reload()
    this.getMsgTotal()
    window.myWebSocket.on('messageevent', (data) => {
      let taskMessageCount = this.$store.state.user.taskMessageCount
      this.messageCount = taskMessageCount + 1

      this.$store.dispatch('setTasketMessageCount', this.messageCount)
    })
  },
  methods: {
    getMsgTotal () {
      let that = this
      this.$api['documentManagement.getWebsocketGroupAll']({ entityId: this.thirdMenuParam.WHOLEDESCRIBEID }).then(res => {
        if (res.length > 0) {
          that.messageCount = res[0].messageCount
          that.$store.dispatch('setTasketMessageCount', res[0].messageCount)
        } else {
          that.$store.dispatch('setTasketMessageCount', 0)
        }
      })
    },
    open () {
      this.messageCount = 0
      this.$store.dispatch('setTasketMessageCount', 0)
      this.isVisibleCommunicationDrawer = true
    },
    visibleMsgClose () {
      this.isVisibleCommunicationDrawer = false
      this.messageCount = 0
      this.$store.dispatch('setTasketMessageCount', 0)
    },
    reload () {
      getTaskStatusInfo({ currentStatus: 'all' }).then(data => {
        this.thirdMenuParamTemp.allStatus = data
        this.isRouterShow = true
      })
    }
  },
  components: {
    LeftCenterRightLayout,
    TaskTabsView,
    TaskInfoView,
    TaskManageView,
    TaskRelationView,
    CommonDrawer,
    type: Object,
    CommunicationMsg
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
div.task-info-related-con {
  height: 100%;
  background-color: #ffffff;
}
.hidden-content {
  display: block;
  position: absolute;
  top: 90%;
  right: 0;
  transform: translateX(-50%);
  background-color: #0050b3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  border: 1px solid #ccc;
  z-index: 10;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  text-align: center;
  color: white;
}
.iconClass {
  display: block;
  margin-top: 5px;
  text-align: center;
  font-size: 23px;
}
</style>
