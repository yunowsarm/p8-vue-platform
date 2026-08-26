<!-- 首页园区帖子待审核组件：查询未审核帖子总数，并提供进入帖子管理的快捷入口。 -->
<template>
  <button type="button" class="pending-park-topic-review" aria-label="查看待审核园区帖子" @click="goToTopicManage">
    <div v-if="!$isMobile">
      <div class="item-title">待审核园区帖子</div>
      <div class="item-info">
        <i class="el-icon-chat-dot-round item-icon" aria-hidden="true"></i>
        <div class="item-count" :class="{ redText: count > 0 }">{{ count }}</div>
      </div>
    </div>
    <div v-else class="mobile-content">
      <div class="item-info">
        <el-badge :value="count" type="danger" :hidden="!count">
          <i class="el-icon-chat-dot-round item-icon" aria-hidden="true"></i>
        </el-badge>
      </div>
      <div class="item-title">待审核园区帖子</div>
    </div>
  </button>
</template>

<script>
export default {
  name: 'PendingParkTopicReview',
  data() {
    return { count: 0 }
  },
  created() {
    this.loadPendingCount()
  },
  methods: {
    async loadPendingCount() {
      const listApi = this.$api && this.$api['forum.topicsPage']
      if (!listApi) return
      try {
        const result = this.unwrapResponse(await listApi({ page: 1, size: 1, status: 0 })) || {}
        const records = Array.isArray(result) ? result : result.records || result.list || result.rows || []
        this.count = Number(result.total || result.count || result.totalCount || records.length) || 0
      } catch (error) {
        this.count = 0
      }
    },
    unwrapResponse(response) {
      if (response && response.result !== undefined && response.result !== null) return response.result
      if (response && response.data && response.data.result !== undefined && response.data.result !== null) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    goToTopicManage() {
      this.$router.push({ name: 'parkTopic_manage', query: { status: '0' } })
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-park-topic-review {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 0.5vw;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: background-color 0.2s ease;
}
.pending-park-topic-review:hover {
  background-color: #f5f9ff;
}
.pending-park-topic-review:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
.item-title {
  margin-bottom: 0.5vw;
  color: #333;
  font-size: clamp(12px, 1vw, 18px);
  font-weight: bold;
}
.item-info {
  display: flex;
  align-items: center;
}
.item-icon {
  margin-right: 1vw;
  color: #409eff;
  font-size: clamp(24px, 2vw, 40px);
}
.item-count {
  color: #409eff;
  font-size: clamp(16px, 1.5vw, 28px);
  font-weight: bold;
}
.redText {
  color: #f56c6c;
}
.mobile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
@media (max-width: 600px) {
  .pending-park-topic-review {
    align-items: center;
  }
  .item-info {
    display: flex;
    width: 50px;
    height: 50px;
    align-items: center;
    justify-content: center;
  }
  .item-icon {
    margin: 0 0 10px;
    font-size: 30px;
  }
}
</style>
