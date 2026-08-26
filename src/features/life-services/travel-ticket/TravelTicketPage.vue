<!-- 旅行门票业务组件：独立维护景点、票种、价格、折扣和销售状态。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-picture-outline-round"></i></span>
        <div>
          <h2>旅行门票</h2>
          <p>{{ mode === 'admin' ? '维护景点票种、价格和销售状态。' : '查看和维护园区旅行门票信息。' }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增门票</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索景点或门票说明" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部票种" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-model="statusFilter" clearable placeholder="全部销售状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="scenicName" label="景点名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="ticketType" label="门票类型" width="120" />
        <el-table-column prop="price" label="价格（元）" width="120" />
        <el-table-column prop="discount" label="折扣" width="110" />
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
      <el-empty v-else class="record-feature-empty" description="暂无旅行门票" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="96px">
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
        <el-button type="primary" :loading="submitting" @click="submitForm">保存门票</el-button>
      </span>
    </el-dialog>
    <el-drawer title="门票详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-picture-outline-round"></i>
          <div>
            <small>{{ selectedRecord.ticketType || '旅行门票' }}</small>
            <h3>{{ selectedRecord.scenicName }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>价格</small>
            <b>¥ {{ selectedRecord.price || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>折扣</small>
            <b>{{ selectedRecord.discount || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>门票说明</h4>
          <p>{{ selectedRecord.description || '-' }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑门票</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
const TICKET_TYPES = ['成人票', '儿童票', '学生票', '团体票']
export default {
  name: 'TravelTicketPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '旅行门票',
        itemName: '门票',
        icon: 'el-icon-picture-outline-round',
        idPrefix: 'TT',
        apiNamespace: 'tocTravelTicket',
        primaryKey: 'scenicName',
        filterKey: 'ticketType',
        primaryOptions: TICKET_TYPES,
        cardTitleKey: 'scenicName',
        contentKey: 'description',
        defaultStatus: '在售',
        statusOptions: ['在售', '售罄', '已下架'],
        fields: [
          { key: 'scenicName', label: '景点名称', required: true },
          { key: 'ticketType', label: '门票类型', options: TICKET_TYPES, required: true },
          { key: 'price', label: '价格（元）', type: 'amount', required: true },
          { key: 'discount', label: '折扣', required: true },
          { key: 'description', label: '门票说明', type: 'textarea', required: true, wide: true }
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
