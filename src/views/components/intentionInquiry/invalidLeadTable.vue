<!-- 无效线索申请关联的线索信息 -->
<template>
  <section v-loading="loading" class="invalid-lead-table">
    <article v-for="record in records" :key="record.id" class="invalid-lead-card">
      <header class="invalid-lead-card__header">
        <div>
          <h3>{{ record.enterprise || '未命名企业' }}</h3>
          <p>创建于 {{ record.createTime || '-' }}</p>
        </div>
        <div class="invalid-lead-card__tags">
          <el-tag size="mini" effect="plain">{{ channelSourceLabel(record) }}</el-tag>
          <el-tag size="mini" :type="isAllocated(record) ? 'success' : 'warning'">{{ isAllocated(record) ? '已分配' : '待分配' }}</el-tag>
        </div>
      </header>

      <section class="invalid-lead-card__section">
        <h4>基本信息</h4>
        <div class="invalid-lead-card__grid">
          <div class="invalid-lead-card__field">
            <small>联系人</small>
            <span>{{ record.contactName || '-' }}</span>
          </div>
          <div class="invalid-lead-card__field">
            <small>联系电话</small>
            <span>{{ record.contactPhone || '-' }}</span>
          </div>
          <div class="invalid-lead-card__field">
            <small>负责人</small>
            <span>{{ record.responsiblePersonName || '-' }}</span>
          </div>
          <div class="invalid-lead-card__field">
            <small>推荐人</small>
            <span>{{ record.referrerName || '-' }}</span>
          </div>
        </div>
      </section>

      <section class="invalid-lead-card__section">
        <h4>线索需求</h4>
        <div class="invalid-lead-card__grid">
          <div class="invalid-lead-card__field">
            <small>所属行业</small>
            <span>{{ formatOption(record.industry, industryOptions) }}</span>
          </div>
          <div class="invalid-lead-card__field">
            <small>团队规模</small>
            <span>{{ formatOption(record.teamSize, teamSizeOptions) }}</span>
          </div>
          <div class="invalid-lead-card__field">
            <small>意向空间</small>
            <span>{{ formatOption(record.intendedSpace, intendedSpaceOptions) }}</span>
          </div>
          <div class="invalid-lead-card__field">
            <small>需求面积</small>
            <span>{{ formatOption(record.requiredArea, requiredAreaOptions) }}</span>
          </div>
          <div class="invalid-lead-card__field">
            <small>计划入住时间</small>
            <span>{{ record.checkinTime || '-' }}</span>
          </div>
        </div>
        <div v-if="record.other" class="invalid-lead-card__remark">
          <small>其他需求</small>
          <p>{{ record.other }}</p>
        </div>
        <div v-if="record.reason" class="invalid-lead-card__remark">
          <small>无效申请原因</small>
          <p>{{ record.reason }}</p>
        </div>
      </section>

      <section class="invalid-lead-card__section">
        <h4>跟进记录（{{ sortedFollowUpRecords(record).length }}）</h4>
        <el-empty v-if="!sortedFollowUpRecords(record).length" description="暂无跟进记录" :image-size="48" />
        <el-timeline v-else class="invalid-lead-card__timeline">
          <el-timeline-item v-for="followUp in sortedFollowUpRecords(record)" :key="followUp.id" :timestamp="followUp.followUpTime || followUp.createdAt || '-'" placement="top">
            <div class="invalid-lead-card__follow-up">
              <div class="invalid-lead-card__follow-up-header">
                <strong>{{ followUpMethodLabel(followUp.followUpMethod) }}</strong>
                <div>
                  <el-tag size="mini" effect="plain">{{ leadStatusLabel(followUp.leadStatus) }}</el-tag>
                  <el-tag size="mini" type="info" effect="plain">{{ intentLevelLabel(followUp.intentLevel) }}</el-tag>
                </div>
              </div>
              <p class="invalid-lead-card__contact">{{ followUp.contactPerson || '-' }}{{ followUp.contactTitle ? ` · ${followUp.contactTitle}` : '' }}</p>
              <p class="invalid-lead-card__summary" :class="{ 'invalid-lead-card__summary--expanded': isFollowUpExpanded(followUp) }">
                {{ followUp.communicationSummary || '暂无沟通纪要' }}
              </p>
              <el-button v-if="(followUp.communicationSummary || '').length > 120" class="invalid-lead-card__expand" type="text" size="mini" @click="toggleFollowUpExpanded(followUp)">
                {{ isFollowUpExpanded(followUp) ? '收起' : '展开' }}
              </el-button>
              <div v-if="followUp.nextFollowUpTime || followUp.nextFollowUpTask" class="invalid-lead-card__next-follow-up">
                <small>下次跟进</small>
                <span>{{ followUp.nextFollowUpTime || '-' }}{{ followUp.nextFollowUpTask ? ` · ${followUp.nextFollowUpTask}` : '' }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </section>
    </article>
    <el-empty v-if="loaded && !records.length" description="暂无线索信息" :image-size="64" />
  </section>
</template>

<script>
export default {
  name: 'InvalidLeadTable',
  props: {
    // 自定义组件可直接传入 dataViewId。
    dataViewId: { type: String, default: '' },
    // 兼容平台自定义组件约定：业务主键通过 businessKey 传入。
    businessKey: { type: String, default: '' },
    row: { type: Array, default: () => [] }
  },
  data() {
    return {
      loading: false,
      loaded: false,
      records: [],
      expandedFollowUpIds: [],
      industryOptions: { 1: '智能制造', 2: '医疗科技', 3: '数字经济', 4: '互联网', 5: '新材料', 6: '其他' },
      teamSizeOptions: { 1: '20 人以内', 2: '20–50 人', 3: '51–100 人', 4: '100 人以上' },
      intendedSpaceOptions: { 1: '独立办公室', 2: '研发办公', 3: '企业总部', 4: '轻型生产', 5: '配套商业' },
      requiredAreaOptions: { 1: '100㎡以内', 2: '100–200㎡', 3: '201–500㎡以内', 4: '500–1,000㎡', 5: '1,000㎡以上' }
    }
  },
  computed: {
    resolvedDataViewId() {
      return this.dataViewId || this.businessKey || this.row[0]?.ID || this.row[0]?.id || ''
    }
  },
  watch: {
    resolvedDataViewId: {
      immediate: true,
      handler(id) {
        if (id) this.loadRecords(id)
      }
    }
  },
  methods: {
    async loadRecords(id) {
      this.loading = true
      this.loaded = false
      try {
        const response = await this.$api['reception.list']({ id, viewType: 0 })
        const data = response?.data || response || {}
        this.records = Array.isArray(data) ? data : data.records || data.list || data.rows || []
        this.$emit('loaded', this.records)
      } catch (error) {
        this.records = []
      } finally {
        this.loading = false
        this.loaded = true
      }
    },
    formatOption(value, options) {
      return options[value] || value || '-'
    },
    channelSourceLabel(record) {
      const sourceMap = {
        ONLINE_INQUIRY: '线上咨询',
        MARKETING_EVENT: '市场活动/展会',
        OUTBOUND_VISIT: '招商拜访',
        PARTNER_REFERRAL: '合作伙伴推荐',
        PARK_OPERATION: '园区运营转交',
        CUSTOMER_REFERRAL: '客户转介绍',
        OTHER: '其他渠道'
      }
      return sourceMap[record.sourceType] || record.channelSource || '未分类'
    },
    isAllocated(record) {
      return Number(record.status) === 1
    },
    sortedFollowUpRecords(record) {
      return (record.records || []).slice().sort((left, right) => this.getTimestamp(right) - this.getTimestamp(left))
    },
    getTimestamp(record) {
      const date = record.followUpTime || record.createdAt || ''
      return new Date(String(date).replace(/-/g, '/')).getTime() || 0
    },
    followUpMethodLabel(value) {
      const methodMap = {
        PHONE: '电话',
        WECHAT: '微信',
        EMAIL: '邮件',
        OFFSITE_VISIT: '外出拜访',
        ONSITE_RECEPTION: '现场接待',
        VIDEO_CALL: '视频沟通',
        TRADE_SHOW: '展会'
      }
      return methodMap[value] || value || '未填写方式'
    },
    leadStatusLabel(value) {
      const statusMap = {
        INITIAL_CONTACT: '初步接触',
        INTENT_CONFIRMED: '意向确认',
        VISIT_OR_PROPOSAL: '考察/洽谈中',
        NEGOTIATION: '谈判阶段',
        CONTRACT_SIGNED: '签约落地',
        ON_HOLD: '暂缓跟进'
      }
      return statusMap[value] || value || '未填写状态'
    },
    intentLevelLabel(value) {
      const levelMap = {
        A: 'A · 最高优先级',
        B: 'B · 重点客户',
        C: 'C · 持续培育',
        D: 'D · 中长期培育',
        E: 'E · 初始/低成熟度',
        F: 'F · 已放弃'
      }
      return levelMap[value] || value || '未填写意向度'
    },
    isFollowUpExpanded(followUp) {
      return this.expandedFollowUpIds.includes(followUp.id)
    },
    toggleFollowUpExpanded(followUp) {
      const index = this.expandedFollowUpIds.indexOf(followUp.id)
      if (index === -1) this.expandedFollowUpIds.push(followUp.id)
      else this.expandedFollowUpIds.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.invalid-lead-table {
  box-sizing: border-box;
  height: 100%;
  min-height: 120px;
  max-height: calc(100vh - 180px);
  padding: 0 4px 16px 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.invalid-lead-card {
  padding: 18px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;

  & + & {
    margin-top: 16px;
  }
}

.invalid-lead-card__header,
.invalid-lead-card__follow-up-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.invalid-lead-card__header h3,
.invalid-lead-card__section h4 {
  margin: 0;
  color: #303133;
}

.invalid-lead-card__header h3 {
  font-size: 16px;
}

.invalid-lead-card__header p,
.invalid-lead-card__contact {
  margin: 6px 0 0;
  color: #909399;
  font-size: 12px;
}

.invalid-lead-card__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.invalid-lead-card__section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}

.invalid-lead-card__section h4 {
  margin-bottom: 12px;
  font-size: 14px;
}

.invalid-lead-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
}

.invalid-lead-card__field {
  display: flex;
  gap: 8px;
  min-width: 0;
  color: #303133;
  font-size: 13px;

  small {
    flex: 0 0 70px;
    color: #909399;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.invalid-lead-card__remark {
  margin-top: 14px;
  color: #606266;
  font-size: 13px;
  line-height: 1.7;

  small {
    display: block;
    color: #909399;
  }

  p {
    margin: 4px 0 0;
    white-space: pre-wrap;
  }
}

.invalid-lead-card__timeline {
  margin: 0;
  padding-top: 4px;
}

.invalid-lead-card__follow-up {
  padding: 10px 12px;
  border-radius: 4px;
  background: #f8fafc;
}

.invalid-lead-card__summary {
  display: -webkit-box;
  margin: 10px 0 0;
  overflow: hidden;
  color: #606266;
  font-size: 13px;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.invalid-lead-card__summary--expanded {
  display: block;
}

.invalid-lead-card__expand {
  padding: 0;
}

.invalid-lead-card__next-follow-up {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
  color: #606266;
  font-size: 12px;

  small {
    color: #909399;
  }
}

@media screen and (max-width: 600px) {
  .invalid-lead-table {
    max-height: calc(100vh - 120px);
  }

  .invalid-lead-card__grid {
    grid-template-columns: 1fr;
  }

  .invalid-lead-card__header {
    flex-direction: column;
  }

  .invalid-lead-card__tags {
    justify-content: flex-start;
  }
}
</style>
