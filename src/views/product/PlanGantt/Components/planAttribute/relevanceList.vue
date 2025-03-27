<template>
  <div style="height: 100%;width:100%;">
    <vxe-table ref="xDemandTable"
               v-if="falg"
               :comp="comp"
               style="height: 92%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkboxConfig="checkboxConfig"
               :is-smart-form="true"
               :tableSetting="false"
               :refreshShow="false"
               :pagination="false"
               :api="tableApi">
    </vxe-table>
  </div>
</template>

<script>
import { P8VxeTable as VxeTable } from 'p8-components-ui'
import { mapGetters } from 'vuex'
export default {
  name: 'Index',
  components: {
    'vxe-table': VxeTable
  },
  props: {
    taskId: {
      type: String
    },
    formWidth: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      comp: this,
      columnsDemand: [
        // {
        //   title: '是否关联',
        //   width: 80,
        //   align: 'center',
        //   type: 'checkbox'
        // },
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: '60px',
          headerAlign: 'center'
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
        taskId: this.taskId
      },
      tableConfig: {
        'highlight-current-row': true
      },
      checkboxConfig: {
        showHeader: false,
        checkMethod: this.checkMethod
      },
      tableApi: '',
      falg: false
    }
  },
  computed: {
    ...mapGetters(['vueThis'])
  },
  mounted () {
    this.tableParamDemand.planChangeDetailId = this.vueThis.changeRecordId
    this.tableApi = 'demandManagement.getRequirementList'
    this.falg = true
  },
  methods: {
    checkMethod ({ row }) {
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
