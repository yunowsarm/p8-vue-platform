<template>
  <div style="height: 100%;background-color: #f3f5f885">
    <div v-if="demandFalg"
         style="padding: 1%;">
      <el-button type="primary"
                 @click="relevanceClick">关联</el-button>
    </div>
    <vxe-table ref="xTable"
               :comp="comp"
               :style="{ height: tabelHeight }"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :is-smart-form="true"
               :refreshShow="false"
               :pagination="false"
               api="demandManagement.getRequirementByProject">
      <template #operation="{ scope }">
        <el-button type="text"
                   @click="showDetail(scope.row)">查看详情</el-button>
      </template>
    </vxe-table>
    <common-drawer v-if="relevanceViewDrawer"
                   title="关联需求"
                   :visible="relevanceViewDrawer"
                   @close="onRelevanceClose">
      <template #drawer>
        <relevance-list @saveSuccess="onRelevanceClose"
                        :configParmars="configParmars"
                        :row="row"></relevance-list>
      </template>
    </common-drawer>
    <common-drawer v-if="relevanceInfoDrawer"
                   title="需求详情"
                   placement="top"
                   size="60%"
                   :visible="relevanceInfoDrawer"
                   @close="onRelevanceInfoClose">
      <template #drawer>
        <form-view @saveSuccess="onRelevanceInfoClose"
                   :row="selectRecords"></form-view>
      </template>
    </common-drawer>
    <div v-if="viewVisible"
         class="viewVisible">
    </div>
  </div>
</template>

<script>
import { P8VxeTable as VxeTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import relevanceList from './relevanceList'
import formView from '@/views/product/DemandInformation/formView'
export default {
  name: 'Index',
  components: {
    'vxe-table': VxeTable,
    CommonDrawer,
    relevanceList,
    formView
  },
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    },
    configParmars: {
      type: Object,
      default: () => {
        return {}
      }
    },
    demandFalg: {
      type: Boolean,
      default: true
    },
    businessKey: {
      type: String
    }
  },
  data () {
    return {
      comp: this,
      tabelHeight: '92%',
      viewVisible: false,
      relevanceViewDrawer: false,
      relevanceInfoDrawer: false,
      columnsDemand: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          headerAlign: 'center',
          width: 60
        },
        {
          title: '状态',
          dataIndex: 'demandStatusDisplay',
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          width: 120
        },
        {
          title: '标题',
          dataIndex: 'title',
          sortable: false,
          align: 'left',
          headerAlign: 'center'
        },
        {
          title: '来源渠道',
          dataIndex: 'source',
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          width: 120
        },
        {
          title: '录入时间',
          dataIndex: 'itemCreateTime',
          sortable: false,
          align: 'center',
          treeNode: true,
          headerAlign: 'center',
          width: 120
        },
        {
          title: '收集人',
          dataIndex: 'createBy',
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          width: 120
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          width: 120,
          scopedSlots: { customRender: 'custom' },
          align: 'center',
          headerAlign: 'center'
        }
      ],
      tableParamDemand: {
        wholeId: ''
      },
      tableConfig: {
        'highlight-current-row': true
      },
      selectRecord: {},
      selectRecords: []
    }
  },
  created () {
    if (this.row && this.row.length) {
      this.id = this.row[0].ID ? this.row[0].ID : this.row[0].id
    } else {
      if (this.businessKey) {
        this.id = this.businessKey
      } else {
        this.id = this.configParmars ? this.configParmars.id : ''
      }
      if (!this.id) {
        this.viewVisible = true
        this.$message({
          message: '请先创建项目',
          type: 'warning'
        })
      }
    }
    this.tableParamDemand.wholeId = this.id ? this.id : '0'
  },
  mounted () {
    if (!this.demandFalg) {
      this.tabelHeight = '100%'
    }
  },
  methods: {
    relevanceClick () {
      this.relevanceViewDrawer = true
    },
    onRelevanceClose () {
      this.relevanceViewDrawer = false
      this.$refs.xTable.searchData()
    },
    onRelevanceInfoClose () {
      this.relevanceInfoDrawer = false
    },
    showDetail (row) {
      this.relevanceInfoDrawer = true
      this.selectRecords = [row]
    }
  }
}
</script>

<style lang="scss" scoped>
.viewVisible {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>