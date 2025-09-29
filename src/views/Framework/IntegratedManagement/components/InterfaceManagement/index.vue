<script>
import { P8Button as CommonButton, P8Drawer as CommonDrawer, P8Dialog as CommonDialog, P8ListLayout as ListLayout, P8Search as SearchFormList, P8Table as CommonTable } from 'p8-components-ui'
import interfaceEdit from './edit.vue'

export default {
  name: 'InterfaceManagement',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    CommonDialog,
    CommonButton,
    SearchFormList,
    interfaceEdit
  },
  inject: ['type', 'interFace'],
  data() {
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: 60,
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '接口id',
        dataIndex: 'interfaceId',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '接口名称',
        dataIndex: 'interfaceName',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '协议',
        dataIndex: 'interfaceAgreement',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: '路径',
        dataIndex: 'interfaceUrl',
        width: 400,
        align: 'left',
        headerAlign: 'left',
        scopedSlots: { customRender: 'custom' }
      },
      {
        title: '是否启用',
        dataIndex: 'isEnabledDisplay',
        align: 'left',
        headerAlign: 'left'
      },
      {
        title: this.type === 'server' ? '已授权用户' : '服务方',
        dataIndex: this.type === 'server' ? 'authorizedUser' : 'interfaceServiceProvider',
        align: 'left',
        headerAlign: 'left'
      },
      // {
      //   title: '服务方',
      //   dataIndex: 'service',
      //   align: 'left',
      //   headerAlign: 'left'
      // },
      {
        title: '操作',
        fixed: 'right',
        width: 160,
        dataIndex: 'operation',
        scopedSlots: { customRender: 'operation' }
      }
    ]
    return {
      searchData: [
        {
          type: 'text',
          labelText: '接口id',
          fieldName: 'interfaceId',
          placeholder: '请输入接口id'
        },
        {
          type: 'text',
          labelText: '接口名称',
          fieldName: 'interfaceName',
          placeholder: '请输入接口名称'
        },
        {
          type: 'select',
          labelText: '协议',
          fieldName: 'interfaceAgreement',
          options: [],
          placeholder: '请选择协议'
        },
        {
          type: 'text',
          labelText: '路径',
          fieldName: 'interfaceUrl',
          placeholder: '请输入路径'
        },
        {
          type: 'select',
          labelText: '是否启用',
          fieldName: 'isEnabled',
          options: [
            {
              label: '启用',
              value: '0'
            },
            {
              label: '禁用',
              value: '1'
            }
          ],
          placeholder: '请选择'
        },
        {
          type: 'text',
          labelText: this.type === 'server' ? '已授权用户' : '服务方',
          fieldName: this.type === 'server' ? 'authorizedUser' : 'interfaceServiceProvider',
          placeholder: `请输入${this.type === 'server' ? '已授权用户' : '服务方'}`
        }
      ],
      comp: this,
      recordId: '',
      tableApi: 'integratedManagement.serverList',
      columns: columns,
      queryParams: {},
      drawerTitle: '',
      visible: false,
      drawerWidth: '50%',
      agreements: [],
      describeContent: '',
      describeVisible: false,
      urlPrefix: ''
    }
  },
  watch: {
    type: {
      handler(val) {},
      immediate: true
    }
  },
  created() {
    const { devBaseUrl, prodBaseUrl, isDevMode } = this.$sysConfig.API_DEFAULT_CONFIG
    this.urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
    console.log(this.urlPrefix, 'urlPrefix')
    this.getAgreements()
  },
  methods: {
    getAgreements() {
      this.$api['thirdPartInterface.getDic']({ dicType: 'PROTOCOL' }).then((res) => {
        this.agreements = res.map((item) => {
          return {
            label: item.label,
            value: item.label
          }
        })
        const index = this.searchData.findIndex((item) => item.fieldName === 'interfaceAgreement')
        this.searchData[index].options = this.agreements
      })
    },
    createInterface() {
      this.drawerTitle = '新建'
      this.visible = true
    },
    modify(row) {
      this.drawerTitle = '修改'
      this.visible = true
      this.recordId = row.id
    },
    describe(row) {
      this.$api['integratedManagement.describe']({ id: row.id }).then((res) => {
        this.describeContent = res
        this.describeVisible = true
      })
    },
    remove(row) {
      this.$confirm(`确定要删除接口“${row.interfaceName}”吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$api[this.interFace.delete]({
            id: row.id
          }).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.$refs.table.searchData()
          })
        })
        .catch((e) => {
          // // console.log(e)
        })
    },
    drawerClose() {
      this.visible = false
      this.recordId = ''
      this.drawerWidth = '50%'
    },
    saveCallBack() {
      this.visible = false
      console.log(this.$refs)
      this.$refs.table.searchData()
      this.$message.success('保存成功！')
    },
    setDrawerWidth(width) {
      console.log(width,'width')
      this.$nextTick(() => {
        this.drawerWidth = width
      })
    },
    // 启用/禁用
    getEnable(row) {
      const isEnabled = row.isEnabled === '1' ? '0' : '1'
      const msg = isEnabled === '1' ? '禁用' : '启用'
      this.$api['integratedManagement.getEnable']({
        id: row.id,
        type: this.type,
        isEnabled: isEnabled
      }).then((res) => {
        if (res) {
          this.$refs.table.searchData()
          this.$message.success(`${msg}成功！`)
        } else {
          this.$message.error(`${msg}失败！`)
        }
      })
    },
    search(params) {
      this.queryParams = { ...params }
    },
    reSet() {
      this.queryParams = {}
    }
  }
}
</script>

<template>
  <div style="width: 100%; height: 100%">
    <list-layout>
      <template #north>
        <common-button :comp="comp" :button-type="'round'"></common-button>
        <search-form-list ref="search" :data-source="searchData" @search="search" :addFuzzySearch="true" labelWidth="100px" @re-set="reSet"></search-form-list>
      </template>
      <template #center>
        <common-table ref="table" :columns="columns" :comp="comp" :api="interFace.list" :params="queryParams">
          <template #interfaceUrl="{ scope }">
            <span v-if="type === 'server'">{{ urlPrefix + scope.row.interfaceUrl }}</span>
            <span v-else>{{ scope.row.interfaceUrl }}</span>
          </template>
        </common-table>
      </template>
      <template #drawer-panel>
        <common-drawer :title="drawerTitle" v-if="visible" :visible="visible" :size="drawerWidth" @close="drawerClose">
          <template #drawer>
            <interface-edit :recordId="recordId"
                            :agreements="agreements"
                            :urlPrefix="urlPrefix"
                            @close="drawerClose"
                            @saveCallBack="saveCallBack"
                            @setDrawerWidth="setDrawerWidth"></interface-edit>
          </template>
        </common-drawer>
      </template>
    </list-layout>
    <common-dialog
      title="说明"
      class="describeDialog"
      v-if="describeVisible"
      :visible="describeVisible"
      :showHandleBtn="false"
      @close="
        describeVisible = false
        describeContent = false
      "
    >
      <template #dialog>
        <div v-html="describeContent"></div>
      </template>
    </common-dialog>
  </div>
</template>

<style scoped lang="scss">
.describeDialog ::v-deep .is-fullscreen .el-dialog__body {
  height: calc(100% - 110px) !important;
}
</style>
