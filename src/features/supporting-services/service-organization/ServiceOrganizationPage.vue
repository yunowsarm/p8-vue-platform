<!-- 服务机构业务组件：独立维护园区服务机构类型、地址、联系人和机构介绍。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-office-building"></i></span>
        <div>
          <h2>服务机构</h2>
          <p>维护法律、财税、知识产权、人力和金融服务机构。</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增机构</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索机构名称、类型或地址" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部机构类型" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="name" label="机构名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="机构类型" width="130" />
        <el-table-column prop="contact" label="联系人" width="110" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
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
      <el-empty v-else class="record-feature-empty" description="暂无服务机构" />
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
        <el-button type="primary" :loading="submitting" @click="submitForm">保存机构</el-button>
      </span>
    </el-dialog>
    <el-drawer title="服务机构详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-office-building"></i>
          <div>
            <small>{{ selectedRecord.type || '服务机构' }}</small>
            <h3>{{ selectedRecord.name }}</h3>
          </div>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>联系人</small>
            <b>{{ selectedRecord.contact || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>联系电话</small>
            <b>{{ selectedRecord.contactPhone || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>机构地址</small>
            <b>{{ selectedRecord.address || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>机构介绍</h4>
          <p>{{ selectedRecord.description || '-' }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑机构</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
export default {
  name: 'ServiceOrganizationPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  computed: {
    resource() {
      return {
        title: '服务机构',
        itemName: '机构',
        icon: 'el-icon-office-building',
        idPrefix: 'SO',
        apiNamespace: 'tobServiceOrg',
        primaryKey: 'type',
        cardTitleKey: 'name',
        timeKey: 'itemCreateTime',
        contentKey: 'description',
        defaultStatus: '已发布',
        statusOptions: ['草稿', '待审核', '已发布', '已下线'],
        fields: [
          { key: 'name', label: '机构名称', required: true, wide: true },
          { key: 'type', label: '机构类型', required: true, options: ['法律服务', '财税服务', '知识产权', '人力资源', '金融服务', '其他'] },
          { key: 'contact', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'address', label: '地址', required: true, wide: true },
          { key: 'description', label: '机构简介', type: 'textarea', required: true, wide: true }
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
