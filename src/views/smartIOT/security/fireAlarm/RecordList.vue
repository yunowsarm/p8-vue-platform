<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="keyword" size="small" clearable prefix-icon="el-icon-search" placeholder="记录名称 / 设备编号 / 名称 / 计划负责人" style="width: 300px" />
        <el-select v-model="result" size="small" clearable placeholder="维保结果" style="width: 130px">
          <el-option v-for="item in ['合格', '不合格']" :key="item" :label="item" :value="item" />
        </el-select>
        <el-date-picker v-model="date" type="date" size="small" value-format="yyyy-MM-dd" placeholder="实际养护日期" style="width: 155px" />
        <el-tag v-if="contextPlanId" closable @close="clearPlanContext">关联计划记录</el-tag>
        <el-button v-if="contextPlanId" type="text" size="small" @click="clearPlanContext">查看全部记录</el-button>
      </div>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%" @row-click="$emit('detail', $event)">
        <el-table-column prop="recordName" label="记录名称" min-width="210" show-overflow-tooltip />
        <el-table-column label="设备信息" min-width="190" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.device }}</div>
            <small class="muted-text">{{ scope.row.deviceCode }} · {{ scope.row.category }}</small>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="实际养护日期" width="130" />
        <el-table-column prop="responsiblePerson" label="计划负责人" width="110" />
        <el-table-column label="结果" width="95">
          <template slot-scope="scope">
            <span :class="['result-pill', scope.row.status === '合格' ? 'success' : scope.row.status === '不合格' ? 'danger' : 'info']">{{ scope.row.status || '未填写' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" class-name="maintenance-actions-column" width="85" fixed="right">
          <template slot-scope="scope"><el-button type="text" size="mini" @click.stop="$emit('detail', scope.row)">详情</el-button></template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-row">
      <div class="pagination-summary">
        <span>
          共
          <b>{{ filteredRows.length }}</b>
          条
        </span>
        <span>{{ pageRange }}</span>
      </div>
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        background
        :pager-count="5"
        layout="sizes, prev, pager, next, jumper"
        :total="filteredRows.length"
        @current-change="page = $event"
        @size-change="$emit('size-change', $event)" />
    </div>
    <el-dialog
      append-to-body
      title="消防设备维保执行登记"
      :visible.sync="recordDialog"
      width="700px"
      custom-class="maintenance-dialog fire-maintenance-dialog record-dialog"
      :close-on-click-modal="false"
      :before-close="closeWhenIdle">
      <el-alert v-if="blocked" title="数据读取失败，已填写内容保留；可重新加载或取消登记" type="error" :closable="false" />
      <el-button v-if="blocked" size="mini" :disabled="saving" @click="$emit('reload')">重新加载</el-button>
      <el-alert v-if="cycleChanged" title="本期已登记或计划时间已变更，请核对记录后重新进入登记" type="warning" :closable="false" />
      <el-button
        v-if="cycleChanged"
        type="text"
        :disabled="saving || uploading > 0"
        @click="
          recordDialog = false
          $emit('view-records', executionPlan)
        ">
        查看已有记录
      </el-button>
      <el-form ref="recordForm" :model="recordForm" :rules="recordRules" label-width="120px" size="small" :disabled="saving || blocked || cycleChanged">
        <el-form-item label="关联计划"><el-input :value="executionPlan ? executionPlan.planName : ''" disabled /></el-form-item>
        <el-form-item label="关联设备"><el-input :value="recordDevice ? recordDevice.name + '（' + recordDevice.deviceCode + '）' : ''" disabled /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="本次维保时间"><el-input :value="recordForm.scheduledDate" disabled /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="登记后下次时间"><el-input :value="executionPlan ? executionPlan.nextMaintenanceDate : ''" disabled /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="记录名称" prop="recordName"><el-input v-model.trim="recordForm.recordName" /></el-form-item>
        <el-form-item label="计划负责人"><el-input :value="executionPlan ? executionPlan.responsiblePerson || '未填写' : ''" disabled /></el-form-item>
        <el-form-item label="实际养护日期" prop="actualDate">
          <el-date-picker v-model="recordForm.actualDate" type="date" value-format="yyyy-MM-dd" :picker-options="dateOptions" style="width: 100%" />
        </el-form-item>
        <el-form-item label="维保结果" prop="status">
          <el-radio-group v-model="recordForm.status">
            <el-radio label="合格" />
            <el-radio label="不合格" />
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="recordForm.status === '不合格' ? '问题说明' : '备注'" prop="remark" :required="recordForm.status === '不合格'">
          <el-input v-model.trim="recordForm.remark" type="textarea" :rows="3" placeholder="填写现场情况、发现的问题及处理说明" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            ref="upload"
            action=""
            name="thefile"
            :http-request="uploadFile"
            :file-list="uploadList"
            :before-upload="beforeUpload"
            :before-remove="beforeRemove"
            :on-success="uploadSuccess"
            :on-remove="removeFile"
            :on-exceed="uploadExceeded"
            :limit="20"
            :disabled="saving || blocked || cycleChanged"
            multiple>
            <el-button size="small" icon="el-icon-upload2" :disabled="saving || blocked">上传附件</el-button>
            <div slot="tip" class="el-upload__tip">支持图片、视频、PDF及办公文档，单个文件不超过10MB，最多20个。</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button :disabled="saving || uploading > 0" @click="recordDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="blocked || uploading > 0 || cycleChanged" @click="saveRecord">
          {{ uploading ? '附件上传中' : '提交维保记录' }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { maintenanceToday, uploadMaintenanceAttachment, isMaintenanceDate } from '@/service/maintenance'
export default {
  name: 'RecordList',
  props: {
    pageSize: { type: Number, required: true },
    active: Boolean,
    saving: Boolean,
    blocked: Boolean,
    records: { type: Array, required: true },
    devices: { type: Array, required: true },
    plans: { type: Array, required: true }
  },
  data() {
    return {
      page: 1,
      keyword: '',
      result: '',
      date: '',
      contextPlanId: '',
      dateOptions: { disabledDate: (date) => date.getTime() > Date.now() },
      recordDialog: false,
      executionPlanId: '',
      recordForm: {},
      uploadList: [],
      uploading: 0,
      recordRules: {
        recordName: [{ required: true, message: '请输入记录名称', trigger: 'blur' }],
        actualDate: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!isMaintenanceDate(value) || value > maintenanceToday()) callback(new Error('实际日期应为今天或之前的有效日期'))
              else callback()
            },
            trigger: 'change'
          }
        ],
        remark: [
          {
            validator: (rule, value, callback) => {
              if (this.recordForm.status === '不合格' && !(value || '').trim()) callback(new Error('请说明发现的问题及处理要求'))
              else callback()
            },
            trigger: 'blur'
          }
        ],
        status: [{ required: true, message: '请选择维保结果', trigger: 'change' }]
      }
    }
  },
  computed: {
    executionPlan() {
      return this.plans.find((item) => item.id === this.executionPlanId) || null
    },
    cycleChanged() {
      const plan = this.executionPlan
      return !!this.recordDialog && (!plan || plan.cycleNo !== this.recordForm.cycleNo || plan.plannedDate !== this.recordForm.scheduledDate)
    },
    recordDevice() {
      return this.devices.find((item) => item.id === this.recordForm.deviceId) || null
    },
    filteredRows() {
      const keyword = this.keyword.toLowerCase()
      return this.records.filter(
        (item) =>
          (!keyword || [item.recordName, item.deviceCode, item.device, item.responsiblePerson].join(' ').toLowerCase().includes(keyword)) &&
          (!this.result || item.status === this.result) &&
          (!this.date || item.date === this.date) &&
          (!this.contextPlanId || item.planId === this.contextPlanId)
      )
    },
    pagedRows() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },
    pageRange() {
      return this.filteredRows.length ? '当前显示 ' + ((this.page - 1) * this.pageSize + 1) + '–' + Math.min(this.page * this.pageSize, this.filteredRows.length) + ' 条' : '暂无数据'
    }
  },
  watch: {
    pageSize() {
      this.page = 1
    },
    'filteredRows.length'() {
      this.page = Math.min(this.page, Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize)))
    },
    active(value) {
      if (value) this.refreshLayout()
    },
    keyword() {
      this.page = 1
    },
    result() {
      this.page = 1
    },
    date() {
      this.page = 1
    }
  },
  mounted() {
    if (this.active) this.refreshLayout()
  },
  methods: {
    refreshLayout() {
      this.$nextTick(() => {
        if (this.$refs.table) this.$refs.table.doLayout()
      })
    },
    closeWhenIdle(done) {
      if (!this.saving && !this.uploading) done()
    },
    closeRecordDialog() {
      this.recordDialog = false
    },
    focusPlanRecords(id) {
      this.keyword = ''
      this.result = ''
      this.date = ''
      this.page = 1
      this.contextPlanId = id
    },
    clearPlanContext() {
      this.contextPlanId = ''
      this.page = 1
    },
    openRecordDialog(device, plan) {
      if (this.saving || this.blocked || this.uploading) return
      if (!plan || !plan.canRegister || !device || device.id !== plan.deviceId) return this.$message.warning('请从本次维保时间前7天内、到期或逾期的有效计划进入登记')
      this.executionPlanId = plan.id
      this.recordForm = {
        planId: plan.id,
        deviceId: device.id,
        cycleNo: plan.cycleNo,
        scheduledDate: plan.plannedDate,
        recordName: plan.planName + '第' + plan.cycleNo + '期养护记录',
        responsiblePerson: plan.responsiblePerson || '',
        actualDate: maintenanceToday(),
        status: '合格',
        remark: '',
        uploadFiles: []
      }
      this.uploadList = []
      this.recordDialog = true
      this.$nextTick(() => {
        if (this.$refs.upload) this.$refs.upload.clearFiles()
        if (this.$refs.recordForm) this.$refs.recordForm.clearValidate()
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
      // 自定义请求不会自动把ready改成uploading，须通知Upload，防止请求未完成就移除文件。
      if (options.onProgress) options.onProgress({ percent: 0 })
      return uploadMaintenanceAttachment(this.$api, options.file)
        .catch((error) => {
          this.$message.error(error.message || '附件上传失败')
          throw error
        })
        .finally(() => {
          this.uploading--
        })
    },
    uploadSuccess(response, file) {
      file.maintenanceAttachment = response
      this.recordForm.uploadFiles.push(response)
    },
    removeFile(file) {
      const attachment = file.maintenanceAttachment || file.response
      if (attachment) this.recordForm.uploadFiles = this.recordForm.uploadFiles.filter((item) => item !== attachment)
    },
    saveRecord() {
      if (this.saving || this.blocked || this.uploading) return
      const plan = this.executionPlan
      if (!plan || this.cycleChanged || !plan.canRegister || plan.id !== this.recordForm.planId || plan.deviceId !== this.recordForm.deviceId)
        return this.$message.warning('本期已登记或计划已变更，请重新打开登记')
      this.$refs.recordForm.validate((valid) => {
        if (valid) this.$emit('save-record', { ...this.recordForm, uploadFiles: this.recordForm.uploadFiles.slice() })
      })
    }
  }
}
</script>
