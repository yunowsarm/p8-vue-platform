<template>
  <div class="report-form">
    <div class="report-title">
      <h2>{{ config.title }}</h2>
      <p>{{ config.subtitle }}</p>
    </div>

    <div class="report-header">
      <div class="header-item">
        <span class="label">填报人</span>
        <el-input v-model="localHeader.reporter" size="small" />
      </div>
      <div class="header-item">
        <span class="label">部门</span>
        <el-input v-model="localHeader.department" size="small" />
      </div>
      <div class="header-item">
        <span class="label">岗位</span>
        <el-input v-model="localHeader.position" size="small" />
      </div>
      <div class="header-item">
        <span class="label">公司</span>
        <el-input v-model="localHeader.company" size="small" />
      </div>
      <div class="header-item">
        <span class="label">填报时间</span>
        <el-date-picker
          v-model="localHeader.reportTime"
          type="date"
          size="small"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />
      </div>
    </div>

    <!-- 本期计划 -->
    <div class="report-section">
      <div class="section-bar">
        <span>{{ config.currentSectionTitle }}</span>
        <div class="section-actions">
          <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addCurrentRow" />
          <el-button type="danger" icon="el-icon-minus" circle size="mini" @click="removeSelected(currentPlanList, 'current')" />
        </div>
      </div>
      <div class="table-scroll">
        <table class="report-table">
          <thead>
            <tr>
              <th class="col-check"><el-checkbox v-model="currentAllSelected" @change="toggleAll(currentPlanList, currentAllSelected)" /></th>
              <th class="col-no">序号</th>
              <th class="col-content">{{ config.currentPlanLabel }}</th>
              <th class="col-select">工作分类性质</th>
              <th class="col-short">计划完成量<br>0-100%</th>
              <th class="col-select">完成结果性质</th>
              <th class="col-desc">完成结果说明</th>
              <th class="col-date">完成日期</th>
              <th class="col-short">实际完成量<br>0-100%</th>
              <th class="col-select">完成性质</th>
              <th class="col-desc">完成性质说明</th>
              <template v-if="config.type === 'monthly'">
                <th class="col-select">依据支撑</th>
                <th class="col-select">实际完成状态</th>
                <th class="col-date">实际完成日期</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in currentPlanList" :key="row._id">
              <td class="col-check"><el-checkbox v-model="row.selected" /></td>
              <td class="col-no">{{ idx + 1 }}</td>
              <td><el-input v-model="row.content" type="textarea" :rows="3" resize="vertical" placeholder="请输入" /></td>
              <td>
                <el-select v-model="row.workType" placeholder="请选择" size="small" clearable>
                  <el-option v-for="item in workTypeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </td>
              <td><el-input v-model="row.planPercent" size="small" placeholder="0-100" /></td>
              <td>
                <el-select v-model="row.resultType" placeholder="请选择" size="small" clearable>
                  <el-option v-for="item in resultTypeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </td>
              <td><el-input v-model="row.resultDesc" type="textarea" :rows="3" resize="vertical" placeholder="请输入" /></td>
              <td>
                <el-date-picker v-model="row.completeDate" type="date" size="small" value-format="yyyy-MM-dd" placeholder="选择日期" />
              </td>
              <td><el-input v-model="row.actualPercent" size="small" placeholder="0-100" /></td>
              <td>
                <el-select v-model="row.completeType" placeholder="请选择" size="small" clearable>
                  <el-option v-for="item in completeTypeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </td>
              <td><el-input v-model="row.completeTypeDesc" type="textarea" :rows="3" resize="vertical" placeholder="请输入" /></td>
              <template v-if="config.type === 'monthly'">
                <td>
                  <el-select v-model="row.basis" placeholder="请选择" size="small" clearable>
                    <el-option v-for="item in basisOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </td>
                <td>
                  <el-select v-model="row.actualStatus" placeholder="请选择" size="small" clearable>
                    <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </td>
                <td>
                  <el-date-picker v-model="row.actualDate" type="date" size="small" value-format="yyyy-MM-dd" placeholder="选择日期" />
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 本周工作说明（仅周报） -->
    <div v-if="config.showWorkDesc" class="report-section">
      <div class="section-bar">
        <span>{{ config.workDescSectionTitle }}</span>
        <div class="section-actions">
          <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addWorkDescRow" />
          <el-button type="danger" icon="el-icon-minus" circle size="mini" @click="removeSelected(workDescList, 'workDesc')" />
        </div>
      </div>
      <div class="table-scroll">
        <table class="report-table">
          <thead>
            <tr>
              <th class="col-check"><el-checkbox v-model="workDescAllSelected" @change="toggleAll(workDescList, workDescAllSelected)" /></th>
              <th class="col-no">序号</th>
              <th class="col-content-wide">工作内容说明</th>
              <th class="col-attach">附件</th>
              <th class="col-desc">备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in workDescList" :key="row._id">
              <td class="col-check"><el-checkbox v-model="row.selected" /></td>
              <td class="col-no">{{ idx + 1 }}</td>
              <td><el-input v-model="row.description" type="textarea" :rows="4" resize="vertical" placeholder="请输入" /></td>
              <td class="col-attach">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :file-list="row.fileList"
                  :on-change="(file, fileList) => handleFileChange(row, fileList)"
                  :on-remove="(file, fileList) => handleFileChange(row, fileList)"
                >
                  <div class="upload-trigger">
                    <i class="el-icon-picture-outline"></i>
                    <span>最大50M/个</span>
                  </div>
                </el-upload>
              </td>
              <td><el-input v-model="row.remark" type="textarea" :rows="4" resize="vertical" placeholder="请输入" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 下期计划 -->
    <div class="report-section">
      <div class="section-bar">
        <span>{{ config.nextSectionTitle }}</span>
        <div class="section-actions">
          <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addNextRow" />
          <el-button type="danger" icon="el-icon-minus" circle size="mini" @click="removeSelected(nextPlanList, 'next')" />
        </div>
      </div>
      <div class="table-scroll">
        <table class="report-table">
          <thead>
            <tr>
              <th class="col-check"><el-checkbox v-model="nextAllSelected" @change="toggleAll(nextPlanList, nextAllSelected)" /></th>
              <th class="col-no">序号</th>
              <th class="col-content">{{ config.nextPlanLabel }}</th>
              <th class="col-select">工作分类性质</th>
              <th class="col-short">计划完成量<br>0-100%</th>
              <th class="col-select">完成结果性质</th>
              <th class="col-desc">完成结果描述</th>
              <th class="col-date">计划开始日期</th>
              <th class="col-date">计划完成日期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in nextPlanList" :key="row._id">
              <td class="col-check"><el-checkbox v-model="row.selected" /></td>
              <td class="col-no">{{ idx + 1 }}</td>
              <td><el-input v-model="row.content" type="textarea" :rows="3" resize="vertical" placeholder="请输入" /></td>
              <td>
                <el-select v-model="row.workType" placeholder="请选择" size="small" clearable>
                  <el-option v-for="item in workTypeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </td>
              <td><el-input v-model="row.planPercent" size="small" placeholder="0-100" /></td>
              <td>
                <el-select v-model="row.resultType" placeholder="请选择" size="small" clearable>
                  <el-option v-for="item in resultTypeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </td>
              <td><el-input v-model="row.resultDesc" type="textarea" :rows="3" resize="vertical" placeholder="请输入" /></td>
              <td>
                <el-date-picker v-model="row.startDate" type="date" size="small" value-format="yyyy-MM-dd" placeholder="选择日期" />
              </td>
              <td>
                <el-date-picker v-model="row.endDate" type="date" size="small" value-format="yyyy-MM-dd" placeholder="选择日期" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="report-notes">
      <div class="notes-title">备注：</div>
      <ol>
        <li v-for="(note, index) in notes" :key="index">{{ note }}</li>
      </ol>
    </div>
  </div>
</template>

<script>
import {
  workTypeOptions,
  resultTypeOptions,
  completeTypeOptions,
  basisOptions,
  statusOptions,
  createWeeklyCurrentPlanRow,
  createWeeklyWorkDescRow,
  createWeeklyNextPlanRow,
  createMonthlyCurrentPlanRow,
  createMonthlyNextPlanRow
} from './mockData'

export default {
  name: 'ReportForm',
  props: {
    config: { type: Object, required: true },
    headerInfo: { type: Object, required: true },
    currentPlanList: { type: Array, required: true },
    workDescList: { type: Array, default: () => [] },
    nextPlanList: { type: Array, required: true },
    notes: { type: Array, default: () => [] }
  },
  data () {
    return {
      localHeader: { ...this.headerInfo },
      currentAllSelected: false,
      workDescAllSelected: false,
      nextAllSelected: false,
      workTypeOptions,
      resultTypeOptions,
      completeTypeOptions,
      basisOptions,
      statusOptions
    }
  },
  watch: {
    headerInfo: {
      deep: true,
      handler (val) {
        this.localHeader = { ...val }
      }
    },
    localHeader: {
      deep: true,
      handler (val) {
        this.$emit('update:header-info', { ...val })
      }
    }
  },
  methods: {
    toggleAll (list, checked) {
      list.forEach(row => { row.selected = checked })
    },
    removeSelected (list, type) {
      const selected = list.filter(row => row.selected)
      if (!selected.length) {
        this.$message.warning('请先勾选要删除的行')
        return
      }
      const remain = list.filter(row => !row.selected)
      this.reindexAndEmit(remain, type)
      if (type === 'current') this.currentAllSelected = false
      if (type === 'workDesc') this.workDescAllSelected = false
      if (type === 'next') this.nextAllSelected = false
    },
    reindexAndEmit (list, type) {
      list.forEach((row, idx) => { row.index = idx + 1 })
      if (type === 'current') this.$emit('update:current-plan-list', list)
      if (type === 'workDesc') this.$emit('update:work-desc-list', list)
      if (type === 'next') this.$emit('update:next-plan-list', list)
    },
    addCurrentRow () {
      const list = [...this.currentPlanList]
      const creator = this.config.type === 'monthly' ? createMonthlyCurrentPlanRow : createWeeklyCurrentPlanRow
      list.push(creator(list.length + 1))
      this.$emit('update:current-plan-list', list)
    },
    addWorkDescRow () {
      const list = [...this.workDescList]
      list.push(createWeeklyWorkDescRow(list.length + 1))
      this.$emit('update:work-desc-list', list)
    },
    addNextRow () {
      const list = [...this.nextPlanList]
      const creator = this.config.type === 'monthly' ? createMonthlyNextPlanRow : createWeeklyNextPlanRow
      list.push(creator(list.length + 1))
      this.$emit('update:next-plan-list', list)
    },
    handleFileChange (row, fileList) {
      row.fileList = fileList
    }
  }
}
</script>

<style lang="scss" scoped>
.report-form {
  padding: 16px 20px 24px;
  background: #fff;
}

.report-title {
  text-align: center;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 22px;
    color: #1a6fb5;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #909399;
  }
}

.report-header {
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #dcdfe6;
  margin-bottom: 16px;

  .header-item {
    flex: 1;
    min-width: 180px;
    display: flex;
    align-items: center;
    border-right: 1px solid #dcdfe6;

    &:last-child {
      border-right: none;
    }

    .label {
      flex-shrink: 0;
      width: 72px;
      padding: 0 10px;
      font-size: 13px;
      color: #606266;
      background: #f5f7fa;
      line-height: 36px;
      border-right: 1px solid #dcdfe6;
    }

    ::v-deep .el-input,
    ::v-deep .el-date-editor {
      flex: 1;

      .el-input__inner {
        border: none;
        border-radius: 0;
      }
    }
  }
}

.report-section {
  margin-bottom: 16px;
}

.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #e8f4fc;
  border: 1px solid #b3d8f0;
  border-bottom: none;
  font-size: 13px;
  color: #303133;

  .section-actions {
    display: flex;
    gap: 6px;
  }
}

.table-scroll {
  overflow-x: auto;
  border: 1px solid #b3d8f0;
}

.report-table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    border: 1px solid #b3d8f0;
    padding: 6px 8px;
    vertical-align: middle;
    font-size: 12px;
  }

  th {
    background: #4a90c8;
    color: #fff;
    font-weight: 500;
    text-align: center;
    line-height: 1.4;
    white-space: normal;
  }

  td {
    background: #fff;
  }

  .col-check { width: 40px; text-align: center; }
  .col-no { width: 50px; text-align: center; }
  .col-content { width: 180px; }
  .col-content-wide { width: 320px; }
  .col-select { width: 120px; }
  .col-short { width: 90px; }
  .col-desc { width: 140px; }
  .col-date { width: 130px; }
  .col-attach { width: 140px; }

  ::v-deep .el-textarea__inner,
  ::v-deep .el-input__inner {
    font-size: 12px;
  }

  ::v-deep .el-date-editor.el-input {
    width: 100%;
  }

  ::v-deep .el-select {
    width: 100%;
  }
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  color: #909399;
  cursor: pointer;

  i {
    font-size: 28px;
    margin-bottom: 4px;
  }

  span {
    font-size: 11px;
  }
}

.report-notes {
  margin-top: 8px;
  font-size: 12px;
  color: #1a6fb5;
  line-height: 1.8;

  .notes-title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  ol {
    margin: 0;
    padding-left: 20px;
  }
}
</style>
