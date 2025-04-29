<template>
  <div class="content">
    <div class="list-header">

      <div v-if="toolbarWritingDisplay === '0'">
        <el-button-group v-if="toolbarCompactLayout === 'true'">
          <el-button type="primary"
                     @click="addAlert()"> 新建</el-button>
          <el-button type="primary"
                     :disabled='!selectedData || !selectedData.length'
                     @click="updateAlert()"> 修改</el-button>
          <el-button type="primary"
                     :disabled='!selectedData || !selectedData.length'
                     @click="deleteAlert()"> 删除</el-button>
          <el-button type="primary"
                     @click="forceSynchronization()">强制同步</el-button>
        </el-button-group>
        <div v-else>
          <el-button type="primary"
                     @click="addAlert()"> 新建</el-button>
          <el-button type="primary"
                     :disabled='!selectedData || !selectedData.length'
                     @click="updateAlert()"> 修改</el-button>
          <el-button type="primary"
                     :disabled='!selectedData || !selectedData.length'
                     @click="deleteAlert()"> 删除</el-button>
          <el-button type="primary"
                     @click="forceSynchronization()">强制同步</el-button>
        </div>
      </div>
      <div v-if="toolbarWritingDisplay === '1'">
        <el-button-group v-if="toolbarCompactLayout === 'true'">
          <el-tooltip placement="top"
                      content="新建">
            <el-button icon="p8 icon-add"
                       @click="addAlert()"
                       type="primary"></el-button>
          </el-tooltip>
          <el-tooltip placement="top"
                      content="修改">
            <el-button icon="p8 icon-xiugai"
                       :disabled='!selectedData || !selectedData.length'
                       @click="updateAlert()"
                       type="primary"></el-button>
          </el-tooltip>
          <el-tooltip placement="top"
                      content="删除">
            <el-button icon="p8 icon-shanchu"
                       :disabled='!selectedData || !selectedData.length'
                       @click="deleteAlert()"
                       type="primary"></el-button>
          </el-tooltip>
          <el-tooltip placement="top"
                      content="强制同步">
            <el-button icon="p8 icon-tongbu"
                       @click="forceSynchronization()"
                       type="primary"></el-button>
          </el-tooltip>
        </el-button-group>
        <div v-else>
          <el-tooltip placement="top"
                      content="新建">
            <el-button icon="p8 icon-add"
                       @click="addAlert()"
                       type="primary"></el-button>
          </el-tooltip>
          <el-tooltip placement="top"
                      content="修改">
            <el-button icon="p8 icon-xiugai"
                       :disabled='!selectedData || !selectedData.length'
                       @click="updateAlert()"
                       type="primary"></el-button>
          </el-tooltip>
          <el-tooltip placement="top"
                      content="删除">
            <el-button icon="p8 icon-shanchu"
                       :disabled='!selectedData || !selectedData.length'
                       @click="deleteAlert()"
                       type="primary"></el-button>
          </el-tooltip>
          <el-tooltip placement="top"
                      content="强制同步">
            <el-button icon="p8 icon-tongbu"
                       @click="forceSynchronization()"
                       type="primary"></el-button>
          </el-tooltip>
        </div>
      </div>
      <div v-if="toolbarWritingDisplay === '2'">
        <el-button-group v-if="toolbarCompactLayout === 'true'">
          <el-button type="primary"
                     icon="p8 icon-add"
                     @click="addAlert()"> 新建</el-button>
          <el-button type="primary"
                     icon="p8 icon-xiugai"
                     :disabled='!selectedData || !selectedData.length'
                     @click="updateAlert()"> 修改</el-button>
          <el-button type="primary"
                     icon="p8 icon-shanchu"
                     :disabled='!selectedData || !selectedData.length'
                     @click="deleteAlert()"> 删除</el-button>
          <el-button type="primary"
                     icon="p8 icon-tongbu"
                     @click="forceSynchronization()">强制同步</el-button>
        </el-button-group>
        <div v-else>
          <el-button type="primary"
                     icon="p8 icon-add"
                     @click="addAlert()"> 新建</el-button>
          <el-button type="primary"
                     icon="p8 icon-xiugai"
                     :disabled='!selectedData || !selectedData.length'
                     @click="updateAlert()"> 修改</el-button>
          <el-button type="primary"
                     icon="p8 icon-shanchu"
                     :disabled='!selectedData || !selectedData.length'
                     @click="deleteAlert()"> 删除</el-button>
          <el-button type="primary"
                     icon="p8 icon-tongbu"
                     @click="forceSynchronization()">强制同步</el-button>
        </div>
      </div>
    </div>
    <table-render ref='tableRender'
                  :key='tableKey'
                  code="planWaeningBasicTable"
                  :report-param="sqlParam"
                  :tableRefresh='tableRefresh'
                  @selection-change="handleSelectionChange"></table-render>
    <common-drawer v-if="formVisible"
                   :title="formTitle"
                   :visible="formVisible"
                   size="50%"
                   @close="formClose">
      <template #drawer>
        <form-render :dataViewId="formViewId"
                     :record="{ desformCode: codeForm }"
                     v-bind="$attrs"
                     @close="formClose"
                     @save-success="formCloseRefresh"></form-render>
      </template>
    </common-drawer>
  </div>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
import { P8ListLayout as ListLayout, P8Drawer as CommonDrawer } from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'

export default {
  name: 'PlanWarning',
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      tableKey: 0,
      formVisible: false,
      formTitle: '',
      selectedData: [],
      formViewId: '',
      codeForm: 'planWaeningBasicForm',
      comp: this,
      record: null,
      permissionVo: {
        resourceId: '',
        router: 'planWarningSettings'
      },
      sqlParam: {
        type: {
          mode: '=',
          relation: 'and',
          value: 'basic'
        }
      },
      toolbarWritingDisplay: '0',
      toolbarCompactLayout: 'false'
    }
  },
  components: {
    FormRender,
    TableRender,
    ListLayout,
    CommonDrawer
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
    // 表格选中事件
    handleSelectionChange (data) {
      this.selectedData = data
    },
    // 打开表单
    addAlert () {
      this.formViewId = ''
      this.formVisible = true
    },
    // 修改
    updateAlert () {
      this.formViewId = this.selectedData[0].ID
      this.formVisible = true
    },
    // 删除
    deleteAlert () {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api['formGenerator.formCallDataRemove']({
          desformCode: 'planWaeningBasicForm',
          dataIds: [this.selectedData[0].ID],
        }).then((res) => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.formCloseRefresh()
        }).catch((err) => {
          this.$message({
            type: 'error',
            message: '删除失败!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 强制同步
    forceSynchronization () {
      this.$confirm('该操作会重置所有计划的计划预警规则，即自动创建的会被删除，并且根据当前配置创建新的。该操作不会删除和修改【手动】创建的，请确认是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api['thirdPartInterface.synchronousWarning']().then((res) => {
          if (res) {
            this.$message({
              type: 'success',
              message: '同步成功!'
            })
            this.formCloseRefresh()
          } else {
            this.$message({
              type: 'error',
              message: '同步失败!'
            })
          }
        }).catch((err) => {
          this.$message({
            type: 'error',
            message: '同步失败!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消同步'
        })
      })
    },
    // 表单关闭
    formClose () {
      this.formVisible = false
    },
    // 表单关闭并刷新
    formCloseRefresh () {
      this.formVisible = false
      this.selectedData = []
      this.formViewId = ''
      this.tableKey++
    },
    tableRefresh () {
      console.log('refreshCallback')
      this.selectedData = []
      this.formViewId = ''
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  width: calc(100% - 29px) !important;
  height: calc(100% - 28px) !important;
  padding: 0 20px !important;
}

.list-header {
  padding: 10px 0px;
  width: 100%;
  height: 50px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 5px 5px 0 0;
}

::v-deep .el-button--small {
  padding: 9px 14px;
  margin: 0 12px 0 0;
}
</style>
