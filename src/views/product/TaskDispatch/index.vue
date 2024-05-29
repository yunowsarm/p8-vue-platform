<template>
  <div style="height: 100%">
    <list-layout class="userSelect">
      <template #north>
        <div class="search-con">
          <div class="input-con" :style="{ width: 'calc(45% - 31px)' }">
            人员姓名:
            <el-input v-model="realName" :style="{ width: 'calc(100% - 70px)' }" class="input-name" placeholder="请输入人员姓名进行搜索" clearable size="mini" />
          </div>
          <div class="search-btn">
            <el-button icon="search" size="mini" type="primary" @click="search"> 搜索 </el-button>
          </div>
        </div>
      </template>
      <template #center>
        <common-table
          ref="table"
          class="user_table"
          :table-setting="false"
          :columns="columns"
          :params="queryParam"
          :api="tableApi"
          :disabled-check-all="true"
          is-radio-select
          @select="handleTableSelectionChange"
        />
        <div class="dialog_footer">
          <el-button @click="$emit('close')">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </div>
      </template>
    </list-layout>
  </div>
</template>
<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, Input } from 'p8-components-ui'

export default {
  name: 'DialogSelectMember',
  components: {
    ListLayout,
    CommonTable,
    'el-input': Input
  },
  props: {
    row: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const columns = [
      {
        title: '',
        type: 'selection'
      },
      {
        title: '姓名',
        dataIndex: 'realName',
        minWidth: 100,
        align: 'center'
      },
      {
        title: '部门',
        dataIndex: 'deptName',
        minWidth: 100,
        align: 'center'
      }
    ]
    return {
      columns,
      tableApi: 'teamManager.roleUserList',
      realName: '',
      queryParam: {
        deptId: '',
        realName: '',
        roleId: ''
      },
      currentRow: [],
      tableSelectValue: []
    }
  },
  watch: {},
  created() {},
  mounted() {
    this.row.forEach(item => {
      console.log(item.ID)
    })
  },
  beforeDestroy() {},
  methods: {
    search() {
      this.queryParam.realName = this.realName
    },
    handleTableSelectionChange(selection, row) {
      this.currentRow = row
    },
    submit() {
      if (this.currentRow.length == 0) {
        this.$message.warning('请选择责任人！')
        return
      }
      let ids = this.row.map(item => item.ID)
      let params = {
        deptUserId: this.currentRow.id,
        taskIds: ids
      }
      this.$api['taskManager.updateTaskDistribution'](params).then(res => {
        if (res) {
          this.$message.success('派发成功！')
          this.$emit('close')
        }
      })
    }
  }
}
</script>
<style lang="scss" scpoed>
.search-con {
  display: flex;
  justify-content: end;
  padding-left: 15px;
  .date-range-con,
  .input-con {
    float: left;
    height: 30px;
  }
  .input-con {
    margin-left: 10px;
  }
  .search-btn {
    width: 60px;
    height: 30px;
  }
}
.table-con .small-table {
  overflow-y: auto;
}
.user_table {
  height: calc(100% - 50px) !important;
}
.dialog_footer {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.userSelect {
  box-sizing: border-box;
  height: 100%;
  padding: 10px;
  margin: 0;
  .normal-header {
    border-bottom: 1px solid #e1e1e1;
  }
}
</style>

