<!-- 业务附件基础字段：统一处理附件上传、大小限制和文件列表同步。 -->
<template>
  <el-form-item :label="label">
    <el-upload action="#" :auto-upload="false" :file-list="files" :limit="limit" :on-change="handleChange" :on-preview="downloadAttachment" :on-remove="handleRemove" :on-exceed="handleExceed">
      <el-button size="small" type="primary" icon="el-icon-upload2">选择附件</el-button>
      <div slot="tip" class="el-upload__tip">{{ tip }}</div>
    </el-upload>
  </el-form-item>
</template>

<script>
export default {
  name: 'BusinessAttachmentField',
  props: {
    value: { type: Array, default: () => [] },
    label: { type: String, default: '附件' },
    limit: { type: Number, default: 9 },
    maxSizeMb: { type: Number, default: 10 },
    tip: { type: String, default: '单个附件不超过 10MB，最多上传 9 个。' }
  },
  computed: {
    files() {
      return Array.isArray(this.value) ? this.value : []
    }
  },
  methods: {
    unwrap(response) {
      if (response && response.data && response.data.head && response.data.data !== undefined) return response.data.data
      if (response && response.result !== undefined) return response.result
      if (response && response.data && response.data.result !== undefined) return response.data.result
      return response && response.data !== undefined ? response.data : response
    },
    async handleChange(file, fileList) {
      if (!file.raw || file.url || file.id || file.attachmentId || file.fileId) {
        this.$emit('input', fileList)
        return
      }
      if (file.raw.size > this.maxSizeMb * 1024 * 1024) {
        this.$message.error(`单个附件不能超过 ${this.maxSizeMb}MB`)
        this.$emit(
          'input',
          fileList.filter((item) => item.uid !== file.uid)
        )
        return
      }
      const uploadApi = this.$api && this.$api['attachment.upload']
      if (!uploadApi) {
        this.$message.error('未找到附件上传接口')
        this.$emit(
          'input',
          fileList.filter((item) => item.uid !== file.uid)
        )
        return
      }
      try {
        const formData = new FormData()
        formData.append('thefile', file.raw)
        const response = this.unwrap(await uploadApi(formData))
        const uploaded = Array.isArray(response) ? response[0] || {} : response || {}
        const url = uploaded.url || uploaded.fileUrl || uploaded.filePath
        const attachmentId = uploaded.attachmentId || uploaded.id || uploaded.fileId
        if (!url && !attachmentId) throw new Error('missing uploaded file data')
        const name = file.name || file.raw.name || uploaded.originalName || uploaded.originalFileName || uploaded.fileName
        const uploadedFile = Object.assign({}, uploaded, {
          name,
          fileName: uploaded.fileName || name,
          filePath: uploaded.filePath || url,
          fileType: uploaded.fileType || file.raw.type || '',
          url: url || '',
          status: 'success'
        })
        if (attachmentId) {
          uploadedFile.id = uploaded.id || attachmentId
          uploadedFile.attachmentId = attachmentId
        }
        const nextFiles = fileList.map((item) => (item.uid === file.uid ? Object.assign({}, item, uploadedFile) : item))
        this.$emit('input', nextFiles)
      } catch (error) {
        this.$message.error('附件上传失败，请重试')
        this.$emit(
          'input',
          fileList.filter((item) => item.uid !== file.uid)
        )
      }
    },
    handleRemove(file, fileList) {
      this.$emit('input', fileList)
    },
    async downloadAttachment(file) {
      const attachmentId = file && (file.attachmentId || file.id || file.fileId)
      if (!attachmentId) {
        this.$message.warning('该附件缺少 attachmentId，无法下载')
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
        link.download = file.fileName || file.name || '附件'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(objectUrl)
      } catch (error) {
        this.$message.error('附件下载失败，请稍后重试')
      }
    },
    handleExceed() {
      this.$message.warning(`最多上传 ${this.limit} 个附件`)
    }
  }
}
</script>
