<!-- 园区话题管理页面：负责帖子筛选、详情审核、统计与删除管理。 -->
<template>
  <main class="park-topic-manage">
    <section class="metric-grid" aria-label="帖子统计">
      <article v-for="card in summaryCards" :key="card.title" class="metric-card">
        <span :class="['metric-icon', card.tone]"><i :class="card.icon"></i></span>
        <div>
          <small>{{ card.title }}</small>
          <strong>{{ card.value }}</strong>
          <p>{{ card.note }}</p>
        </div>
      </article>
    </section>

    <section v-loading="loading" class="topic-surface">
      <div class="filter-bar">
        <el-input v-model.trim="filters.keyword" clearable size="small" prefix-icon="el-icon-search" placeholder="搜索标题、内容或发布人" @keyup.enter.native="search" @clear="search" />
        <el-select v-model="filters.categoryId" clearable size="small" placeholder="全部版块" @change="search">
          <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
        </el-select>
        <el-select v-model="filters.status" size="small" @change="search">
          <el-option label="全部审核状态" :value="3" />
          <el-option label="未审核" :value="0" />
          <el-option label="已审核" :value="1" />
          <el-option label="审核不通过" :value="2" />
        </el-select>
        <el-select v-model="filters.sort" size="small" @change="search">
          <el-option label="最新发布" value="latest" />
          <el-option label="互动最多" value="hot" />
        </el-select>
        <div class="filter-actions">
          <el-button size="small" icon="el-icon-refresh-left" @click="resetFilters">重置</el-button>
          <el-button size="small" icon="el-icon-refresh" :loading="loading" @click="refreshTopics">刷新</el-button>
          <el-button size="small" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        </div>
      </div>

      <el-table v-if="topics.length" :data="topics" class="topic-table" row-key="id">
        <el-table-column label="帖子内容" min-width="360">
          <template slot-scope="{ row }">
            <button type="button" class="topic-title" :aria-label="'查看帖子 ' + topicTitle(row)" @click="openDetail(row)">{{ topicTitle(row) }}</button>
            <p class="topic-content">{{ row.content || '暂无正文' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="版块" min-width="120">
          <template slot-scope="{ row }">
            <el-tag size="small" :style="categoryTagStyle(row.categoryId)">{{ categoryName(row.categoryId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="118">
          <template slot-scope="{ row }">
            <el-tag size="small" :type="reviewStatusType(row.status)">{{ reviewStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布人" min-width="130">
          <template slot-scope="{ row }">
            <span class="publisher">
              <i class="el-icon-user"></i>
              {{ authorName(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="互动数据" min-width="156">
          <template slot-scope="{ row }">
            <span class="topic-metrics">
              <span>
                <i class="el-icon-view"></i>
                {{ numberValue(row.viewCount) }}
              </span>
              <span>
                <i class="el-icon-chat-dot-round"></i>
                {{ numberValue(row.replyCount) }}
              </span>
              <span>
                <i class="el-icon-star-off"></i>
                {{ numberValue(row.likeCount) }}
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" min-width="160">
          <template slot-scope="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="184" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="openDetail(row)">详情</el-button>
            <el-button v-if="isPendingReview(row)" type="text" size="mini" @click="openAudit(row)">审核</el-button>
            <el-button type="text" size="mini" class="delete-action" @click="deleteTopic(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else-if="!loading" description="暂无符合条件的帖子" :image-size="88" />

      <div v-if="total" class="pagination-bar">
        <span>共 {{ total }} 条</span>
        <el-pagination background :current-page.sync="currentPage" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="loadTopics" />
      </div>
    </section>

    <el-drawer title="帖子详情" :visible.sync="detailVisible" size="560px" append-to-body custom-class="topic-manage-drawer">
      <article v-if="selectedTopic" class="detail-content">
        <div class="detail-topline">
          <div>
            <el-tag size="small" :style="categoryTagStyle(selectedTopic.categoryId)">{{ categoryName(selectedTopic.categoryId) }}</el-tag>
            <el-tag size="small" :type="reviewStatusType(selectedTopic.status)">{{ reviewStatusText(selectedTopic.status) }}</el-tag>
          </div>
          <time>{{ formatDateTime(selectedTopic.createdAt) }}</time>
        </div>
        <h3>{{ topicTitle(selectedTopic) }}</h3>
        <div class="detail-publisher">
          <i class="el-icon-user"></i>
          {{ authorName(selectedTopic) }}
        </div>
        <p>{{ selectedTopic.content || '暂无正文' }}</p>
        <div class="detail-metrics">
          <span>
            <i class="el-icon-view"></i>
            {{ numberValue(selectedTopic.viewCount) }} 浏览
          </span>
          <span>
            <i class="el-icon-chat-dot-round"></i>
            {{ numberValue(selectedTopic.replyCount) }} 回复
          </span>
          <span>
            <i class="el-icon-star-off"></i>
            {{ numberValue(selectedTopic.likeCount) }} 点赞
          </span>
        </div>
        <div class="detail-actions">
          <el-button v-if="isPendingReview(selectedTopic)" type="primary" @click="openAudit(selectedTopic)">审核帖子</el-button>
          <el-button type="danger" :loading="deletingId === selectedTopic.id" @click="deleteTopic(selectedTopic)">删除该帖子</el-button>
        </div>
      </article>
    </el-drawer>

    <el-dialog title="审核帖子" :visible.sync="auditVisible" width="620px" top="4vh" append-to-body :close-on-click-modal="false" @closed="resetAudit">
      <article v-if="auditTarget" class="audit-preview">
        <div class="audit-preview__topline">
          <div>
            <el-tag size="small" :style="categoryTagStyle(auditTarget.categoryId)">{{ categoryName(auditTarget.categoryId) }}</el-tag>
            <el-tag size="small" :type="reviewStatusType(auditTarget.status)">{{ reviewStatusText(auditTarget.status) }}</el-tag>
          </div>
          <span>{{ auditTarget.id }}</span>
        </div>
        <dl class="audit-preview__meta">
          <div>
            <dt>发布人</dt>
            <dd>{{ authorName(auditTarget) }}</dd>
          </div>
          <div>
            <dt>发布时间</dt>
            <dd>{{ formatDateTime(auditTarget.createdAt) }}</dd>
          </div>
          <div>
            <dt>公网 IP</dt>
            <dd>{{ auditTarget.ipAddress || '-' }}</dd>
          </div>
          <div>
            <dt>互动数据</dt>
            <dd>{{ numberValue(auditTarget.viewCount) }} 浏览 · {{ numberValue(auditTarget.replyCount) }} 回复 · {{ numberValue(auditTarget.likeCount) }} 点赞</dd>
          </div>
        </dl>
        <section class="audit-preview__content">
          <h3>{{ topicTitle(auditTarget) }}</h3>
          <p>{{ auditTarget.content || '暂无正文' }}</p>
        </section>
      </article>
      <el-form class="audit-form" label-width="86px" @submit.native.prevent>
        <el-form-item label="审核结果" required>
          <el-radio-group v-model="auditStatus">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditing" :disabled="!auditTarget" @click="submitAudit">确认审核</el-button>
      </span>
    </el-dialog>
  </main>
</template>

<script>
const CATEGORY_PALETTE = [
  { color: '#3674d9', softColor: '#eaf2ff' },
  { color: '#0f9a76', softColor: '#e7f8f1' },
  { color: '#e46d32', softColor: '#fff0e8' },
  { color: '#7a5bd7', softColor: '#f1edff' },
  { color: '#197eae', softColor: '#e6f5fb' },
  { color: '#bb7a18', softColor: '#fff6df' }
]

export default {
  name: 'ParkTopicManage',
  data() {
    return {
      loading: false,
      categories: [],
      topics: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      deletingId: '',
      detailVisible: false,
      selectedTopic: null,
      auditVisible: false,
      auditing: false,
      auditTarget: null,
      auditStatus: '',
      filters: { keyword: '', categoryId: '', status: 3, sort: 'latest' }
    }
  },
  computed: {
    summaryCards() {
      return [
        { title: '帖子总数', value: this.total, note: '当前筛选结果', tone: 'blue', icon: 'el-icon-document' },
        { title: '本页帖子', value: this.topics.length, note: `每页展示 ${this.pageSize} 条`, tone: 'purple', icon: 'el-icon-collection' },
        { title: '本页回复', value: this.topics.reduce((sum, item) => sum + this.numberValue(item.replyCount), 0), note: '用于快速评估讨论热度', tone: 'orange', icon: 'el-icon-chat-dot-round' },
        { title: '本页点赞', value: this.topics.reduce((sum, item) => sum + this.numberValue(item.likeCount), 0), note: '当前页互动累计', tone: 'green', icon: 'el-icon-star-on' }
      ]
    }
  },
  watch: {
    '$route.query.status'(status) {
      if (!this.applyRouteStatus(status)) return
      this.search()
    }
  },
  created() {
    this.applyRouteStatus(this.$route.query.status)
    this.loadCategories()
    this.loadTopics()
  },
  methods: {
    applyRouteStatus(status) {
      if (status === undefined || status === null || status === '') return false
      const normalizedStatus = Number(status)
      if (![0, 1, 2, 3].includes(normalizedStatus) || this.filters.status === normalizedStatus) return false
      this.filters.status = normalizedStatus
      return true
    },
    unwrap(response) {
      if (response && response.data !== undefined) return response.data
      if (response && response.result !== undefined && !response.records) return response.result
      return response
    },
    async loadCategories() {
      if (!this.$api || !this.$api['forum.categories']) return
      try {
        const result = this.unwrap(await this.$api['forum.categories']())
        const categories = Array.isArray(result) ? result : (result && (result.records || result.list)) || []
        this.categories = categories.map((item, index) => Object.assign({}, item, CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]))
      } catch (error) {
        this.categories = []
      }
    },
    async loadTopics() {
      if (!this.$api || !this.$api['forum.topicsPage']) return
      this.loading = true
      try {
        const params = { page: this.currentPage, size: this.pageSize, sort: this.filters.sort }
        if (this.filters.keyword) params.keyword = this.filters.keyword
        if (this.filters.categoryId !== '') params.categoryId = this.filters.categoryId
        params.status = this.filters.status
        const result = this.unwrap(await this.$api['forum.topicsPage'](params)) || {}
        this.topics = Array.isArray(result) ? result : result.records || result.list || []
        this.total = Number(result.total || this.topics.length)
        return true
      } catch (error) {
        this.topics = []
        this.total = 0
        this.$message.error('帖子列表加载失败，请稍后重试')
        return false
      } finally {
        this.loading = false
      }
    },
    async refreshTopics() {
      if (await this.loadTopics()) this.$message.success('刷新成功')
    },
    search() {
      this.currentPage = 1
      this.loadTopics()
    },
    resetFilters() {
      this.filters = { keyword: '', categoryId: '', status: 3, sort: 'latest' }
      this.search()
    },
    categoryName(id) {
      return this.categoryById(id).name
    },
    categoryById(id) {
      return this.categories.find((item) => String(item.id) === String(id)) || { name: '未分类', color: '#909399', softColor: '#f4f4f5' }
    },
    categoryTagStyle(id) {
      const category = this.categoryById(id)
      return { color: category.color, backgroundColor: category.softColor, borderColor: category.softColor }
    },
    authorName(topic) {
      return (topic && (topic.userName || topic.publisherName || topic.nickName)) || (topic && topic.userId ? `用户${topic.userId}` : '园区用户')
    },
    topicTitle(topic) {
      return (topic && topic.title) || '未命名帖子'
    },
    formatDateTime(value) {
      return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
    },
    numberValue(value) {
      return Math.max(0, Number(value) || 0)
    },
    reviewStatusText(status) {
      return { 0: '未审核', 1: '已审核', 2: '审核不通过' }[Number(status)] || '审核状态未知'
    },
    reviewStatusType(status) {
      return { 0: 'warning', 1: 'success', 2: 'danger' }[Number(status)] || 'info'
    },
    isPendingReview(topic) {
      return Boolean(topic) && Number(topic.status) === 0
    },
    currentUserId() {
      const storeId = this.$store && this.$store.getters && this.$store.getters.userId
      if (storeId) return storeId
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}').id || ''
      } catch (error) {
        return ''
      }
    },
    userRequestOptions() {
      const userId = this.currentUserId()
      return userId ? { headers: { 'X-User-Id': userId } } : null
    },
    async openDetail(topic) {
      this.selectedTopic = topic
      this.detailVisible = true
      if (!this.$api || !this.$api['forum.topicDetail']) return
      try {
        const detail = this.unwrap(await this.$api['forum.topicDetail']({ id: topic.id }))
        if (detail) this.selectedTopic = Object.assign({}, topic, detail)
      } catch (error) {
        this.$message.warning('帖子详情加载失败，已展示列表信息')
      }
    },
    openAudit(topic) {
      if (!topic || !topic.id || !this.isPendingReview(topic)) return
      this.auditTarget = Object.assign({}, topic)
      this.auditStatus = ''
      this.auditVisible = true
    },
    resetAudit() {
      this.auditTarget = null
      this.auditStatus = ''
      this.auditing = false
    },
    async submitAudit() {
      if (!this.auditTarget || ![1, 2].includes(Number(this.auditStatus))) {
        this.$message.warning('请选择审核结果')
        return
      }
      const editApi = this.$api && this.$api['forum.topicEdit']
      if (!editApi) {
        this.$message.error('帖子编辑接口暂不可用')
        return
      }
      this.auditing = true
      try {
        const status = Number(this.auditStatus)
        await editApi({ id: this.auditTarget.id, status }, this.userRequestOptions() || {})
        this.topics = this.topics.map((item) => (String(item.id) === String(this.auditTarget.id) ? Object.assign({}, item, { status }) : item))
        if (this.selectedTopic && String(this.selectedTopic.id) === String(this.auditTarget.id)) this.selectedTopic = Object.assign({}, this.selectedTopic, { status })
        this.auditVisible = false
        this.$message.success(status === 1 ? '帖子审核已通过' : '帖子审核不通过')
      } catch (error) {
        const message = error && (error.message || (error.head && error.head.message))
        this.$message.error(message || '帖子审核失败，请稍后重试')
      } finally {
        this.auditing = false
      }
    },
    async deleteTopic(topic) {
      if (!topic || !topic.id || this.deletingId) return
      if (!this.$api || !this.$api['forum.topicDelete']) {
        this.$message.error('删除接口暂不可用')
        return
      }
      try {
        await this.$confirm(`确定删除“${this.topicTitle(topic)}”吗？该操作会删除帖子及其全部回复，且无法恢复。`, '管理员删除确认', {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.deletingId = topic.id
        // 不限制发布人：后端根据当前登录管理员的权限决定是否允许删除。
        await this.$api['forum.topicDelete']({ id: topic.id }, this.userRequestOptions() || {})
        this.$message.success('帖子已删除')
        if (this.selectedTopic && String(this.selectedTopic.id) === String(topic.id)) this.detailVisible = false
        if (this.topics.length === 1 && this.currentPage > 1) this.currentPage -= 1
        await this.loadTopics()
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
          const message = error && (error.message || (error.head && error.head.message))
          this.$message.error(message || '帖子删除失败，请稍后重试')
        }
      } finally {
        this.deletingId = ''
      }
    }
  }
}
</script>

<style scoped>
.park-topic-manage {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
  color: #303133;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.metric-card {
  min-height: 96px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px 17px;
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  box-sizing: border-box;
  background: #fff;
}
.metric-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  border-radius: 9px;
  font-size: 18px;
}
.metric-icon.blue {
  background: #ecf5ff;
  color: #409eff;
}
.metric-icon.purple {
  background: #f2edff;
  color: #7a5bd7;
}
.metric-icon.orange {
  background: #fff4e8;
  color: #e46d32;
}
.metric-icon.green {
  background: #eaf8f2;
  color: #20a36c;
}
.metric-card small,
.metric-card strong,
.metric-card p {
  display: block;
}
.metric-card small,
.metric-card p {
  color: #909399;
  font-size: 12px;
}
.metric-card strong {
  margin: 3px 0;
  color: #303133;
  font-size: 23px;
  line-height: 1.1;
}
.metric-card p {
  margin: 0;
}
.topic-surface {
  min-height: calc(100vh - 170px);
  border: 1px solid #e5ebf2;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}
.surface-heading {
  min-height: 62px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #edf1f5;
}
.surface-heading h2 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}
.surface-heading p {
  margin: 5px 0 0;
  color: #909399;
  font-size: 12px;
}
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid #edf1f5;
  background: #fcfdff;
}
.filter-bar .el-input {
  width: 300px;
}
.filter-bar .el-select {
  width: 150px;
}
.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
.filter-actions .el-button {
  margin: 0;
}
.topic-table {
  width: 100%;
}
.topic-title {
  max-width: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.topic-title:hover {
  color: #409eff;
}
.topic-title:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
.topic-content {
  display: -webkit-box;
  margin: 5px 0 0;
  overflow: hidden;
  color: #7c8797;
  font-size: 12px;
  line-height: 18px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.publisher,
.topic-metrics,
.detail-metrics {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 12px;
}
.publisher i,
.topic-metrics i,
.detail-metrics i {
  color: #97a5b9;
}
.topic-metrics {
  gap: 11px;
}
.delete-action {
  color: #f56c6c;
}
.delete-action:hover {
  color: #f56c6c;
}
.pagination-bar {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 0 20px;
  border-top: 1px solid #edf1f5;
  color: #909399;
  font-size: 12px;
}
.pagination-bar .el-pagination {
  padding: 0;
}
.detail-content {
  display: flex;
  min-height: 100%;
  box-sizing: border-box;
  flex-direction: column;
  padding: 4px 20px 20px;
}
.detail-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}
.detail-topline > div,
.audit-preview__topline > div {
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-content h3 {
  margin: 18px 0 10px;
  color: #303133;
  font-size: 20px;
  line-height: 30px;
}
.detail-publisher {
  color: #7b8798;
  font-size: 13px;
}
.detail-publisher i {
  margin-right: 5px;
}
.detail-content > p {
  margin: 22px 0;
  color: #4d5a6b;
  font-size: 14px;
  line-height: 25px;
  white-space: pre-wrap;
}
.detail-metrics {
  gap: 18px;
  padding-top: 16px;
  border-top: 1px solid #edf1f5;
}
.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: auto;
  padding-top: 24px;
}
.detail-actions .el-button {
  margin: 0;
}
.audit-preview {
  min-height: 240px;
}
.audit-preview__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
}
.audit-preview__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin: 16px 0;
}
.audit-preview__meta > div {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #edf1f5;
  border-radius: 6px;
}
.audit-preview__meta dt {
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
}
.audit-preview__meta dd {
  margin: 0;
  color: #4d5a6b;
  font-size: 13px;
  word-break: break-word;
}
.audit-preview__content {
  padding: 14px 16px;
  border-radius: 8px;
  background: #f8fafc;
}
.audit-preview__content h3 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 17px;
  line-height: 25px;
}
.audit-preview__content p {
  margin: 0;
  color: #4d5a6b;
  font-size: 14px;
  line-height: 24px;
  white-space: pre-wrap;
}
.audit-form {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #edf1f5;
}
@media (max-width: 1024px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .topic-surface {
    overflow-x: auto;
  }
  .topic-table {
    min-width: 900px;
  }
}
@media (max-width: 760px) {
  .park-topic-manage {
    padding: 10px;
  }
  .metric-grid {
    gap: 10px;
  }
  .metric-card {
    min-height: 82px;
    padding: 12px;
  }
  .metric-icon {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    font-size: 16px;
  }
  .metric-card strong {
    font-size: 20px;
  }
  .metric-card p {
    display: none;
  }
  .surface-heading {
    padding: 12px;
  }
  .surface-heading p {
    line-height: 18px;
  }
  .filter-bar {
    flex-wrap: wrap;
    padding: 12px;
  }
  .filter-bar .el-input {
    width: 100%;
  }
  .filter-bar .el-select {
    width: calc(50% - 5px);
  }
  .filter-actions {
    width: 100%;
    margin-left: 0;
  }
  .filter-actions .el-button {
    flex: 1;
    min-height: 36px;
  }
  .pagination-bar {
    justify-content: center;
    padding: 10px;
  }
  .pagination-bar > span {
    display: none;
  }
  ::v-deep .topic-manage-drawer {
    width: 100% !important;
    max-width: 100% !important;
  }
  ::v-deep .el-dialog {
    width: calc(100% - 24px) !important;
  }
  .audit-preview__meta {
    grid-template-columns: 1fr;
  }
}
</style>
