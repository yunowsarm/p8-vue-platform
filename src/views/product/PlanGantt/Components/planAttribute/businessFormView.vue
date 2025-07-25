<template>
  <list-layout class="listLayout"
               :headerVisible="false"
               style="height: 300px;">
    <template #north>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    class="customTable"
                    :columns="columns"
                    :pagination="false"
                    :no-api-table-data="editTableData">
        <template #operation="{ scope }">
          <el-button type="text"
                     @click="viewForm(scope.row)">查看</el-button>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visible"
                     size="50%"
                     :visible='visible'
                     title="查看"
                     @close="drawerClose">
        <template #drawer>
          <!-- 业务表单 -->
          <template v-if="record.formType === 'businessForm'">
            <FormRender v-if="record.editMode === '单数据'"
                        :ref="record.id"
                        :item="record"
                        :approveType="false"
                        :taskId="taskId"
                        :key="record.id"></FormRender>
            <multiple-form-table v-else-if="record.editMode === '多数据'"
                                 :ref="record.id"
                                 :key="record.id"
                                 :taskId="taskId"
                                 :approveType="false"
                                 :item="record"></multiple-form-table>
          </template>
          <!-- 自定义表单 -->
          <template v-else-if="record.formType === 'customForm'">
            <component v-if="record.editMode === '单数据'"
                       :item="record"
                       :ref="record.id"
                       :key="record.id"
                       :approveType="false"
                       :is="componentUrl(record.formUrl)"></component>
            <custom-form-table v-else-if="record.editMode === '多数据'"
                               :item="record"
                               :key="record.id"
                               :ref="record.id"
                               :approveType="false"></custom-form-table>
          </template>
          <!-- 模板表单 -->
          <template v-else-if="record.formType === 'templateForm'">
            <iframeForm v-if="record.editMode === '单数据'"
                        :ref="record.id"
                        :key="record.id"
                        :item="record"
                        :approveType="false"></iframeForm>
            <template-form-table v-else-if="record.editMode === '多数据'"
                                 :item="record"
                                 :key="record.id"
                                 :ref="record.id"
                                 :approveType="false"></template-form-table>
          </template>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<script>
import { P8ListLayout as ListLayout, P8Drawer as CommonDrawer, P8Table as CommonTable, } from 'p8-components-ui'
import multipleFormTable from '@/views/product/My/Work/Task/Components/taskOperating/components/multipleFormTable.vue'
import customFormTable from '@/views/product/My/Work/Task/Components/taskOperating/components/customFormTable.vue'
import templateFormTable from '@/views/product/My/Work/Task/Components/taskOperating/components/templateFormTable.vue'
import FormRender from '@/views/product/My/Work/Task/Components/taskOperating/components/formRender.vue'
import iframeForm from '@/views/product/My/Work/Task/Components/taskOperating/components/iframeForm.vue'
import { defineAsyncComponent } from 'vue'
export default {
  name: 'businessFormView',
  props: {
    taskId: {
      type: String,
      default: ''
    },
  },
  data () {
    return {
      record: {},
      visible: false,
      comp: this,
      columns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 70,
        },
        {
          title: '业务表单',
          dataIndex: 'formName',
          align: 'center',
        },
        {
          title: '编辑模式',
          dataIndex: 'editMode',
          align: 'center',
        },
        {
          title: '是否必填',
          dataIndex: 'isRequired',
          align: 'center',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
          width: 80,
          align: 'center'
        }
      ],
      editTableData: []
    }
  },
  components: {
    CommonTable,
    ListLayout,
    CommonDrawer,
    multipleFormTable,
    customFormTable,
    templateFormTable,
    FormRender,
    iframeForm
  },
  created () {
    this.$api['planGanttManager.taskFormInfo']({ taskId: this.taskId }).then(res => {
      this.editTableData = res.map(item => {
        return { name: item.id, ...item }
      })
    })
  },
  methods: {
    viewForm (row) {
      this.record = row;
      this.visible = true
    },
    drawerClose () {
      this.visible = false
      this.record = {}
    },
    componentUrl (componentPath) {
      const path = componentPath.startsWith('/') ? componentPath.slice(1) : componentPath
      return defineAsyncComponent(() =>
        import(`@/views/${path}.vue`)
      );

    }
  }
}
</script>
<style lang="scss" scoped>
.listLayout {
  margin: 0;
  padding: 0;
  ::v-deep .list-header {
    padding: 10px 1px !important;
  }
  ::v-deep .list-main {
    padding: 0;
    margin: 0;
    height: 100%;
  }
  ::v-deep .list-layout {
    margin: 0;
    height: 100%;
  }
  .el-icon-delete,
  .el-icon-view {
    font-size: 16px;
    line-height: 24px;
    cursor: pointer;
    &:hover {
      color: $base-light-color;
    }
  }
}
.customTable ::v-deep .panination {
  display: none;
}
</style>
