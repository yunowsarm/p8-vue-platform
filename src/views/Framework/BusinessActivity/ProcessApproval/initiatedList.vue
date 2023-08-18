<template>
  <div class="list-content">
    <div class="infinite-list-wrapper"
         style="overflow: auto">
      <common-table ref="table"
                    :columns="columns"
                    :flex="110"
                    :style="{ height: tableHeight}"
                    :table-setting="false"
                    :table-config="tableConfig"
                    :no-api-table-data="historyList"
                    :pagination-info="pageInfo"
                    @row-click="rowClick"
                    @change-page="changePage">
        <template #operation="{ scope }">
          <el-button type="text"
                     @click.stop="rollback(scope.row.processTaskId)">撤回</el-button>
        </template>
      </common-table>
    </div>
  </div>
</template>

<script>
import { Button, P8Table as CommonTable } from 'p8-components-ui'
/* eslint-disable vue/require-prop-types */
export default {
  name: 'ClaimList',
  props: ['approvedTaskId', 'refreshFlag'],
  components: {
    CommonTable,
    'el-button': Button
  },
  mounted () {
    this.getPageSize()
    this.load()
  },
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: '50px'
      },
      {
        title: '流程名称',
        dataIndex: 'processName',
        sortable: false,
        align: 'center'
      },
      {
        title: '提交人',
        dataIndex: 'startUser',
        sortable: false,
        align: 'center'
      },
      {
        title: '提交时间',
        dataIndex: 'startTime',
        sortable: false,
        align: 'center',
        width: 150
      },
      {
        title: '审批时间',
        dataIndex: 'approvalTime',
        sortable: false,
        align: 'center',
        width: 150
      },
      {
        title: '审批结果',
        dataIndex: 'yesOrNo',
        sortable: false,
        fixed: 'right',
        align: 'center'
      }
    ]
    return {
      tableHeight: document.documentElement.clientHeight * 0.9 - 80 + 'px',
      loading: false,
      currentItemIndex: null,
      historyList: [],
      param: {},
      triggerSelectRecord: null,
      sortNum: 0,
      pageInfo: {
        current: 1,
        size: 15,
        total: 0,
        orders: [{ column: 'aa.start_Time', asc: false }],
        pages: 0
      },
      searchForm: {
        approveStatus: 0
      },
      searchData: [
        {
          type: 'text', // 控件类型
          labelText: '关键字', // 控件显示的文本
          fieldName: 'processName',
          placeholder: '请输入审批流程名称' // 默认控件的空值文本
        },
        {
          type: 'text', // 控件类型
          labelText: '申请人', // 控件显示的文本
          placeholder: '请输入申请人姓名',
          fieldName: 'approveUser'
        },
        {
          type: 'datetime', // 控件类型
          labelText: '开始时间', // 控件显示的文本
          placeholder: '请选择查询开始时间',
          fieldName: 'startTime',
          fieldConfig: {
            size: 'small'
          }
        },
        {
          type: 'datetime', // 控件类型
          labelText: '结束时间', // 控件显示的文本
          placeholder: '请选择查询结束时间',
          fieldName: 'endTime',
          fieldConfig: {
            size: 'small'
          }
        }
      ],

      columns,
      tableApi: 'PersonalProcessApproval.approvalHistoryList',
      tableConfig: {
        'highlight-current-row': true
      }
    }
  },
  computed: {
    noMore () {
      let { current, pages } = this.pageInfo
      return current === 0 ? false : current >= pages
    },
    disabled () {
      return this.loading || this.noMore
    },
    itemSelected () {
      return function (index) {
        return this.currentItemIndex === index ? 'item-selected' : ''
      }
    }
  },
  watch: {
    approvedTaskId: function (newV, oldV) {
      if (newV) {
        if (this.historyList.length !== this.historyList.filter((task) => task.processTaskId !== newV).length) {
          this.historyList = this.historyList.filter((task) => task.processTaskId !== newV)
          this.pageInfo.total--
        }

        this.triggerSelectRecord = null
      }
    },
    historyList: function (newV, oldV) {
      if (this.historyList.length > 0) {
        this.triggerSelect(this.triggerSelectRecord ? this.triggerSelectRecord : this.historyList[0], this.currentItemIndex == null ? 0 : this.currentItemIndex)
      } else {
        this.triggerSelect()
      }
    },
    refreshFlag (val) {
      this.refreshList(val)
    }
  },
  methods: {
    getPageSize () {
      const rowH = 40
      const headerH = 91
      const tableBodyH = this.$refs.table.$refs.table.$el.offsetHeight - headerH
      this.pageInfo.size = Math.floor(tableBodyH / rowH)
    },
    rowClick (row, column, e) {
      this.$emit('itemClick', row)
    },
    changePage (current) {
      this.pageInfo.current = current
      this.load(this.param)
    },
    search (queryParam) {
      this.load(queryParam)
    },
    reSet () { },
    load (queryParam) {
      this.loading = true
      let that = this
      this.historyList = []
      let page = { ...this.pageInfo }
      queryParam = { ...queryParam, page }
      this.param = queryParam
      this.$api['PersonalProcessApproval.approvalHistoryList'](queryParam).then((res) => {
        let { records, pages } = res
        that.historyList.push(...records)
        that.pageInfo.pages = pages
        that.pageInfo.current = page.current
        that.pageInfo.total = res.total
        this.loading = false
      })
    },

    triggerSelect (record, index) {
      this.currentItemIndex = index
      this.triggerSelectRecord = record
      this.$emit('itemClick', record)
    },
    refreshList (flag) {
      this.sortFn(flag)
      this.historyList = []
      this.pageInfo.current = 1
      this.load(this.param)
    },
    sortFn (flag) {
      if (flag === undefined) {
        this.sortFn(this.sortNum)
      } else if (flag === 0) {
        this.sortNum = flag
        this.pageInfo.orders = [{ column: 'aa.start_Time', asc: false }]
      } else if (flag === 1) {
        this.sortNum = flag
        this.pageInfo.orders = [{ column: 'aa.start_Time', asc: true }]
      }
    },
    rollback (processTaskId) {
      let that = this
      that
        .$confirm('确定要回退该任务吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          that.$api['PersonalProcessApproval.cancelAndStartTask']({ taskId: processTaskId }).then((res) => {
            let msg = ''
            let type = 'success'
            if (res && res.result === true) {
              msg = '操作成功！'
            } else {
              msg = res.errorMsg
              type = 'warning '
            }
            that.$message({
              message: msg,
              type: type
            })
          })
        })
        .catch(() => { })
    }
  }
}
</script>

<style lang="scss" scoped>
.list-content {
  height: 100%;
  width: 100%;
  padding: 6px 0px;
  box-sizing: border-box;
}
.row-search-refresh.el-row {
  padding: 10px;
  .col-refresh.el-col {
    text-align: right;
  }
}
.infinite-list-wrapper {
  width: 100%;
  height: 100%;
  text-align: center;
}
.infinite-list {
  padding: 0;
  margin: 0;
  list-style: none;
}
.infinite-list .infinite-list-item {
  padding: 5px 12px 5px 5px !important;
  margin-bottom: 8px;
  cursor: pointer;
  height: 50px;
  border-bottom: 1px solid #f0f0f0;
}
.infinite-list .infinite-list-item:hover {
  background-color: #edf6ff;
}

.infinite-list .infinite-list-item.item-selected {
  background-color: #f5f7fa;
}

.infinite-list .infinite-list-item i {
  font-size: 12px;
  margin-right: 2px;
}
</style>
