<template>
  <button type="button" class="pending-property-repair" aria-label="查看待处理物业报修" @click="goToPropertyRepairHandle">
    <div v-if="!$isMobile">
      <div class="item-title">待处理物业报修</div>
      <div class="item-info">
        <i class="el-icon-s-tools item-icon" aria-hidden="true"></i>
        <div class="item-count" :class="{ redText: count > 0 }">{{ count }}</div>
      </div>
    </div>
    <div v-else class="mobile-content">
      <div class="item-info">
        <el-badge :value="count" type="danger" :hidden="!count">
          <i class="el-icon-s-tools item-icon" aria-hidden="true"></i>
        </el-badge>
      </div>
      <div class="item-title">待处理物业报修</div>
    </div>
  </button>
</template>

<script>
export default {
  name: 'PendingPropertyRepair',
  data() {
    return {
      count: 0
    }
  },
  created() {
    this.getPendingPropertyRepairCount()
  },
  methods: {
    async getPendingPropertyRepairCount() {
      if (!this.$api || !this.$api['reportRepair.searchStatus']) return

      try {
        const result = this.unwrapResponse(await this.$api['reportRepair.searchStatus']())
        this.count = this.getCount(result)
      } catch (error) {
        this.count = 0
      }
    },
    getCount(result) {
      if (typeof result === 'number' || typeof result === 'string') return Number(result) || 0
      if (!result) return 0
      if (result.total !== undefined) return Number(result.total) || 0
      if (result.count !== undefined) return Number(result.count) || 0
      if (Array.isArray(result.records)) return result.records.length
      if (Array.isArray(result.list)) return result.list.length
      return Array.isArray(result) ? result.length : 0
    },
    unwrapResponse(response) {
      if (response && response.result !== undefined && response.result !== null) return response.result
      if (response && response.data && response.data.result !== undefined && response.data.result !== null) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    goToPropertyRepairHandle() {
      this.$router.push('/propertyRepair')
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-property-repair {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 0.5vw;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f5f9ff;
  }

  &:focus-visible {
    outline: 2px solid #409eff;
    outline-offset: 2px;
  }
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
  .pending-property-repair {
    align-items: center;
  }

  .item-title {
    margin-bottom: 0.5vw;
    font-size: clamp(12px, 1vw, 18px);
  }

  .item-info {
    display: flex;
    width: 50px;
    height: 50px;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .item-icon {
    margin: 0 0 10px;
    color: #409eff;
    font-size: 30px;
  }
}
</style>
