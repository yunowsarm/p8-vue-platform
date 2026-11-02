<template>
  <div class="meeting-minutes-page">
    <div class="list-card">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="openCreateDialog">新建</el-button>
        <el-input ref="quickSearch" v-model.trim="searchKeyword" class="quick-search" size="small" clearable placeholder="使用Alt+Q快捷搜索" @input="handleSearch" @keyup.enter.native="handleSearch">
          <i slot="prefix" class="el-input__icon el-icon-search" />
          <i slot="suffix" class="el-input__icon el-icon-arrow-down" />
        </el-input>
      </div>

      <div class="table-panel">
        <el-table v-loading="listLoading" :data="pagedMinutes" border height="100%" style="width: 100%" :header-cell-style="{ background: '#f4f7f7' }">
          <el-table-column width="44" align="center">
            <template slot-scope="scope">
              <el-radio v-model="selectedMinuteId" :label="scope.row.id"><span /></el-radio>
            </template>
          </el-table-column>
          <el-table-column label="编号" width="80" align="center">
            <template slot-scope="scope">{{ getRowNumber(scope.$index) }}</template>
          </el-table-column>
          <el-table-column prop="subject" label="会议主题" min-width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="meetingCategory" label="会议类别" min-width="140" align="center" show-overflow-tooltip />
          <el-table-column prop="meetingTime" label="时间" min-width="160" align="center" />
          <el-table-column prop="location" label="地点" min-width="140" align="center" show-overflow-tooltip />
          <el-table-column prop="recorder" label="记录人" min-width="110" align="center" />
          <el-table-column prop="chairperson" label="主持人" min-width="110" align="center" />
          <el-table-column prop="participants" label="参会人员" min-width="180" align="center" show-overflow-tooltip />
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="viewMinute(scope.row)">查看</el-button>
              <span class="action-divider">|</span>
              <el-button type="text" size="mini" @click="openApprovalDialog(scope.row)">提交审批</el-button>
              <span class="action-divider">|</span>
              <el-button type="text" size="mini" @click="editMinute(scope.row)">修改</el-button>
              <span class="action-divider">|</span>
              <el-button type="text" size="mini" @click="deleteMinute(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-panel">
          <el-button class="pagination-tool" size="mini" icon="el-icon-refresh" title="刷新" @click="handleRefresh" />
          <el-pagination
            small
            layout="prev, pager, next, sizes, total, jumper"
            :current-page="pagination.current"
            :page-size="pagination.size"
            :page-sizes="[11, 20, 50, 100]"
            :total="filteredMinutes.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <el-dialog
      :title="editingMinuteId ? '修改会议纪要' : '新增会议纪要'"
      :visible.sync="createDialogVisible"
      fullscreen
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeWhenBusy"
      custom-class="meeting-minutes-dialog"
      @closed="resetForm">
      <el-form ref="meetingForm" :model="meetingForm" :rules="formRules" label-width="120px" label-position="right" class="meeting-form">
        <div class="form-grid">
          <el-form-item label="会议编号" prop="code">
            <el-input v-model.trim="meetingForm.code" placeholder="请输入会议编号" maxlength="50" />
          </el-form-item>
          <el-form-item label="会议主题" prop="subject">
            <el-input v-model.trim="meetingForm.subject" placeholder="请输入会议主题" maxlength="100" />
          </el-form-item>
          <el-form-item label="会议类别" prop="meetingCategory">
            <el-popover v-model="departmentPickerVisible" placement="bottom-start" trigger="click" width="320">
              <el-tree
                v-loading="departmentLoading"
                :data="departmentTree"
                class="meeting-category-tree"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                default-expand-all
                highlight-current
                :expand-on-click-node="false"
                @node-click="handleDepartmentSelected" />
              <el-input slot="reference" :value="meetingForm.meetingCategory" placeholder="请选择部门作为会议类别" readonly>
                <i slot="suffix" class="el-input__icon el-icon-arrow-down" />
              </el-input>
            </el-popover>
          </el-form-item>
          <el-form-item label="会议时间" prop="meetingTime">
            <el-date-picker v-model="meetingForm.meetingTime" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" placeholder="请选择会议时间" style="width: 100%" />
          </el-form-item>
          <el-form-item label="会议地点" prop="location">
            <el-input v-model.trim="meetingForm.location" placeholder="请输入会议地点" maxlength="100" />
          </el-form-item>
          <el-form-item label="记录人" prop="recorderId">
            <el-popover v-model="recorderPickerVisible" placement="bottom-start" trigger="click" width="320" @show="syncRecorderTree">
              <el-tree
                ref="recorderTree"
                v-loading="personnelLoading"
                :data="personnelTree"
                class="meeting-personnel-tree"
                :props="personnelTreeProps"
                node-key="treeKey"
                default-expand-all
                highlight-current
                :expand-on-click-node="false"
                @node-click="selectRecorder" />
              <el-input slot="reference" :value="personnelName(meetingForm.recorderId)" placeholder="请选择记录人" readonly>
                <i slot="suffix" class="el-input__icon el-icon-arrow-down" />
              </el-input>
            </el-popover>
          </el-form-item>
          <el-form-item label="主持人" prop="chairperson" class="full-width">
            <el-popover v-model="chairpersonPickerVisible" placement="bottom-start" trigger="click" width="320" @show="syncChairpersonTree">
              <el-tree
                ref="chairpersonTree"
                v-loading="personnelLoading"
                :data="personnelTree"
                class="meeting-personnel-tree"
                :props="personnelTreeProps"
                node-key="treeKey"
                default-expand-all
                highlight-current
                :expand-on-click-node="false"
                @node-click="selectChairperson" />
              <el-input slot="reference" :value="personnelName(meetingForm.chairpersonId)" placeholder="请选择主持人" readonly>
                <i slot="suffix" class="el-input__icon el-icon-arrow-down" />
              </el-input>
            </el-popover>
          </el-form-item>
          <el-form-item label="参会人员" prop="participants" class="full-width">
            <el-popover v-model="participantPickerVisible" placement="bottom-start" trigger="click" width="320" @show="syncParticipantTree">
              <el-tree
                ref="participantTree"
                v-loading="personnelLoading"
                :data="personnelTree"
                class="meeting-personnel-tree"
                :props="personnelTreeProps"
                node-key="treeKey"
                show-checkbox
                default-expand-all
                :expand-on-click-node="false"
                @check="handleParticipantTreeCheck" />
              <el-input slot="reference" :value="meetingForm.participants" placeholder="请选择参会人员" readonly>
                <i slot="suffix" class="el-input__icon el-icon-arrow-down" />
              </el-input>
            </el-popover>
          </el-form-item>
          <el-form-item label="会议内容" class="full-width">
            <el-input v-model="meetingForm.content" type="textarea" :rows="8" resize="vertical" placeholder="请输入会议内容" />
          </el-form-item>
          <el-form-item label="附件" class="full-width">
            <el-upload
              ref="upload"
              action=""
              name="thefile"
              :http-request="uploadFile"
              :file-list="uploadList"
              :before-upload="beforeUpload"
              :before-remove="beforeRemove"
              :on-preview="downloadMeetingAttachment"
              :on-success="uploadSuccess"
              :on-remove="removeFile"
              :on-exceed="uploadExceeded"
              :limit="20"
              :disabled="saving || uploading > 0"
              multiple>
              <el-button size="small" icon="el-icon-upload2" :disabled="saving || uploading > 0">上传附件</el-button>
              <div slot="tip" class="el-upload__tip">支持图片、视频、PDF及办公文档，单个文件不超过10MB，最多20个。</div>
            </el-upload>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :disabled="saving || uploading > 0" @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving || attachmentLoading" :disabled="uploading > 0 || attachmentLoading || attachmentLoadFailed" @click="submitForm">
          {{ attachmentLoading ? '附件加载中' : uploading ? '附件上传中' : attachmentLoadFailed ? '附件加载失败' : '确定' }}
        </el-button>
      </span>
    </el-dialog>

    <el-dialog title="提交审批" :visible.sync="approvalDialogVisible" width="680px" append-to-body :close-on-click-modal="false" @closed="approvalMinute = null">
      <meeting-process
        v-if="approvalDialogVisible && approvalMinute"
        :row="[approvalMinute]"
        :business-ids="[approvalMinute.id]"
        :approve-info-map="[approvalMinute]"
        :approve-info-config="approvalInfoConfig"
        @close="approvalDialogVisible = false"
        @success="handleApprovalSuccess" />
    </el-dialog>

    <meeting-minutes-detail :visible.sync="detailDialogVisible" :minute="detailMinute" :embedded="false" />
  </div>
</template>

<script>
import MeetingProcess from '@/views/components/processDialog/meetingProcess'
import MeetingMinutesDetail from '@/views/components/meetingMinutes/meetingMinutesDetail'

const createEmptyForm = () => ({
  code: '',
  subject: '',
  meetingCategory: '',
  meetingCategoryDepartmentId: '',
  meetingTime: '',
  location: '',
  recorder: '',
  recorderId: '',
  chairperson: '',
  chairpersonId: '',
  participantIds: [],
  participants: '',
  content: '',
  uploadFiles: []
})

export default {
  name: 'MeetingMinutes',
  components: { MeetingProcess, MeetingMinutesDetail },
  data() {
    return {
      minutes: [],
      listLoading: false,
      saving: false,
      uploading: 0,
      attachmentLoading: false,
      attachmentLoadFailed: false,
      uploadList: [],
      searchKeyword: '',
      selectedMinuteId: '',
      editingMinuteId: '',
      pagination: {
        current: 1,
        size: 11
      },
      createDialogVisible: false,
      approvalDialogVisible: false,
      approvalMinute: null,
      departmentPickerVisible: false,
      recorderPickerVisible: false,
      chairpersonPickerVisible: false,
      participantPickerVisible: false,
      detailDialogVisible: false,
      detailMinute: null,
      departmentLoading: false,
      departmentTree: [],
      personnelLoading: false,
      personnelOptions: [],
      personnelTree: [],
      personnelTreeProps: {
        label: 'name',
        children: 'children',
        disabled: 'disabled'
      },
      selectedChairperson: null,
      selectedParticipants: [],
      meetingForm: createEmptyForm(),
      formRules: {
        // subject: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
        // meetingCategory: [{ required: true, message: '请选择会议类别所属部门', trigger: 'change' }],
        // meetingTime: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
        // location: [{ required: true, message: '请输入会议地点', trigger: 'blur' }],
        // recorderId: [{ required: true, message: '请选择记录人', trigger: 'change' }],
        // chairperson: [{ required: true, message: '请选择主持人', trigger: 'change' }],
        // participants: [{ required: true, message: '请选择参会人员', trigger: 'change' }]
      }
    }
  },
  computed: {
    approvalInfoConfig() {
      if (!this.approvalMinute) return {}
      return {
        [this.approvalMinute.id]: {
          filed1: { label: '会议编号', value: this.approvalMinute.code || '' },
          filed2: { label: '会议主题', value: this.approvalMinute.subject || '' },
          filed3: { label: '会议类别', value: this.approvalMinute.meetingCategory || '' },
          filed4: { label: '会议时间', value: this.approvalMinute.meetingTime || '' }
        }
      }
    },
    currentUserName() {
      const getters = this.$store && this.$store.getters
      const user = getters && getters.userInfo
      return (user && (user.realName || user.userName || user.username || user.name)) || (getters && getters.userName) || ''
    },
    pagedMinutes() {
      const start = (this.pagination.current - 1) * this.pagination.size
      return this.filteredMinutes.slice(start, start + this.pagination.size)
    },
    filteredMinutes() {
      const keyword = this.searchKeyword.toLocaleLowerCase()
      if (!keyword) return this.minutes
      return this.minutes.filter((minute) =>
        [minute.subject, minute.meetingCategory, minute.meetingTime, minute.location, minute.recorder, minute.chairperson, minute.participants].some((value) =>
          String(value || '')
            .toLocaleLowerCase()
            .includes(keyword)
        )
      )
    }
  },
  watch: {
    currentUserName() {
      if (this.createDialogVisible && !this.editingMinuteId && !this.meetingForm.recorderId) this.setCurrentUserAsRecorder()
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleGlobalShortcut)
    this.loadMinutes()
    this.loadMeetingDepartments()
    this.loadMeetingPersonnel()
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleGlobalShortcut)
  },
  methods: {
    closeWhenBusy(done) {
      if (!this.saving && !this.uploading) done()
    },
    openCreateDialog() {
      this.meetingForm = createEmptyForm()
      this.selectedChairperson = null
      this.selectedParticipants = []
      this.recorderPickerVisible = false
      this.chairpersonPickerVisible = false
      this.participantPickerVisible = false
      this.setCurrentUserAsRecorder()
      this.createDialogVisible = true
    },
    getRowNumber(index) {
      return (this.pagination.current - 1) * this.pagination.size + index + 1
    },
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.current = 1
    },
    handleCurrentChange(current) {
      this.pagination.current = current
    },
    handleSearch() {
      this.pagination.current = 1
    },
    handleGlobalShortcut(event) {
      if (event.altKey && event.key.toLowerCase() === 'q') {
        event.preventDefault()
        this.$refs.quickSearch.focus()
      }
    },
    handleRefresh() {
      this.searchKeyword = ''
      this.selectedMinuteId = ''
      this.pagination.current = 1
      this.loadMinutes()
    },
    openApprovalDialog(minute) {
      this.approvalMinute = { ...minute, ID: minute.id }
      this.approvalDialogVisible = true
    },
    handleApprovalSuccess() {
      this.approvalDialogVisible = false
      this.loadMinutes()
    },
    unwrapResponse(response) {
      if (response && response.head) {
        return response.data
      }
      if (response && response.result !== undefined) return response.result
      if (response && response.data !== undefined) return response.data
      return response
    },
    meetingRows(response) {
      const result = this.unwrapResponse(response)
      const rows = Array.isArray(result) ? result : result && (result.records || result.list || result.rows)
      if (!Array.isArray(rows)) throw new Error('会议列表数据格式错误')
      return rows.map((minute) => {
        const participants = minute.participants || ''
        const uploadFiles = Array.isArray(minute.uploadFiles) ? minute.uploadFiles : []
        return {
          ...minute,
          id: minute.id || minute.meetingId,
          subject: minute.subject || minute.meetingName || '',
          meetingTime: minute.meetingTime || minute.time || '',
          location: minute.location || '',
          recorder: minute.recorder || '',
          chairperson: minute.chairperson || '',
          participants: Array.isArray(participants)
            ? participants
                .map((user) => user.realName || user.REAL_NAME || user.NAME || user.name || '')
                .filter(Boolean)
                .join('、')
            : participants,
          uploadFiles
        }
      })
    },
    meetingAttachmentFiles(response) {
      const result = this.unwrapResponse(response)
      const data = result && (result.data || result.result) ? result.data || result.result : result
      const files = Array.isArray(data) ? data : data && (data.uploadFiles || data.attachments || data.files)
      if (!Array.isArray(files)) throw new Error('会议附件数据格式错误')
      return files
    },
    meetingAttachmentUploadList(files) {
      return files.map((file, index) => {
        const id = file.id || file.ID || file.attachmentId || file.fileId
        return {
          ...file,
          name: file.name || file.fileName || file.FILE_NAME || `附件${index + 1}`,
          url: file.url || file.filePath || file.urlTemp || '',
          status: 'success',
          uid: file.uid || (id != null ? String(id) : `meeting-file-${index}`)
        }
      })
    },
    async downloadMeetingAttachment(file) {
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
    },
    selectionRows(response, label) {
      const result = this.unwrapResponse(response)
      const rows = Array.isArray(result) ? result : result && (result.records || result.list || result.rows)
      if (!Array.isArray(rows)) throw new Error(`${label}数据格式错误`)
      return rows
        .map((item) => {
          if (!item) return null
          const id = item.ID || item.id || item.USER_ID || item.USERID || item.userId || item.USER_CODE || item.userCode
          const name = item.REAL_NAME || item.REALNAME || item.realName || item.USER_NAME || item.USERNAME || item.userName || item.NAME || item.name
          if (id == null || !name) return null
          return { ...item, id: String(id), name: String(name) }
        })
        .filter(Boolean)
    },
    findPersonnel(value) {
      if (value == null || value === '') return null
      return this.personnelOptions.find((user) => String(user.id) === String(value)) || this.personnelOptions.find((user) => user.name === String(value)) || null
    },
    personnelName(value) {
      const user = this.findPersonnel(value)
      return user ? user.name : ''
    },
    syncRecorderTree() {
      this.$nextTick(() => {
        const tree = this.$refs.recorderTree
        if (tree) tree.setCurrentKey(`user:${this.meetingForm.recorderId}`)
      })
    },
    syncChairpersonTree() {
      this.$nextTick(() => {
        const tree = this.$refs.chairpersonTree
        if (tree) tree.setCurrentKey(`user:${this.meetingForm.chairpersonId}`)
      })
    },
    syncParticipantTree() {
      this.$nextTick(() => {
        if (this.$refs.participantTree) {
          this.$refs.participantTree.setCheckedKeys(this.meetingForm.participantIds.map((id) => `user:${id}`))
        }
      })
    },
    buildPersonnelTree(users) {
      const childrenByParentId = new Map()
      users.forEach((item) => {
        const parentId = item.PARENTID
        if (parentId == null || parentId === '') return
        const key = String(parentId)
        childrenByParentId.set(key, (childrenByParentId.get(key) || 0) + 1)
      })
      const rootIds = new Set(users.filter((item) => item.PARENTID == null || item.PARENTID === '').map((item) => String(item.ID)))

      const nodeMap = new Map()
      users.forEach((item) => {
        const id = String(item.ID)
        const isDepartment = item.PARENTID == null || item.PARENTID === '' || childrenByParentId.has(id) || rootIds.has(String(item.PARENTID))
        nodeMap.set(id, {
          ...item,
          id,
          name: item.NAME || '',
          treeKey: `${isDepartment ? 'department' : 'user'}:${id}`,
          type: isDepartment ? 'department' : 'user',
          children: []
        })
      })

      const roots = []
      nodeMap.forEach((node) => {
        const parentId = node.PARENTID
        const parent = parentId == null ? null : nodeMap.get(String(parentId))
        if (parent && parent !== node) parent.children.push(node)
        else roots.push(node)
      })
      return roots
    },
    setCurrentUserAsRecorder() {
      const getters = this.$store && this.$store.getters
      const currentUser = getters && getters.userInfo
      const currentNames = [
        currentUser && currentUser.realName,
        getters && getters.userName,
        currentUser && currentUser.userName,
        currentUser && currentUser.username,
        currentUser && currentUser.name,
        this.currentUserName
      ]
        .filter(Boolean)
        .map((name) => String(name).trim().toLocaleLowerCase())
      const user = this.personnelOptions.find((item) => currentNames.includes(item.name.trim().toLocaleLowerCase()))
      if (!user) return
      this.meetingForm.recorderId = user.id
      this.meetingForm.recorder = user.name
      this.$nextTick(() => {
        if (this.$refs.meetingForm) this.$refs.meetingForm.validateField('recorderId')
        if (this.recorderPickerVisible) this.syncRecorderTree()
      })
    },
    async loadMeetingPersonnel() {
      const api = this.$api && this.$api['yqRequestApi.platSelectApi']
      if (!api) {
        this.$message.error('未找到会议人员接口')
        return
      }
      this.personnelLoading = true
      try {
        this.personnelOptions = this.selectionRows(await api({ id: '55791dba230e63aa8ce8af4a49a178f6' }), '会议人员')
        this.personnelTree = this.buildPersonnelTree(this.personnelOptions)
        if (this.createDialogVisible && !this.editingMinuteId) this.setCurrentUserAsRecorder()
      } catch (error) {
        this.$message.error(error.message || '会议人员加载失败')
      } finally {
        this.personnelLoading = false
      }
    },
    buildDepartmentTree(departments) {
      const nodeMap = new Map()
      departments.forEach((department) => {
        nodeMap.set(String(department.ID), {
          ...department,
          id: String(department.ID),
          name: department.NAME || '',
          children: []
        })
      })
      const roots = []
      departments.forEach((department) => {
        const node = nodeMap.get(String(department.ID))
        const parentId = department.PATER_DEPARTMENT_ID
        const parent = parentId == null ? null : nodeMap.get(String(parentId))
        if (parent && parent !== node) parent.children.push(node)
        else roots.push(node)
      })
      return roots
    },
    async loadMeetingDepartments() {
      const api = this.$api && this.$api['yqRequestApi.platSelectApi']
      if (!api) {
        this.$message.error('未找到会议类别接口')
        return
      }
      this.departmentLoading = true
      try {
        const response = await api({ id: 'a97e9d7d81c8a29fa3d1296d97794b4f' })
        const rows = this.unwrapResponse(response)
        if (!Array.isArray(rows)) throw new Error('会议类别数据格式错误')
        this.departmentTree = this.buildDepartmentTree(rows)
      } catch (error) {
        this.$message.error(error.message || '会议类别加载失败')
      } finally {
        this.departmentLoading = false
      }
    },
    async loadMinutes() {
      const api = this.$api && this.$api['yqRequestApi.getMeetingListApi']
      if (!api) {
        this.$message.error('未找到会议列表接口')
        return
      }
      this.listLoading = true
      try {
        this.minutes = this.meetingRows(await api())
      } catch (error) {
        this.$message.error(error.message || '会议列表加载失败')
      } finally {
        this.listLoading = false
      }
    },
    viewMinute(minute) {
      this.detailMinute = { ...minute }
      this.detailDialogVisible = true
    },
    async editMinute(minute) {
      this.editingMinuteId = minute.id
      this.attachmentLoading = true
      this.attachmentLoadFailed = false
      const chairpersonUser = minute.chairpersonUser
      const chairperson = this.findPersonnel(
        minute.chairpersonId || (chairpersonUser && (chairpersonUser.id || chairpersonUser.ID || chairpersonUser.realName || chairpersonUser.REAL_NAME || chairpersonUser.NAME)) || minute.chairperson
      )
      const participantValues = Array.isArray(minute.participantUsers)
        ? minute.participantUsers.map((user) => user.id || user.ID || user.realName || user.REAL_NAME || user.NAME || user.name)
        : Array.isArray(minute.participantIds)
        ? minute.participantIds
        : String(minute.participants || '')
            .split(/[、,，]/)
            .filter(Boolean)
      const participants = participantValues.map((value) => this.findPersonnel(value)).filter(Boolean)
      this.selectedChairperson = chairperson
      this.selectedParticipants = participants
      this.meetingForm = {
        ...createEmptyForm(),
        ...minute,
        recorderId: (this.findPersonnel(minute.recorderId || minute.recorder) || {}).id || '',
        recorder: (this.findPersonnel(minute.recorderId || minute.recorder) || {}).name || minute.recorder || '',
        chairpersonId: chairperson ? chairperson.id : '',
        chairperson: chairperson ? chairperson.name : minute.chairperson || '',
        participantIds: participants.map((user) => user.id),
        participants: participants.map((user) => user.name).join('、')
      }
      this.uploadList = this.meetingAttachmentUploadList(this.meetingForm.uploadFiles)
      this.createDialogVisible = true
      const api = this.$api && this.$api['yqRequestApi.queryMeetingAttachmentsApi']
      if (!api) {
        this.attachmentLoading = false
        this.attachmentLoadFailed = true
        this.$message.error('未找到会议附件查询接口')
        return
      }
      try {
        const response = await api({ id: minute.id })
        if (String(this.editingMinuteId) !== String(minute.id) || !this.createDialogVisible) return
        const files = this.meetingAttachmentFiles(response)
        this.meetingForm.uploadFiles = files
        this.uploadList = this.meetingAttachmentUploadList(files)
      } catch (error) {
        if (String(this.editingMinuteId) === String(minute.id) && this.createDialogVisible) {
          this.attachmentLoadFailed = true
          this.$message.error(error.message || '会议附件加载失败')
        }
      } finally {
        if (String(this.editingMinuteId) === String(minute.id)) this.attachmentLoading = false
      }
    },
    deleteMinute(minute) {
      this.$confirm('确定删除这条会议纪要吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const api = this.$api && this.$api['yqRequestApi.deleteMeetingApi']
          if (!api) throw new Error('未找到删除会议接口')
          return api({ id: minute.id })
        })
        .then(() => {
          this.$message.success('删除成功')
          if (this.selectedMinuteId === minute.id) this.selectedMinuteId = ''
          return this.loadMinutes()
        })
        .catch((action) => {
          if (action !== 'cancel' && action !== 'close') this.$message.error(action.message || '删除操作失败')
        })
    },
    handleDepartmentSelected(department) {
      this.meetingForm.meetingCategoryDepartmentId = department.id
      this.meetingForm.meetingCategory = department.name
      this.departmentPickerVisible = false
      this.$nextTick(() => {
        if (this.$refs.meetingForm) this.$refs.meetingForm.validateField('meetingCategory')
      })
    },
    selectRecorder(user) {
      if (user.type !== 'user') return
      this.meetingForm.recorderId = user.id
      this.meetingForm.recorder = user ? user.name : ''
      this.recorderPickerVisible = false
      this.$nextTick(() => {
        if (this.$refs.meetingForm) this.$refs.meetingForm.validateField('recorderId')
      })
    },
    selectChairperson(user) {
      if (user.type !== 'user') return
      this.meetingForm.chairpersonId = user.id
      this.selectedChairperson = user
      this.meetingForm.chairperson = user ? user.name : ''
      this.chairpersonPickerVisible = false
      this.$nextTick(() => {
        if (this.$refs.meetingForm) this.$refs.meetingForm.validateField('chairperson')
      })
    },
    handleParticipantTreeCheck(checkedNode, checkedState) {
      this.selectedParticipants = (checkedState.checkedNodes || []).filter((node) => node.type === 'user')
      this.meetingForm.participantIds = this.selectedParticipants.map((user) => user.id)
      this.meetingForm.participants = this.selectedParticipants.map((user) => user.name).join('、')
      this.$nextTick(() => {
        if (this.$refs.meetingForm) this.$refs.meetingForm.validateField('participants')
      })
    },
    beforeUpload(file) {
      if (file.size > 10 * 1024 * 1024) {
        this.$message.warning('单个附件不能超过10MB')
        return false
      }
      if (!/\.(jpe?g|png|gif|webp|bmp|mp4|mov|avi|webm|pdf|docx?|xlsx?|pptx?)$/i.test(file.name)) {
        this.$message.warning('请选择图片、视频、PDF或办公文档')
        return false
      }
      return true
    },
    beforeRemove(file) {
      return !this.saving && !this.uploading && file.status !== 'uploading'
    },
    uploadExceeded() {
      this.$message.warning('最多上传20个附件')
    },
    uploadFile(options) {
      this.uploading++
      if (options.onProgress) options.onProgress({ percent: 0 })
      const uploadApi = this.$api && this.$api['qualifications.upload']
      if (!uploadApi) {
        this.uploading--
        return Promise.reject(new Error('未找到会议附件上传接口'))
      }
      const formData = new FormData()
      formData.append('thefile', options.file)
      return uploadApi(formData)
        .then((response) => {
          const result = this.unwrapResponse(response)
          const uploaded = Array.isArray(result) ? result[0] : result
          if (!uploaded || !(uploaded.id || uploaded.ID || uploaded.attachmentId || uploaded.fileId || uploaded.url || uploaded.fileUrl || uploaded.filePath)) {
            throw new Error('上传接口未返回有效附件信息')
          }
          const id = uploaded.id || uploaded.ID || uploaded.attachmentId || uploaded.fileId
          const url = uploaded.url || uploaded.fileUrl || uploaded.filePath || ''
          return {
            ...uploaded,
            ...(id ? { id: String(id), attachmentId: uploaded.attachmentId || String(id) } : {}),
            name: uploaded.name || uploaded.fileName || options.file.name,
            fileName: uploaded.fileName || uploaded.name || options.file.name,
            filePath: uploaded.filePath || url,
            fileType: uploaded.fileType || options.file.type || '',
            url,
            size: uploaded.size || uploaded.fileSize || options.file.size
          }
        })
        .catch((error) => {
          this.$message.error(error.message || '附件上传失败')
          throw error
        })
        .finally(() => {
          this.uploading--
        })
    },
    uploadSuccess(response, file) {
      file.meetingAttachment = response
      this.meetingForm.uploadFiles.push(response)
    },
    removeFile(file) {
      const attachment = file.meetingAttachment || file.response || file
      const attachmentId = file.id || file.attachmentId || attachment.id || attachment.attachmentId
      this.meetingForm.uploadFiles = this.meetingForm.uploadFiles.filter((item) => {
        if (item === attachment || item === file) return false
        return !attachmentId || String(item.id || item.attachmentId || '') !== String(attachmentId)
      })
    },
    submitForm() {
      if (this.saving || this.uploading) return
      this.$refs.meetingForm.validate((valid) => {
        if (!valid) return

        const chairperson = this.selectedChairperson
        const recorder = this.findPersonnel(this.meetingForm.recorderId)
        const payload = {
          ...this.meetingForm,
          meetingTime: this.meetingForm.meetingTime ? `${this.meetingForm.meetingTime}:00` : '',
          recorder: recorder ? recorder.name : this.meetingForm.recorder,
          chairperson: chairperson ? chairperson.name : this.meetingForm.chairperson,
          chairpersonId: chairperson ? chairperson.id : this.meetingForm.chairpersonId,
          participants: this.selectedParticipants.map((user) => user.name).join('、'),
          participantIds: this.selectedParticipants.map((user) => user.id),
          uploadFiles: this.meetingForm.uploadFiles.slice()
        }
        delete payload.chairpersonUser
        delete payload.participantUsers
        this.saving = true
        const apiName = this.editingMinuteId ? 'yqRequestApi.editMeetingApi' : 'yqRequestApi.addMeetingApi'
        const api = this.$api && this.$api[apiName]
        if (!api) {
          this.saving = false
          this.$message.error(this.editingMinuteId ? '未找到编辑会议接口' : '未找到新增会议接口')
          return
        }
        if (this.editingMinuteId) payload.id = this.editingMinuteId
        api(payload)
          .then(() => {
            this.$message.success('会议纪要已保存')
            this.createDialogVisible = false
            this.pagination.current = 1
            return this.loadMinutes()
          })
          .catch((error) => {
            this.$message.error(error.message || '会议纪要保存失败')
          })
          .finally(() => {
            this.saving = false
          })
      })
    },
    resetForm() {
      this.meetingForm = createEmptyForm()
      this.uploadList = []
      this.editingMinuteId = ''
      this.attachmentLoading = false
      this.attachmentLoadFailed = false
      this.selectedChairperson = null
      this.selectedParticipants = []
      this.departmentPickerVisible = false
      this.recorderPickerVisible = false
      this.chairpersonPickerVisible = false
      this.participantPickerVisible = false
      this.$nextTick(() => {
        if (this.$refs.upload) this.$refs.upload.clearFiles()
      })
      this.$nextTick(() => {
        if (this.$refs.meetingForm) this.$refs.meetingForm.clearValidate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.meeting-minutes-page {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  overflow: hidden;
  padding: 10px 14px;
  background: #f0f0f0;
}

.list-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 10px;
  background: #fff;
  border-radius: 4px;

  > .toolbar {
    display: flex;
    height: 34px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
    flex-shrink: 0;

    .el-button--primary {
      background: #1890c8;
      border-color: #1890c8;
      &:hover {
        background: #40a9df;
        border-color: #40a9df;
      }
    }
  }
}

.quick-search {
  width: 300px;

  ::v-deep .el-input__inner {
    border-color: #d7dce2;
  }
}

.table-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e1e4e6;

  .el-table {
    flex: 1;
    min-height: 0;
    color: #526170;

    ::v-deep th.el-table__cell {
      height: 44px;
      color: #263746;
      font-weight: 600;
    }

    ::v-deep td.el-table__cell {
      height: 44px;
    }

    ::v-deep .el-table__row {
      cursor: pointer;
    }

    ::v-deep .el-radio__label {
      display: none;
    }
  }
}

.pagination-panel {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 44px;
  padding: 6px 12px 0;
  flex-shrink: 0;
  background: #fff;
}

.pagination-tool {
  padding: 4px;
  color: #647483;
  border-color: #d9dfe4;
}

.action-divider {
  margin: 0 6px;
  color: #d7dce2;
}

.form-grid {
  display: flex;
  flex-wrap: wrap;
}

.form-grid > .el-form-item {
  width: 50%;
}

.form-grid > .full-width {
  width: 100%;
}

.user-picker {
  display: flex;
  min-height: 32px;
  align-items: center;
  gap: 12px;
}

.select-user-button {
  border-style: dashed;
  border-color: #1890ff;
  color: #1890ff;
}

.selected-user {
  color: #606266;

  .el-icon-circle-close {
    margin-left: 8px;
    color: #909399;
    cursor: pointer;
  }
}

.meeting-category-tree {
  max-height: 320px;
  overflow: auto;
}

.meeting-personnel-tree {
  max-height: 320px;
  overflow: auto;
}
</style>

<style lang="scss">
.meeting-minutes-dialog.el-dialog.is-fullscreen {
  display: flex;
  flex-direction: column;
  background: #f8fafc;

  .el-dialog__header {
    flex-shrink: 0;
    border-bottom: 1px solid #e8e8e8;
  }

  .el-dialog__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 10px 24px;
  }

  .el-dialog__footer {
    flex-shrink: 0;
    border-top: 1px solid #e8e8e8;
    background: #fff;
  }

  .meeting-form .el-form-item__content {
    background: #fff;
  }
}
</style>
