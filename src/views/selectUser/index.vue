<template>
  <normal-layout :normalLayout="normalLayout"
                 style="padding: 0; margin: 0;height: 100%"
                 layoutCode='SELECT_USER'
                 :splitDefaultLeftWidth="35"
                 v-bind="normalLayoutConfig">
    <template #north>
      <el-input placeholder="请输入人员姓名进行搜索"
                size="mini"
                clearable
                v-model="userParam.userName"
                @change="search"
                style="width: 35%"></el-input>
      <el-select v-model="userParam.roleIds"
                 multiple
                 size="mini"
                 style="width: 35%"
                 collapse-tags
                 clearable
                 placeholder="请选择角色进行搜索">
        <el-option v-for="item in roleIds"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value">
        </el-option>
      </el-select>
      <el-button style="margin-left: 8px"
                 icon="search"
                 size="mini"
                 type="primary"
                 @click="search">搜索</el-button>
      <el-button style="margin-left: 8px"
                 size="mini"
                 @click="reSet">重置</el-button>
    </template>
    <template #west>
      <common-tree :treeApi="treeOptions.treeApi"
                   :treeParam="treeOptions.treeParam"
                   :disabledRow="treeOptions.disabledRow"
                   :defaultExpandAll="treeOptions.defaultExpandAll"
                   :defaultExpandedKeys="treeOptions.defaultExpandedKeys"
                   :lazy="treeOptions.lazy"
                   @initTreeData="initTreeData"
                   @select="onSelect"
                   :treeConfig="treeOptions.treeConfig"></common-tree>
    </template>
    <template #center>

      <common-table ref="table"
                    :table-config="tableConfig"
                    :columns="columns"
                    :params="queryParam"
                    :api="tableApi"
                    :is-radio-select='true'
                    :pagination="true"
                    @requested-table-data="handleRequested"
                    @select="select"
                    @select-all="selectAll"
                    @row-click="rowClick"
                    @row-dblclick="rowDblClick"></common-table>
    </template>
  </normal-layout>
</template>
<script>
import { Input, Button } from "element-ui";
import { P8NormalLayoutV1 as NormalLayout, P8Dialog as CommonDialog, P8Tree as CommonTree, P8Table as CommonTable } from 'p8-components-ui'

export default {
  name: "SelectUser",
  props: {
    normalLayout: {
      type: Object,
      default: () => {
        return {
          west: {
            xs: 10,
            sm: 9,
            md: 8,
            lg: 7,
            xl: 6,
          },
          center: {
            xs: 14,
            sm: 15,
            md: 16,
            lg: 17,
            xl: 18,
          },
        };
      },
    },
    normalLayoutConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    disabledRow: {
      type: Array,
      default: () => [],
    },
    selectRows: {
      type: Array,
      default: () => [],
    },
    otherParam: {
      type: Object,
      default: () => {
        return {};
      },
    },
    tableConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    treeOptions: {
      type: Object,
      default: () => {
        return {
          treeApi: "userManager.deptTree",
          treeParam: {},
          disabledRow: [],
          defaultExpandAll: true,
          defaultExpandedKeys: [],
          treeConfig: {
            "expand-on-click-node": false,
            "check-on-click-node": true,
            'current-node-key': '1'
          },
          lazy: false
        };
      },
    },
  },
  data () {
    return {
      flexHeight: "350px",
      queryParam: {
        userName: null,
        departmentId: null,
      },
      userParam: {
        userName: "",
        roleIds: []
      },
      data: [], // 列表数据
      checkedGh: [],
      page: {
        current: 1,
        size: 10,
        total: 0,
        orders: [],
      }, // 分页
      selectedRow: null,
      selectedRows: [],
      reserveSelection: true,
      tableApi: "userManager.listData",
      columns: [
        {
          title: "",
          width: 45,
          type: "selection",
          selectable: (row, index) => {
            return this.checkSelect(row, index);
          },
          align: "center",
          headerAlign: 'center'
        },
        {
          title: "序号",
          type: "index",
          width: 55,
          align: "center",
        },
        {
          title: 'ID',
          dataIndex: 'id',
          align: 'left',
          headerAlign: 'left',
          isshow: false
        },
        {
          title: "用户名",
          dataIndex: "realName",
          minWidth: 120,
          align: "center",
        },
        {
          title: "所属部门",
          dataIndex: "departmentName",
          minWidth: 260,
          align: "center",
        },
      ],
      roleIds: []
    };
  },
  components: {
    "el-input": Input,
    "el-button": Button,
    NormalLayout,
    CommonTree,
    CommonDialog,
    CommonTable,
  },
  mounted () {
    this.getRole()
  },
  methods: {
    getRole () {
      this.$api['userManager.getRoles']().then(res => {
        if (res) {
          this.roleIds = res
        }
      })
    },
    initTreeData (data) {
      this.$emit("initTreeData", data);
    },
    onSelect (obj) {
      this.queryParam.departmentId = obj.id;
    },
    select (selection, row) {
      this.selectedRow = row;
      this.selectedRows = selection;
      this.$emit('selection-change', this.selectedRows)
    },
    selectAll (selection) {
      this.selectedRows = selection;
      this.$emit('selection-change', this.selectedRows)
    },
    // 单击选中行
    rowClick (row, column, event) {
      let check = this.isCheck(this.disabledRow, row);
      if (check) {
        if (this.getRadioSelect) {
          let checkRow = row;
          let checkRows = [row];
          if (!this.selectedRow) {
            this.$refs.table.toggleRowSelection(row);
          } else if (this.selectedRow && this.selectedRow.id === row.id) {
            checkRow = null;
            checkRows = [];
            this.$refs.table.setCurrentRow();
            this.$refs.table.toggleRowSelection(row);
          } else {
            this.$refs.table.clearSelection();
            this.$refs.table.toggleRowSelection(row);
          }
          this.selectedRow = checkRow;
          this.selectedRows = checkRows;
        }
      }
    },
    // 双击行，直接关闭抽屉、回填值
    rowDblClick (row, column, event) {
      let check = this.isCheck(this.disabledRow, row);
      if (check) {
        this.$refs.table.clearSelection();
        this.$refs.table.toggleRowSelection(row);
        this.selectedRows[0] = row;
        this.$emit('selection-change', this.selectedRows,'close')
      }
    },
    checkSelect (row, index) {
      if (this.disabledRow.includes(row.id)) {
        return false;
      } else {
        return true;
      }
    },
    handleRequested (data) {
      let selectRows = this.selectRows
      data.forEach((item, idx) => {
        selectRows.forEach(el => {
          if (el === item.id) {
            let isCheck = this.selectedRows.some(i => { return i.id === el })
            if (!isCheck) {
              this.$refs.table.toggleRowSelection(item, true)
            }
          }
        })
      })
    },
    search () {
      this.queryParam.userName = this.userParam.userName;
      this.queryParam.roleIds = this.userParam.roleIds;
      this.$refs.table.searchData()
    },
    reSet () {
      this.queryParam.userName = "";
      this.userParam.userName = "";
      this.queryParam.roleIds = [];
      this.userParam.roleIds = [];
      this.$refs.table.searchData()
    },
    isCheck (disabledRow, row) {
      if (disabledRow.includes(row.id)) {
        return false;
      } else {
        return true;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.dialogSelectUser {
  padding: 0;
}
::v-deep .el-input__validateIcon {
  display: none !important;
}
</style>
