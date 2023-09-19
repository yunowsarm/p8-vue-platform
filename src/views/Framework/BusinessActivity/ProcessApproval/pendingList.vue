<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div class="list-content">
    <div class="infinite-list-wrapper"
         style="overflow: auto">
      <common-table ref="table"
                    :columns="columns"
                    :flex="110"
                    :style="{ height: tableHeight }"
                    :table-setting="false"
                    :table-config="tableConfig"
                    :no-api-table-data="infiniteList"
                    :pagination-info="pageInfo"
                    @size-change="sizeChange"
                    @selection-change="pendingSelectionChange"
                    @row-click="rowClick"
                    @change-page="changePage"></common-table>
    </div>
  </div>
</template>

<script>
import { P8Table as CommonTable } from 'p8-components-ui'
/* eslint-disable vue/require-prop-types */
export default {
  name: 'PendingList',
  props: ['approvedTaskId', 'refreshFlag'],
  components: {
    CommonTable
  },
  mounted () {
    this.getPageSize()
    this.load()
  },
  data () {
    const columns = [
      {
        type: 'selection',
        width: 40
      },
      {
        title: '序号',
        type: 'index',
        width: '50px'
      },
      // {
      //   title: '业务名称',
      //   dataIndex: 'businessName',
      //   sortable: false,
      //   align: 'center'
      // },
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
      // {
      //   title: '送审部门',
      //   dataIndex: 'startUserDept',
      //   sortable: false,
      //   align: 'center'
      // },
      {
        title: '提交时间',
        dataIndex: 'startTime',
        sortable: false,
        align: 'center',
        width: 150
      }
    ]
    return {
      tableHeight: document.documentElement.clientHeight * 0.9 - 80 + 'px',
      loading: false,
      currentItemIndex: null,
      infiniteList: [],
      param: {},
      triggerSelectRecord: null,
      sortNum: 1,
      pageInfo: {
        current: 1,
        size: 15,
        total: 0,
        orders: [{ column: 't.create_time_', asc: false }],
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
        if (this.infiniteList.length !== this.infiniteList.filter((task) => task.processTaskId !== newV).length) {
          this.infiniteList = this.infiniteList.filter((task) => task.processTaskId !== newV)
          this.pageInfo.total--
        }
        this.triggerSelectRecord = null
      }
    },
    infiniteList: function (newV, oldV) {
      if (this.infiniteList.length > 0) {
        this.triggerSelect(this.triggerSelectRecord ? this.triggerSelectRecord : this.infiniteList[0], this.currentItemIndex == null ? 0 : this.currentItemIndex)
      } else {
        this.triggerSelect()
      }
    },
    refreshFlag (val) {
      this.refreshList(val)
    }
  },
  methods: {
    sizeChange (size) {
      this.pageInfo.size = size
      this.load(this.param)
    },
    pendingSelectionChange (selection) {
      this.$emit('selection', selection)
    },
    getPageSize () {
      const rowH = 40
      const headerH = 91
      this.$nextTick(() => {
        const tableBodyH = this.$refs.table.$refs.table.$el.offsetHeight - headerH
        this.pageInfo.size = Math.floor(tableBodyH / rowH)
      })
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
      this.infiniteList = []
      let page = { ...this.pageInfo }
      // page.current = page.current + 1
      queryParam = { ...queryParam, page }
      this.param = queryParam
      this.$api['processApproval.pendingList'](queryParam).then((res) => {
        let { records, pages } = res
        that.infiniteList.push(...records)
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
      this.infiniteList = []
      this.pageInfo.current = 1
      this.load(this.param)
    },
    sortFn (flag) {
      if (flag === undefined) {
        this.sortFn(this.sortNum)
      } else if (flag === 0) {
        this.sortNum = flag
        this.pageInfo.orders = [{ column: 't.create_time_', asc: false }]
      } else if (flag === 1) {
        this.sortNum = flag
        this.pageInfo.orders = [{ column: 't.create_time_', asc: true }]
      }
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
// 搜索-刷新样式
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
