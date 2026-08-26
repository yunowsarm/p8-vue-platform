<!-- 资源对接业务组件：独立维护资源需求、对接目标、办理进度和终端操作规则。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i :class="resource.icon"></i></span>
        <div>
          <h2>资源对接</h2>
          <p>{{ resource.description }}</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增对接申请</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索申请编号、对接目标或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部资源类型" @change="resetPage" @clear="resetPage">
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
              <i class="el-icon-connection"></i>
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
              <el-button v-if="canChangeRecordStatus(record)" type="text" size="mini" @click.stop="openStatusDialog(record)">更新进度</el-button>
              <el-button v-if="canEditRecord(record)" type="text" size="mini" @click.stop="openEdit(record)">编辑</el-button>
              <el-button v-if="canDeleteRecord(record)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(record)">删除</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else class="record-feature-empty" description="暂无资源对接申请" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>

    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
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

    <el-drawer title="资源对接申请详情" :visible.sync="detailVisible" size="520px" append-to-body>
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
          <h4>对接内容</h4>
          <p>{{ selectedRecord.connectContent || '-' }}</p>
        </section>
        <section v-if="selectedRecord.resourceDesc" class="record-feature-detail__section">
          <h4>资源描述</h4>
          <p>{{ selectedRecord.resourceDesc }}</p>
        </section>
        <div v-if="canChangeRecordStatus(selectedRecord) || canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <div>
            <el-button v-if="canChangeRecordStatus(selectedRecord)" @click="openStatusDialog(selectedRecord)">更新进度</el-button>
            <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="更新资源对接进度" :visible.sync="statusVisible" width="430px" append-to-body :close-on-click-modal="false">
      <el-form :model="statusForm" label-width="86px">
        <el-form-item label="下一状态">
          <el-select v-model="statusForm.status" class="record-feature-full"><el-option v-for="status in availableStatusOptions" :key="status" :label="status" :value="status" /></el-select>
        </el-form-item>
        <el-form-item label="处理备注"><el-input v-model.trim="statusForm.remark" type="textarea" :rows="3" maxlength="300" show-word-limit /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" :loading="statusSubmitting" @click="saveStatus">确认更新</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'

export default {
  name: 'ResourceConnectionPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  props: { mode: { type: String, default: 'user' } },
  computed: {
    resource() {
      return {
        title: '资源对接',
        itemName: '资源对接',
        description: this.mode === 'admin' ? '受理技术、人才、金融、市场和场地资源对接需求。' : '提交资源对接需求并查看园区跟进进度。',
        icon: 'el-icon-connection',
        idPrefix: 'RC',
        apiNamespace: 'tobResourceConnection',
        primaryKey: 'resourceType',
        timeKey: 'applyTime',
        contentKey: 'connectContent',
        defaultStatus: '待受理',
        statusOptions: ['待受理', '处理中', '已完成', '已关闭'],
        statusTransitions: { 待受理: ['处理中', '已关闭'], 处理中: ['已完成', '已关闭'] },
        fields: [
          { key: 'companyId', label: '企业', required: true },
          { key: 'resourceType', label: '资源类型', required: true, options: ['技术资源', '人才资源', '金融资源', '市场资源', '场地资源'] },
          { key: 'connectTarget', label: '对接目标', required: true },
          { key: 'applyTime', label: '申请时间', type: 'datetime', required: true },
          { key: 'contactName', label: '联系人', required: true },
          { key: 'contactPhone', label: '联系电话', required: true },
          { key: 'resourceDesc', label: '资源描述', type: 'textarea', required: true, wide: true, hideInDetail: true },
          { key: 'connectContent', label: '对接内容', type: 'textarea', required: true, wide: true },
          { key: 'remark', label: '备注', type: 'textarea', wide: true }
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
