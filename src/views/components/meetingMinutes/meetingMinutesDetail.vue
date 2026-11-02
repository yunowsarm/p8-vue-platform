<!-- 会议纪要详情：弹窗形态 + 平台审批内容内嵌形态 -->
<template>
  <div class="meeting-minutes-detail">
    <el-dialog v-if="!embedded" title="会议纪要详情" :visible.sync="dialogVisible" append-to-body width="760px" @closed="handleClosed">
      <div v-loading="loading">
        <template v-if="detail">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="会议编号" :label-style="{ width: '90px' }">{{ detail.code || '-' }}</el-descriptions-item>
            <el-descriptions-item label="会议类别" :label-style="{ width: '90px' }">{{ detail.meetingCategory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="会议时间" :label-style="{ width: '90px' }">{{ detail.meetingTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="会议主题" :span="3" :label-style="{ width: '90px' }">{{ detail.subject || '-' }}</el-descriptions-item>
            <el-descriptions-item label="会议地点" :label-style="{ width: '90px' }">{{ detail.location || '-' }}</el-descriptions-item>
            <el-descriptions-item label="记录人" :label-style="{ width: '90px' }">{{ detail.recorder || '-' }}</el-descriptions-item>
            <el-descriptions-item label="主持人" :label-style="{ width: '90px' }">{{ detail.chairperson || '-' }}</el-descriptions-item>
            <el-descriptions-item label="参会人员" :span="3" :label-style="{ width: '90px' }">{{ detail.participants || '-' }}</el-descriptions-item>
            <el-descriptions-item label="会议内容" :span="3" :label-style="{ width: '90px' }">{{ detail.content || '-' }}</el-descriptions-item>
          </el-descriptions>
          <div class="detail-attachments">
            <strong>附件</strong>
            <div v-if="attachments.length">
              <div v-for="(file, index) in attachments" :key="file.id || file.attachmentId || file.uid || index">
                <el-button type="text" @click="downloadAttachment(file)">
                  {{ file.name || file.fileName || file.originalName || `附件${index + 1}` }}
                </el-button>
              </div>
            </div>
            <span v-else>-</span>
          </div>
        </template>
        <el-empty v-else-if="!loading" description="暂无会议纪要信息" :image-size="64" />
      </div>
      <span slot="footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 被平台审批页 / 数据视图直接挂载时，不再套弹窗，直接平铺展示 -->
    <div v-else v-loading="loading" class="embedded-body">
      <template v-if="detail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="会议编号" :label-style="{ width: '90px' }">{{ detail.code || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会议类别" :label-style="{ width: '90px' }">{{ detail.meetingCategory || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会议时间" :label-style="{ width: '90px' }">{{ detail.meetingTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会议主题" :span="3" :label-style="{ width: '90px' }">{{ detail.subject || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会议地点" :label-style="{ width: '90px' }">{{ detail.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="记录人" :label-style="{ width: '90px' }">{{ detail.recorder || '-' }}</el-descriptions-item>
          <el-descriptions-item label="主持人" :label-style="{ width: '90px' }">{{ detail.chairperson || '-' }}</el-descriptions-item>
          <el-descriptions-item label="参会人员" :span="3" :label-style="{ width: '90px' }">{{ detail.participants || '-' }}</el-descriptions-item>
          <el-descriptions-item label="会议内容" :span="3" :label-style="{ width: '90px' }">{{ detail.content || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-attachments">
          <strong>附件</strong>
          <div v-if="attachments.length">
            <div v-for="(file, index) in attachments" :key="file.id || file.attachmentId || file.uid || index">
              <el-button type="text" @click="downloadAttachment(file)">
                {{ file.name || file.fileName || file.originalName || `附件${index + 1}` }}
              </el-button>
            </div>
          </div>
          <span v-else>-</span>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="暂无会议纪要信息" :image-size="64" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MeetingMinutesDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    minute: {
      type: Object,
      default: null
    },
    // 自定义组件可直接传入会议纪要主键。
    dataViewId: {
      type: String,
      default: ''
    },
    // 兼容平台自定义组件约定：业务主键通过 businessKey 传入。
    businessKey: {
      type: String,
      default: ''
    },
    row: {
      type: Array,
      default: () => []
    },
    // 平台审批页 / 数据视图内嵌挂载时为 true：不渲染弹窗，直接平铺展示详情
    embedded: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      detail: null,
      attachments: [],
      loadedId: ''
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    // 与 invalidLeadTable 保持一致：平台注入的业务主键优先，其次取行数据，最后取列表行对象。
    resolvedMinuteId() {
      const row = this.row[0] || {}
      const minute = this.minute || {}
      const id = this.dataViewId || this.businessKey || row.ID || row.id || minute.id || minute.ID || minute.meetingId
      return id == null ? '' : String(id)
    }
  },
  watch: {
    visible(value) {
      if (value) this.loadDetail()
    },
    resolvedMinuteId(id) {
      const opened = this.embedded || this.visible
      if (opened && id && id !== this.loadedId) this.loadDetail()
    }
  },
  mounted() {
    console.log(111111111111)
    // 页面加载时即按业务主键拉取会议详情与附件。
    if (!this.resolvedMinuteId) return
    if (this.embedded) {
      this.loadDetail()
    } else {
      this.loadDetail()
    }
  },
  methods: {
    unwrapResponse(response) {
      if (response && response.head) {
        return response.data
      }
      if (response && response.result !== undefined) return response.result
      if (response && response.data !== undefined) return response.data
      return response
    },
    handleClosed() {
      this.detail = null
      this.attachments = []
    },
    // 接口同时返回 xxx 与 xxxName 两套字段，Name 为空时回退到主字段。
    normalizeDetail(data) {
      const detail = data || {}
      return {
        ...detail,
        meetingCategory: detail.meetingCategory || detail.meetingCategoryName || '',
        recorder: detail.recorder || detail.recorderName || '',
        chairperson: detail.chairperson || detail.chairpersonName || '',
        participants: detail.participants || detail.participantsName || ''
      }
    },
    async loadDetail() {
      const minute = this.minute || {}
      const id = this.resolvedMinuteId
      this.detail = this.normalizeDetail({ ...minute, id: minute.id || id })
      this.attachments = Array.isArray(minute.uploadFiles) ? minute.uploadFiles : []
      const api = this.$api && this.$api['yqRequestApi.queryMeetingAttachmentsApi']
      if (!api) {
        this.$message.error('未找到会议详情接口')
        return
      }
      this.loading = true
      try {
        this.loadedId = id
        const result = this.unwrapResponse(await api({ id }))
        if (Array.isArray(result)) {
          this.attachments = result
        } else if (result && typeof result === 'object') {
          this.detail = this.normalizeDetail({ ...this.detail, ...result })
          const files = result.uploadFiles || result.attachments || result.files
          if (Array.isArray(files)) this.attachments = files
        }
      } catch (error) {
        this.$message.error(error.message || '会议详情加载失败')
      } finally {
        this.loading = false
      }
    },
    async downloadAttachment(file) {
      const attachmentId = file && (file.attachmentId || file.id || file.ID || file.fileId)
      if (!attachmentId) {
        this.$message.warning('该附件缺少附件ID，无法下载')
        return
      }
      const downloadApi = this.$api && this.$api['attachment.download']
      if (!downloadApi) {
        this.$message.error('未找到附件下载接口')
        return
      }
      try {
        const response = await downloadApi({ attachmentId }, { responseType: 'blob' })
        const responseData = response && response.data !== undefined ? response.data : response
        const blob = responseData instanceof Blob ? responseData : new Blob([responseData], { type: file.fileType || 'application/octet-stream' })
        const objectUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectUrl
        link.download = file.fileName || file.name || file.originalName || '附件'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000)
      } catch (error) {
        this.$message.error(error.message || '附件下载失败，请稍后重试')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.embedded-body {
  min-height: 120px;
  padding: 12px;
  background: #fff;
}

.detail-attachments {
  margin-top: 14px;
  line-height: 24px;

  strong {
    display: block;
    margin-bottom: 4px;
  }
}
</style>
