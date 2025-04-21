<template>
  <div class="container">
    <div class="wrap">
      <i class="el-icon-plus icon"
         v-if="isLock"
         @click="addTabs"
         style="right: 45px"></i>
      <i :class="icon"
         class="icon"
         @click="openLock"></i>
    </div>
    <el-tabs v-model="editableTabsValue"
             type="card"
             :closable="isLock"
             @tab-remove="removeTab"
             @tab-click="handleTabsClick"
             :key="timeKey">
      <template v-for="(item, index) in editableTabs">
        <el-tab-pane :label="item.name"
                     :name="item.name"
                     :key="item.name">
          <span slot="label"> {{ item.name }}<i v-if="isLock"
               class="el-icon-edit-outline"
               style="font-size: 12px"
               @click="modify(item.name, index, item.indexNo)"></i>
            <el-popover v-if="item.visible"
                        class="elPopover"
                        placement="top"
                        trigger="manual"
                        v-model="visible"
                        width="140">
              <span style="display:inline-block;padding: 3px 0;">布局有更新,<span style="color: #259bd8;text-decoration: underline;cursor: pointer;"
                      @click="viewVlick(item.changeWidget, index)">点击同步</span></span>
              <i slot="reference"
                 v-if="item.visible && editableTabsValue == item.name"
                 class="el-icon-refresh"
                 style="font-size: 14px;margin-left: 5px;"></i>
            </el-popover>
          </span>
          <!-- 使用 v-if 判断当前页签是否为激活状态 -->
          <template v-if="editableTabsValue === item.name || isLock">
            <component v-if="isLock"
                       :key="index"
                       :record="{ widgets: item.deepCopyWidget }"
                       ref="kanbanEdit"
                       class="component"
                       :is="hankanbanEdit"
                       @saveTemplate="saveTemplate" />
            <component :key="dateTime"
                       v-else
                       ref="kanbanView"
                       class="component"
                       :headerVisible="false"
                       :id="''"
                       :code="''"
                       :render-data="[item.deepCopyFormData]"
                       :widget="item.deepCopyWidget"
                       :style-object="{}"
                       :row-height="50"
                       :margin="[5, 5]"
                       :padding="[5, 5]"
                       :is-static="true"
                       :is-design="false"
                       :is="kanbanView" />
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
    <add-tabs v-if="addTabsVisible"
              :name="name"
              :indexNo="indexNumber"
              :title="title"
              :visible="addTabsVisible"
              @handleCancel="addTabsVisible = false"
              @handleOk="handleOk"> </add-tabs>
    <view-change v-if="viewVisible"
                 title="查看"
                 :visible="viewVisible"
                 @handleCancel="viewVisible = false"
                 @handleOk="viewhandleOk"> </view-change>
  </div>
</template>
<script>
import { P8ListLayout as ListLayout, P8Dialog as CommonDialog } from 'p8-components-ui'
import SearchFormList from '@/views/Framework/ComponentsMananger/Grid/Components/intellSearchFormList'
import addTabs from './Components/addTabs'
import viewChange from './Components/viewChange'
import _ from 'lodash';
export default {
  name: 'Index',
  components: {
    CommonDialog,
    addTabs,
    ListLayout,
    SearchFormList,
    viewChange
  },
  provide () {
    return {
      provideParams: this.provideParams
    }
  },
  data () {
    return {
      dateTime: '',
      isLock: false,
      icon: 'el-icon-lock',
      editableTabs: [{ name: '选项页一' }, { name: '选项页二' }],
      editableTabsValue: '选项页一',
      kanbanData: { deepCopyFormData: {} },
      addTabsVisible: false,
      searchFormConfig: [],
      provideParams: {
        searchParams: {}
      },
      visible: false,
      timeKey: new Date().getTime(),
      viewVisible: false,
      newWidget: [],
      indexNumber: null
    }
  },
  computed: {
    hankanbanEdit () {
      return () => import('@/views/Dashboard/Components/edit')
    },
    kanbanView () {
      return () => import('@/views/Dashboard/kanbanView')
    }
  },
  watch: {
    editableTabsValue (val, oldVal) {
      let index = this.editableTabs.findIndex(item => item.name === val);
      let deepWidget = this.editableTabs[index]
      this.visible = false
      if (deepWidget.homePageId) {
        this.$api['kanbanView.getAllNoPage']({ id: deepWidget.homePageId }).then(res => {
          if (deepWidget.homePageVersion && res[0] && res[0].dataVersion && res[0].dataVersion !== deepWidget.homePageVersion) {
            this.editableTabs[index].visible = true

            this.timeKey = new Date().getTime()
            this.editableTabs[index].changeWidget = res[0].widgets.map(el => JSON.parse(el.layout))
            this.editableTabs[index].changeHomePageVersion = res[0].dataVersion
            setTimeout(() => {
              this.visible = true
            }, 500)
          }
        })
      }
    }
  },
  mounted () {
    const that = this
    this.$api['kanbanView.getHomeBoard']({}).then((res) => {
      if (res && res.length) {
        that.editableTabs = []
        res.forEach((el, index) => {
          const deepCopyWidget = []
          if (el.widgets && el.widgets.length) {
            el.widgets.forEach((el) => {
              deepCopyWidget.push({ ...JSON.parse(el.layout), isShow: el.isShow })
            })
          }
          that.editableTabs[index] = {
            deepCopyWidget: deepCopyWidget,
            name: el.name,
            homePageId: el.homePageId,
            homePageVersion: el.homePageVersion,
            visible: false,
            indexNo: el.indexNo
          }
        })
        // 对 editableTabs 根据 indexNo 进行排序
        that.editableTabs.sort((a, b) => a.indexNo - b.indexNo)
        if (that.editableTabs && that.editableTabs.length > 0) {
          that.editableTabsValue = that.editableTabs[0].name
        }
      }
    })
  },
  methods: {
    openLock () {
      this.isLock = !this.isLock
      this.icon = this.isLock ? 'el-icon-unlock' : 'el-icon-lock'
      if (!this.isLock) {
        if (this.$refs.kanbanEdit && this.$refs.kanbanEdit.length > 0) {
          this.editableTabs.forEach((el, index) => {
            this.editableTabs[index].deepCopyWidget = this.$refs.kanbanEdit[index].getData()
          })
        }
        const saveList = []
        this.editableTabs.forEach((el, index) => {
          const list = []
          // if (el.deepCopyWidget && el.deepCopyWidget.length) {
          el.deepCopyWidget.forEach((val) => {
            list.push({
              appId: val.component.dataviewId,
              layout: JSON.stringify(val),
              name: el.name,
              style: ''
            })
          })
          saveList.push({ widgets: list, name: el.name, queryConfig: '', style: '', describe: '', indexNo: el.indexNo, homePageId: el.homePageId ? el.homePageId : undefined, homePageVersion: el.homePageVersion })
          // }
        })
        if (saveList && saveList.length || !this.editableTabs.length) {
          const saveParmars = {
            boards: saveList
          }
          this.$api['kanbanView.saveHomeBoard'](saveParmars).then((res) => {
            if (res) {
              this.$message({ type: 'success', message: '保存成功' })
            }
          })
        }
      }
    },
    handleTabsClick (targetName) {
      this.editableTabsValue = targetName.name
    },
    removeTab (targetName) {
      const tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter((tab) => tab.name !== targetName)
    },
    addTabs () {
      this.addTabsVisible = true
      this.name = ''
      this.index = null
      this.indexNumber = this.editableTabs.length + 1
      this.title = '新增标签页'
    },
    modify (name, index, indexNo) {
      this.addTabsVisible = true
      this.name = name
      this.index = index
      this.indexNumber = indexNo
      this.title = '修改标签页'
    },
    handleOk (name, indexNumber) {
      if (this.title == '新增标签页') {
        if (this.editableTabs.some(tab => tab.name === name)) {
          this.$message.warning(`名称为${name}的标签页已存在，请勿重复添加`)
          return
        }
      }
      if (this.name) {
        this.editableTabs[this.index].name = name
        this.editableTabs[this.index].indexNo = indexNumber
      } else {
        this.editableTabs.push({
          name: name,
          indexNo: indexNumber
        })
      }
      // 对 editableTabs 根据 indexNo 进行排序
      this.editableTabs.sort((a, b) => a.indexNo - b.indexNo)
      this.editableTabsValue = name
      this.addTabsVisible = false
      this.timeKey = new Date().getTime()
    },
    saveTemplate (addArr) {
      let widgetList = addArr
      let errList = []
      if (widgetList && widgetList.length) {
        widgetList.forEach(widget => {
          const isNameExists = this.editableTabs.some(tab => tab.name === widget.name)
          if (!isNameExists) {
            const deepCopyWidget = []
            widget.widgets.forEach(el => {
              deepCopyWidget.push(JSON.parse(el.layout))
            })
            let index = this.editableTabs && this.editableTabs.length ? this.editableTabs[this.editableTabs.length - 1].indexNo + 1 : 1
            this.editableTabs.push({
              name: widget.name,
              deepCopyWidget: deepCopyWidget,
              homePageId: widget.id,
              indexNo: index
            })
          } else {
            // 可选：如果需要，可以在这里处理名称重复的情况，比如提示用户
            errList.push(widget.name)
          }
        })
        if (errList.length) {
          let names = errList.join(',')
          this.$message.warning(`名称为${names}的主页已存在，请勿重复添加`)
        }
      }
    },
    viewVlick (changeWidget, index) {
      // this.viewVisible = true
      this.editableTabs[index].deepCopyWidget = changeWidget
      this.editableTabs[index].visible = false
      // let saveList = []
      // let list = []
      // let el = this.editableTabs[index]
      // this.editableTabs[index].deepCopyWidget.forEach((val) => {
      //   list.push({
      //     appId: val.appId,
      //     layout: JSON.stringify(val),
      //     name: el.name,
      //     style: ''
      //   })
      // })
      const saveList = []
      this.editableTabs.forEach((el, index) => {
        const list = []
        // if (el.deepCopyWidget && el.deepCopyWidget.length) {
        el.deepCopyWidget.forEach((val) => {
          list.push({
            appId: val.component.dataviewId,
            layout: JSON.stringify(val),
            name: el.name,
            style: ''
          })
        })
        saveList.push({ widgets: list, name: el.name, queryConfig: '', style: '', describe: '', indexNo: el.indexNo, homePageId: el.homePageId ? el.homePageId : undefined, homePageVersion: el.changeHomePageVersion ? el.changeHomePageVersion : el.homePageVersion })
        // }
      })
      // saveList.push({ widgets: list, name: el.name, queryConfig: '', style: '', describe: '', indexNo: index, homePageId: el.homePageId ? el.homePageId : undefined, homePageVersion: el.changeHomePageVersion })
      if (saveList && saveList.length) {
        const saveParmars = {
          boards: saveList
        }
        this.$api['kanbanView.saveHomeBoard'](saveParmars).then((res) => {
          if (res) {
            this.$message({ type: 'success', message: '同步成功' })
          }
        })
        this.timeKey = new Date().getTime()
      }
    },
    viewhandleOk () {
      this.viewVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  overflow: hidden;
  .icon {
    position: absolute;
    right: 20px;
    top: 6px;
    z-index: 10;
    font-size: 18px;
    color: black;
  }
  ::v-deep .el-tabs__header {
    margin: 0;
  }
  ::v-deep .el-tabs__content {
    overflow: hidden;
  }
  ::v-deep .el-tabs {
    height: 100%;
  }
  ::v-deep .el-tabs--top .el-tabs__content .el-tab-pane {
    height: calc(100% - 10px);
  }
}
.elPopover {
  padding: 5px;
  min-width: 140px;
}
</style>
