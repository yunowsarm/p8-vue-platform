<template>
  <common-dialog title="选择人员"
                 style="font-size: 10px;"
                 class="dialogSelectUser"
                 :visible="visible"
                 :dialogConfig="dialogConfig"
                 :dialogHeight="dialogHeight"
                 @isfullscreen="handleFullscreen"
                 @handle-cancel="handleCancel"
                 @handle-ok="handleOk"
                 @close="handleCancel">
    <template #dialog>
      <normal-layout :normalLayout="normalLayout"
                     style="padding: 0; margin: 0;"
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
                        :pagination="true"
                        :isRadioSelect="getRadioSelect"
                        @requested-table-data="handleRequested"
                        @select="select"
                        @select-all="selectAll"
                        @row-click="rowClick"
                        @row-dblclick="rowDblClick"></common-table>
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>
<script>
import { Input, Button } from "element-ui";
import { P8NormalLayoutV1 as NormalLayout, P8Dialog as CommonDialog, P8Tree as CommonTree, P8Table as CommonTable } from 'p8-components-ui'

export default {
  name: "P8SelectUser",
  componentName: "P8SelectUser",
  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },
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
    selectType: {
      type: String,
      default: "0",
    },
    dialogConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    dialogHeight: {
      type: Number,
      default: 690
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
      tableApi: "userManager.list",
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
  computed: {
    getRadioSelect () {
      if (this.selectType === "0") {
        return false;
      } else {
        return true;
      }
    },
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
    handleFullscreen () {
      const selectedRows = this.selectedRows ? [...this.selectedRows] : [];
      this.$nextTick(() => {
        // 恢复选中行
        if (selectedRows && selectedRows.length > 0) {
          selectedRows.forEach(row => {
            this.$refs.table.toggleRowSelection(row, true);
          });
        }
      });
    },
    handleCancel () {
      this.$refs.table.clearSelection();
      this.selectedRow = null;
      this.selectedRows = [];
      this.$emit("close-dialog", this.selectedRows, this.otherParam);
    },
    handleOk (e) {
      this.$emit("close-dialog", this.selectedRows, this.otherParam);
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
    },
    selectAll (selection) {
      this.selectedRows = selection;
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
        this.handleOk();
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
</style>
