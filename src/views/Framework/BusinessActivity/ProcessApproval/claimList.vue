<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div class="list-content">
    <el-row class="row-search-refresh"
            :gutter="10">
      <el-col :span="16">
        <search-form-list search-width="100%"
                          search-contain-width="100%"
                          label-width="70px"
                          ref="search"
                          :data-source="searchData"
                          @search="search"
                          @re-set="reSet"></search-form-list>
      </el-col>
      <el-col class="col-refresh"
              :span="8">
        <el-dropdown split-button
                     @click="refreshList"
                     type="primary">
          刷新
          <el-dropdown-menu key="refreshList"
                            slot="dropdown">
            <el-dropdown-item key="refreshList1"
                              @click.native="refreshList(1)">时间正序</el-dropdown-item>
            <el-dropdown-item key="refreshList0"
                              @click.native="refreshList(0)">时间倒序</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>

    <div class="infinite-list-wrapper"
         style="overflow: auto">
      <common-table ref="table"
                    :columns="columns"
                    :flex="210"
                    :table-setting="false"
                    :table-config="tableConfig"
                    :no-api-table-data="claimListList"
                    @row-click="rowClick"
                    @change-page="changePage"></common-table>
      <!-- <ul class="infinite-list" v-infinite-scroll="load" infinite-scroll-disabled="disabled" :infinite-scroll-distance="0" :infinite-scroll-delay="500">
              <li @click="triggerSelect(r, index)" :key="r.processTaskId" v-for="(r, index) in claimListList" class="infinite-list-item" :class="itemSelected(index)">
                  <el-row type="flex" style="text-align: left; height:30px">
                      <el-col :span="2" style="text-align: center">{{index+1}}</el-col>
                      <el-col :span="14">{{r.processName}}</el-col>
                      <el-col :span="8" style="text-align: right">{{r.processTaskName}}</el-col>
                  </el-row>
                  <el-row type="flex"  style="text-align: left; height:18px;">
                      <el-col :span="2"></el-col>
                      <el-col :xs="4" :sm="4" :md="5" :lg="6" :xl="6" ><i class="p8 icon-full-name"/>{{r.startUser}}</el-col>
                      <el-col :xs="5" :sm="5" :md="5" :lg="6" :xl="6" ><i class="p8 icon-dept"/>{{r.startUserDept}}</el-col>
                      <el-col :xs="13" :sm="13" :md="12" :lg="10" :xl="10" style="text-align: right;"><i class="p8 icon-approval-time"/>{{r.startTime}}</el-col>
                  </el-row>
              </li>
          </ul>
          <div style="height: 50px">
              <p v-if="loading">加载中...</p>
              <p v-if="noMore">没有更多了</p>
          </div> -->
    </div>
  </div>
</template>

<script>
import { Row, Col, Dropdown, DropdownMenu, DropdownItem, P8Search as SearchFormList, P8Table as CommonTable } from 'p8-components-ui'
/* eslint-disable vue/require-prop-types */
export default {
  name: 'ClaimList',
  props: ['approvedTaskId'],
  components: {
    SearchFormList,
    CommonTable,
    'el-row': Row,
    'el-col': Col,
    'el-dropdown': Dropdown,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem
  },
  mounted () {
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
        title: '业务名称',
        dataIndex: 'businessName',
        sortable: false
      },
      {
        title: '流程名称',
        dataIndex: 'processName',
        sortable: false
      },
      {
        title: '流程名称',
        dataIndex: 'processTaskName',
        sortable: false
      },
      {
        title: '审批人',
        dataIndex: 'startUser',
        sortable: false
      },
      {
        title: '审批人部门',
        dataIndex: 'startUserDept',
        sortable: false
      },
      {
        title: '审批时间',
        dataIndex: 'startTime',
        sortable: false
      }
    ]
    return {
      loading: false,
      currentItemIndex: null,
      claimListList: [],
      param: {},
      triggerSelectRecord: null,
      sortNum: 1,
      pageInfo: {
        current: 1,
        size: 10,
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
        if (this.claimListList.length !== this.claimListList.filter((task) => task.processTaskId !== newV).length) {
          this.claimListList = this.claimListList.filter((task) => task.processTaskId !== newV)
          this.pageInfo.total--
        }

        this.triggerSelectRecord = null
      }
    },
    claimListList: function (newV, oldV) {
      if (this.claimListList.length > 0) {
        this.triggerSelect(this.triggerSelectRecord ? this.triggerSelectRecord : this.claimListList[0], this.currentItemIndex == null ? 0 : this.currentItemIndex)
      } else {
        this.triggerSelect()
      }
    }
  },
  methods: {
    setTableCurrentRow (row) {
      this.$refs.table.$refs.table.setCurrentRow(row)
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

      let page = { ...this.pageInfo }
      // page.current = page.current + 1
      queryParam = { ...queryParam, page }
      this.param = queryParam
      this.$api['PersonalProcessApproval.claimListList'](queryParam).then((res) => {
        let { records, pages } = res
        that.claimListList.push(...records)
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
      this.claimListList = []
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
.row-search-refresh.el-row {
  padding: 10px;
  .col-refresh.el-col {
    text-align: right;
  }
}
.infinite-list-wrapper {
  width: 100%;
  height: calc(100% - 50px);
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
