<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="keyword" size="small" clearable prefix-icon="el-icon-search" placeholder="设备编号 / 名称 / 类型 / 位置 / 负责人 / 计划" style="width: 340px" />
        <el-select v-model="urgency" clearable size="small" placeholder="紧急程度" style="width: 130px">
          <el-option v-for="item in ['已逾期', '今日到期', '即将到期']" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%">
        <el-table-column label="紧急程度" width="115">
          <template slot-scope="scope">
            <span :class="['urgency-mark', scope.row.overdueDays > 0 ? 'danger' : scope.row.overdueDays === 0 ? 'today' : 'warning']">
              <i></i>
              {{ scope.row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编号" width="135" show-overflow-tooltip />
        <el-table-column prop="device" label="设备名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="设备类型" width="130" show-overflow-tooltip />
        <el-table-column prop="location" label="安装位置" min-width="200" show-overflow-tooltip />
        <el-table-column prop="dueDate" label="下次维保时间" width="145" />
        <el-table-column prop="owner" label="计划负责人" width="110" />
        <el-table-column prop="plan" label="关联计划" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" class-name="maintenance-actions-column" width="95" fixed="right">
          <template slot-scope="scope"><el-button type="text" size="mini" @click="$emit('view-plan', scope.row.planId)">查看计划</el-button></template>
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
  </div>
</template>
<script>
export default {
  name: 'ReminderList',
  props: { pageSize: { type: Number, required: true }, active: Boolean, reminders: { type: Array, required: true } },
  data() {
    return { page: 1, keyword: '', urgency: '' }
  },
  computed: {
    filteredRows() {
      const keyword = this.keyword.toLowerCase()
      return this.reminders.filter(
        (item) =>
          (!keyword || [item.deviceCode, item.device, item.category, item.location, item.owner, item.plan].join(' ').toLowerCase().includes(keyword)) &&
          (!this.urgency || item.urgency === this.urgency)
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
    urgency() {
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
    }
  }
}
</script>
