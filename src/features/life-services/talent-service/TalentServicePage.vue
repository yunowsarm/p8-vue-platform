<!-- 人才服务业务组件：独立维护招聘职位、企业、薪资、联系方式和招聘状态。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-user"></i></span>
        <div>
          <h2>人才服务</h2>
          <p>{{ mode === 'admin' ? '维护园区企业招聘岗位和招聘状态。' : '发布和查看园区企业招聘岗位。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">发布职位</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索职位、公司或职位描述" @input="resetPage" @clear="resetPage" />
        <el-select v-model="statusFilter" clearable placeholder="全部招聘状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="jobTitle" label="职位名称" min-width="190" show-overflow-tooltip />
        <el-table-column prop="company" label="公司名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="salary" label="薪资" width="130" />
        <el-table-column prop="contact" label="联系方式" min-width="150" />
        <el-table-column prop="publishTime" label="发布时间" width="170" />
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="statusType(statusText(scope.row.status))" size="small">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template slot-scope="scope">
            <div class="record-feature-table__actions">
              <el-button type="text" size="mini" @click.stop="openDetail(scope.row)">详情</el-button>
              <el-button v-if="canEditRecord(scope.row)" type="text" size="mini" @click.stop="openEdit(scope.row)">编辑</el-button>
              <el-button v-if="canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else class="record-feature-empty" description="暂无招聘职位" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="90px">
        <div class="record-feature-form-grid">
          <business-record-field
            v-for="field in formFields"
            :key="field.key"
            v-model="form[field.key]"
            :field="field"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存职位</el-button>
      </span>
    </el-dialog>
    <el-drawer title="职位详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-user"></i>
          <div>
            <small>{{ selectedRecord.company || '招聘企业' }}</small>
            <h3>{{ selectedRecord.jobTitle }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>薪资</small>
            <b>{{ selectedRecord.salary || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>联系方式</small>
            <b>{{ selectedRecord.contact || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>发布时间</small>
            <b>{{ selectedRecord.publishTime || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>职位描述</h4>
          <p>{{ selectedRecord.description || '-' }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑职位</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
export default {
  name: 'TalentServicePage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '人才服务',
        itemName: '职位',
        icon: 'el-icon-user',
        idPrefix: 'TS',
        apiNamespace: 'tocTalentService',
        primaryKey: 'jobTitle',
        cardTitleKey: 'jobTitle',
        timeKey: 'publishTime',
        contentKey: 'description',
        defaultStatus: '招聘中',
        statusOptions: ['招聘中', '已暂停', '已截止'],
        fields: [
          { key: 'jobTitle', label: '职位名称', required: true },
          { key: 'company', label: '公司名称', required: true },
          { key: 'salary', label: '薪资', required: true },
          { key: 'contact', label: '联系方式', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true },
          { key: 'description', label: '职位描述', type: 'textarea', required: true, wide: true }
        ]
      }
    },
    permissions() {
      return this.mode === 'readonly' ? { create: false, edit: false, delete: false } : { create: true, edit: true, delete: true, changeStatus: false }
    }
  }
}
</script>
<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
