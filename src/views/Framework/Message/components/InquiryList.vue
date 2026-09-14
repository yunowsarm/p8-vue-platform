<template>
  <div class="inquiry-list">
    <span v-if="!entityId" class="inquiry-list__tip">该消息未关联意向咨询记录</span>
    <section v-else v-loading="detailLoading" class="inquiry-list__detail">
      <div v-for="field in detailFields" :key="field.key" class="inquiry-list__field" :class="{ 'inquiry-list__field--wide': field.wide }">
        <span>{{ field.label }}</span>
        <strong>{{ field.value }}</strong>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'InquiryList',
  props: {
    // MessageView 动态渲染消息业务组件时透传的当前消息。
    selectedApproval: {
      type: Object,
      default: () => ({})
    },
    // 同时兼容 MessageView 传入的 task-id。
    taskId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      detailLoading: false,
      detail: null,
      referrerName: ''
    }
  },
  computed: {
    entityId() {
      return this.selectedApproval.entityId || this.taskId
    },
    detailFields() {
      const detail = this.detail || {}
      return [
        { key: 'enterprise', label: '企业名称', value: detail.enterprise || '-' },
        { key: 'contactName', label: '联系人', value: detail.contactName || '-' },
        { key: 'contactPhone', label: '联系电话', value: detail.contactPhone || '-' },
        { key: 'industry', label: '所属行业', value: this.formatValue(detail.industry, 'industry') },
        { key: 'teamSize', label: '团队规模', value: this.formatValue(detail.teamSize, 'teamSize') },
        { key: 'intendedSpace', label: '意向空间', value: this.formatValue(detail.intendedSpace, 'intendedSpace') },
        { key: 'requiredArea', label: '需求面积', value: this.formatValue(detail.requiredArea, 'requiredArea') },
        { key: 'checkinTime', label: '计划入住时间', value: detail.checkinTime || '-' },
        { key: 'referrerName', label: '推荐人', value: this.referrerName || '-' },
        { key: 'createTime', label: '提交时间', value: detail.createTime || '-' },
        { key: 'status', label: '状态', value: this.formatValue(detail.status, 'status') },
        { key: 'other', label: '其他需求', value: detail.other || '-', wide: true }
      ]
    }
  },
  watch: {
    entityId: {
      immediate: true,
      handler() {
        this.loadDetail()
      }
    }
  },
  methods: {
    unwrapResponse(response) {
      // 全局 axios 拦截器通常已返回 data；同时兼容直接使用 axios 时的 res.data。
      return response && response.data !== undefined ? response.data : response
    },
    formatValue(value, type) {
      if (value === null || value === undefined || value === '') return '-'
      const valueMaps = {
        industry: { 1: '智能制造', 2: '医疗科技', 3: '数字经济', 4: '互联网', 5: '新材料', 6: '其他' },
        teamSize: { 1: '20 人以内', 2: '20–50 人', 3: '51–100 人', 4: '100 人以上' },
        intendedSpace: { 1: '独立办公室', 2: '研发办公', 3: '企业总部', 4: '轻型生产', 5: '配套商业' },
        requiredArea: { 1: '100㎡以内', 2: '100–200㎡', 3: '201–500㎡以内', 4: '500–1,000㎡', 5: '1,000㎡以上' },
        status: { 0: '待分配', 1: '已分配' }
      }
      return (valueMaps[type] && valueMaps[type][value]) || value
    },
    async loadReferrerName(detail) {
      if (!detail.referrer || !this.$api || !this.$api['reception.getUsername']) return detail.referrerName || ''
      const result = this.unwrapResponse(await this.$api['reception.getUsername']({ id: detail.referrer }))
      if (typeof result === 'string') return result
      return result && (result.username || result.userName || result.name) ? result.username || result.userName || result.name : ''
    },
    async loadDetail() {
      this.detail = null
      this.referrerName = ''
      if (!this.entityId || !this.$api || !this.$api['reception.queryById']) {
        return
      }

      this.detailLoading = true
      try {
        const detail = this.unwrapResponse(await this.$api['reception.queryById']({ id: this.entityId })) || {}
        this.detail = detail
        this.referrerName = detail.referrerName || (await this.loadReferrerName(detail))
        console.log('意向咨询详情：', detail)
      } catch (error) {
        this.$message.error('意向咨询详情加载失败')
      } finally {
        this.detailLoading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.inquiry-list {
  padding: 15px 25px;

  &__tip {
    margin-left: 8px;
    color: #909399;
    font-size: 13px;
  }

  &__detail {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 24px;
    margin-top: 16px;
    padding: 16px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background: #fafafa;
  }

  &__field {
    min-width: 0;

    span,
    strong {
      display: block;
    }

    span {
      margin-bottom: 5px;
      color: #909399;
      font-size: 13px;
    }

    strong {
      overflow: hidden;
      color: #303133;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &--wide {
      grid-column: 1 / -1;

      strong {
        white-space: normal;
        word-break: break-word;
      }
    }
  }
}
</style>
