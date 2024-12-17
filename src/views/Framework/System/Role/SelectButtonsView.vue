<template>
  <el-table row-key="id"
            :data="menus"
            :pagination="false"
            :height="height"
            :default-expand-all="true">
    <el-table-column label="选择"
                     type="index">
      <span slot-scope="scope">
        <el-checkbox v-model="scope.row.checked"
                     :disabled="resDisabled(scope.row.id)"></el-checkbox>
      </span>
    </el-table-column>
    <el-table-column width="180"
                     label="菜单"
                     prop="title"></el-table-column>
    <el-table-column label="功能">
      <span slot-scope="scope">
        <ul class="btn-container">
          <template v-for="btn in buttons(scope.row.id)">
            <li :key="btn.id"
                :class="btnClass(btn.checked)">
              <el-checkbox :key="btn.id"
                           v-model="btn.checked"
                           :disabled="true">
                <!-- <a-icon class="roleOperationIcon" :type="btn.icon"></a-icon> -->
                {{ btn.title }}
              </el-checkbox>
            </li>
          </template>
        </ul>
      </span>
    </el-table-column>
  </el-table>
</template>
<style lang="scss" scoped>
.ant-tag-checkable .roleOperationIcon {
  margin-right: 5px;
}
.btn-container {
  li {
    float: left;
    min-width: 80px;
    margin-right: 10px;
    margin-bottom: 10px;
    border: 1px solid #dcdfe6;
    padding: 5px 8px;
    border-radius: 5px;
    cursor: pointer;
    &.checked {
      border: 1px solid #2196f3;
    }
  }
}
</style>
<script>
import { Checkbox, Table, TableColumn } from 'p8-components-ui'
import { generateTree } from '@/utils/generateTree'

export default {
  props: {
    buttonSelected: {
      type: Array,
      default: function () {
        return []
      }
    },
    disable: Boolean
  },
  components: {
    'el-table': Table,
    'el-table-column': TableColumn,
    'el-checkbox': Checkbox
  },
  data () {
    const docHeight = document.documentElement.clientHeight - 318
    return {
      height: docHeight,
      resources: [],
      isIndeterminate: false,
      related: false
    }
  },
  mounted () {
    this.getPermissions()
    window.addEventListener('resize', this._initTableSize)
  },
  computed: {
    btnClass () {
      return function (checked) {
        return checked ? 'checked' : ''
      }
    },
    dataSource () {
      let that = this
      // console.log('dataSource()', that.resources, this.buttonSelected)
      this.buttonSelected.forEach((b) => {
        let res = that.resources.find((r) => r.id === b)
        if (res) {
          res.checked = true
        }
      })
      return that.resources
    },
    menus () {
      // this.dataSource.filter(r => r.parentId === 'root').forEach(i => { i.parentId = null })
      // filter(r => r.type === 'MENU' && r.id !== 'root') 不包含根节点
      return generateTree(
        this.dataSource.filter((r) => r.type === 'MENU' && r.id !== null),
        'parentId'
      )
    },
    buttons () {
      return function (menuId) {
        return this.dataSource.filter((r) => r.parentId === menuId && r.type === 'BUTTON')
      }
    },
    resDisabled () {
      return function (resId) {
        return true
      }
    },
    selectedRes: function () {
      let res = []
      res = this.dataSource.filter((r) => r.checked).map((r) => r.id)
      return res
    }
  },
  methods: {
    _initTableSize () {
      let docHeight = document.documentElement.clientHeight - 318
      this.height = docHeight
    },
    getPermissions () {
      let that = this
      // let paramdata = new FormData()
      this.$api['role.getPermissions']().then(function (res) {
        // that.skeletonLoading = false;
        // console.log('res', res)
        that.resources = res
        that.resChanged()
      })
    },
    relateSelect (id) {
      let cRow = this.dataSource.filter((r) => r.parentId === id)
      cRow.forEach((value) => {
        value.checked = true
        let cBtn = this.dataSource.filter((r) => r.parentId === value.id)
        cBtn.forEach((cValue) => {
          cValue.checked = true
          if (cValue.children && cValue.children.length > 0) {
            this.relateSelect(cValue.id)
          } else {
            let cRow = this.dataSource.filter((r) => r.parentId === cValue.id)
            cRow.forEach((value) => {
              value.checked = true
            })
          }
        })
      })
    },
    resChanged () {
      // console.log('selectedRes', this.selectedRes)
      this.$emit('btn-select-change', this.selectedRes)
    },
    checkAll () {
      // this.isIndeterminate = true
      let res1 = []
      res1 = this.dataSource.filter((r) => r).map((r) => r.id)
      let res = this.resources
      if (res) {
        //
        res.forEach((value) => {
          value.checked = true
        })
      }
      this.$emit('btn-select-change', res1)
    },
    unCheckAll () {
      this.resources.forEach((value) => {
        value.checked = false
      })
      let res = []
      this.$emit('btn-select-change', res)
    },
    relate () {
      this.related = true
    },
    unRelate () {
      this.related = false
    }
  }
}
</script>
