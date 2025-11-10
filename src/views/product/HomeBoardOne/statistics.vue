<template>
  <div class="statistics-container" ref='container'>
    <div class="statistics-grid">
      <div class="statistics-item" v-for="(item, index) in statisticsItems" :key="index" @click="handleItemClick(item)">
        <div class="item-title">{{ item.title }}</div>
        <div class="item-info">
          <i :class="item.icon" class="item-icon"></i>
          <div class="item-count" :class="{'redText': item.count > 0}">{{ item.count }}</div>
        </div>
      </div>
    </div>
    <CommonDialog v-if="visibleMsgDialog" :visible="visibleMsgDialog" :title="dialogName" width="90%" :dialog-height="750" top="5vh" :show-handle-btn="false" @close="visibleMsgDialog = false">
      <template #dialog>
        <MyTask v-if="comp === 'MyTask'" :layout-config="layoutConfig" :isFromDashboard='true'></MyTask>
        <component v-else :is="comp"></component>
      </template>
    </CommonDialog>
  </div>
</template>

<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'
import ProcessApprovalIndex from '@/views/Communication/MyApprove/list.vue'
import Message from '@/views/Framework/Message'
import MineToDo from './components/MineToDo.vue'
import MineQuestion from './components/MineQuestion.vue'
import MyTask from '@/views/product/My/Work/Task/index.vue'

export default {
  name: 'Statistics',
  components: {
    CommonDialog,
    Message,
    ProcessApprovalIndex,
    MineToDo,
    MyTask,
    MineQuestion
  },
  data() {
    return {
      layoutConfig: {
        layoutCode: 'MyTask',
        layoutVersion: 'latest'
      },
      dialogName: '',
      comp: null,
      visibleMsgDialog: false,
      statisticsItems: [
        {
          title: '待审批',
          icon: 'el-icon-s-check',
          count: 0,
          comp: 'ProcessApprovalIndex',
          dialogName: '我的审批'
        },
        {
          title: '待阅通知',
          icon: 'el-icon-message',
          count: 0,
          comp: 'Message',
          dialogName: '我的消息'
        },
        {
          title: '待办事项',
          icon: 'el-icon-s-order',
          count: 0,
          comp: 'MineToDo',
          dialogName: '我的待办'
        },
        {
          title: '本月任务',
          icon: 'el-icon-date',
          count: 0,
          comp: 'MyTask',
          dialogName: '我的任务'
        },
        {
          title: '待处理问题',
          icon: 'el-icon-date',
          count: 0,
          comp: 'MineQuestion',
          dialogName: '我的问题'
        }
      ]
    }
  },
  created() {
    this.getHomeBoardData()
  },
  methods: {
    getHomeBoardData() {
      this.$api['formGenerator.tableApply']({
        sqlParam: {},
        reportId: 'ffd55ca4c4674613c623a6d217d1d2f8',
        reportParam: {},
        router: this.$route.name,
        code: 'pendingApprovalStatistics',
        permissionVo: {
          router: this.$route.name,
          resourceId: ''
        },
        page: {
          current: 1,
          size: 10,
          orders: []
        }
      }).then((res) => {
        if (res && res.records) {
          this.statisticsItems.forEach((item) => {
            const matchedRecord = res.records.find((record) => record.NAMES === item.title)
            if (matchedRecord) {
              item.count = matchedRecord.VAL
            }
          })
        }
      })
    },
    handleItemClick(item) {
      this.dialogName = item.dialogName
      this.comp = item.comp
      this.visibleMsgDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-container {
  // 添加禁用选中效果的样式
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  height: 100%;

  .statistics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8vw;
    height: 100%;
  }

  .statistics-item {
    display: flex;
    flex-direction: column;
    //padding: 1vw;
    border-radius: 0.5vw;
    transition: all 0.3s;
    justify-content: center;

    .item-title {
      font-size: clamp(12px,1vw,18px);
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5vw;
      text-align: start;
    }

    .item-info {
      cursor: pointer;
      display: flex;
      align-items: center;
      //margin-top: 0.8vw;

      .item-icon {
        font-size: clamp(24px,2vw,40px);
        color: #409eff;
        margin-right: 1vw;
      }

      .item-count {
        font-size: clamp(16px,1.5vw,28px);
        color: #409eff;
        font-weight: bold;
      }
      .redText{
        color: #f56c6c;
      }
    }
  }
}

//::v-deep .el-dialog {
//  margin-top: 7vh !important;
//}

::v-deep .el-dialog__body {
  padding: 0 !important;

  .customNlcr {
    height: 100% !important;
    margin: 0 !important;
  }
}
</style>
