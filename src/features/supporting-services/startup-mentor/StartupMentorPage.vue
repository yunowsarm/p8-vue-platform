<!-- 创业导师业务组件：独立维护导师档案、头衔、专长和联系方式。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-user-solid"></i></span>
        <div>
          <h2>创业导师</h2>
          <p>{{ mode === 'admin' ? '维护园区创业导师档案与辅导专长。' : '查看园区创业导师档案与辅导专长。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增导师</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索导师姓名、头衔或专长" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部专长" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="name" label="导师姓名" min-width="150" />
        <el-table-column prop="title" label="头衔" min-width="180" show-overflow-tooltip />
        <el-table-column prop="specialty" label="专长领域" width="130" />
        <el-table-column prop="contact" label="联系方式" min-width="160" />
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
      <el-empty v-else class="record-feature-empty" description="暂无创业导师" />
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
        <el-button type="primary" :loading="submitting" @click="submitForm">保存导师</el-button>
      </span>
    </el-dialog>
    <el-drawer title="创业导师详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-user-solid"></i>
          <div>
            <small>{{ selectedRecord.specialty || '创业导师' }}</small>
            <h3>{{ selectedRecord.name }}</h3>
          </div>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>导师头衔</small>
            <b>{{ selectedRecord.title || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>联系方式</small>
            <b>{{ selectedRecord.contact || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>导师介绍</h4>
          <p>{{ selectedRecord.introduction || '-' }}</p>
        </section>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
export default {
  name: 'StartupMentorPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '创业导师',
        itemName: '导师',
        icon: 'el-icon-user-solid',
        idPrefix: 'SM',
        apiNamespace: 'tobStartupMentor',
        primaryKey: 'specialty',
        cardTitleKey: 'name',
        timeKey: 'itemCreateTime',
        contentKey: 'introduction',
        defaultStatus: '已发布',
        statusOptions: ['草稿', '待审核', '已发布', '已下线'],
        fields: [
          { key: 'name', label: '姓名', required: true },
          { key: 'title', label: '头衔', required: true },
          { key: 'specialty', label: '专长', required: true, options: ['企业管理', '市场营销', '融资财税', '技术创新', '人力资源', '其他'] },
          { key: 'contact', label: '联系方式', required: true },
          { key: 'introduction', label: '导师介绍', type: 'textarea', required: true, wide: true }
        ]
      }
    },
    permissions() {
      return this.mode === 'admin' ? { create: true, edit: true, delete: true, changeStatus: false } : { create: false, edit: false, delete: false, changeStatus: false }
    }
  }
}
</script>
<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
