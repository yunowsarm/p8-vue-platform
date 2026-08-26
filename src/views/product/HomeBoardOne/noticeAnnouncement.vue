<!-- 首页通知公告组件：按配置范围展示公告列表、详情内容以及附件下载链接，默认加载对内公告。 -->
<template>
  <section class="notice-announcement" aria-label="通知公告">
    <header class="notice-announcement__header">
      <div class="notice-announcement__title">
        <i class="el-icon-bell" aria-hidden="true"></i>
        <span>通知公告</span>
      </div>
      <span class="notice-announcement__summary">最新 {{ notices.length }} 条</span>
    </header>

    <div v-loading="loading" class="notice-announcement__content" element-loading-text="正在加载通知公告">
      <div v-if="notices.length" class="notice-announcement__list">
        <button v-for="notice in notices" :key="notice.id" type="button" class="notice-item" :aria-label="`查看公告：${notice.title || '未命名公告'}`" @click="openDetail(notice)">
          <span class="notice-item__title" :title="notice.title">{{ notice.title || '未命名公告' }}</span>
          <span class="notice-item__meta">
            <span class="notice-scene">
              <img v-if="sceneIcon(notice)" :src="sceneIcon(notice)" alt="" />
              {{ notice.sceneType || '园区公告' }}
            </span>
            <span>{{ publisherName(notice) }}</span>
            <time>{{ formatDateTime(notice.publishTime) }}</time>
          </span>
        </button>
      </div>
      <el-empty v-else-if="!loading" description="暂无通知公告" :image-size="64" />
    </div>

    <el-drawer title="通知公告详情" :visible.sync="detailVisible" size="500px" append-to-body custom-class="home-notice-detail">
      <article v-if="selectedNotice" class="notice-detail">
        <div class="notice-detail__meta">
          <span class="notice-scene">
            <img v-if="sceneIcon(selectedNotice)" :src="sceneIcon(selectedNotice)" alt="" />
            {{ selectedNotice.sceneType || '园区公告' }}
          </span>
          <span>{{ publisherName(selectedNotice) }}</span>
          <time>{{ formatDateTime(selectedNotice.publishTime) }}</time>
        </div>
        <h3>{{ selectedNotice.title || '未命名公告' }}</h3>
        <p>{{ selectedNotice.content || '暂无公告内容' }}</p>
        <section v-if="detailUploadFiles.length" class="notice-attachments">
          <h4>附件</h4>
          <div class="notice-attachments__list">
            <button
              v-for="file in detailUploadFiles"
              :key="file.uid || file.id || file.filePath || file.fileName"
              type="button"
              class="notice-attachment-link"
              :disabled="!file.id"
              :title="file.name || file.fileName || '附件'"
              :aria-label="`下载附件：${file.name || file.fileName || '附件'}`"
              @click="downloadUploadFile(file)">
              <img class="file-type-icon" :src="fileIcon(file)" alt="" aria-hidden="true" />
              <span>{{ file.name || file.fileName || '附件' }}</span>
            </button>
          </div>
        </section>
      </article>
    </el-drawer>
  </section>
</template>

<script>
import activityNoticeIcon from '@/assets/image/publicNotice/activity-notice.svg'
import enterpriseNewsIcon from '@/assets/image/publicNotice/enterprise-news.svg'
import parkNewsIcon from '@/assets/image/publicNotice/park-news.svg'
import safetyReminderIcon from '@/assets/image/publicNotice/safety-reminder.svg'
import { getFileTypeIcon } from '@/utils/fileTypeIcon'

const sceneIcons = {
  园区动态: parkNewsIcon,
  园区通用: parkNewsIcon,
  企业动态: enterpriseNewsIcon,
  安全提醒: safetyReminderIcon,
  活动通知: activityNoticeIcon
}

export default {
  name: 'HomeNoticeAnnouncement',
  props: {
    noticeType: { type: Number, default: 0 }
  },
  data() {
    return {
      loading: false,
      notices: [],
      detailVisible: false,
      selectedNotice: null
    }
  },
  created() {
    this.loadNotices()
  },
  computed: {
    detailUploadFiles() {
      return this.selectedNotice ? this.normalizeUploadFiles(this.selectedNotice.uploadFiles) : []
    }
  },
  methods: {
    unwrap(response) {
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    recordsFrom(data) {
      if (Array.isArray(data)) return data
      return (data && (data.records || data.list)) || []
    },
    async loadNotices() {
      if (!this.$api || !this.$api['tobPublicNotice.list']) return
      this.loading = true
      try {
        const result = this.unwrap(await this.$api['tobPublicNotice.list']({ pageNo: 1, pageSize: 5, type: this.noticeType }))
        this.notices = this.recordsFrom(result).slice(0, 5)
      } catch (error) {
        this.notices = []
      } finally {
        this.loading = false
      }
    },
    async openDetail(notice) {
      this.selectedNotice = notice
      this.detailVisible = true
      if (!this.$api || !this.$api['tobPublicNotice.queryById']) return
      try {
        const detail = this.unwrap(await this.$api['tobPublicNotice.queryById']({ id: notice.id }))
        if (detail) this.selectedNotice = Object.assign({}, notice, detail)
      } catch (error) {
        // 列表数据足以支撑基础详情回显。
      }
    },
    publisherName(notice) {
      return (notice && notice.createByName) || '园区'
    },
    sceneIcon(notice) {
      return (notice && sceneIcons[notice.sceneType]) || ''
    },
    fileIcon(file) {
      return getFileTypeIcon(file)
    },
    normalizeUploadFiles(value) {
      let files = value
      if (typeof files === 'string') {
        try {
          files = JSON.parse(files)
        } catch (error) {
          files = []
        }
      }
      if (!Array.isArray(files)) files = files ? [files] : []
      return files.filter(Boolean).map((item, index) => {
        const file = typeof item === 'string' ? { fileName: item, filePath: item } : item
        return Object.assign({}, file, {
          name: file.name || file.fileName || `附件${index + 1}`,
          uid: file.uid || file.id || file.filePath || `home-notice-file-${index}`
        })
      })
    },
    async downloadUploadFile(file) {
      if (!file.id || !this.$api || !this.$api['attachment.download']) return
      try {
        const response = await this.$api['attachment.download']({ attachmentId: file.id }, { responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([response.data], { type: file.fileType || 'application/octet-stream' }))
        const link = document.createElement('a')
        link.href = url
        link.download = file.name || file.fileName || '附件'
        link.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        this.$message.error('附件下载失败，请稍后重试')
      }
    },
    formatDateTime(value) {
      return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.notice-announcement {
  height: 100%;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 4px;
  background: #fff;
  color: #303133;
}

.notice-announcement__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.notice-announcement__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(14px, 1vw, 18px);
  font-weight: 600;
}

.notice-announcement__title i {
  color: #409eff;
  font-size: 20px;
}

.notice-announcement__summary,
.notice-item__meta,
.notice-detail__meta {
  color: #909399;
  font-size: 12px;
}

.notice-announcement__content {
  height: calc(100% - 49px);
  min-height: 0;
}

.notice-announcement__list {
  height: 100%;
  overflow-y: auto;
}

.notice-item {
  display: block;
  width: 100%;
  padding: 11px 0;
  border: 0;
  border-bottom: 1px solid #f0f2f5;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
}

.notice-item:hover {
  background: #f5faff;
}

.notice-item:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: -2px;
}

.notice-item__title,
.notice-item__meta span,
.notice-item__meta time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-item__title {
  display: block;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.notice-item__meta,
.notice-detail__meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.notice-item__meta span,
.notice-item__meta time {
  min-width: 0;
}

.notice-scene {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.notice-scene img {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  object-fit: contain;
}

.notice-detail {
  padding: 4px 20px 20px;
}

.notice-detail__meta {
  flex-wrap: wrap;
}

.notice-detail h3 {
  margin: 18px 0 14px;
  color: #303133;
  font-size: 20px;
  line-height: 30px;
}

.notice-detail p {
  margin: 0;
  color: #4d5a6b;
  font-size: 14px;
  line-height: 24px;
  white-space: pre-wrap;
}

.notice-attachments {
  margin-top: 24px;
}

.notice-attachments h4 {
  margin: 0 0 10px;
  color: #303133;
  font-size: 14px;
}

.notice-attachments__list {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 10px;
}

.notice-attachment-link {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  min-height: 24px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 2px;
  background: transparent;
  box-shadow: none;
  color: #3387ee;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 22px;
  text-align: left;
  transition: color 180ms ease;
}

.notice-attachment-link:hover,
.notice-attachment-link:focus {
  background: transparent;
  box-shadow: none;
  color: #2678dc;
  text-decoration: underline;
  text-underline-offset: 3px;
  transform: none;
}

.notice-attachment-link:focus:not(:focus-visible) {
  outline: none;
}

.notice-attachment-link:focus-visible {
  outline: 2px solid #3387ee;
  outline-offset: 3px;
}

.notice-attachment-link:disabled,
.notice-attachment-link:disabled:hover,
.notice-attachment-link:disabled:focus {
  background: transparent;
  box-shadow: none;
  color: #9aa9bc;
  cursor: not-allowed;
  opacity: 0.55;
  text-decoration: none;
  transform: none;
}

.notice-attachment-link span {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-attachment-link .file-type-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .notice-announcement {
    padding: 12px;
  }

  .notice-item {
    min-height: 44px;
  }

  .notice-attachment-link {
    min-height: 44px;
  }

  ::v-deep .home-notice-detail {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
