<template>
  <section class="pay-warning" aria-label="合同与租金预警">
    <header class="pay-warning__header">
      <div class="pay-warning__title">
        <i class="el-icon-warning-outline" aria-hidden="true"></i>
        <span>合同与租金预警</span>
      </div>
      <span class="pay-warning__summary">{{ totalCount }} 条待关注</span>
    </header>

    <div v-loading="loading" class="pay-warning__content" element-loading-text="正在加载预警数据">
      <article v-for="section in warningSections" :key="section.key" class="warning-section" :class="`warning-section--${section.tone}`">
        <button type="button" class="warning-section__header" :aria-label="`查看${section.title}`" @click="goToWarning(section.key)">
          <span class="warning-section__marker" aria-hidden="true"></span>
          <span class="warning-section__title">{{ section.title }}</span>
          <span class="warning-section__count">{{ section.items.length }}</span>
        </button>

        <div v-if="section.items.length" class="warning-section__list">
          <button
            v-for="(item, index) in section.items"
            :key="item.id || `${section.key}-${index}`"
            type="button"
            class="warning-item"
            :aria-label="`查看${section.title}：${getItemName(item, section.key)}`"
            @click="goToWarning(section.key)">
            <span class="warning-item__main" :title="getItemName(item, section.key)">{{ getItemName(item, section.key) }}</span>
            <span class="warning-item__meta">
              <span v-if="getItemDetail(item, section.key)">{{ getItemDetail(item, section.key) }}</span>
              <span>{{ section.dateLabel }}：{{ formatDate(getItemDate(item, section.key)) }}</span>
            </span>
          </button>
        </div>
        <div v-else class="warning-section__empty">暂无预警</div>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PayWarming',
  data() {
    return {
      loading: false,
      warningData: {
        contractsDue: [],
        rentsDue: [],
        rentsLe: []
      }
    }
  },
  computed: {
    totalCount() {
      return this.warningSections.reduce((total, section) => total + section.items.length, 0)
    },
    warningSections() {
      return [
        {
          key: 'contractsDue',
          title: '7天内到期合同',
          dateLabel: '到期日',
          tone: 'warning',
          items: this.warningData.contractsDue
        },
        {
          key: 'rentsDue',
          title: '7天内到期租金',
          dateLabel: '应收日',
          tone: 'notice',
          items: this.warningData.rentsDue
        },
        {
          key: 'rentsLe',
          title: '已逾期租金',
          dateLabel: '逾期日',
          tone: 'danger',
          items: this.warningData.rentsLe
        }
      ]
    }
  },
  created() {
    this.getWarningData()
  },
  methods: {
    getWarningData() {
      this.loading = true
      this.$api['homeBoard.getRentWarnings']()
        .then((res) => {
          const data = res || {}
          this.warningData = {
            contractsDue: Array.isArray(data.contractsDue) ? data.contractsDue : [],
            rentsDue: Array.isArray(data.rentsDue) ? data.rentsDue : [],
            rentsLe: Array.isArray(data.rentsLe) ? data.rentsLe : []
          }
        })
        .catch(() => {
          this.warningData = {
            contractsDue: [],
            rentsDue: [],
            rentsLe: []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getItemName(item, key) {
      return key === 'contractsDue' ? item.code || '未编号合同' : item.contractCode || '未关联合同'
    },
    getItemDetail(item, key) {
      return key === 'contractsDue' ? item.details : `金额：¥${this.formatMoney(item.money)}`
    },
    getItemDate(item, key) {
      return key === 'contractsDue' ? item.endDate : item.date
    },
    goToWarning(key) {
      const path = key === 'contractsDue' ? '/zulinhetongguanli/LeaseContract' : '/yingshouzujinguanli/RentReceivableManagement'
      this.$router.push({ path })
    },
    formatDate(value) {
      return value ? String(value).slice(0, 10) : '--'
    },
    formatMoney(value) {
      const amount = Number(value)
      return Number.isFinite(amount) ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'
    }
  }
}
</script>

<style lang="scss" scoped>
.pay-warning {
  --warning-color: #e6a23c;
  --notice-color: #409eff;
  --danger-color: #f56c6c;
  height: 100%;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 4px;
  background: #fff;
  color: #303133;
}

.pay-warning__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.pay-warning__title {
  display: flex;
  align-items: center;
  min-width: 0;
  font-size: clamp(14px, 1vw, 18px);
  font-weight: 600;

  i {
    margin-right: 8px;
    color: var(--warning-color);
    font-size: 20px;
  }
}

.pay-warning__summary {
  flex: none;
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.pay-warning__content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  height: calc(100% - 49px);
  min-height: 0;
  padding-top: 12px;
}

.warning-section {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.warning-section:hover,
.warning-section:focus-within {
  border-color: var(--warning-color);
  background: #fffaf2;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.16);
}

.warning-section--notice:hover,
.warning-section--notice:focus-within {
  border-color: var(--notice-color);
  background: #f4f9ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.16);
}

.warning-section--danger:hover,
.warning-section--danger:focus-within {
  border-color: var(--danger-color);
  background: #fff7f7;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.16);
}

.warning-section__header {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.warning-section__header:focus-visible,
.warning-item:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.warning-section__marker {
  width: 8px;
  height: 8px;
  flex: none;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--warning-color);
}

.warning-section--notice .warning-section__marker {
  background: var(--notice-color);
}

.warning-section--danger .warning-section__marker {
  background: var(--danger-color);
}

.warning-section__title {
  overflow: hidden;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warning-section__count {
  min-width: 22px;
  height: 22px;
  margin-left: auto;
  padding: 0 6px;
  border-radius: 11px;
  background: #fdf6ec;
  color: #c07b12;
  font-size: 12px;
  line-height: 22px;
  text-align: center;
}

.warning-section--notice .warning-section__count {
  background: #ecf5ff;
  color: #2878c9;
}

.warning-section--danger .warning-section__count {
  background: #fef0f0;
  color: #d84747;
}

.warning-section__list {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.warning-section__list::-webkit-scrollbar {
  display: none;
}

.warning-item {
  display: block;
  width: 100%;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
  border-top: 0;
  border-right: 0;
  border-left: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.warning-item:last-child {
  border-bottom: 0;
}

.warning-item__main,
.warning-item__meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.warning-item__main {
  display: block;
  color: #303133;
  font-size: 13px;
  line-height: 20px;
}

.warning-item__meta {
  display: flex;
  gap: 8px;
  margin-top: 2px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.warning-item__meta span {
  min-width: 0;
}

.warning-section__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  color: #909399;
  font-size: 13px;
}

@media (max-width: 768px) {
  .pay-warning {
    padding: 12px;
  }

  .pay-warning__content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .warning-section {
    min-height: 112px;
  }
}
</style>
