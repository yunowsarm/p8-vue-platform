<template>
  <div class="reimburse-details-page">
    <!-- 搜索入口栏 -->
    <div class="search-bar">
      <el-button type="primary" size="small" @click="handleExport">导出</el-button>
      <div class="search-input-box" @click="toggleSearchPanel">
        <i class="el-icon-search search-icon" />
        <span :class="['search-placeholder', { 'has-value': searchSummary }]">{{ searchSummary || '请输入关键字或点击展开筛选条件' }}</span>
        <i :class="['el-icon-arrow-down', 'search-arrow', { rotated: searchExpanded }]" />
      </div>
    </div>

    <!-- 搜索条件浮层卡片 -->
    <div v-show="searchExpanded" class="search-overlay" @click.self="searchExpanded = false">
      <div class="search-card">
        <div class="search-card-header">
          <span class="search-card-title">搜索条件</span>
          <i class="el-icon-close" @click="searchExpanded = false" />
        </div>
        <div class="search-card-body">
          <el-form
            :model="searchForm"
            ref="searchForm"
            size="small"
            label-position="right"
            label-width="80px"
            inline
            class="reimburse-details-search underline-form"
          >
            <el-form-item label="项目" prop="projectId">
              <el-select
                v-model="searchForm.projectId"
                placeholder="请选择项目"
                multiple
                collapse-tags
                clearable
                filterable
                style="width: 240px"
                @visible-change="onProjectSelectVisible"
              >
                <el-option v-for="item in projectOptions" :key="item.id" :label="item.cmeaning" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="费用分类" prop="classification">
              <el-select
                ref="categorySelect"
                v-model="searchForm.classification"
                placeholder="请选择费用分类"
                multiple
                collapse-tags
                clearable
                style="width: 240px"
                popper-class="tree-select-popper"
                @remove-tag="handleCategoryRemoveTag"
                @visible-change="handleCategorySelectVisible"
              >
                <el-option
                  v-for="item in selectedCategoryNodes"
                  :key="item.id"
                  :value="item.id"
                  :label="item.cmeaning"
                  style="display: none"
                />
                <el-option value="" label="" style="height: auto; padding: 0; overflow: auto">
                  <el-tree
                    ref="categoryTree"
                    :data="categoryOptions"
                    :props="categoryTreeProps"
                    node-key="id"
                    show-checkbox
                    default-expand-all
                    :expand-on-click-node="false"
                    @check="handleCategoryTreeCheck"
                  />
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="部门" prop="dept">
              <el-select
                ref="deptSelect"
                v-model="searchForm.dept"
                placeholder="请选择部门"
                multiple
                collapse-tags
                clearable
                style="width: 240px"
                popper-class="tree-select-popper"
                @remove-tag="handleDeptRemoveTag"
                @visible-change="handleDeptSelectVisible"
              >
                <el-option
                  v-for="item in selectedDeptNodes"
                  :key="item.ID"
                  :value="item.ID"
                  :label="item.NAME"
                  style="display: none"
                />
                <el-option value="" label="" style="height: auto; padding: 0; overflow: auto">
                  <el-tree
                    ref="deptTree"
                    :data="deptOptions"
                    :props="deptTreeProps"
                    node-key="ID"
                    show-checkbox
                    default-expand-all
                    :expand-on-click-node="false"
                    @check="handleDeptTreeCheck"
                  />
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="提交日期" prop="dateRange">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                clearable
                :picker-options="datePickerOptions"
                style="width: 240px"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="search-card-footer">
          <el-button size="small" @click="handleReset">重置</el-button>
          <el-button type="primary" size="small" icon="el-icon-search" @click="handleSearch">查询</el-button>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-panel">
      <el-table
        ref="detailTable"
        v-loading="loading"
        :data="tableData"
        border
        stripe
        height="100%"
        :row-style="{ height: '50px' }"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <!-- <el-table-column type="index" label="序号" width="60" align="center" fixed="left" /> -->
        <el-table-column prop="submitDate" label="提交日期" min-width="120" align="center">
          <template slot-scope="scope">{{ scope.row.submitDate ? scope.row.submitDate.split(' ')[0] : '-' }}</template>
        </el-table-column>
        <el-table-column prop="occurrenceDate" label="费用发生日期" min-width="120" align="center">
          <template slot-scope="scope">{{ scope.row.occurrenceDate ? scope.row.occurrenceDate.split(' ')[0] : '-' }}</template>
        </el-table-column>
        <el-table-column prop="handler" label="经办人" min-width="100" align="center" />
        <el-table-column prop="department" label="费用归属部门" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="expenseName" label="费用名称" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="quantity" label="数量" min-width="80" align="right" />
        <el-table-column prop="unit" label="单位" min-width="80" align="center" />
        <el-table-column prop="price" label="单价" min-width="100" align="right" />
        <el-table-column prop="subtotal" label="小计" min-width="100" align="right" />
        <el-table-column prop="category" label="费用分类" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="project" label="项目" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="isExternal" label="是否对外" min-width="100" align="center">
          <!-- <template slot-scope="scope">{{ scope.row.IS_EXTERNAL === '1' ? '是' : '否' }}</template> -->
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" align="center" show-overflow-tooltip />
        <!-- <el-table-column prop="reimbursementNo" label="所属报销单序号" min-width="140" align="center" /> -->
        <el-table-column prop="expenseDescription" label="费用说明" min-width="160" align="center" show-overflow-tooltip />
        <el-table-column prop="invoiceTitle" label="发票抬头" min-width="160" align="center" show-overflow-tooltip />
        <el-table-column prop="expenseStatus" label="费用状态" min-width="100" align="center" fixed="right"></el-table-column>
      </el-table>
      <div class="pagination-panel">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.current"
          :page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReimburseDetails',
  data () {
    return {
      loading: false,
      searchExpanded: false,
      projectLoaded: false,
      searchForm: {
        projectId: [],       // 项目id，多选
        classification: [],  // 费用分类id，多选
        dept: [],            // 部门id，多选
        dateRange: []        // 费用发生时间范围 [beginDate, endDate]
      },
      projectOptions: [],
      categoryOptions: [],
      categoryTreeProps: {
        children: 'children',
        label: 'cmeaning'
      },
      selectedCategoryNodes: [],
      deptOptions: [],
      deptTreeProps: {
        children: 'children',
        label: 'NAME'
      },
      selectedDeptNodes: [],
      tableData: [],
      pagination: {
        current: 1,
        size: 10,
        total: 0
      }
    }
  },
  computed: {
    searchSummary () {
      const parts = []
      if (this.searchForm.projectId && this.searchForm.projectId.length) {
        const labels = this.searchForm.projectId.map(v => this.getLabelByValue(v, this.projectOptions))
        parts.push(`项目：${labels.join('、')}`)
      }
      // 直接用已选节点的名称，避免树递归查找漏掉后面的分类
      if (this.selectedCategoryNodes.length) {
        parts.push(`分类：${this.selectedCategoryNodes.map(n => n.cmeaning).join('、')}`)
      }
      if (this.selectedDeptNodes.length) {
        parts.push(`部门：${this.selectedDeptNodes.map(n => n.NAME).join('、')}`)
      }
      if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
        parts.push(`${this.searchForm.dateRange[0]} ~ ${this.searchForm.dateRange[1]}`)
      }
      return parts.join(' / ')
    },
    datePickerOptions () {
      const today = new Date()
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      return {
        shortcuts: [
          {
            text: '今天',
            onClick (picker) {
              const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一周',
            onClick (picker) {
              const start = new Date(today.getTime() - 7 * 24 * 3600 * 1000)
              start.setHours(0, 0, 0, 0)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一月',
            onClick (picker) {
              const start = new Date(today.getTime() - 30 * 24 * 3600 * 1000)
              start.setHours(0, 0, 0, 0)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三月',
            onClick (picker) {
              const start = new Date(today.getTime() - 90 * 24 * 3600 * 1000)
              start.setHours(0, 0, 0, 0)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  mounted () {
    this.loadDictionary()
    this.handleSearch()
  },
  methods: {
    loadDictionary () {
      // 加载费用分类
      const fyparams = {
        id: "900915dd9a1596ad4a91d8504c6db3d2"
      }
      this.$api['carRequest.platSelectApi'](fyparams).then(res => {
        this.categoryOptions = this.buildTree(res.data)
      })
      // 加载部门
      const deptParams = {
        id: 'a97e9d7d81c8a29fa3d1296d97794b4f'
      }
      this.$api['carRequest.platSelectApi'](deptParams).then(res => {
        this.deptOptions = this.buildDeptTree(res.data)
        console.log('部门树形数据', this.deptOptions)
      })
    },
    buildTree(data) {
        // 1. 创建一个映射，方便通过 id 快速查找节点
        const nodeMap = {};
        data.forEach(item => {
            nodeMap[item.id] = {
                ...item,
                children: [] // 初始化 children 数组
            };
        });
        const tree = [];
        data.forEach(item => {
            const node = nodeMap[item.id];
            if (item.cparentid && nodeMap[item.cparentid]) {
                // 如果有父节点，将当前节点添加到父节点的 children 中
                nodeMap[item.cparentid].children.push(node);
            } else {
                // 否则为根节点
                tree.push(node);
            }
        });

        return tree;
    },
    buildDeptTree(data) {
      // 先找出所有根节点（PATER_DEPARTMENT_ID 为 null 的节点）
      const roots = data.filter(item => item.PATER_DEPARTMENT_ID === null)

      // 找出所有子节点（PATER_DEPARTMENT_ID 不为 null 的节点）
      const children = data.filter(item => item.PATER_DEPARTMENT_ID !== null)

      // 构建映射表，方便查找
      const map = {}
      data.forEach(item => {
        map[item.ID] = { ...item, children: [] }
      })

      // 构建树
      const tree = []
      roots.forEach(root => {
        const node = map[root.ID]
        if (node) {
          // 递归查找子节点
          node.children = this.getDeptChildren(node.ID, children, map)
          tree.push(node)
        }
      })
      return tree
    },
    getDeptChildren(parentId, children, map) {
      const result = []
      children.forEach(child => {
        if (child.PATER_DEPARTMENT_ID === parentId) {
          const node = map[child.ID]
          if (node) {
            // 递归查找孙节点
            node.children = this.getDeptChildren(child.ID, children, map)
            result.push(node)
          }
        }
      })
      // 按 INDEX_NO 排序
      result.sort((a, b) => a.INDEX_NO - b.INDEX_NO)
      return result
    },
    onProjectSelectVisible (visible) {
      if (visible && !this.projectLoaded) {
        this.loadProjectOptions()
      }
    },
    loadProjectOptions () {
      const params = {
        id: 'ddafa31f1948ef419e014cd0e134a89c'
      }
      this.$api['carRequest.platSelectApi'](params).then(res => {
        this.projectOptions = res.data || []
        this.projectLoaded = true
      }).catch(() => {
        this.$message.error('加载项目列表失败')
      })
    },
    // ===== 费用分类树形选择 =====
    handleCategoryTreeCheck (checkedNode, checkedState) {
      // 只取叶子节点（没有 children 的节点）
      const leafNodes = (checkedState.checkedNodes || []).filter(
        node => !node.children || !node.children.length
      )
      this.selectedCategoryNodes = leafNodes
      this.searchForm.classification = leafNodes.map(node => node.id)
    },
    handleCategoryRemoveTag (removedId) {
      this.selectedCategoryNodes = this.selectedCategoryNodes.filter(
        item => item.id !== removedId
      )
      this.searchForm.classification = this.selectedCategoryNodes.map(item => item.id)
      // 同步 tree 的选中状态
      const tree = this.$refs.categoryTree
      if (tree) {
        tree.setCheckedKeys(this.searchForm.classification)
      }
    },
    handleCategorySelectVisible (visible) {
      if (!visible) return
      this.$nextTick(() => {
        const tree = this.$refs.categoryTree
        if (tree) {
          tree.setCheckedKeys(this.searchForm.classification || [])
        }
      })
    },
    // ===== 部门树形选择 =====
    // 下拉框/树用 ID 绑定；查询参数在 buildSearchParams 里转成 NAME
    handleDeptTreeCheck (checkedNode, checkedState) {
      // 只取叶子节点（没有 children 的节点）
      const leafNodes = (checkedState.checkedNodes || []).filter(
        node => !node.children || !node.children.length
      )
      this.selectedDeptNodes = leafNodes
      this.searchForm.dept = leafNodes.map(node => node.ID)
    },
    handleDeptRemoveTag (removedId) {
      this.selectedDeptNodes = this.selectedDeptNodes.filter(
        item => item.ID !== removedId
      )
      this.searchForm.dept = this.selectedDeptNodes.map(item => item.ID)
      // 同步 tree 的选中状态（node-key 是 ID）
      const tree = this.$refs.deptTree
      if (tree) {
        tree.setCheckedKeys(this.searchForm.dept)
      }
    },
    handleDeptSelectVisible (visible) {
      if (!visible) return
      this.$nextTick(() => {
        const tree = this.$refs.deptTree
        if (tree) {
          tree.setCheckedKeys(this.searchForm.dept || [])
        }
      })
    },
    toggleSearchPanel () {
      this.searchExpanded = !this.searchExpanded
    },
    buildSearchParams () {
      const { projectId, classification, dept, dateRange } = this.searchForm
      const params = {}

      // 部门：页面用 ID 绑定，查询只传 NAME
      params.dept = (dept && dept.length)
        ? this.selectedDeptNodes.map(item => item.NAME)
        : []
      // 费用分类id，多选，传数组（没有选择时传空数组）
      params.classification = classification && classification.length ? classification : []
      // 项目id，多选，传数组（没有选择时传空数组）
      params.projectId = projectId && projectId.length ? projectId : []
      // 时间范围（没有选择时传空字符串）
      if (dateRange && dateRange.length === 2) {
        params.beginDate = dateRange[0] + ' 00:00:00'
        params.endDate = dateRange[1] + ' 23:59:59'
      } else {
        params.beginDate = ''
        params.endDate = ''
      }

      return params
    },
    handleSearch () {
      this.searchExpanded = false
      this.loading = true

      const params = {
        ...this.buildSearchParams(),
        page: this.pagination.current,
        size: this.pagination.size
      }

      this.$api['baseData.getReimburseList'](params).then(res => {
        this.tableData = res.records
        this.pagination.total = res.total
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.$message.error('查询报销明细失败')
      })
    },
    handleExport () {
      const params = this.buildSearchParams()
      this.$api['baseData.exportReimburseExcel'](params, { responseType: 'blob' }).then(res => {
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        const date = new Date()
        const fileName = '报销明细_' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        link.download = fileName + '.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      }).catch(() => {
        this.$message.error('导出失败')
      })
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.projectId = []
      this.searchForm.classification = []
      this.searchForm.dept = []
      this.searchForm.dateRange = []
      this.selectedCategoryNodes = []
      this.selectedDeptNodes = []
      this.handleSearch()
    },
    handleSizeChange (val) {
      this.pagination.size = val
      this.pagination.current = 1
      this.handleSearch()
    },
    handleCurrentChange (val) {
      this.pagination.current = val
      console.log('当前页码', val)
      this.handleSearch()
    },
    getLabelByValue (value, options) {
      const item = options.find(opt => opt.id === value || opt.value === value)
      return item ? (item.cmeaning || item.label || value) : value
    },
    getCategoryNodeLabel (id, nodes) {
      for (const node of nodes) {
        if (node.id === id) return node.cmeaning
        if (node.children && node.children.length) {
          const found = this.getCategoryNodeLabel(id, node.children)
          // 未找到时子调用返回 null，不能当成命中，否则会提前退出导致回显 id
          if (found != null) return found
        }
      }
      return null
    },
    getDeptNodeLabel (id, nodes) {
      for (const node of nodes) {
        if (node.ID === id) return node.NAME
        if (node.children && node.children.length) {
          const found = this.getDeptNodeLabel(id, node.children)
          if (found != null) return found
        }
      }
      return null
    },
    getStatusType (status) {
      switch (status) {
        case '1': return 'success'
        case '2': return 'warning'
        case '3': return 'danger'
        default: return 'info'
      }
    },
    getStatusText (status) {
      switch (status) {
        case '1': return '已通过'
        case '2': return '审批中'
        case '3': return '已驳回'
        default: return '草稿'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.reimburse-details-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: #f5f7fa;
}

// ===== 搜索入口栏 =====
.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  gap: 12px;
  flex-shrink: 0;

  .el-button--primary {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;
    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }
}

.search-input-box {
  width: 420px;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  // background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
  &:hover {
    border-color: #409eff;
  }
}

.search-icon {
  color: #c0c4cc;
  margin-right: 8px;
  font-size: 14px;
}

.search-placeholder {
  flex: 1;
  color: #c0c4cc;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.has-value {
    color: #606266;
  }
}

.search-arrow {
  color: #c0c4cc;
  font-size: 12px;
  transition: transform 0.3s;
  margin-left: 8px;
  &.rotated {
    transform: rotate(180deg);
  }
}

.search-bar-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

// ===== 浮层遮罩 =====
.search-overlay {
  position: absolute;
  top: 57px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.search-card {
  position: absolute;
  top: 0;
  right: 16px;
  width: 420px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  max-height: calc(100% - 20px);
  overflow-y: auto;
}

.search-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #ebeef5;
}

.search-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.el-icon-close {
  font-size: 16px;
  color: #909399;
  cursor: pointer;
  &:hover {
    color: #303133;
  }
}

.search-card-body {
  padding: 20px;
}

// ===== 下划线样式选择框 =====
.underline-form {
  .el-form-item {
    margin-bottom: 18px;
  }

  // select 下划线样式
  ::v-deep .el-select {
    .el-input__inner {
      border: none;
      border-bottom: 1px solid #dcdfe6;
      border-radius: 0;
      padding-left: 0;
      padding-right: 30px;
      background: transparent;
      &:focus,
      &:hover {
        border-bottom-color: #409eff;
      }
    }
    .el-input__suffix {
      right: 0;
    }
    .el-input__suffix-inner {
      color: #c0c4cc;
    }
  }

  // date-picker 下划线样式
  ::v-deep .el-date-editor {
    .el-range-input {
      border: none;
      border-radius: 0;
      background: transparent;
    }
    .el-range-separator {
      color: #c0c4cc;
      line-height: 28px;
    }
    &.el-input__inner {
      border: none;
      border-bottom: 1px solid #dcdfe6;
      border-radius: 0;
      padding-left: 0;
      padding-right: 25px;
      background: transparent;
      &:hover {
        border-bottom-color: #409eff;
      }
    }
    .el-range__close-icon {
      right: 0;
    }
    .el-range__icon {
      margin-left: 0;
    }
  }
}

.search-card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 16px;
}

// ===== 表格区域 =====
.table-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #fff;
  overflow: hidden;
  .el-table {
    flex: 1;
  }
}

.pagination-panel {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 0 0;
}
</style>

<style lang="scss">
.reimburse-details-search {
  .el-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  .el-form-item {
    margin-bottom: 12px;
    margin-right: 20px;
  }
}

// 树形下拉框样式
.tree-select-popper {
  .el-select-dropdown__item {
    height: auto;
    padding: 0;
    &.selected {
      font-weight: normal;
    }
  }
}
</style>
