<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"
                     :special-rote-name="roteName"></common-button>
      <search-form-list ref="search"
                        :data-source="searchFormConfig"
                        @search="onSearch"
                        @re-set="onSearchReset"></search-form-list>
    </template>
    <template #center>
      <vxe-table ref="table"
                 :special-rote-name="roteName"
                 :comp="comp"
                 :columns="columns"
                 :customHeight="customHeight"
                 :table-config="tableConfig"
                 :row-config="{ isHover: true }"
                 :params="queryParam"
                 :pagination="false"
                 :api="tableApi"
                 :tree-config="treeConfig">
        <template #title="{ scope }">
          <i :class="typeIcon(scope.row.type)"> {{ scope.row.title }}</i>
        </template>
        <template #image="{ scope }">
          <el-tooltip effect="dark"
                      :content="scope.row.title"
                      placement="top">
            <i :class="'p8 ' + scope.row.image"></i>
          </el-tooltip>
        </template>
      </vxe-table>
    </template>
    <template #drawer-panel>
      <el-dialog title="请选择类型"
                 :visible="typeSelectVisible"
                 width="400px"
                 @close="onTypeSelClose">
        <div class="restype_panel">
          <el-radio-group v-model="resTypeSel"
                          class="res_selector">
            <el-radio-button :key="r.value"
                             v-for="r in currValidResTypeDic"
                             :label="r.value">{{ r.label }} </el-radio-button>
          </el-radio-group>
        </div>
        <template #footer>
          <el-button @click="onTypeSelClose">取 消</el-button>
          <el-button :disabled="disabledCt"
                     type="primary"
                     @click="onTypeSelNext">下一步</el-button>
        </template>
      </el-dialog>
      <common-drawer v-if="drawerVisible"
                     :title="drawerTitle"
                     :visible="drawerVisible"
                     size="50%"
                     @close="onDrawerClose">
        <template #drawer>
          <resource-edit :record="currRecord"
                         :res-type="resTypeSel"
                         :parent-record="parentRecord"
                         @saveSuccess="onSaveSuccess"></resource-edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<script>
import { P8VxeTable as VxeTable, P8ListLayout as ListLayout, P8Button as CommonButton, P8Drawer as CommonDrawer, P8Search as SearchFormList, Tooltip } from 'p8-components-ui'
import ResourceEdit from './Components/edit'
import { validResTypes } from './res_set_utils'

export default {
  name: 'IndexVue',
  components: {
    ListLayout,
    CommonButton,
    CommonDrawer,
    SearchFormList,
    ResourceEdit,
    'el-tooltip': Tooltip,
    VxeTable
  },
  props: {
    roteName: {
      // 三级菜单路由
      type: String,
      default: ''
    }
  },
  data () {
    return {
      customHeight: document.documentElement.clientHeight - 160,
      comp: this,
      drawerTitle: '',
      typeSelectVisible: false,
      drawerVisible: false,
      queryParam: {},
      searchFormConfig: [
        {
          type: 'text',
          labelText: '中文名称',
          fieldName: 'title',
          placeholder: '请输入中文名称'
        },
        {
          type: 'text',
          labelText: '英文名称',
          fieldName: 'name',
          placeholder: '请输入英文名称'
        },
        {
          type: 'select',
          labelText: '类型',
          fieldName: 'type',
          placeholder: '请选择类型',
          optionUrl: {
            api: 'resource.getDic',
            params: { dictType: 'RESOURCE_TYPE' }
          }
        },
        {
          type: 'select',
          labelText: '按钮位置',
          fieldName: 'location',
          placeholder: '请选择按钮位置',
          optionUrl: {
            api: 'resource.getDic',
            params: { dictType: 'LOCATION' }
          }
        },
        {
          type: 'select',
          labelText: '是否可授权',
          fieldName: 'isAccredit',
          optionUrl: {
            api: 'resource.getDic',
            params: { dictType: 'IS_ACCREDIT' }
          }
        },
        {
          type: 'text',
          labelText: '权限编码',
          fieldName: 'permission',
          placeholder: '请输入权限编码'
        }
      ],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: '50',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '中文名称',
          dataIndex: 'title',
          align: 'left',
          headerAlign: 'left',
          minWidth: '250',
          fixed: 'left',
          treeNode: true,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '图标',
          width: '50',
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'image',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '英文名称',
          dataIndex: 'name',
          align: 'left',
          headerAlign: 'left',
          width: '150'
        },
        {
          title: '排序号',
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'indexNumber',
          width: '60'
        },
        {
          title: '类型',
          width: '80',
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'typeName'
        },
        {
          title: '按钮位置',
          width: '90',
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'locationName'
        },
        {
          title: '可授权',
          width: '100',
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'isAccreditName'
        },
        {
          title: '权限编码',
          width: '150',
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'permission'
        },
        {
          title: '状态',
          width: '80',
          align: 'left',
          headerAlign: 'left',
          dataIndex: 'enableName'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          width: '150',
          align: 'left',
          headerAlign: 'left',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      tableConfig: {
        'default-expand-all': true
      },
      tableApi: 'resource.list',
      resTypeSel: '',
      resTypeDic: [],
      currValidResTypeDic: [],
      parentName: '',
      parentId: '',
      parentRecord: {},
      currRecord: {},
      treeConfig: {
        transform: true,
        expandAll: true,
        rowField: 'id',
        parentField: 'parentId'
      }
    }
  },
  created () {
    this.$api['resource.getDic']({ dictType: 'RESOURCE_TYPE' }).then((data) => {
      this.resTypeDic = data
    })
  },
  computed: {
    disabledCt () {
      return this.resTypeSel == ''
    },
    typeIcon () {
      return function (type) {
        let icon = ''
        switch (type) {
          case 'MENU':
            icon = 'el-icon-menu'
            break
          case 'BUTTON':
            icon = 'el-icon-s-tools'
            break
          case 'PER_GROUP':
            icon = 'el-icon-folder-checked'
            break
          case 'PER':
            icon = 'el-icon-setting'
        }
        return icon
      }
    }
  },
  methods: {
    /*
     * row为父对象
     */
    create (row) {
      //清空修改操作时的临时对象
      this.currRecord = {}
      this.currValidResTypeDic = this.getResTypeDic(row)
      this.parentRecord = row
      this.typeSelectVisible = true
    },
    update (row) {
      this.currRecord = { ...row }
      this.drawerVisible = true
    },
    delete (row) {
      let _this = this
      this.$confirm('是否确定要删除选择的行记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          _this.$api['resource.delete']({ ids: [row.id] })
            .then((data) => {
              _this.reloadList()
            })
            .catch((e) => {

            })
        })
        .catch((e) => {

        })
    },
    toEnable (row) {
      this.switchEnable([row.id], 1)
    },
    toDisable (row) {
      this.switchEnable([row.id], 0)
    },
    switchEnable (idArray, state) {
      let _this = this
      let stateStr = ''
      switch (state) {
        case 0:
          stateStr = '禁用'
          break
        case 1:
          stateStr = '启用'
          break
      }
      this.$confirm('是否确定要' + stateStr + '选择的行记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          _this.$api['resource.switch']({ ids: idArray, enabled: state })
            .then((data) => {
              _this.reloadList()
            })
            .catch((e) => {

            })
        })
        .catch((e) => {

        })
    },
    exportSQL () {
      this.$api['resource.exportSQL']({}, { responseType: 'blob' })
        .then((backJson) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = 'Resource.sql'
          document.body.appendChild(link)

          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        })
        .finally(() => { })
    },
    onTypeSelNext () {
      this.onTypeSelClose()
      this.drawerVisible = true
    },
    onTypeSelClose () {
      this.typeSelectVisible = false
    },
    onSearch (param) {
      this.queryParam = param
    },
    onSearchReset () {
      this.queryParam = {}
    },
    onDrawerClose () {
      this.drawerVisible = false
    },
    onSaveSuccess (res) {
      this.reloadList()
      this.onDrawerClose()
    },
    reloadList () {
      this.$refs.table.searchData()
    },
    getResTypeDic (row) {
      let resTypes = []
      if (row) {
        let typeValues = validResTypes(row)
        if (typeValues && typeValues.length > 0) {
          resTypes = this.resTypeDic.filter((d) => typeValues.includes(d.value))
        }
      }
      return resTypes
    }
  }
}
</script>

<style scoped lang="scss">
.restype_panel {
  width: 100%;
  height: 100px;
  display: flex;

  .res_selector {
    align-self: center;
    margin: auto;
  }
}
</style>
