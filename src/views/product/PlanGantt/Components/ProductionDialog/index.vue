<template>
  <common-dialog
    :title="title"
    @close="handleCancel"
    :visible="visible"
    :dialog-config="dialogConfig"
    :show-handle-btn="false"
    :dialog-height="dialogHeight"
    :width="dialogWidth"
    @isfullscreen="isfullscreen"
  >
    <template #dialog>
      <list-layout>
        <template #north>
          <el-button @click="exportFile" type="primary" size="mini">导出</el-button>
        </template>
        <template #center>
          <div id="table-contain" style="width: 100%; display: flex">
            <div class="table_left" style="width: 170px; box-sizing: border-box; border-right: 1px solid #e9edf6">
              <div
                v-for="item in tabs"
                :class="activeTabs === item.name ? 'isactive' : ''"
                style="text-align: center; height: 100px; line-height: 100px; margin-bottom: 15px"
                :key="item.name"
                @click="changParams(item)"
              >
                <div>{{ item.label }}</div>
              </div>
            </div>
            <div class="table_content" style="width: calc(100% - 170px)">
              <common-table ref="tableCom" :columns="columns" :params="queryParam" :api="tableApi" :table-config="tableConfig" :table-setting="false"> </common-table>
            </div>
          </div>
        </template>
      </list-layout>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.isactive {
  background: #133b78;
  color: white;
}
.isactive:hover {
  cursor: pointer;
}
.table_left > div:not(.isactive):hover {
  background: #133b78;
  color: white;
  cursor: pointer;
}
.date-range-con,
.input-con {
  float: left;
  height: 30px;
  width: 50%;
}
.input-con {
  margin-left: 10px;
}
.search-btn {
  float: right;
  height: 30px;
}
.el-icon-d-arrow-right {
  float: right;
  font-size: 20px;
  margin-top: 6px;
  cursor: pointer;
}
.icon-conflict {
  cursor: pointer;
  font-size: 20px;
  color: #ff0000;
}
.input-search-name {
  width: 450px !important;
  display: inline-block !important;
}
.table-con .small-table {
  overflow-y: auto;
}
.resourceList {
  float: left;
  width: calc(50% - 5px);
  height: 100%;
}
</style>
<script>
import Vue from 'vue'
import { P8Table as CommonTable, P8Dialog as CommonDialog, P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'SubjectNumberSelect',
  components: {
    CommonTable,
    CommonDialog,
    ListLayout
  },
  props: ['selectTaskId', 'visible'],
  data() {
    const columns1 = [
      {
        title: '生产订单',
        dataIndex: 'produceOrder',
        align: 'center',
        min_width: 80
      },
      {
        title: '物料',
        dataIndex: 'materialCode',
        align: 'center',
        width: 80
      },
      {
        title: '生产订单数量',
        dataIndex: 'orderNum',
        align: 'center',
        width: 140
      },
      {
        title: '累计收货数量',
        dataIndex: 'receivedNum',
        align: 'center',
        width: 120
      },
      {
        title: '状态',
        dataIndex: 'statusDisplay',
        align: 'center',
        width: 80
      },
      {
        title: '密级',
        dataIndex: 'classifiedLevelDisplay',
        align: 'center',
        width: 80
      }
    ]

    const columns2 = [
      {
        title: '采购订单号码',
        dataIndex: 'purNumber',
        align: 'center',
        width: 120
      },
      {
        title: '采购订单行项目',
        dataIndex: 'purLineItems',
        align: 'center',
        width: 120
      },
      {
        title: '采购订单类型',
        dataIndex: 'purType',
        align: 'center',
        width: 140
      },
      {
        title: '审批日期',
        dataIndex: 'approvalDate',
        align: 'center',
        width: 120
      },
      {
        title: '物料编码',
        dataIndex: 'materialCode',
        align: 'center',
        width: 80
      },
      {
        title: '数量',
        dataIndex: 'purNum',
        align: 'center',
        width: 80
      },
      {
        title: '合同号',
        dataIndex: 'contractNumber',
        align: 'center',
        width: 80
      },
      {
        title: '创建人',
        dataIndex: 'createUser',
        align: 'center',
        width: 80
      },
      {
        title: '创建日期',
        dataIndex: 'createDate',
        align: 'center',
        width: 80
      },
      {
        title: '密级',
        dataIndex: 'classifiedLevelDisplay',
        align: 'center',
        width: 80
      }
    ]

    const columns3 = [
      {
        title: '物料凭证',
        dataIndex: 'materialVoucher',
        align: 'center',
        min_width: 80
      },
      {
        title: '物料凭证行项目',
        dataIndex: 'mvLineItems',
        align: 'center',
        width: 140
      },
      {
        title: '物料编码',
        dataIndex: 'materialCode',
        align: 'center',
        width: 80
      },
      {
        title: '入库数量',
        dataIndex: 'receiptNum',
        align: 'center',
        width: 100
      },
      {
        title: '批次/序列号',
        dataIndex: 'serialNumber',
        align: 'center',
        width: 120
      },
      {
        title: '入库过账日期',
        dataIndex: 'transferItemsDate',
        align: 'center',
        width: 120
      },
      {
        title: '入库输入日期',
        dataIndex: 'enterDate',
        align: 'center',
        width: 120
      },
      {
        title: '入库输入时间',
        dataIndex: 'enterTime',
        align: 'center',
        width: 120
      },
      {
        title: '采购订单号码',
        dataIndex: 'purNumber',
        align: 'center',
        width: 120
      },
      {
        title: '采购订单行项目',
        dataIndex: 'purLineItems',
        align: 'center',
        width: 120
      },
      {
        title: '采购订单类型',
        dataIndex: 'purType',
        align: 'center',
        width: 120
      },
      {
        title: '订单数量',
        dataIndex: 'purNum',
        align: 'center',
        width: 80
      },
      {
        title: '内向交货单号码',
        dataIndex: 'deliveryNoteNumber',
        align: 'center',
        width: 120
      },
      {
        title: '内向交货单行项目',
        dataIndex: 'deliveryLineItems',
        align: 'center',
        width: 150
      },
      {
        title: '密级',
        dataIndex: 'classifiedLevelDisplay',
        align: 'center',
        width: 80
      }
    ]

    const columns4 = [
      {
        title: '任务描述',
        dataIndex: 'taskDesc',
        align: 'center',
        min_width: 80
      },
      {
        title: 'ERP任务编码',
        dataIndex: 'erpTaskCode',
        align: 'center',
        width: 110
      },
      {
        title: '到货比例',
        dataIndex: 'arrivalRatio',
        align: 'center',
        width: 100
      },
      {
        title: '入库比例',
        dataIndex: 'receiptRatio',
        align: 'center',
        width: 100
      },
      {
        title: '信息涉密等级',
        dataIndex: 'classifiedLevelDisplay',
        align: 'center',
        width: 120
      }
    ]
    return {
      tabs: [
        {
          label: '生产订单状态',
          name: 'produceStatus'
        },
        {
          label: '产品采购订单状态',
          name: 'productPurchaseOrderStatus'
        },
        {
          label: '采购订单入库情况',
          name: 'productPurchaseOrderWarehousing'
        },
        {
          label: '采购订单到货/入库情况',
          name: 'purchaseOrderArrival'
        }
      ],
      activeTabs: 'produceStatus',
      comp: this,
      title: '',
      txtTitle: '生产订单状态',
      dialogWidth: '60%',
      dialogHeight: 580,
      dialogConfig: {
        modal: false
      },
      tableApi: 'planGanttManager.pageReceiveErpList',
      queryParam: {
        pageDataType: 'produceStatus',
        taskId: this.selectTaskId
      },
      tableConfig: {
        'highlight-current-row': true
      },
      resourceWidth: '100%',
      customHeight: 462,
      columns: [],
      columns1,
      columns2,
      columns3,
      columns4
    }
  },
  mounted() {
    this.columns = this.columns1
  },
  methods: {
    changParams(data) {
      if (data.name === 'produceStatus') {
        this.columns = this.columns1
      } else if (data.name === 'productPurchaseOrderStatus') {
        this.columns = this.columns2
      } else if (data.name === 'productPurchaseOrderWarehousing') {
        this.columns = this.columns3
      } else {
        this.columns = this.columns4
      }
      this.txtTitle = data.label
      this.activeTabs = data.name
      this.queryParam.pageDataType = data.name
      this.$refs.table.searchData()
    },
    isfullscreen(isfullscreen) {
      if (isfullscreen) {
        this.customHeight = document.documentElement.clientHeight - 170
      } else {
        this.customHeight = 462
      }
    },
    async exportFile() {
      const [err, res] = await this.$to(this.$api['planGanttManager.exportReceiveErpList'](this.queryParam, { responseType: 'blob' }))
      if (!err) {
        const date = new Date()
        // eslint-disable-next-line camelcase
        const file_name = this.txtTitle + '导出' + date.getFullYear() + '-' + Number(date.getMonth() + 1) + '-' + date.getDate()
        // eslint-disable-next-line camelcase
        const file_type = 'xls'
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        // eslint-disable-next-line camelcase
        link.download = `${file_name}.${file_type}`
        document.body.appendChild(link)
        // link.click()
        // window.URL.revokeObjectURL(link.href)
        // document.body.removeChild(link)
        if (document.createEvent) {
          // 主流浏览器
          const e = document.createEvent('MouseEvent')
          e.initEvent('click', false, false)
          link.dispatchEvent(e)
        }
        setTimeout(function () {
          // 兼容Firefox/4 bug#https://stackoverflow.com/questions/30694453/blob-createobjecturl-download-not-working-in-firefox-but-works-when-debugging#
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }, 100)
      }
    },
    handleCancel() {
      this.$emit('closed')
    }
  }
}
</script>
