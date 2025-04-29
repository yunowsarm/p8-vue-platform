<template>
  <common-dialog title="我的经验库"
                 :visible="visible"
                 width="80%"
                 class="experience_dialog"
                 @close="handleCancel"
                 :show-handle-btn="false"
                 :dialog-height="450">
    <template #dialog>
      <normal-layout v-if="visible"
                     :header-visible="false"
                     :split-default-left-width="26">
        <template #north> </template>
        <template #west>
          <tree class="customTree"
                :data="treeData"
                :node-slot="true"
                ref="tree"
                @select="selectNode"
                :tree-config="treeCfg">
            <template #tree="{ node }">
              <div class="node-span"
                   :class="{ 'node-left': !node.childNodes.length }">
                <div style="display: flex">
                  <span style="display: inline-block;">
                    <i class="p8"
                       :class="node.data.icon ? node.data.icon : 'icon-fenzu'"></i>
                  </span>
                  <el-input v-if="parentId === node.data.parentId && !node.data.type"
                            class="node-label"
                            v-model="node.data.name"
                            size="mini"
                            @blur="(val) => addClass(node.data, 'blur', val)"></el-input>
                  <span v-else
                        class="node-label"
                        :title="node.data.name">{{ node.data.name }}</span>
                </div>
                <div>
                  <el-button type="text"
                             icon="el-icon-plus"
                             :disabled="!!node.data.type"
                             @click="addClass(node.data, 'add')"></el-button>
                  <el-button type="text"
                             icon="el-icon-minus"
                             :disabled="!node.data.parentId"
                             @click="deleteClass(node.data)"></el-button>
                </div>
              </div>
            </template>
          </tree>
        </template>
        <template #center>
          <div style="padding: 10px">
            <div v-if="toolbarWritingDisplay === '0'">
              <el-button-group v-if="toolbarCompactLayout === 'true'">
                <el-button type="primary"
                           :disabled="isManage"
                           @click="exportExperience">导入</el-button>
                <el-button type="primary"
                           @click="copyExperience">复制到粘贴板</el-button>
              </el-button-group>
              <div v-else>
                <el-button type="primary"
                           :disabled="isManage"
                           @click="exportExperience">导入</el-button>
                <el-button type="primary"
                           @click="copyExperience">复制到粘贴板</el-button>
              </div>
            </div>
            <div v-if="toolbarWritingDisplay === '1'">
              <el-button-group v-if="toolbarCompactLayout === 'true'">
                <el-tooltip placement="top"
                            content="导入">
                  <el-button icon="p8 icon-daoru"
                             @click="exportExperience"
                             type="primary"></el-button>
                </el-tooltip>
                <el-tooltip placement="top"
                            content="复制到粘贴板">
                  <el-button icon="p8 icon-copy"
                             @click="copyExperience"
                             type="primary"></el-button>
                </el-tooltip>
              </el-button-group>
              <div v-else>
                <el-tooltip placement="top"
                            content="导入">
                  <el-button icon="p8 icon-daoru"
                             @click="exportExperience"
                             type="primary"></el-button>
                </el-tooltip>
                <el-tooltip placement="top"
                            content="复制到粘贴板">
                  <el-button icon="p8 icon-copy"
                             @click="copyExperience"
                             type="primary"></el-button>
                </el-tooltip>
              </div>
            </div>
            <div v-if="toolbarWritingDisplay === '2'">
              <el-button-group v-if="toolbarCompactLayout === 'true'">
                <el-button type="primary"
                           icon="p8 icon-daoru"
                           :disabled="isManage"
                           @click="exportExperience">导入</el-button>
                <el-button type="primary"
                           icon="p8 icon-copy"
                           @click="copyExperience">复制到粘贴板</el-button>
              </el-button-group>
              <div v-else>
                <el-button type="primary"
                           icon="p8 icon-daoru"
                           :disabled="isManage"
                           @click="exportExperience">导入</el-button>
                <el-button type="primary"
                           icon="p8 icon-copy"
                           @click="copyExperience">复制到粘贴板</el-button>
              </div>
            </div>
          </div>
          <common-table ref="table"
                        :comp="comp"
                        :columns="columns"
                        :params="tableParam"
                        :api="tableApi"
                        :pagination="false"
                        :use-tree-format="true"
                        :table-config="tableConfig"
                        use-tree-p-id="parentId"
                        :table-refresh="tableRefresh"
                        @select-all="selectAll"
                        @select="onTableSelect"
                        @selection-change="handleSelectionChange">
            <template #monitorPoints="{ scope }">
              <span v-if="scope.row.monitorPointArray">
                <i v-for="item in handleRowMointor(scope.row)"
                   :key="item.id"
                   :class="`${item.icon}`"
                   :title="item.name"></i>
              </span>
            </template>
            <template #operation="{ scope }">
              <el-button type="text"
                         v-if="toolbarWritingDisplay === '0'"
                         @click="showDetail(scope.row)">查看详情</el-button>
              <el-tooltip v-if="toolbarWritingDisplay === '1'"
                          placement="top"
                          content="查看详情">
                <el-button type="primary"
                           icon="p8 icon-chakan"
                           @click="showDetail(scope.row)"></el-button>
              </el-tooltip>
              <el-button type="primary"
                         icon="p8 icon-chakan"
                         v-if="toolbarWritingDisplay === '2'"
                         @click="showDetail(scope.row)">查看详情</el-button>
            </template></common-table>
        </template>
        <template #drawer-panel>
          <common-drawer :title="detailTitle"
                         v-if="detailVisible"
                         :visible="detailVisible"
                         size="50%"
                         @close="detailClose">
            <template #drawer>
              <Detail :task-id="taskId"
                      :record="record"
                      :gantt-name="ganttName"></Detail>
            </template>
          </common-drawer>
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.experience_dialog ::v-deep {
  .el-dialog {
    .el-dialog__body {
      padding: 0px !important;

      .dialogBody {
        .normal-layout {
          padding-left: 0px !important;
          margin: 6px;
        }
      }
    }
  }
}

.common-table ::v-deep {
  height: calc(100% - 60px) !important;
  margin: 10px;
}

.node-span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 10px;

  .node-label {
    width: 150px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
  }
}
</style>
<script>
import { P8NormalLayoutV1 as NormalLayout, P8Drawer as CommonDrawer, P8Table as CommonTable, P8Tree as commonTree, P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
import DescribeView from '@/views/product/PlanGantt/Components/describeEdit/describeView.vue'
// import Detail from './taskDetail.vue'
import Detail from '@/views/Framework/Message/components/TaskDetail/index.vue'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'
import api from '@/plugins/api'
export default {
  name: 'MyExperienceBase',
  components: {
    Detail,
    DescribeView,
    tree: commonTree,
    NormalLayout,
    FormList,
    CommonTable,
    CommonDrawer,
    CommonDialog
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: () => { }
    },
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    selectedTask: {
      type: Array,
      default: () => {
        return []
      }
    },
    isManage: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    ganttName: {
      type: String,
      default: ''
    },
    createPage: {
      type: String,
      default: ''
    },
    planInfoId: {
      type: String,
      default: ''
    },
    exportExperienceType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      record: {},
      detailTitle: '任务属性',
      tableConfig: {
        'default-expand-all': true,
        'highlight-current-row': true
      },
      selectedRows: [],
      detailVisible: false,
      tableApi: 'MyExperience.myBaseExperienceList',
      selectedTreeId: '',
      messageCatalogApi: 'MyExperience.experienceClassifyTreeList',
      catalogData: [],
      columns: [
        {
          title: '',
          width: 45,
          type: 'selection',
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '标识',
          dataIndex: 'monitorPoints',
          type: '',
          minWidth: 100,
          scopedSlots: { customRender: 'custom' },
          align: 'center'
        },
        {
          title: '大纲',
          type: '',
          dataIndex: 'WBS',
          minWidth: 60,
          align: 'left'
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          align: 'left'
        },
        {
          title: '前后置',
          dataIndex: 'backAndForth',
          align: 'left'
        },
        {
          title: '工期',
          dataIndex: 'durations',
          align: 'center'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          width: '150',
          scopedSlots: {
            customRender: 'custom'
          },
          align: 'center'
        }
      ],
      taskId: '',
      tableParam: {
        classifyId: ''
      },
      parentId: '',
      comp: this,
      treeCfg: {
        indent: 48,
        'highlight-current': true
      },
      toolbarWritingDisplay: '0',
      toolbarCompactLayout: 'false'
    }
  },
  watch: {
    selectedTreeId: function (newV, oldV) {
      if (newV) {
        this.tableParam.classifyId = newV
        // this.$refs.table.searchData()
      }
    }
  },
  created () {
    this.loadCatalog()
  },
  computed: {
    vueThis () {
      return this.$store.getters.vueThis
    },
    treeData () {
      this.catalogData.map((el) => {
        if (el.id === '0') {
          el.icon = 'icon p8 icon-zong'
        }
      })
      const resultData = this.catalogData
      return resultData
      // }
    }
  },
  mounted () {
    if (this.$store.getters.baseConfig.toolbarWritingDisplay) {
      this.toolbarWritingDisplay = this.$store.getters.baseConfig.toolbarWritingDisplay
    } else {
      this.toolbarWritingDisplay = '0'
    }
    if (this.$store.getters.baseConfig.toolbarCompactLayout) {
      this.toolbarCompactLayout = this.$store.getters.baseConfig.toolbarCompactLayout
    } else {
      this.toolbarCompactLayout = 'false'
    }
  },
  methods: {
    handleRowMointor (row) {
      if (row && row.monitorPointArray) {
        const monitorPointArray = row.monitorPointArray.split(',')
        const monitorPointIconArray = row.monitorPointIconArray.split(',')
        const monitorPointDisplayArray = row.monitorPointDisplayArray.split(',')
        const mointIcon = []
        const monitorLength = monitorPointArray.length
        for (let i = 0; i < monitorLength; i++) {
          mointIcon.push({
            id: monitorPointArray[i],
            icon: monitorPointIconArray[i],
            name: monitorPointDisplayArray[i]
          })
        }
        return mointIcon
      }
    },
    detailClose () {
      this.detailVisible = false
    },
    showDetail (row) {
      this.record = row
      this.taskId = row.planId
      this.detailVisible = true
    },
    onTableSelect (select, row) {
      // 获取表格中所有选中的数据
      const checkrow = []
      checkrow.push(row)
      if (row.isCheck === true) {
        if (select === 1) {
          this.$refs.table.$refs.table.toggleRowSelection(row, false)
        }
        this.clearRow(checkrow)
      } else {
        if (select === 1) {
          this.$refs.table.$refs.table.toggleRowSelection(row, true)
        }
        this.checkRow(checkrow)
      }
      this.selectedRows = this.$refs.table.$refs.table.selection;
    },
    selectAll (selection) {
      let that = this
      this.$nextTick(() => {
        let selectAll = document.querySelector('.headerRowClassName .el-table-column--selection .el-checkbox__input')
        let tabindex
        if (selectAll) {
          tabindex = selectAll.getAttribute('tabindex')
        }
        if (!tabindex && selection && selection.length) {
          this.checkRow(selection)
        } else {
          this.clearRow(this.$refs.table.tableData)
        }
        this.selectedRows = this.$refs.table.$refs.table.selection
      })
    },
    // 取消选中递归
    clearRow (data) {
      Array.from(data).forEach((row) => {
        row.isCheck = false // 给这行数据设置一个选中字段为false
        this.$refs.table.$refs.table.toggleRowSelection(row, false)
        if (row.children) this.clearRow(row.children) // 有子集就递归  没子集了就不循环了
      })
    },
    // 选中递归
    checkRow (data) {
      Array.from(data).forEach((row) => {
        row.isCheck = true // 选中是字段值为true
        this.$refs.table.$refs.table.toggleRowSelection(row, true)
        if (row.children) this.checkRow(row.children)
      })
    },
    exportExperience () {
      const that = this
      if (that.selectedRows.length > 0) {
        const experienceInfoIds = that.selectedRows.map((item) => item.id)
        const params = {
          createPage: that.createPage,
          experienceInfoIds,
          parentTaskId: that.selectedTask[0].id,
          planInfoId: that.planInfoId,
          type: that.exportExperienceType
        }
        that.$api['MyExperience.importTaskEx'](params)
          .then((res) => {
            if (res && res.length > 0) {
              that.$emit('handleCancel', res)
              that.$message.success('导入成功')
            } else {
              that.$message.error('导入失败')
            }
          })
          .then((err) => {
            console.error(err + '错误信息')
          })
      } else {
        that.$message.warning('请选择需要导入的数据')
      }
    },
    // 复制到粘贴板
    copyExperience () {
      const vueThis = this.vueThis
      vueThis.copyFlag = false
      const copyTaskIds = this.selectedRows.map(el => el.planId)
      const planInfoId = this.planInfoId
      vueThis.copyTasks.tasks = []
      if (copyTaskIds !== null && copyTaskIds.length > 0) {
        this.$api['planGanttManager.copyTasks']({
          pasteTaskIds: copyTaskIds,
          planInfoId: planInfoId
        })
          .then((res) => {
            if (res) {
              if (res) {
                if (res && res.tasks && res.tasks.length) {
                  copyTaskIds.forEach(id => {
                    res.tasks.forEach(el => {
                      if (id === el.id) {
                        el.managerStatus = (this.thirdMenuParam.MANAGESTATUS === '6609' || this.thirdMenuParam.EXECUTESTATE === '1000') ? '6401' : '6403'
                        el.realBeginDate = ''
                        el.realEndDate = ''
                        el.dutyDeptName = ''
                        el.realName = ''
                        vueThis.copyTasks.tasks.push(el)
                      }
                    })
                  })
                }
                this.$message({
                  message: '复制成功！',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: '任务复制失败！',
                  type: 'error'
                })
              }
            }
          })
          .catch((err) => {
            console.error(err, 'err')
            this.$message({
              message: '任务复制失败！',
              type: 'error'
            })
          })
      }
    },
    addClass (node, type, e) {
      const that = this
      const { id } = node
      if (type === 'add') {
        this.parentId = id
        that.$api['MyExperience.experienceClassifyCreate']({ parentId: id })
          .then((res) => {
            if (res === 'true') {
              that.loadCatalog()
              // that.$message.success('创建成功')
            } else {
              that.$message.error('创建失败')
            }
          })
          .then((err) => {
            console.error(err + '错误信息')
          })
      }
      if (type == 'blur') {
        if (!e.target.value) {
          this.$message.warning('请填写分类名称')
          return
        }
        that.$api['MyExperience.experienceClassifyCreate']({ id, label: e.target.value })
          .then((res) => {
            if (res === 'true') {
              this.parentId = ''
              that.loadCatalog()
              that.$message.success('创建成功')
            } else {
              that.$message.error('创建失败')
            }
          })
          .then((err) => {
            console.error(err + '错误信息')
          })
      }
    },
    deleteClass (node) {
      const that = this
      const { id } = node
      that
        .$confirm('确定要删除该分类吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          that.$api['MyExperience.removeExperienceClassify']({ id })
            .then((res) => {
              if (res === 'true') {
                that.loadCatalog(that.treeData[0].id)
                that.$message.success('删除成功')
              } else {
                that.$message.error('删除失败')
              }
            })
            .then((err) => {
              console.error(err + '错误信息')
            })
        })
        .catch(() => { })
    },
    loadCatalog (id) {
      const _this = this
      this.$api[this.messageCatalogApi]({ isDisplay: '' }).then((res) => {
        _this.catalogData = res
        if (id) {
          this.$nextTick(() => {
            _this.selectedTreeId = id;
            _this.$refs.tree.$refs.tree.setCurrentKey(id);
          })
        }
      })
    },
    selectNode (nodeData) {
      this.treeCfg['current-node-key'] = nodeData.id
      this.selectedTreeId = nodeData.id
    },
    tableRefresh (param) {
      // 先保存当前选中的行的 id
      const selectedRowIds = this.selectedRows.map(row => row.id);
      param
        .then(() => {


          // 使用 $nextTick 确保 DOM 渲染完成后再恢复选中状态
          this.$nextTick(() => {
            this.restoreSelectedRows(selectedRowIds);
          });
        })
        .catch(() => {
          console.error('异步失败的操作');
        });
    },
    // 恢复选中的行
    restoreSelectedRows (selectedRowIds) {
      this.$refs.table.$refs.table.clearSelection();
      selectedRowIds.forEach(id => {
        const row = this.findRowById(this.$refs.table.tableData, id);
        if (row) {
          // 确保当前行被选中
          this.$refs.table.$refs.table.toggleRowSelection(row, true);
          this.$set(row, 'isCheck', true);
        }
      });
    },

    // 递归查找树形数据中的节点
    findRowById (treeData, id) {
      for (const node of treeData) {
        if (node.id === id) {
          return node;
        }
        if (node.children) {
          const found = this.findRowById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    },
    handleSelectionChange (val) { },
    handleCancel () {
      this.$emit('handleCancel')
    },
    customValidate (saveParams) {
      this.$emit('handleOk', saveParams.name)
    }
  }
}
</script>
