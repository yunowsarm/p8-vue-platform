<!-- ToC 园区活动业务组件：独立维护活动场景、时间地点、发布信息和报名状态。 -->
<template>
  <main class="record-feature-page">
    <header class="record-feature-hero">
      <div class="record-feature-hero__title">
        <span class="record-feature-hero__icon"><i class="el-icon-calendar"></i></span>
        <div>
          <h2>园区活动</h2>
          <p>查看和维护企业、公益、文体及培训沙龙活动。</p>
        </div>
      </div>
      <el-button v-if="canCreate" type="primary" icon="el-icon-plus" @click="openCreate">新增活动</el-button>
    </header>
    <section v-loading="loading" class="record-feature-surface">
      <div class="record-feature-toolbar">
        <el-input v-model.trim="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索活动标题、地点或内容" @input="resetPage" @clear="resetPage" />
        <el-select v-model="typeFilter" clearable placeholder="全部活动场景" @change="resetPage" @clear="resetPage">
          <el-option v-for="option in primaryOptions" :key="optionValue(option)" :label="optionLabel(option)" :value="optionValue(option)" />
        </el-select>
        <el-select v-model="statusFilter" clearable placeholder="全部报名状态" @change="resetPage" @clear="resetPage">
          <el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" />
        </el-select>
      </div>
      <el-table v-if="pagedRecords.length" :data="pagedRecords" stripe class="record-feature-table" @row-click="openDetail">
        <el-table-column prop="title" label="活动标题" min-width="240" show-overflow-tooltip />
        <el-table-column prop="sceneType" label="场景类型" width="130" />
        <el-table-column prop="location" label="地点" min-width="160" show-overflow-tooltip />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
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
              <el-button v-if="canDeleteRecord(scope.row)" type="text" size="mini" class="danger-action" @click.stop="removeRecord(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else class="record-feature-empty" description="暂无园区活动" />
      <div v-if="paginationTotal" class="record-feature-pagination">
        <span>共 {{ paginationTotal }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="paginationTotal" layout="prev, pager, next" @current-change="loadRecords" />
      </div>
    </section>
    <el-dialog :title="formDialogTitle" :visible.sync="formVisible" top="4vh" append-to-body :close-on-click-modal="false" custom-class="record-feature-form" @closed="resetForm">
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
        <el-button type="primary" :loading="submitting" @click="submitForm">保存活动</el-button>
      </span>
    </el-dialog>
    <el-drawer title="园区活动详情" :visible.sync="detailVisible" size="560px" append-to-body>
      <div v-if="selectedRecord" class="record-feature-detail">
        <div class="record-feature-detail__hero">
          <i class="el-icon-calendar"></i>
          <div>
            <small>{{ selectedRecord.sceneType || '园区活动' }}</small>
            <h3>{{ selectedRecord.title }}</h3>
          </div>
          <el-tag :type="statusType(statusText(selectedRecord.status))">{{ statusText(selectedRecord.status) }}</el-tag>
        </div>
        <div class="record-feature-detail__grid">
          <div class="record-feature-detail__item">
            <small>地点</small>
            <b>{{ selectedRecord.location || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>开始时间</small>
            <b>{{ selectedRecord.startTime || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>结束时间</small>
            <b>{{ selectedRecord.endTime || '-' }}</b>
          </div>
          <div class="record-feature-detail__item">
            <small>发布时间</small>
            <b>{{ selectedRecord.publishTime || '-' }}</b>
          </div>
        </div>
        <section class="record-feature-detail__section">
          <h4>活动内容</h4>
          <p>{{ selectedRecord.content || '-' }}</p>
        </section>
        <div v-if="canEditRecord(selectedRecord)" class="record-feature-card__actions">
          <el-button v-if="canEditRecord(selectedRecord)" type="primary" @click="openEdit(selectedRecord)">编辑活动</el-button>
        </div>
      </div>
    </el-drawer>
  </main>
</template>
<script>
import BusinessRecordField from '@/components/business/record-fields/BusinessRecordField'
import recordManager from '@/features/_shared/record-management/recordManager'
const ACTIVITY_SCENES = ['企业活动', '公益活动', '文体活动', '培训沙龙']
export default {
  name: 'ToCEventActivityPage',
  components: { BusinessRecordField },
  mixins: [recordManager],
  computed: {
    resource() {
      return {
        title: '园区活动',
        itemName: '活动',
        icon: 'el-icon-calendar',
        idPrefix: 'EA',
        apiNamespace: 'tocEventActivity',
        primaryKey: 'title',
        filterKey: 'sceneType',
        primaryOptions: ACTIVITY_SCENES,
        cardTitleKey: 'title',
        timeKey: 'startTime',
        contentKey: 'content',
        defaultStatus: '报名中',
        statusOptions: ['草稿', '报名中', '报名截止', '活动结束', '已取消'],
        fields: [
          { key: 'title', label: '标题', required: true, wide: true },
          { key: 'sceneType', label: '场景类型', options: ACTIVITY_SCENES, required: true },
          { key: 'location', label: '地点', required: true },
          { key: 'startTime', label: '开始时间', type: 'datetime', required: true },
          { key: 'endTime', label: '结束时间', type: 'datetime', required: true },
          { key: 'publisherId', label: '发布人编号', required: true },
          { key: 'publishTime', label: '发布时间', type: 'datetime', required: true },
          { key: 'content', label: '活动内容', type: 'textarea', required: true, wide: true }
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
