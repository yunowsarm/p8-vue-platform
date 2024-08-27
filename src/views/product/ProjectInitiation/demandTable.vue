<template>
  <div style="height: 100%;">
    <div style="padding: 1%;">
      <el-button type="primary"
                 @click="relevanceClick">关联</el-button>
    </div>
    <vxe-table ref="xTable"
               :comp="comp"
               style="height: 92%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :is-smart-form="true"
               :refreshShow="false"
               :pagination="false"
               api="demandManagement.getRequirementByProject">
    </vxe-table>
    <common-drawer v-if="relevanceViewDrawer"
                   title="关联需求"
                   :visible="relevanceViewDrawer"
                   @close="onRelevanceClose">
      <template #drawer>
        <relevance-list @saveSuccess="onRelevanceClose"
                        :row="row"></relevance-list>
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
export default {
  name: 'Index',
  components: {
    'vxe-table': VxeTable,
    CommonDrawer,
    relevanceList
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
    }
  },
  data () {
    return {
      comp: this,
      viewVisible: false,
      relevanceViewDrawer: false,
      columnsDemand: [
        {
          title: '序号',
          type: 'index',
          width: '60px'
        },
        {
          title: '状态',
          dataIndex: 'demandStatusDisplay',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
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
          headerAlign: 'center'
        },
        {
          title: '录入时间',
          dataIndex: 'createTime',
          sortable: false,
          align: 'center',
          treeNode: true,
          headerAlign: 'center'
        },
        {
          title: '收集人',
          dataIndex: 'createBy',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
      ],
      tableParamDemand: {
        wholeId: this.row[0].ID
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
      this.id = this.row[0].ID
    } else {
      this.id = this.configParmars.id
      if (!this.id) {
        this.viewVisible = true
        this.$message({
          message: '请先创建项目',
          type: 'warning'
        })
      }
    }
  },
  mounted () {
  },
  methods: {
    relevanceClick () {
      this.relevanceViewDrawer = true
    },
    onRelevanceClose () {
      this.relevanceViewDrawer = false
      this.$refs.xTable.searchData()
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