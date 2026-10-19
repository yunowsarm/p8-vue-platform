<!-- 线索管理端入口：查看全部线索、分配负责人并记录跟进。 -->
<template>
  <div class="intention-inquiry-admin">
    <div class="admin-navigation">
      <span class="admin-navigation__title">线索管理</span>
      <div class="view-actions" role="group" aria-label="线索展示方式">
        <el-tooltip content="线索管理" placement="bottom">
          <button
            type="button"
            class="view-action"
            :class="{ 'view-action--active': activeView === 'management' }"
            aria-label="线索管理"
            :aria-pressed="activeView === 'management'"
            @click="activeView = 'management'">
            <img src="../electricitySummary/icons/data-view.svg" alt="" />
          </button>
        </el-tooltip>
        <el-tooltip content="数据分析" placement="bottom">
          <button
            type="button"
            class="view-action"
            :class="{ 'view-action--active': activeView === 'analysis' }"
            aria-label="数据分析"
            :aria-pressed="activeView === 'analysis'"
            @click="activeView = 'analysis'">
            <img src="../electricitySummary/icons/data-analysis.svg" alt="" />
          </button>
        </el-tooltip>
      </div>
    </div>
    <div class="admin-content">
      <lead-management-page v-if="activeView === 'management'" class="intention-inquiry-page" mode="admin" :list-params="{ viewType: 0 }" />
      <intention-inquiry-analysis v-else />
    </div>
  </div>
</template>

<script>
import LeadManagementPage from './components/LeadManagementPage'
import IntentionInquiryAnalysis from './analysis'

export default {
  name: 'IntentionInquiryAdmin',
  components: { LeadManagementPage, IntentionInquiryAnalysis },
  data() {
    return { activeView: 'management' }
  }
}
</script>

<style lang="scss" scoped>
.intention-inquiry-admin {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f3f5f7;
}
.admin-navigation {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 10px 0;
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 8px;
}
.admin-navigation__title {
  color: #27364a;
  font-size: 14px;
  font-weight: 600;
}
.view-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.view-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 7px;
  background: #fff;
  border: 1px solid #dce3ed;
  border-radius: 6px;
  cursor: pointer;
}
.view-action img {
  width: 20px;
  height: 20px;
}
.view-action--active {
  background: #ecf5ff;
  border-color: #409eff;
}
.view-action--active img {
  filter: invert(49%) sepia(81%) saturate(1418%) hue-rotate(186deg) brightness(105%) contrast(101%);
}
.view-action:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
.admin-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.admin-content ::v-deep .intention-inquiry-page {
  height: 100%;
  min-height: 0;
}
.admin-content ::v-deep .intention-inquiry-page .record-feature-surface {
  height: 100%;
  min-height: 0;
}
.admin-content > .lead-analysis {
  height: 100%;
  min-height: 0;
  overflow: auto;
}
</style>
