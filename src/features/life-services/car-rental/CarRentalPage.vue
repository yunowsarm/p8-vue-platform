<!-- 租车服务业务组件：独立维护车型、车牌、日租金和车辆可租状态。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-truck"></i></span>
        <div>
          <h2>租车服务</h2>
          <p>查看和维护园区可租车辆、车型与日租价格。</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增车辆</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索车型或车牌号" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部车型" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-model="statusFilter" clearable placeholder="全部车辆状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="carType" label="车型" min-width="160" />
        <el-table-column prop="plateNo" label="车牌号" min-width="160" />
        <el-table-column prop="rentPrice" label="租金（元/天）" width="150" />
        <el-table-column label="车辆状态" width="110">
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
      <el-empty v-else class="record-feature-empty" description="暂无租赁车辆" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 辆</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="110px">
        <div class="record-feature-form-grid"><business-record-field v-for="field in formFields" :key="field.key" v-model="form[field.key]" :field="field" /></div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存车辆</el-button>
      </span>
    </el-dialog>
    <el-drawer title="车辆详情" :visible.sync="detailVisible" size="480px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-truck"></i>
          <div>
            <small>{{ selectedRecord.carType || '租赁车辆' }}</small>
            <h3>{{ selectedRecord.plateNo }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>车型</small>
            <b>{{ selectedRecord.carType || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>日租金</small>
            <b>¥ {{ selectedRecord.rentPrice || '-' }}</b>
          </div>
        </div>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑车辆</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
const CAR_TYPES = ['轿车', 'SUV', '商务车', '新能源车']
export default {
  name: 'CarRentalPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  computed: {
    resource() {
      return {
        title: '租车服务',
        itemName: '车辆',
        icon: 'el-icon-truck',
        idPrefix: 'CR',
        apiNamespace: 'tocCarRental',
        primaryKey: 'carType',
        primaryOptions: CAR_TYPES,
        cardTitleKey: 'plateNo',
        contentKey: 'plateNo',
        defaultStatus: '可租',
        statusOptions: ['可租', '已租出', '维修中', '已下架'],
        fields: [
          { key: 'carType', label: '车型', options: CAR_TYPES, required: true },
          { key: 'plateNo', label: '车牌号', required: true },
          { key: 'rentPrice', label: '租金（元/天）', type: 'amount', required: true }
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
