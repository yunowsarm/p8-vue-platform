<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <list-layout>
    <template #north>
      <el-button type="primary"
                 round
                 @click="edit">新建</el-button>
    </template>
    <template #center>
      <div class="common-table"
           :style="{ height: flexHeight }">
        <div class="small-table">
          <el-table ref="table"
                    height="100%"
                    stripe
                    :data="tableData"
                    row-key="id">
            <template v-for="(item, index) in columns">
              <el-table-column :prop="item.dataIndex"
                               :label="item.title"
                               :width="item.width"
                               :key="index"></el-table-column>
            </template>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text"
                           @click="modify(scope)">修改</el-button>
                <el-button type="text"
                           @click="remove(scope)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
    <template #drawer-panel>
      <!-- 表单数据新建 -->
      <common-drawer :title="drawerTitle"
                     :visible="editVisible"
                     size="100%"
                     :drawer-config="drawerConfig"
                     @close="formEditClose">
        <template #drawer>
          <form-data-edit @save-success="saveCallback" @close='formEditClose' :record="record" :data-view-id="dataViewId"></form-data-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { Table, TableColumn, Button, P8ListLayout as ListLayout, P8Drawer as CommonDrawer } from 'p8-components-ui'

import FormDataEdit from './Components/edit'
export default {
  name: 'FormDataList',
  components: {
    ListLayout,
    CommonDrawer,
    FormDataEdit,
    'el-table': Table,
    'el-table-column': TableColumn,
    'el-button': Button
  },
  props: {
    record: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    const mh = document.documentElement.clientHeight - 160 + 40
    return {
      flexHeight: mh + 'px',
      columns: [],
      visible: false,
      editVisible: false,
      drawerTitle: '',
      dataViewId: '',
      drawerConfig: {
        modal: false
      },
      renderColumn: [],
      tableData: []
    }
  },
  async mounted () {
    window.addEventListener('resize', this._initTableSize)
    let that = this
    this.$api['formGenerator.getFormFieldsList']({ id: this.record.id }).then(function (res) {
      if (res && res.length) {
        let columnData = res.map((item) => {
          return {
            title: item.fieldDisplay,
            dataIndex: item.fieldName.toUpperCase()
          }
        })
        that.columns = [...columnData]
        console.log('columns:', that.columns)
      }
    })
    this.refreshTable()
  },
  watch: {
    columns: {
      handler (val) {
        this.renderColumn = val
      },
      deep: true
    }
  },
  methods: {
    _initTableSize () {
      const vm = this
      let timer = null
      // 这里增加一个延迟保证不会触发频次不会太高,减少开销
      if (timer) return
      timer = setTimeout(() => {
        const mh = document.documentElement.clientHeight - 160 + 40
        vm.flexHeight = mh + 'px'
        timer = null
      }, 300)
    },
    refreshTable () {
      let that = this
      this.$api['formGenerator.formCallDataList']({ desFormId: this.record.id })
        .then(function (res) {
          that.tableData = res
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    edit () {
      this.dataViewId = ''
      this.drawerTitle = '新建表单'
      this.editVisible = true
    },
    modify (scope) {
      this.dataViewId = scope.row.ID
      this.drawerTitle = '修改表单'
      this.editVisible = true
    },
    remove (scope) {
      let that = this
      this.$confirm('是否确定要删除该条表单数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          that.$api['formGenerator.formCallDataRemove']({
            desFormId: that.record.id,
            dataId: scope.row.ID,
            router: that.$route.name
          }).then((res) => {
            console.log(res, '删除444')
            that.refreshTable()
          })
        })
        .catch((e) => {
          console.log(e)
        })
    },
    formEditClose () {
      this.editVisible = false
    },
    saveCallback () {
      this.refreshTable()
      this.formEditClose()
    }
  }
}
</script>
