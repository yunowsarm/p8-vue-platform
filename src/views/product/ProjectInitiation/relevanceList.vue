<template>
  <div style="height: 100%;">
    <div style="padding: 1%;">
      <el-button type="primary"
                 @click="relevanceClick">保存</el-button>
    </div>
    <vxe-table ref="xDemandTable"
               :comp="comp"
               style="height: 92%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkbox-config="checkboxConfig"
               :is-smart-form="true"
               :refreshShow="false"
               :pagination="false"
               api="demandManagement.getRequirementList"
               @selection-change="handleSelectionChangeDemand"
               @requested-table-data="requestedTableData">
      <template #operation="{ scope }">
        <el-button type="text"
                   @click="showDetail(scope.row)">查看详情</el-button>
      </template>
    </vxe-table>
    <common-drawer v-if="relevanceInfoDrawer"
                   title="需求详情"
                   placement="top"
                   size="60%"
                   :visible="relevanceInfoDrawer"
                   @close="onRelevanceInfoClose">
      <template #drawer>
        <form-view @saveSuccess="onRelevanceInfoClose"
                   :row="selectDatas"></form-view>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import { P8VxeTable as VxeTable, P8Drawer as CommonDrawer } from 'p8-components-ui'
import formView from '@/views/product/DemandInformation/formView'
export default {
  name: 'Index',
  components: {
    'vxe-table': VxeTable,
    CommonDrawer,
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
    }
  },
  data () {
    return {
      comp: this,
      relevanceInfoDrawer: false,
      columnsDemand: [
        {
          title: '',
          width: 60,
          align: 'center',
          type: 'checkbox'
        },
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
          dataIndex: 'createTime',
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
      tableParamDemand: {},
      tableConfig: {
        'highlight-current-row': true
      },
      checkboxConfig: {
        showHeader: false,
        checkMethod: this.checkMethod
      },
      selectRecord: {},
      selectRecords: [],
      selectDatas: []
    }
  },
  methods: {
    onRelevanceInfoClose () {
      this.relevanceInfoDrawer = false
    },
    showDetail (row) {
      this.relevanceInfoDrawer = true
      this.selectDatas = [row]
    },
    requestedTableData (data) {
      let that = this
      let id = ''
      if (this.row.length > 0) {
        id = that.row[0].ID
      } else {
        id = this.configParmars.id
      }
      this.$api['demandManagement.getRequirementByProject']({
        wholeId: id
      }).then(res => {
        if (res) {
          let selectData = that.$refs.xDemandTable.$refs.table.tableData
          res.forEach(row => {
            selectData.forEach((item, index) => {
              if (row.id === item.id) {
                if (!that.selectRecords.includes(row.id)) {
                  that.selectRecords.push(row.id)
                }
                that.$refs.xDemandTable.$refs.table.setCheckboxRow(selectData[index], true)
              }
            })
          })
        }
      })
    },
    checkMethod ({ row }) {
      if (row.demandStatus === '1a4c0e5a2022e3db79882411c378318b' ||
        row.demandStatus === '0db5ad18b95fa31828ca0ae226c1a23e' ||
        row.demandStatus === '545e73dc8c6dc8145efd118492ba3226') {
        return false
      }
      return true
    },
    handleSelectionChangeDemand (rows, row, checked) {
      this.selectRecords = []
      rows.map(item => {
        this.selectRecords.push(item.id)
      })
    },
    relevanceClick () {
      let that = this
      if (this.selectRecords.length === 0) {
        return this.$message({
          message: '请先勾选需要关联的需求',
          type: 'warning'
        })
      }
      let id = ''
      if (this.row.length > 0) {
        id = that.row[0].ID
      } else {
        id = this.configParmars.id
      }
      this.$api['demandManagement.saveRequirementByProject']({
        wholeId: id,
        requirementIds: this.selectRecords
      }).then(res => {
        if (res) {
          this.$message.success('操作成功')
          this.$emit('saveSuccess')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>