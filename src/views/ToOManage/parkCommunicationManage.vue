<!-- 管理端园区交流入口：统一查看并删除失物招领和园区拼车记录。 -->
<template>
  <main class="park-communication-manage">
    <section class="manage-surface">
      <el-tabs v-model="activeTab" class="manage-tabs" stretch>
        <el-tab-pane name="lost-found">
          <span slot="label" class="tab-label">
            <i class="el-icon-search" />
            失物招领
          </span>
        </el-tab-pane>
        <el-tab-pane name="carpool">
          <span slot="label" class="tab-label">
            <i class="el-icon-position" />
            园区拼车
          </span>
        </el-tab-pane>
      </el-tabs>

      <keep-alive>
        <lost-found-board v-if="activeTab === 'lost-found'" :config="lostFoundConfig" />
        <carpool-service-board v-else :config="carpoolConfig" />
      </keep-alive>
    </section>
  </main>
</template>

<script>
import CarpoolServiceBoard from '../ToC/parkCommunication/components/CarpoolServiceBoard.vue'
import LostFoundBoard from '../ToC/parkCommunication/components/LostFoundBoard.vue'

export default {
  name: 'ParkCommunicationManage',
  components: { CarpoolServiceBoard, LostFoundBoard },
  data() {
    return {
      activeTab: 'lost-found',
      lostFoundConfig: {
        title: '失物招领',
        apiNamespace: 'tocLostFound',
        managementMode: true,
        primaryLabel: '物品标题',
        primaryKey: 'title',
        contentKey: 'content',
        contentLabel: '物品说明',
        timeKey: 'publishTime',
        currentUserIdKey: 'userId',
        filterKey: 'type',
        showMineFilter: false,
        canAdvanceStatus: false,
        uploadField: 'uploadFiles',
        uploadResponseField: 'uploadFiles',
        uploadLabel: '附件',
        typeStatusOptions: {
          失物招领: ['待认领', '已认领'],
          寻物启事: ['寻找中', '已找到']
        },
        fields: [
          { key: 'userId', label: '发布人编号', hidden: true },
          { key: 'userName', label: '发布人', hidden: true, responseOnly: true },
          { key: 'type', label: '类型', options: ['失物招领', '寻物启事'] },
          { key: 'title', label: '标题' },
          { key: 'content', label: '内容', type: 'textarea' },
          { key: 'contact', label: '联系方式' },
          { key: 'publishTime', label: '发布时间', type: 'datetime', hidden: true }
        ]
      },
      carpoolConfig: {
        title: '园区拼车',
        apiNamespace: 'tocCarpoolService',
        managementMode: true,
        primaryLabel: '出发地点',
        primaryKey: 'startPoint',
        contentKey: 'contact',
        contentLabel: '联系方式',
        timeKey: 'publishTime',
        departureTimeKey: 'time',
        currentUserIdKey: 'userId',
        currentUserNameKey: 'userName',
        filterKey: 'type',
        defaultStatus: '待拼车',
        statusOptions: ['待拼车', '已拼车', '已出发'],
        fields: [
          { key: 'userId', label: '发布人编号', hidden: true },
          { key: 'type', label: '类型', options: ['找车', '找乘客'] },
          { key: 'startPoint', label: '起点' },
          { key: 'endPoint', label: '终点' },
          { key: 'time', label: '出发时间', type: 'datetime' },
          { key: 'seats', label: '座位数', type: 'number', showWhen: { type: '找乘客' } },
          { key: 'passengerCount', label: '拼车人数', type: 'number', showWhen: { type: '找车' } },
          { key: 'contact', label: '联系方式' },
          { key: 'publishTime', label: '发布时间', type: 'datetime', hidden: true }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.park-communication-manage {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
}

.manage-surface {
  min-height: 680px;
  overflow: hidden;
  border: 1px solid #e5ebf2;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(45, 67, 95, 0.06);
}

.manage-tabs {
  margin: 18px 20px 0;

  ::v-deep .el-tabs__header {
    margin: 0 0 18px;
    padding: 6px;
    border: 1px solid #e7edf5;
    border-radius: 12px;
    background: #f5f8fc;
  }

  ::v-deep .el-tabs__nav-wrap::after,
  ::v-deep .el-tabs__active-bar {
    display: none;
  }

  ::v-deep .el-tabs__item {
    height: 44px;
    border-radius: 8px;
    color: #607087;
    font-weight: 500;
    line-height: 44px;
    transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  }

  ::v-deep .el-tabs__item:hover {
    color: #2f7cdf;
    background: rgba(47, 124, 223, 0.06);
  }

  ::v-deep .el-tabs__item.is-active {
    color: #236dc9;
    background: #fff;
    box-shadow: 0 3px 12px rgba(47, 124, 223, 0.14);
  }

  ::v-deep .el-tabs__item:focus-visible {
    outline: 3px solid rgba(47, 124, 223, 0.28);
    outline-offset: 1px;
  }
}

.tab-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  i {
    font-size: 16px;
  }
}

@media (max-width: 760px) {
  .park-communication-manage {
    padding: 8px;
  }

  .manage-tabs {
    margin: 10px 8px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .manage-tabs ::v-deep .el-tabs__item {
    transition: none;
  }
}
</style>
