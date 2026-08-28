<!-- 媒体宣传业务组件：独立维护宣传申请的页面、字段、审核流转和终端权限。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i :class="resource.icon"></i></span>
        <div>
          <h2>媒体宣传</h2>
          <p>{{ resource.description }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增宣传申请</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索申请编号、联系人或宣传内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部宣传渠道" @change="resetPage" @clear="resetPage">
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
              <i class="el-icon-picture-outline"></i>
              {{ record.id }}
            </span>
            <el-tag :type="statusType(statusText(record.status))" size="small">{{ statusText(record.status) }}</el-tag>
          </div>
          <h3>{{ recordTitle(record) }}</h3>
          <p class="record-feature-card__description">{{ recordDescription(record) }}</p>
          <dl>
            <template v-for="field in cardFields">
              <dt :key="field.key + '-label'">{{ field.label }}</dt>
              <dd :key="field.key + '-value'">{{ formatValue(record[field.key], field.key) }}</dd>
            </template>
          </dl>
          <div v-if="hasRecordActions(record)" class="record-feature-card__actions">
            <div class="record-feature-card__actions-right">
              <el-button v-if="canChangeRecordStatus(record)" type="text" size="mini" @click.stop="openStatusDialog(record)">审核处理</el-button>
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">编辑</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无媒体宣传申请" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="5vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
      <el-form ref="recordForm" :model="form" :rules="rules" label-width="96px" @submit.native.prevent>
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
        <el-button type="primary" :loading="submitting" @click="submitForm">提交申请</el-button>
      </span>
    </el-dialog>

    <el-drawer title="媒体宣传申请详情" :visible.sync="detailVisible" size="520px" append-to-body>
      <div v-if="selectedRecord" v-loading="detailLoading" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i :class="resource.icon"></i>
          <div>
            <small>{{ selectedRecord.id }}</small>
            <h3>{{ recordTitle(selectedRecord) }}</h3>
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
          <h4>宣传内容</h4>
          <p>{{ selectedRecord.promotionContent || '-' }}</p>
        </section>
      </div>
    </el-drawer>

    <el-dialog title="审核媒体宣传申请" :visible.sync="statusVisible" width="430px" append-to-body :close-on-click-modal="false">
      <el-form :model="statusForm" label-width="86px">
        <el-form-item label="审核结果">
          <el-select v-model="statusForm.status" class="record-feature-full"><el-option v-for="status in availableStatusOptions" :key="status" :label="status" :value="status" /></el-select>
        </el-form-item>
        <el-form-item label="审核意见"><el-input v-model.trim="statusForm.remark" type="textarea" :rows="3" maxlength="300" show-word-limit /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusSubmitting" @click="saveStatus">确认</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'

export default {
  name: 'MediaPromotionPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '媒体宣传',
        itemName: '媒体宣传',
        description: this.mode === 'admin' ? '审核企业宣传申请并维护办理结果。' : '申请园区公众号、官网及线下活动等宣传资源。',
        icon: 'el-icon-picture-outline',
        idPrefix: 'MP',
        apiNamespace: 'tobMediaPromotion',
        primaryKey: 'promotionChannel',
        timeKey: 'applyTime',
        contentKey: 'promotionContent',
        defaultStatus: '待审核',
        statusOptions: ['待审核', '处理中', '已通过', '已拒绝', '已关闭'],
        statusTransitions: { 待审核: ['处理中', '已拒绝', '已关闭'], 处理中: ['已通过', '已拒绝', '已关闭'] },
        fields: [
          { key: 'companyId', label: '企业', required: true },
          { key: 'promotionChannel', label: '宣传渠道', required: true, options: ['园区公众号', '园区官网', '媒体专栏', '线下活动'] },
          { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'promotionContent', label: '宣传内容', type: 'textarea', required: true, wide: true }
        ]
      }
    },
    permissions() {
      if (this.mode === 'admin') return { create: false, edit: false, delete: true, changeStatus: true }
      if (this.mode === 'readonly') return { create: false, edit: false, delete: false, changeStatus: false }
      return { create: true, edit: true, delete: true, changeStatus: false }
    }
  }
}
</script>

<style lang="scss" src="../../_shared/record-management/record-feature-page.scss"></style>
