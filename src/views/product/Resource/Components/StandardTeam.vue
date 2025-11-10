<template>
  <normal-layout v-if="innerWidth > 600"
                 :headerVisible="false">
    <template #west>
      <div class="">
        <div class="standard-team-table-left"
             :class="{'small-table': true}"
             :style="{height: flexHeight }">
          <el-table ref="table"
                    height="100%"
                    :data="tableData"
                    header-row-class-name="headerRowClass"
                    row-class-name="rowClass"
                    highlight-current-row
                    @current-change="handleCurrentChange"
                    row-key="id">
            <el-table-column prop="name"
                             label="标准团队"
                             align="center">
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
    <template #center>
      <div class="">
        <div :class="{'small-table': true}"
             :style="{height: flexHeight }">
          <el-table ref="table1"
                    height="100%"
                    :data="tableData1"
                    header-row-class-name="headerRowClass"
                    row-class-name="rowClass"
                    default-expand-all
                    :tree-props="{children: 'roles', hasChildren: 'hasChildren'}"
                    row-key="id">
            <el-table-column prop="name"
                             label="角色名称"
                             header-align="center">
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
  </normal-layout>
  <div v-else
       class="noraml-box">
    <div class="standard-team-table-left"
         :class="{'small-table': true}"
         :style="{height: flexHeight, width: '40%' }">
      <el-table ref="table"
                height="100%"
                :data="tableData"
                header-row-class-name="headerRowClass"
                row-class-name="rowClass"
                highlight-current-row
                @current-change="handleCurrentChange"
                row-key="id">
        <el-table-column prop="name"
                         label="标准团队"
                         align="center">
        </el-table-column>
      </el-table>
    </div>
    <div style="border: 1px #cccccc solid;"></div>
    <div :class="{'small-table': true}"
         :style="{height: flexHeight, width: '60%' }">
      <el-table ref="table1"
                height="100%"
                :data="tableData1"
                header-row-class-name="headerRowClass"
                row-class-name="rowClass"
                default-expand-all
                :tree-props="{children: 'roles', hasChildren: 'hasChildren'}"
                row-key="id">
        <el-table-column prop="name"
                         label="角色名称"
                         header-align="center">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { P8NormalLayout as NormalLayout } from 'p8-components-ui'
// import { P8Table as CommonTable } from 'p8-components-ui'
import { Table, TableColumn } from 'p8-components-ui'
export default {
  name: 'StandardTeam',
  props: {
    tableRefresh: {// 调用列表接口后的回调方法
      type: Function,
      default: function () { }
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const columns = [
      {
        title: '标准团队',
        dataIndex: 'name'
      }
    ]
    const columns1 = [
      {
        title: '角色名称',
        dataIndex: 'name'
      }
    ]
    return {
      flexHeight: '350px',
      columns,
      columns1,
      queryParam: {},
      tableData: [],
      tableData1: [],
      tableParentApi: 'teamManager.list', // projectTeam.getAllKTeams
      tableChildApi: 'knowledgeManagement.roleClassifyList',
      currentRow: ''
    }
  },
  mounted () {
    this.getAllTeams()
  },
  watch: {
    fullscreen: {
      handler (val) {
        const ch = document.documentElement.clientHeight
        if (val) {
          this.flexHeight = ch - 144 + 'px'
        } else {
          this.flexHeight = ch * 0.6 - 94 + 'px'
        }
      },
      immediate: true
    }
  },
  methods: {
    getAllTeams () {
      let _this = this
      this.$api[this.tableParentApi]({
        name: '',
        shortName: '',
        describes: ''
      }).then(function (res) {
        _this.tableData = res
        _this.$refs.table.setCurrentRow(res[0])
        _this.currentRow = res[0]
        _this.getRoleList(res[0].id)
      })
    },
    getRoleList (kTeamId) {
      let _this = this
      _this.tableData1 = []
      _this.tableRefresh(new Promise((resolve, reject) => {
        _this.$api[this.tableChildApi]({ klTeamsId: kTeamId }).then(function (res) {
          _this.tableData1 = res
          resolve({ kTeamId: kTeamId, data: res })
        }).catch(err => {
          reject(err)
        })
      }))
    },
    handleCurrentChange (row) {
      if (row.id === this.currentRow) {
        return false
      }
      this.currentRow = row
      this.getRoleList(row.id)
    }
  },
  components: {
    NormalLayout,
    // CommonTable,
    'el-table': Table,
    'el-table-column': TableColumn
  }
}
</script>
<style lang="scss" scoped>
.headerRowClass {
  color: #333;
  font-size: 14px;
}
.rowClass td {
  border-bottom: none;
  padding-left: 10px;
}

.standard-team-table-left {
  .el-table__body tr.current-row > td {
    background-color: transparent;
    color: $base-light-color;
    font-weight: bolder;
  }
  .el-table__body tr:hover td {
    background-color: transparent !important;
    color: $base-light-color;
  }
}
.noraml-box {
  display: flex !important;
  flex-direction: row;
  width: 100% !important;
  overflow: auto;
}
</style>
