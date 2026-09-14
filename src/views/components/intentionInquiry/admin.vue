<!-- 意向咨询管理端入口：查看全部记录并支持分配。 -->
<template>
  <online-consultation-page
    class="intention-inquiry-page"
    api-namespace="reception"
    page-title="意向咨询"
    page-description="登记来访企业或个人的意向咨询信息，并跟进专员回复。"
    search-placeholder="搜索企业、联系人或联系电话"
    :list-params="{ viewType: 0 }"
    :show-create="false"
    compact
    read-only
    allocation-enabled />
</template>

<script>
import OnlineConsultationPage from '@/features/public-services/online-consultation/OnlineConsultationPage'

export default {
  name: 'IntentionInquiryAdmin',
  components: { OnlineConsultationPage }
}
</script>

<style lang="scss">
.intention-inquiry-page.record-feature-page {
  padding: 12px;
  background: #f3f5f7;
}

.intention-inquiry-page .record-feature-hero--compact {
  min-height: 42px;
  padding: 0 10px;
  margin: 0;
  border: 0;
  border-radius: 4px 4px 0 0;
  box-shadow: none;
  background: #fff;
}

.intention-inquiry-page .record-feature-hero--compact .el-button--primary {
  padding: 8px 15px;
  border-color: #2399ce;
  border-radius: 3px;
  background: #2399ce;
}

.intention-inquiry-page .record-feature-surface {
  height: calc(100vh - 140px);
  min-height: 600px;
  padding: 8px 10px 10px;
  border: 0;
  border-radius: 0 0 4px 4px;
  box-shadow: none;
}

.intention-inquiry-page.record-feature-page--read-only .record-feature-surface {
  height: calc(100vh - 92px);
  border-radius: 4px;
}

.intention-inquiry-page .record-feature-toolbar {
  justify-content: flex-end;
  min-height: 32px;
  margin-bottom: 6px;
}

.intention-inquiry-page .record-feature-toolbar > .el-input {
  width: min(360px, 100%);
}

.intention-inquiry-page .record-feature-table--compact {
  border: 1px solid #e8edef;
}

.intention-inquiry-page .record-feature-table--compact th {
  height: 48px;
  color: #27313d;
  font-weight: 600;
  background: #f4f8f9;
}

.intention-inquiry-page .record-feature-table--compact td {
  height: 48px;
}

.intention-inquiry-page .record-feature-table--compact .el-table__row {
  cursor: pointer;
}

.intention-inquiry-page .record-feature-pagination {
  justify-content: flex-end;
  min-height: 32px;
  padding-top: 10px;
}

@media (max-width: 720px) {
  .intention-inquiry-page .record-feature-surface {
    height: auto;
    min-height: 440px;
  }
}
</style>
