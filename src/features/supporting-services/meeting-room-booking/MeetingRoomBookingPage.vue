<!-- 会议室预定业务组件：独立维护预定企业、会议室、使用时段和联系信息。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-date"></i></span>
        <div>
          <h2>会议室预定</h2>
          <p>提交并维护园区会议室使用预定。</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增预定</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索会议室、企业或联系人" @input="resetPage" @clear="resetPage" />
        <el-select v-model="statusFilter" clearable placeholder="全部审核状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="roomId" label="会议室" min-width="140" />
        <el-table-column label="预定企业" min-width="170" show-overflow-tooltip>
          <template slot-scope="scope">{{ formatValue(scope.row.companyId, 'companyId') }}</template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
        <el-table-column prop="contactName" label="联系人" width="110" />
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
              <el-button v-if="canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">取消</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else class="record-feature-empty" description="暂无会议室预定" />
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
            :enterprise-options="enterpriseOptions"
            :enterprise-loading="enterpriseLoading"
            :class="{ 'record-feature-field--wide': field.wide || field.type === 'textarea' }" />
        </div>
      </el-form>
      <span slot="footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">提交预定</el-button>
      </span>
    </el-dialog>
    <el-drawer title="会议室预定详情" :visible.sync="detailVisible" size="540px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-date"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>会议室 {{ selectedRecord.roomId }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div v-for="field in detailFields" :key="field.key" class="record-feature-detail__item">
            <small>{{ field.label }}</small>
            <b>{{ formatValue(selectedRecord[field.key], field.key) }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>预定用途</h4>
          <p>{{ selectedRecord.purpose || '-' }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑预定</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
export default {
  name: 'MeetingRoomBookingPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  computed: {
    resource() {
      return {
        title: '会议室预定',
        itemName: '预定',
        icon: 'el-icon-date',
        idPrefix: 'MR',
        apiNamespace: 'tobMeetingRoomBook',
        primaryKey: 'roomId',
        cardTitleKey: 'roomId',
        timeKey: 'startTime',
        contentKey: 'purpose',
        defaultStatus: '待审核',
        statusOptions: ['待审核', '已通过', '已拒绝', '已取消'],
        fields: [
          { key: 'companyId', label: '预定企业', required: true },
          { key: 'roomId', label: '会议室 ID', required: true },
          { key: 'startTime', label: '开始时间', type: 'datetime', required: true },
          { key: 'endTime', label: '结束时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'purpose', label: '预定用途', type: 'textarea', required: true, wide: true }
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
