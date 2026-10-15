<template>
  <div class="maintenance-list">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model.trim="reminderKeyword" size="small" clearable prefix-icon="el-icon-search" placeholder="设备编号 / 设备名称 / 类型 / 位置 / 责任人 / 计划" style="width: 300px"></el-input>
      </div>
      <el-button size="small" @click="openReminderRuleDialog">提醒规则</el-button>
    </div>
    <div class="maintenance-table-area">
      <el-table ref="table" :data="pagedRows" size="small" stripe height="100%">
        <el-table-column label="紧急程度" width="100">
          <template slot-scope="scope">
            <span :class="['urgency-mark', scope.row.overdueDays > 0 ? 'danger' : scope.row.overdueDays === 0 ? 'today' : 'warning']">
              <i></i>
              {{ scope.row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceId" label="设备编号" width="118"></el-table-column>
        <el-table-column prop="device" label="设备名称" min-width="180"></el-table-column>
        <el-table-column prop="category" label="设备类型" width="120"></el-table-column>
        <el-table-column prop="location" label="安装位置" min-width="220"></el-table-column>
        <el-table-column prop="dueDate" label="到期日期" width="105"></el-table-column>
        <el-table-column prop="owner" label="责任人" width="85"></el-table-column>
        <el-table-column prop="plan" label="关联计划" min-width="190"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="$emit('view-plan', scope.row)">查看计划</el-button>
          </template>
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
    <el-dialog append-to-body title="到期提醒规则" :visible.sync="ruleDialog" width="560px" custom-class="maintenance-dialog fire-maintenance-dialog">
      <el-form :model="reminderRule" label-width="115px" size="small">
        <el-form-item label="默认提前提醒">
          <el-input-number v-model="reminderRule.advanceDays" :min="1" :max="30"></el-input-number>
          <span class="form-unit">天</span>
        </el-form-item>
        <el-form-item label="提醒对象">
          <el-checkbox-group v-model="reminderRule.receivers">
            <el-checkbox label="设备责任人"></el-checkbox>
            <el-checkbox label="部门负责人"></el-checkbox>
            <el-checkbox label="消防管理员"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="提醒方式">
          <el-checkbox-group v-model="reminderRule.channels">
            <el-checkbox label="系统消息"></el-checkbox>
            <el-checkbox label="移动端"></el-checkbox>
            <el-checkbox label="短信"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="逾期升级">
          <el-switch v-model="reminderRule.escalate"></el-switch>
          <span class="form-help inline">逾期超过3天升级至园区工程负责人</span>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="ruleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveReminderRule">保存规则</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ReminderList',
  props: {
    pageSize: { type: Number, required: true },
    active: Boolean,
    reminders: { type: Array, required: true },
    initialRule: { type: Object, required: true }
  },
  data() {
    return {
      page: 1,
      reminderKeyword: '',
      ruleDialog: false,
      reminderRule: { advanceDays: 7, receivers: [], channels: [], escalate: true }
    }
  },
  computed: {
    filteredRows() {
      const keyword = this.reminderKeyword.toLowerCase()
      if (!keyword) return this.reminders
      return this.reminders.filter((item) => [item.deviceId, item.device, item.category, item.location, item.owner, item.plan, item.status, item.dueDate].join(' ').toLowerCase().includes(keyword))
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
    reminderKeyword() {
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
    openReminderRuleDialog() {
      this.reminderRule = JSON.parse(JSON.stringify(this.initialRule))
      this.ruleDialog = true
    },
    saveReminderRule() {
      this.$emit('save-rule', JSON.parse(JSON.stringify(this.reminderRule)))
      this.ruleDialog = false
    }
  }
}
</script>
