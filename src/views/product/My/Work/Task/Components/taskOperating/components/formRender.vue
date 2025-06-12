<template>
  <div style="position: relative;">
    <div style="font-size: 14px;color: #606266;padding-top: 20px;height: 55px;"
         v-if="pageType == 'edit' && PREDECESSORSNUMBER">
      <span style="text-align: right;float: left; width: 90px;line-height: 55px;">关联前置任务</span>
      <el-input style="position: relative;width: calc(100% - 110px);line-height: 55px; padding-left: 10px;"
                v-model="formName"
                placeholder="弹出选择"
                @click.native="selectBeforeTaskFun"></el-input>
    </div>
    <div style="font-size: 14px;color: #606266;padding-top: 20px;height: 45px;"
         v-else-if="(pageType == 'view' && PREDECESSORSNUMBER) || (isApprove && formName)">
      <span style="text-align: right;float: left; width: 100px; line-height: 32px;">关联前置任务</span>
      <span style="width: calc(100% - 120px); line-height: 55px; margin-left: 10px; background: #f5f8fb; height: 30px; line-height: 32px; display: inline-block;">
        {{formName}}
        <el-button type="text"
                   style="margin-left: 10px;"
                   @click="viewForm">查看</el-button>
      </span>
    </div>
    <form-render ref="form"
                 :style="{'padding-top': !(PREDECESSORSNUMBER || isApprove) ? '20px' : '0px'}"
                 :dataViewId="formViewId"
                 :record="{ desformCode: formCode }"
                 :key="timeKey"
                 :pageType="pageType"
                 @save-success="(res) => formCloseRefresh(res)"></form-render>
    <div v-if="pageType == 'view' && !formViewId"
         class="single-mask"></div>
    <el-drawer v-if="drawerVisible"
               :title="drawerTitle"
               size="80%"
               :append-to-body="true"
               :destroy-on-close="true"
               :wrapper-closable="false"
               :visible.sync="drawerVisible"
               @close="onDrawerClose">
      <selectBeforeTask :record="{ desformCode: item.formCode }"
                        :dataViewId="formViewId"
                        :pageType="pageType"
                        :taskId="taskId"
                        :selectFormDataId="selectFormDataId"
                        @handleOk="handleOk"></selectBeforeTask>
    </el-drawer>
    <el-drawer v-if="viewDrawerVisible"
               title="查看前置任务"
               size="50%"
               :append-to-body="true"
               :destroy-on-close="true"
               :wrapper-closable="false"
               :visible.sync="viewDrawerVisible"
               @close="onDrawerClose">
      <form-render ref="form"
                   :dataViewId="selectFormDataId"
                   :record="{ desformCode: selectFormCode }"
                   pageType="view"></form-render>
    </el-drawer>
  </div>
</template>

<script>
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
import selectBeforeTask from './selectBeforeTask'
export default {
  name: 'formRender1',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    approveType: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    },
    PREDECESSORSNUMBER: {
      type: Number,
      default: 0
    },
    isApprove: {
      type: Boolean,
      default: false
    },
  },

  data () {
    return {
      formViewId: '',
      formCode: '',
      pageType: '',
      timeKey: new Date().getTime(),
      drawerTitle: '',
      drawerVisible: false,
      viewDrawerVisible: false,
      formName: '',
      selectFormDataId: '',
      selectFormCode: ''
    }
  },
  components: {
    FormRender,
    selectBeforeTask
  },
  created () {
    console.log(this.PREDECESSORSNUMBER, '====PREDECESSORSNUMBER');
    console.log(this.isApprove, '====isApprove');
    this.getInfo()
  },

  methods: {
    formCloseRefresh (res) {
      this.$api['taskManager.taskFormDataSave']({ actOrTaskFormId: this.item.name, formDataId: res, frontFormIds: this.frontFormIds, frontDataIds: this.frontDataIds }).then(res => {
        this.getInfo()
      })
    },
    checkBusinessForm () {
      if (this.formViewId) {
        return true
      }
      return false
    },
    async getInfo () {
      if (this.item.name) {
        if (this.approveType) {
          this.pageType = 'edit'
        } else {
          this.pageType = 'view'
        }
        console.log(this.pageType, '====pageType');

        await this.$api['taskManager.taskFormdataList']({ actOrTaskFormId: this.item.name, formId: this.item.formId }).then(res => {
          this.formCode = this.item.formCode
          this.formViewId = res[0] ? res[0].ID : ''
          this.timeKey = new Date().getTime()
        })
        if (this.formViewId) {
          this.$api['taskManager.queryFrontInfo']({ actOrTaskFormId: this.item.name, formDataId: this.formViewId }).then(res => {
            if (res && res[0]) {
              this.formName = res[0].formName ? res[0].formName : ''
              this.selectFormDataId = res[0].formDataId ? res[0].formDataId : ''
              this.selectFormCode = res[0].formCode ? res[0].formCode : ''
            }
          })
        }
      }
    },
    selectBeforeTaskFun () {
      this.drawerVisible = true
    },
    onDrawerClose () {
      this.drawerVisible = false
      this.viewDrawerVisible = false
    },
    handleOk (rows, treeNode) {
      if (rows && rows.length) {
        this.frontFormIds = [treeNode.data.id]
        this.frontDataIds = rows.map(el => el.ID)
        this.formName = treeNode.label
        this.selectFormDataId = this.frontDataIds[0]
      }
      this.onDrawerClose()
    },
    viewForm () {
      this.viewDrawerVisible = true
    }
  },
}

</script>
<style lang='scss' scoped>
.single-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 999;
}
</style>