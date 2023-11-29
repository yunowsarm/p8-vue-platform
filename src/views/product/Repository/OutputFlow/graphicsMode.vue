<template>
  <div style="height:100%;width:100%;"
       class="graphicsMode">
    <list-layout :headerVisible="false">
      <template #center>
        <antv :acivityData="acivityData"
              ref="antv"
              :edgeList="edgeList"
              @openActivityInfo="openActivityInfo"
              @nodeClick="nodeClick"></antv>
      </template>
      <template #drawer-panel>
        <common-drawer title="活动信息设置"
                       :visible="visibleModel"
                       :show-handle-btn="false"
                       size="50%"
                       @close="onModelClose">
          <template #drawer>
            <el-tabs v-model="describeKey"
                     ref="tab"
                     tab-position="left"
                     class="flowTabs"
                     style="height: calc(100% - 50px);"
                     @tab-click="onSelect">
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
                <describe-edit ref="describeEdit"
                               :activityInfoId="activityId"
                               :teamId="teamId"
                               :rootId="activityInfoId"
                               colLayoutClassify="doubleCol"
                               v-show="'describeKey' == activeKey && activityId"></describe-edit>
              </keep-alive>
              <keep-alive>
                <input-edit ref="inputEdit"
                            :activityInfoId="activityId"
                            v-show="'inputKey' == activeKey && activityId"></input-edit>
              </keep-alive>
              <keep-alive>
                <output-edit ref="outputEdit"
                             :activityInfoId="activityId"
                             v-show="'outputKey' == activeKey && activityId"></output-edit>
              </keep-alive>
              <keep-alive>
                <special-edit ref="specialEdit"
                              :activityInfoId="activityId"
                              v-show="'specialKey' == activeKey && activityId"></special-edit>
              </keep-alive>
            </div>
            <div class="footer"><el-button plain
                         @click="$emit('close')">取消</el-button><el-button type="primary"
                         @click="saveAll"
                         style="margin-right: 20px;">保存</el-button></div>
          </template>
        </common-drawer>
      </template>
    </list-layout>
  </div>
</template>
<script>
import DescribeEdit from './Components/describeEdit'
import inputEdit from './Components/inputEdit'
import outputEdit from './Components/outputEdit'
import specialEdit from './Components/specialEdit'
import { P8ListLayout as ListLayout, P8Drawer as CommonDrawer } from 'p8-components-ui'
import antv from './antv'
export default {
  name: 'GraphicsMode',
  components: {
    'describe-edit': DescribeEdit,
    'input-edit': inputEdit,
    'output-edit': outputEdit,
    'special-edit': specialEdit,
    ListLayout,
    CommonDrawer,
    antv
  },
  props: {
    activityInfoId: {
      type: String,
      default: ''
    },
    teamId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      visibleModel: false,
      activityId: '',
      acivityData: [],
      activeKey: 'describeKey',
      describeKey: 'describeKey',
      describeRefrshKey: new Date().getTime(),
      edgeList: []
    }
  },
  created () {
    this.getData()
  },
  methods: {
    getData () {
      this.$api['OutputFlow.loadModeData']({ activityInfoId: this.activityInfoId }).then(res => {
        this.edgeList = res.link
        this.getXY(res.node, 'parent', 'key')
        this.acivityData = res.node
      })
    },
    getXY (arr, parent, key) {
      function generateTree (treeData, pidName, idName, custompId) {
        if (!custompId) custompId = '' //
        // // 把跟节点首先放进数组
        const tmpTree = treeData.filter((node) => !node[pidName] || node[pidName] === custompId)
        // 递归生成节点及子节点数据
        const findChildren = (tree) => {
          tree.forEach((node) => {
            let index = 0
            let arr = treeData.filter((cNode) => {
              if (cNode[pidName] === node[idName]) {
                cNode.x = index
                if (cNode.level > 2) {
                  cNode.x = node.x
                }
                index++
                return true
              }
            })
            if (arr.length) {
              findChildren(arr)
            }
          })
        }
        findChildren(tmpTree)
      }
      return generateTree(arr, parent, key)
    },
    nodeClick (cell) {
      this.activityId = cell.id
      this.visibleModel = true
    },
    openActivityInfo (type, id) {
      this.visibleModel = true
    },
    onSelect (tab, event) {
      this.activeKey = tab.name
    },
    onModelClose () {
      this.visibleModel = false
    },
    async saveAll (e) {
      if (this.activityId) {
        await this.saveParams()
        this.$message({ type: 'success', message: '保存成功' })
        this.visibleModel = false
        this.$api['OutputFlow.loadModeData']({ activityInfoId: this.activityInfoId }).then(res => {
          this.$refs.antv.graph.clearCells()
          this.acivityData = res.node
          this.edgeList = res.link
        })
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
          // that.$refs.activityTree.updateTaskName(res)
        })
      })
      await that.$refs.inputEdit.$refs.form.validate().then((queryParams) => {
        let saveParams = { ...queryParams, ...that.$refs.inputEdit.$refs.form.otherParam }
        that.$api[that.$refs.inputEdit.saveApi](saveParams)
      })
      await that.$refs.outputEdit.$refs.form.validate().then((queryParams) => {
        let saveParams = { ...queryParams, ...that.$refs.outputEdit.$refs.form.otherParam }
        that.$api[that.$refs.outputEdit.saveApi](saveParams)
      })
      await that.$refs.specialEdit.$refs.form.validate().then((queryParams) => {
        let saveParams = { ...queryParams, ...that.$refs.specialEdit.$refs.form.otherParam }
        that.$api[that.$refs.specialEdit.saveApi](saveParams)
      })
      this.describeRefrshKey = new Date().getTime()
    },
  }
}
</script>
<style lang="scss" scoped>
.header {
  display: flex;
  .text {
    margin: 10px;
    color: #1890ff;
    font-size: 14px;
    cursor: pointer;
  }
}

.graphicsMode ::v-deep .list-layout {
  margin: 10px;
  height: calc(100% - 20px);
  .list-main {
    padding: 0;
  }
}
.flowTabs {
  width: 120px !important;
  display: inline-block;
  vertical-align: top;
  height: calc(100% - 60px);
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
  height: calc(100% - 60px);
  display: inline-block;
  vertical-align: top;
}
.footer {
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: right;
  background: #fff;
}
</style>
