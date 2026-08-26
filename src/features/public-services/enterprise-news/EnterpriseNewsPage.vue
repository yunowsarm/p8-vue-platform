<!-- 企业动态业务组件：独立维护企业新闻、产品发布、荣誉成果及合作动态。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-office-building"></i></span>
        <div>
          <h2>企业动态</h2>
          <p>展示和维护企业新闻、产品发布、荣誉成果与合作动态。</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增企业动态</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索企业、标题或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部动态类型" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-model="statusFilter" clearable placeholder="全部状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <div v-if="pagedRecords.length" class="record-feature-grid">
        <article
          v-for="record in pagedRecords"
          :key="record.id"
          class="record-feature-card"
          role="button"
          tabindex="0"
          :aria-label="`查看${recordTitle(record)}详情`"
          @click="openDetail(record)"
          @keydown.enter.self="openDetail(record)"
          @keydown.space.self.prevent="openDetail(record)">
          <div class="record-feature-card__head">
            <span class="record-feature-card__id">
              <i class="el-icon-news"></i>
              {{ record.id }}
            </span>
            <el-tag :type="statusType(statusText(record.status))" size="small">{{ statusText(record.status) }}</el-tag>
          </div>
          <h3>{{ record.title || '企业动态' }}</h3>
          <p class="record-feature-card__description">{{ record.content || '-' }}</p>
          <dl>
            <dt>动态类型</dt>
            <dd>{{ record.newsType || '-' }}</dd>
            <dt>发布企业</dt>
            <dd>{{ formatValue(record.companyId, 'companyId') }}</dd>
            <dt>发布时间</dt>
            <dd>{{ record.publishTime || '-' }}</dd>
          </dl>
          <div v-if="hasRecordActions(record)" class="record-feature-card__actions">
            <div class="record-feature-card__actions-right">
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">编辑</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无企业动态" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="5vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="90px" @submit.native.prevent>
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :enterprise-options="enterpriseOptions"
            :enterprise-loading="enterpriseLoading"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存动态</el-button>
      </span>
    </el-dialog>
    <el-drawer title="企业动态详情" :visible.sync="detailVisible" size="540px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-office-building"></i>
          <div>
            <small>{{ selectedRecord.newsType || '企业动态' }}</small>
            <h3>{{ selectedRecord.title }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>发布企业</small>
            <b>{{ formatValue(selectedRecord.companyId, 'companyId') }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>发布时间</small>
            <b>{{ selectedRecord.publishTime || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>动态内容</h4>
          <p>{{ selectedRecord.content || '-' }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑动态</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>

<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'

export default {
  name: 'EnterpriseNewsPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  computed: {
    resource() {
      return {
        title: '企业动态',
        itemName: '企业动态',
        icon: 'el-icon-office-building',
        idPrefix: 'EN',
        apiNamespace: 'tobCompanyNews',
        primaryKey: 'newsType',
        cardTitleKey: 'title',
        timeKey: 'publishTime',
        contentKey: 'content',
        defaultStatus: '已发布',
        statusOptions: ['草稿', '待审核', '已发布', '已下线'],
        fields: [
          { key: 'companyId', label: '企业', required: true },
          { key: 'title', label: '标题', required: true, wide: true },
          { key: 'newsType', label: '动态类型', required: true, options: ['企业新闻', '产品发布', '荣誉成果', '合作动态'] },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true },
          { key: 'content', label: '动态内容', type: 'textarea', required: true, wide: true }
        ]
      }
    },
    permissions() {
      return { create: true, edit: true, delete: true, changeStatus: false }
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
