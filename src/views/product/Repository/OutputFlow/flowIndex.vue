<template>
  <div style="height:100%;position:relative">
    <el-tabs v-model="defaultActiveKey"
             class="flowTopTabs"
             @tab-click="triggerChange">
      <el-tab-pane label="默认模式"
                   name="first">
        <div class="wrap"
             v-if="defaultActiveKey == 'first'">
          <normal-layout :headerVisible="false"
                         :splitDefaultLeftWidth="50"
                         :normalLayout="normalLayout">
            <template #west>
              <activityTree ref="activityTree"
                            class="left-container"
                            :activity-info-id="activityInfoId"
                            v-if="triggerVal"
                            @taskSelected="selectTask"
                            @importExcel="importTask"
                            @refrshDes="refrshDes"
                            @remove-task="removeTask">
              </activityTree>
            </template>
            <template #center>
              <el-tabs v-model="describeKey"
                       ref="tab"
                       tab-position="left"
                       class="flowTabs"
                       style="height: 100%;"
                       @tab-click="onSelect"
                       v-if="triggerVal">
                <el-tab-pane name="describeKey">
                  <span slot="label">
                    <div style="display: flex; align-items: center"><i class="p8 icon-jindu"></i><span style="margin-left: 4px">活动描述</span></div>
                  </span>

                </el-tab-pane>
                <el-tab-pane name="inputKey">
                  <span slot="label">
                    <div style="display: flex; align-items: center"><i class="p8 icon-shuruyaoqiu"></i><span style="margin-left: 4px">输入</span></div>
                  </span>

                </el-tab-pane>
                <el-tab-pane name="outputKey">
                  <span slot="label">
                    <div style="display: flex; align-items: center"><i class="p8 icon-shuchuyaoqiu"></i><span style="margin-left: 4px">输出</span></div>
                  </span>

                </el-tab-pane>
                <el-tab-pane name="specialKey">
                  <span slot="label">
                    <div style="display: flex; align-items: center"><i class="p8 icon-tebieshuoming"></i><span style="margin-left: 4px">特别说明</span></div>
                  </span>

                </el-tab-pane>
              </el-tabs>
              <div class="formEdit"
                   :key="describeRefrshKey">
                <keep-alive>
                  <describe-edit @saveSuccess="saveCallback"
                                 @saveAll="saveAll"
                                 ref="describeEdit"
                                 :activityInfoId="activityId"
                                 :teamId="teamId"
                                 :rootId="activityInfoId"
                                 :colLayoutClassify="colLayoutClassify"
                                 v-show="'describeKey' == activeKey && activityId"></describe-edit>
                </keep-alive>
                <keep-alive>
                  <input-edit @saveSuccess="saveCallback"
                              @saveAll="saveAll"
                              ref="inputEdit"
                              :activityInfoId="activityId"
                              v-show="'inputKey' == activeKey && activityId"></input-edit>
                </keep-alive>
                <keep-alive>
                  <output-edit @saveSuccess="saveCallback"
                               @saveAll="saveAll"
                               ref="outputEdit"
                               :activityInfoId="activityId"
                               v-show="'outputKey' == activeKey && activityId"></output-edit>
                </keep-alive>
                <keep-alive>
                  <special-edit @saveSuccess="saveCallback"
                                @saveAll="saveAll"
                                ref="specialEdit"
                                :activityInfoId="activityId"
                                v-show="'specialKey' == activeKey && activityId"></special-edit>
                </keep-alive>
              </div>
            </template>
          </normal-layout>
          <div class="footer"><el-button plain
                       @click="$emit('close')">取消</el-button><el-button type="primary"
                       @click="saveAll"
                       style="margin-right: 20px;">保存</el-button></div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="图形模式"
                   name="second">
        <graphics-mode :teamId="teamId"
                       v-if="defaultActiveKey == 'second'"
                       :activityInfoId="activityInfoId">
        </graphics-mode>
      </el-tab-pane>
    </el-tabs>

    <div>
      <common-drawer v-if="excelDrawer"
                     :title="excelTitle"
                     :drawerConfig="drawerConfig"
                     :visible="excelDrawer"
                     @close="onExcelClose">
        <template #drawer>
          <import-excel @saveSuccess="importExcelClosed"
                        :task-id="selectTaskId"
                        :output-request="excelImportData"></import-excel>
        </template>
      </common-drawer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flowTopTabs ::v-deep .normal-center {
  position: relative;
}
.secret_level {
  position: absolute;
  right: 20px;
  top: 15px;
  z-index: 9;
  font-weight: bolder;
  // top: 50%;
  // transform: translateY(-50%);
  color: red;
  font-size: larger;
}
.table-page-search-wrapper .ant-form-inline .ant-form-item {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  margin-bottom: 24px;
  margin-right: 0;
}
.table-page-search-wrapper .ant-form-inline .ant-form-item .ant-form-item-control-wrapper {
  -webkit-box-flex: 1;
  -ms-flex: 1 1;
  flex: 1 1;
  display: inline-block;
  vertical-align: middle;
}
.left-container {
  padding-left: 10px;
  overflow: hidden;
  position: relative;
  height: 100%;
}
.flowTopTabs .el-tabs__content {
  background-color: rgba(243, 245, 248, 0.9);
}
.flowTopTabs {
  .splitBtn {
    display: none;
  }
  height: 100%;
  .normal-layout {
    // box-shadow: 4px 4px 8px #bfbdbd54;
    height: calc(100% - 80px);
    padding: 0;
  }
  .wrap {
    height: 100%;
    .footer {
      width: 100%;
      height: 50px;
      line-height: 50px;
      text-align: right;
      background: #fff;
    }
  }
  > .el-tabs__header.is-top {
    height: 42px;
  }
  > .el-tabs__content {
    height: calc(100% - 43px);
    > .el-tab-pane {
      height: 100%;
    }
  }
}
.normal-center {
  position: relative;
}
.flowTabs {
  width: 120px !important;
  display: inline-block;
  vertical-align: top;
  .el-tabs__item.is-active {
    color: #1890ff;
  }
  .el-tabs__nav-wrap.is-left::after {
    width: 0;
  }
  .el-tabs__nav {
    border-right: 2px solid #e4e7ed;
  }
  .el-tabs__active-bar {
    background: #1890ff;
  }
  .el-tabs__active-bar.is-left {
    right: -2px;
  }
  > .el-tabs__header.is-top {
    height: 42px;
  }
  .el-tabs__content {
    height: calc(100% - 43px);
  }
  .el-tab-pane {
    height: 100%;

    > div {
      height: 100%;
    }
  }
}
.formEdit {
  width: calc(100% - 125px);
  height: 100%;
  display: inline-block;
  vertical-align: top;
  // position: relative;
}
</style>
<script>
import { Tabs, TabPane, P8NormalLayoutV1 as NormalLayout, P8Drawer as CommonDrawer } from 'p8-components-ui'

import ActivityTree from './activityTree'
import ImportExcel from './Components/importExcel'
import GraphicsMode from './graphicsMode.vue'

import DescribeEdit from './Components/describeEdit'
import InputEdit from './Components/inputEdit'
import SpecialEdit from './Components/specialEdit'
import OutputEdit from './Components/outputEdit'
export default {
  name: 'FlowManager',
  components: {
    NormalLayout,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'graphics-mode': GraphicsMode,
    ActivityTree,
    DescribeEdit,
    ImportExcel,
    InputEdit,
    SpecialEdit,
    CommonDrawer,
    OutputEdit
  },
  props: {
    row: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      activityInfoId: '',
      teamId: '',
      secretLevel: '内部',
      excelTitle: '产出流程Excel导入',
      activeKey: 'describeKey',
      describeKey: 'describeKey',
      specialKey: 'specialKey',
      outputKey: 'outputKey',
      inputKey: 'inputKey',
      defaultActiveKey: 'first',
      colLayoutClassify: 'doubleCol',
      triggerVal: true,
      excelDrawer: false,
      activityId: '',
      loadTaskUrl: '',
      selectTaskId: '',
      tasks: {
        data: []
      },
      messages: [],
      excelImportData: [
        {
          attId: '2',
          attFilePath: 'Excel产出流程导入模板.xlsx',
          attFileName: 'Excel产出流程导入模板',
          descriptionStr: '按照大纲级别，将文档中的任务导入为选中任务的下级任务。'
        }
      ],
      normalLayout: {
        west: {
          xs: 12, sm: 12, md: 12, lg: 12, xl: 12
        },
        center: {
          xs: 12, sm: 12, md: 12, lg: 12, xl: 12
        }
      },
      drawerConfig: { /// z-index
        destroyOnClose: true,
        modal: false,
        appendToBody: true,
        wrapperClosable: true
      },
      describeRefrshKey: new Date().getTime()
    }
  },
  created () {
    if (this.row.length && this.row.length > 0) {
      this.teamId = this.row[0].KTEAMSID
      this.activityInfoId = this.row[0].ID
    }
  },
  methods: {
    refrshDes () {
      this.describeRefrshKey = new Date().getTime()
    },
    async saveAll (e) {
      if (this.activityId) {
        await this.saveParams()
        this.$message({ type: 'success', message: '保存成功' })
      } else {
        this.$message({
          message: '请选择保存信息对应的活动！',
          type: 'error'
        })
      }
    },
    async saveParams () {
      let that = this
      that.flag = false
      await that.$refs.describeEdit.$refs.form.validate().then((queryParams) => {
        let saveParams = { ...queryParams, ...that.$refs.describeEdit.$refs.form.otherParam }
        that.$api[that.$refs.describeEdit.saveApi](saveParams).then(res => {
          that.$refs.activityTree.updateTaskName(res)
        })
      })
      await that.$refs.inputEdit.$refs.form.validate().then((queryParams) => {
        let saveParams = { ...queryParams, ...that.$refs.inputEdit.$refs.form.otherParam }
        if (!saveParams.uploadFiles.length && !saveParams.describes) {
          return
        }
        that.$api[that.$refs.inputEdit.saveApi](saveParams)
      })
      await that.$refs.outputEdit.$refs.form.validate().then((queryParams) => {
        let saveParams = { ...queryParams, ...that.$refs.outputEdit.$refs.form.otherParam }
        if (!saveParams.uploadFiles.length && !saveParams.describes) {
          return
        }
        that.$api[that.$refs.outputEdit.saveApi](saveParams)
      })
      await that.$refs.specialEdit.$refs.form.validate().then((queryParams) => {
        let saveParams = { ...queryParams, ...that.$refs.specialEdit.$refs.form.otherParam }
        that.$api[that.$refs.specialEdit.saveApi](saveParams)
      })
      this.describeRefrshKey = new Date().getTime()
    },
    destructorDp () {
      // this.$refs.activityTree.destructorDp()
    },
    triggerChange () {
      if (this.defaultActiveKey === 'first') {
        this.triggerVal = true
      } else {
        this.triggerVal = false
      }
    },
    // // tabs页选中
    // change (activeKey) {
    //   this.activeKey = activeKey
    // },
    // tabs页切换
    onSelect (tab, event) {
      this.activeKey = tab.name
      if (!this.activityId) {
        this.$message({
          type: 'error',
          message: '请选择活动节点'
        })
      }
      // this.$refs.tab.refresh()
    },
    updateActivity (record) {

    },
    saveCallback (res) {
      if (res) {
        this.$refs.activityTree.updateTaskName(res)
      }
    },
    removeActivity (record) {
      let that = this
      that.$confirm({
        title: '确认',
        content: '是否确定要删除该活动？',
        onOk () {
          //   return new Promise((resolve, reject) => {
          //     removeUserAPI({ entityId: record.id }).then(res => {
          //       if (res.data && res.data.result == 'success') {
          //         that.$refs.tab.refresh()
          //         resolve()
          //       } else {
          //         reject('删除活动错误！')
          //       }
          //     })
          //   }).catch(() => console.error('Oops errors!'))
        },
        onCancel () { }
      })
    },
    selectTask (activityId) {
      this.activityId = activityId
      // 刷新页面
      if (this.activeKey && this.activeKey === 'describeKey') {
        this.activeKey = ''
        this.$nextTick(() => (this.activeKey = 'describeKey'))
      }
    },
    importTask (activityId) {
      this.selectTaskId = activityId
      this.excelDrawer = true
    },
    removeTask () {
      this.activityId = ''
    },
    addMessage (message) {
      this.messages.unshift(message)
      if (this.messages.length > 40) {
        this.messages.pop()
      }
    },
    logTaskUpdate (id, mode, task) {
      let text = (task && task.text ? ` (${task.text})` : '')
      let message = `Task ${mode}: ${id} ${text}`
      this.addMessage(message)
    },
    logLinkUpdate (id, mode, link) {
      let message = `Link ${mode}: ${id}`
      if (link) {
        message += ` ( source: ${link.source}, target: ${link.target} )`
      }
      this.addMessage(message)
    },
    onExcelClose () {
      this.excelDrawer = false
    },
    importExcelClosed () {
      this.excelDrawer = false
      this.$refs.activityTree.initGantt(this.activityInfoId)
    }
  }
}

</script>
