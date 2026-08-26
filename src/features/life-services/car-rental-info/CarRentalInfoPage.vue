<!-- 租车申请业务组件：独立维护用户选车、租赁日期、总租金和申请状态。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-tickets"></i></span>
        <div>
          <h2>租车申请</h2>
          <p>提交并查看个人车辆租赁申请和确认状态。</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增租车申请</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索车辆编号或用户编号" @input="resetPage" @clear="resetPage" />
        <el-select v-model="statusFilter" clearable placeholder="全部申请状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="carId" label="车辆编号" min-width="140" />
        <el-table-column prop="userId" label="用户编号" min-width="140" />
        <el-table-column prop="rentStart" label="开始日期" width="140" />
        <el-table-column prop="rentEnd" label="结束日期" width="140" />
        <el-table-column prop="totalPrice" label="总租金（元）" width="130" />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="statusType(statusText(scope.row.status))" size="small">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template slot-scope="scope">
            <div class="record-feature-table__actions">
              <el-button type="text" size="mini" @click.stop="openDetail(scope.row)">详情</el-button>
              <el-button v-if="canEditRecord(scope.row)" type="text" size="mini" @click.stop="openEdit(scope.row)">编辑</el-button>
              <el-button v-if="canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">取消</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else class="record-feature-empty" description="暂无租车申请" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="110px">
        <div class="record-feature-form-grid"><business-record-field v-for="field in formFields" :key="field.key" v-model="form[field.key]" :field="field" /></div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交申请</el-button>
      </span>
    </el-dialog>
    <el-drawer title="租车申请详情" :visible.sync="detailVisible" size="500px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-tickets"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>车辆 {{ selectedRecord.carId }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div v-for="field in detailFields" :key="field.key" class="record-feature-detail__item">
            <small>{{ field.label }}</small>
            <b>{{ formatValue(selectedRecord[field.key], field.key) }}</b>
          </div>
        </div>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑申请</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
export default {
  name: 'CarRentalInfoPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  computed: {
    resource() {
      return {
        title: '租车申请',
        itemName: '租车申请',
        icon: 'el-icon-tickets',
        idPrefix: 'CRI',
        apiNamespace: 'tocCarRentalInfo',
        primaryKey: 'carId',
        cardTitleKey: 'carId',
        timeKey: 'rentStart',
        contentKey: 'userId',
        defaultStatus: '待确认',
        statusOptions: ['待确认', '已确认', '租用中', '已归还', '已取消'],
        fields: [
          { key: 'carId', label: '车辆编号', required: true },
          { key: 'userId', label: '用户编号', required: true },
          { key: 'rentStart', label: '租车开始日期', type: 'date', required: true },
          { key: 'rentEnd', label: '租车结束日期', type: 'date', required: true },
          { key: 'totalPrice', label: '总租金（元）', type: 'amount', required: true }
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
