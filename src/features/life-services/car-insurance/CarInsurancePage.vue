<!-- 汽车保险业务组件：独立维护保险产品、险种、价格、说明和销售状态。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-umbrella"></i></span>
        <div>
          <h2>汽车保险</h2>
          <p>查看和维护交强险、商业险及车辆保障产品。</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增保险产品</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索保险名称或说明" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部保险类型" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-model="statusFilter" clearable placeholder="全部销售状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="insuranceName" label="保险名称" min-width="230" show-overflow-tooltip />
        <el-table-column prop="insuranceType" label="保险类型" width="140" />
        <el-table-column prop="price" label="价格（元）" width="130" />
        <el-table-column label="销售状态" width="110">
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
      <el-empty v-else class="record-feature-empty" description="暂无汽车保险产品" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 项</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="100px">
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
        <el-button type="primary" :loading="submitting" @click="submitForm">保存产品</el-button>
      </span>
    </el-dialog>
    <el-drawer title="保险产品详情" :visible.sync="detailVisible" size="500px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-umbrella"></i>
          <div>
            <small>{{ selectedRecord.insuranceType || '汽车保险' }}</small>
            <h3>{{ selectedRecord.insuranceName }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>保险价格</small>
            <b>¥ {{ selectedRecord.price || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>保险说明</h4>
          <p>{{ selectedRecord.description || '-' }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑产品</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
const INSURANCE_TYPES = ['交强险', '商业险', '车损险', '第三者责任险']
export default {
  name: 'CarInsurancePage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  computed: {
    resource() {
      return {
        title: '汽车保险',
        itemName: '保险产品',
        icon: 'el-icon-umbrella',
        idPrefix: 'CI',
        apiNamespace: 'tocCarInsurance',
        primaryKey: 'insuranceName',
        filterKey: 'insuranceType',
        primaryOptions: INSURANCE_TYPES,
        cardTitleKey: 'insuranceName',
        contentKey: 'description',
        defaultStatus: '在售',
        statusOptions: ['在售', '暂停销售', '已下架'],
        fields: [
          { key: 'insuranceName', label: '保险名称', required: true, wide: true },
          { key: 'insuranceType', label: '保险类型', options: INSURANCE_TYPES, required: true },
          { key: 'price', label: '价格（元）', type: 'amount', required: true },
          { key: 'description', label: '保险说明', type: 'textarea', required: true, wide: true }
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
