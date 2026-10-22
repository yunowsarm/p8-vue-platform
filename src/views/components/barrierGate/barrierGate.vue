<template>
  <div class="barrier-gate">
    <div class="query-card">
      <div class="query-form">
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          class="date-range" />
        <el-input v-model.trim="query.plateNumber" clearable placeholder="搜索车牌号" size="small" class="plate-filter" @keyup.enter.native="search" />
        <el-select v-model="query.companyName" clearable filterable size="small" placeholder="全部企业" class="company-filter">
          <el-option v-for="name in companyNames" :key="name" :label="name" :value="name" />
        </el-select>
        <el-select v-model="query.registration" clearable size="small" placeholder="全部车辆" class="registration-filter">
          <el-option label="已登记车辆" value="registered" />
          <el-option label="未登记 / 登记冲突" value="unregistered" />
        </el-select>
        <el-button type="primary" size="small" :loading="loading" @click="search">查询</el-button>
        <el-button size="small" @click="resetFilters">重置</el-button>
      </div>
      <el-button size="small" icon="el-icon-refresh" :loading="loading" @click="loadData">刷新</el-button>
      <el-button size="small" type="primary" icon="el-icon-upload2" :disabled="loading || importing" @click="importVisible = true">导入</el-button>
      <div class="view-actions" role="group" aria-label="数据展示方式">
        <el-tooltip content="数据视图" placement="bottom">
          <button type="button" class="view-action" :class="{ 'view-action--active': activeView === 'data' }" aria-label="数据视图" :aria-pressed="activeView === 'data'" @click="activeView = 'data'">
            <img src="./icons/data-view.svg" alt="" />
          </button>
        </el-tooltip>
        <el-tooltip content="数据分析" placement="bottom">
          <button
            type="button"
            class="view-action"
            :class="{ 'view-action--active': activeView === 'analysis' }"
            aria-label="数据分析"
            :aria-pressed="activeView === 'analysis'"
            @click="activeView = 'analysis'">
            <img src="./icons/data-analysis.svg" alt="" />
          </button>
        </el-tooltip>
      </div>
    </div>
    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" />
    <div v-loading="loading" class="content">
      <keep-alive>
        <barrier-data-view v-if="activeView === 'data'" :rows="filteredRows" :stats="stats" :loading="loading" />
        <barrier-analysis v-else :rows="filteredRows" :stats="stats" :applied-query="filters" :loading="loading" />
      </keep-alive>
    </div>
    <el-dialog title="导入出入记录" :visible.sync="importVisible" width="760px" append-to-body :close-on-click-modal="false" :before-close="closeImport">
      <el-alert title="选择道闸导出的原始 Excel；上传成功后刷新记录和分析。" type="info" :closable="false" show-icon />
      <el-upload
        ref="upload"
        drag
        action="#"
        accept=".xls,.xlsx"
        :auto-upload="false"
        :limit="1"
        :file-list="fileList"
        :disabled="readingFile || importing"
        :on-change="selectFile"
        :on-remove="removeFile"
        :on-exceed="fileExceeded">
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击选择</em>
        </div>
        <div slot="tip" class="el-upload__tip">支持 .xls、.xlsx，最大 20 MB。请保留原始表头。</div>
      </el-upload>
      <div v-loading="readingFile" class="import-preview">
        <template v-if="importPreview.length">
          <p>已识别 {{ importCount }} 条明细，以下预览前 5 条（汇总行不计入预览）：</p>
          <el-table :data="importPreview" size="mini" border>
            <el-table-column prop="plateNumber" label="车牌号" min-width="110" />
            <el-table-column prop="entryTime" label="进入时间" min-width="160" />
            <el-table-column prop="exitTime" label="离开时间" min-width="160" />
          </el-table>
        </template>
        <p v-if="importResult" class="import-result">{{ importResult }}</p>
      </div>
      <div slot="footer">
        <el-button :disabled="importing" @click="closeImport()">关闭</el-button>
        <el-button type="primary" :loading="importing" :disabled="!selectedFile || readingFile" @click="uploadRecords">上传导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import BarrierDataView from './BarrierDataView.vue'
import BarrierAnalysis from './BarrierAnalysis.vue'
import { fetchAll, parkingRequest } from './api'
import { clean, dateLabel, normalizeRecord, filterRecords, summarizeRecords } from './data'
const blankFilters = () => ({ dateRange: [], plateNumber: '', companyName: '', registration: '' })
export default {
  name: 'BarrierGate',
  components: { BarrierDataView, BarrierAnalysis },
  data() {
    return {
      activeView: 'data',
      query: blankFilters(),
      filters: blankFilters(),
      records: [],
      vehicles: [],
      loading: false,
      loadError: '',
      requestId: 0,
      importVisible: false,
      readingFile: false,
      importing: false,
      selectedFile: null,
      fileList: [],
      importPreview: [],
      importCount: 0,
      importResult: '',
      fileVersion: 0
    }
  },
  computed: {
    companyNames() {
      return [...new Set(this.vehicles.map((v) => clean(v.companyName)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
    },
    filteredRows() {
      return Object.freeze(filterRecords(this.records, this.vehicles, this.filters).sort((a, b) => (b.entryMs || b.exitMs || 0) - (a.entryMs || a.exitMs || 0)))
    },
    stats() {
      return Object.freeze(summarizeRecords(this.filteredRows, this.filters.dateRange || []))
    }
  },
  mounted() {
    this.loadData()
  },
  activated() {
    if (this.hasLoaded) this.loadData()
  },
  beforeDestroy() {
    this.requestId++
    this.fileVersion++
  },
  methods: {
    errorText(error, fallback) {
      return (error && (error.message || error.msg || (error.head && error.head.message))) || fallback
    },
    search() {
      this.filters = { ...this.query, dateRange: (this.query.dateRange || []).slice() }
    },
    resetFilters() {
      this.query = blankFilters()
      this.search()
    },
    async loadData() {
      const id = ++this.requestId
      this.loading = true
      this.loadError = ''
      try {
        const [records, vehicles] = await Promise.all([fetchAll('/parking/access-record/list', () => id === this.requestId), fetchAll('/parking/vehicleInfo/list', () => id === this.requestId)])
        if (id !== this.requestId) return
        this.records = Object.freeze(records.map(normalizeRecord))
        this.vehicles = Object.freeze(vehicles)
        this.hasLoaded = true
      } catch (error) {
        if (id === this.requestId) {
          this.records = []
          this.vehicles = []
          this.loadError = this.errorText(error, '道闸数据加载失败，请重试')
        }
      } finally {
        if (id === this.requestId) this.loading = false
      }
    },
    async selectFile(file, files) {
      const version = ++this.fileVersion
      this.selectedFile = null
      this.importPreview = []
      this.importResult = ''
      this.fileList = files.slice(-1)
      this.readingFile = true
      try {
        if (!/\.(xlsx|xls)$/i.test(file.name)) throw new Error('请选择 .xls 或 .xlsx 文件')
        if (!file.size || file.size > 20 * 1024 * 1024) throw new Error('请选择非空且不超过 20 MB 的 Excel 文件')
        const XLSX = await import('xlsx')
        const workbook = XLSX.read(await file.raw.arrayBuffer(), { type: 'array', cellDates: true })
        if (version !== this.fileVersion) return
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        if (!sheet) throw new Error('Excel 中没有工作表')
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
        const headers = (rows[0] || []).map(clean)
        const required = ['车牌号', '进入时间', '离开时间']
        if (!required.every((name) => headers.includes(name))) throw new Error('首行需包含：车牌号、进入时间、离开时间，请使用原始导出文件')
        const plateIndex = headers.indexOf('车牌号')
        const details = rows.slice(1).filter((row) => clean(row[plateIndex]) && !/合计|汇总|总计/.test(clean(row[plateIndex])))
        if (!details.length) throw new Error('文件中没有车辆出入明细')
        this.importCount = details.length
        this.importPreview = details
          .slice(0, 5)
          .map((row) => ({ plateNumber: row[plateIndex], entryTime: dateLabel(row[headers.indexOf('进入时间')]), exitTime: dateLabel(row[headers.indexOf('离开时间')]) }))
        this.selectedFile = file.raw
      } catch (error) {
        if (version === this.fileVersion) {
          this.fileList = []
          this.$message.error(this.errorText(error, 'Excel 读取失败'))
        }
      } finally {
        if (version === this.fileVersion) this.readingFile = false
      }
    },
    removeFile() {
      this.fileVersion++
      this.selectedFile = null
      this.fileList = []
      this.importPreview = []
      this.importCount = 0
      this.readingFile = false
    },
    fileExceeded() {
      this.$message.warning('请先移除已选文件，再选择新的文件')
    },
    closeImport(done) {
      if (this.importing) return
      this.removeFile()
      this.importResult = ''
      this.importVisible = false
      if (done) done()
    },
    async uploadRecords() {
      if (!this.selectedFile || this.importing) return
      this.importing = true
      try {
        const form = new FormData()
        form.append('file', this.selectedFile)
        const result = await parkingRequest('access-record', 'import', form)
        this.importResult = typeof result === 'string' ? result : (result && (result.message || result.msg)) || '导入成功'
        this.$message.success('出入记录导入成功')
        this.removeFile()
        await this.loadData()
      } catch (error) {
        this.importResult = this.errorText(error, '导入失败，请检查文件后重试')
        this.$message.error(this.importResult)
      } finally {
        this.importing = false
      }
    }
  }
}
</script>
<style scoped>
.barrier-gate {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  background: #f5f7fa;
  color: #27364a;
}
.query-card {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 8px 10px 0;
  padding: 7px 12px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 8px;
}
.query-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}
.date-range {
  width: 250px;
}
.plate-filter {
  width: 140px;
}
.company-filter {
  width: 170px;
}
.registration-filter {
  width: 160px;
}
.view-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.view-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 7px;
  background: #fff;
  border: 1px solid #dce3ed;
  border-radius: 6px;
  cursor: pointer;
}
.view-action img {
  width: 20px;
  height: 20px;
}
.view-action--active {
  background: #ecf5ff;
  border-color: #409eff;
}
.view-action--active img {
  filter: invert(49%) sepia(81%) saturate(1418%) hue-rotate(186deg) brightness(105%) contrast(101%);
}
.view-action:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
.content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px 10px 23px;
}
.el-alert {
  width: auto;
  margin: 8px 10px 0;
}
.import-preview {
  color: #8895a7;
  font-size: 12px;
  line-height: 1.8;
}
.import-result {
  color: #364c78;
  white-space: pre-wrap;
}
@media (max-width: 700px) {
  .view-actions {
    margin-left: auto;
  }
  .date-range {
    max-width: 100%;
  }
}
</style>
