<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"></common-button>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :flex="160"
                    :columns="columns"
                    :api="tableApi"></common-table>
    </template>
    <template #drawer-panel>
      <common-drawer :title="drawerTitle"
                     :visible="secretLevelEditDrawer"
                     size="50%"
                     @close="onEditViewSecretLevelClose">
        <template #drawer>
          <secret-level-edit @saveSuccess="saveCallback"
                             :record="record"></secret-level-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Button as CommonButton, P8Table as CommonTable, P8Drawer as CommonDrawer } from 'p8-components-ui'

import SecretLevelEdit from './edit'
export default {
  name: 'SecretLevelIndex',
  data () {
    const columns = [
      {
        title: '序号',
        type: 'index',
        align: 'center',
        width: '50',
        headerAlign: 'center'
      },
      {
        title: '名称',
        dataIndex: 'meaning',
        align: 'center'
      },
      {
        title: '操作',
        fixed: 'right',
        dataIndex: 'operation',
        scopedSlots: { customRender: 'operation' },
        align: 'center'
      }
    ]
    return {
      comp: this,
      tableApi: 'secretLevel.list',
      columns: columns,
      drawerTitle: '',
      secretLevelEditDrawer: false,
      record: {}
    }
  },
  methods: {
    createSecretLevel () {
      this.secretLevelEditDrawer = true
      this.drawerTitle = '新建密级'
      this.record = {}
    },
    updateSecretLevel (record) {
      this.secretLevelEditDrawer = true
      this.drawerTitle = '修改密级'
      this.record = record
    },
    removeSecretLevel (record) {
      let that = this
      this.$confirm('是否确定要删除该密级？', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          that.$api['secretLevel.remove']({ id: record.id }).then((res) => {
            if (res && res.data) {
              that.$message({
                message: res.data.resultMsg,
                type: 'warning'
              })
            } else {
              that.$refs.table.searchData()
            }
          })
        })
        .catch(() => {

        })
    },
    onEditViewSecretLevelClose () {
      this.secretLevelEditDrawer = false
      this.record = {}
    },
    saveCallback (res) {
      this.$refs.table.searchData()
      this.onEditViewSecretLevelClose()
    }
  },
  components: {
    ListLayout,
    CommonButton,
    CommonTable,
    CommonDrawer,
    SecretLevelEdit
  }
}
</script>
