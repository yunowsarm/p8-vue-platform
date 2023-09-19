<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div>
    <common-table ref="table"
                  :comp="comp"
                  :columns="columns"
                  :params="queryParam"
                  :api="tableApi"
                  :table-refresh="tableRefresh"
                  :flex="tableFlex"
                  :pagination="true"></common-table>
  </div>
</template>

<script>
import { P8Table as CommonTable } from 'p8-components-ui'
export default {
  name: 'ProcessHistoryList',
  components: {
    CommonTable
  },
  props: {
    processInstId: {
      type: String,
      default: ''
    },
    businessKey: {
      type: String,
      default: ''
    },
    tableFlex: {
      type: Number,
      default: 160
    },
    tableApi: {
      type: String,
      default: 'PersonalProcessApproval.processHistoryList'
    },
    columns: {
      type: Array,
      default: () => [
        {
          title: '序号',
          type: 'index',
          align: 'center'
        },
        {
          title: '审批意见',
          dataIndex: 'opinion',
          sortable: false,
          align: 'left'
        },
        {
          title: '审批结果',
          dataIndex: 'yesOrNo',
          sortable: false,
          width: '100px',
          align: 'center'
        },
        {
          title: '审批人',
          dataIndex: 'approveUser',
          sortable: false,
          width: '100px',
          align: 'center'
        },
        {
          title: '审批节点',
          dataIndex: 'processTaskName',
          sortable: false,
          align: 'center'
        },
        {
          title: '审批时间',
          dataIndex: 'approvalTime',
          sortable: false,
          width: '140px',
          align: 'center'
        }
      ]
    }
  },
  data () {
    return {
      comp: this,
      queryParam: {
        processInstId: '',
        businessKey: ''
      }
    }
  },
  mounted () {
    console.log(this.processInstId, 'this.processInstId')
    this.queryParam.processInstId = this.processInstId
    this.queryParam.businessKey = this.businessKey
  },
  computed: {},
  watch: {
    processInstId: {
      handler: function (newV, oldV) {
        this.queryParam.processInstId = this.processInstId
        this.queryParam.businessKey = this.businessKey
        this.$refs.table.queryList()
      }
    }
  },
  methods: {
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    }
  }
}
</script>

<style scoped></style>
