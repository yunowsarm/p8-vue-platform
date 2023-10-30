<template>
  <div class="container">
    <div class="wrap">
      <i class="el-icon-plus icon" v-if="isLock" @click="addTabs" style="right: 45px"></i>
      <i :class="icon" class="icon" @click="openLock"></i>
    </div>
    <el-tabs v-model="editableTabsValue" type="card" :closable="isLock" @tab-remove="removeTab">
      <template v-for="(item, index) in editableTabs">
        <el-tab-pane :label="item.name" :name="item.name" :key="index">
          <span slot="label">{{ item.name }} <i v-if="isLock" class="el-icon-edit-outline" style="font-size: 12px" @click="modify(item.name, index)"></i></span>
          <component v-if="isLock" :key="index" :record="{ widgets: item.deepCopyWidget }" ref="kanbanEdit" class="component" :is="hankanbanEdit" />
          <component
            v-else
            ref="kanbanView"
            class="component"
            :key="index"
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
            :is="kanbanView"
          />
        </el-tab-pane>
      </template>
    </el-tabs>
    <add-tabs v-if="addTabsVisible" :name="name" :title="title" :visible="addTabsVisible" @handleCancel="addTabsVisible = false" @handleOk="handleOk"> </add-tabs>
  </div>
</template>
<script>
import { P8ListLayout as ListLayout, P8Dialog as CommonDialog } from 'p8-components-ui'
import SearchFormList from '@/views/Framework/ComponentsMananger/Grid/Components/intellSearchFormList'
import addTabs from './Components/addTabs'
export default {
  name: 'Index',
  components: {
    CommonDialog,
    addTabs,
    ListLayout,
    SearchFormList
  },
  provide() {
    return {
      provideParams: this.provideParams
    }
  },
  data() {
    return {
      isLock: false,
      icon: 'el-icon-lock',
      editableTabs: [{ name: '选项页一' }, { name: '选项页二' }],
      editableTabsValue: '',
      kanbanData: { deepCopyFormData: {} },
      addTabsVisible: false,
      searchFormConfig: [],
      provideParams: {
        searchParams: {}
      }
    }
  },
  computed: {
    hankanbanEdit() {
      return () => import('@/views/Dashboard/Components/edit')
    },
    kanbanView() {
      return () => import('@/views/Dashboard/kanbanView')
    }
  },
  mounted() {
    const that = this
    this.$api['kanbanView.getHomeBoard']({}).then((res) => {
      if (res && res.length) {
        that.editableTabs = []
        res.forEach((el, index) => {
          const deepCopyWidget = []
          if (el.widgets && el.widgets.length) {
            el.widgets.forEach((el) => {
              deepCopyWidget.push(JSON.parse(el.layout))
            })
          }
          that.editableTabs[index] = {
            deepCopyWidget: deepCopyWidget,
            name: el.name
          }
        })
      }
      if (that.editableTabs && that.editableTabs.length > 0) {
        that.editableTabsValue = that.editableTabs[0].name
      }
    })
  },
  methods: {
    openLock() {
      if (this.$refs.kanbanEdit && this.$refs.kanbanEdit.length > 0) {
        // let index = this.editableTabs.findIndex(el => { return el.name === this.editableTabsValue })
        this.editableTabs.forEach((el, index) => {
          this.editableTabs[index].deepCopyWidget = this.$refs.kanbanEdit[index].getData()
        })
      }
      this.isLock = !this.isLock
      this.icon = this.isLock ? 'el-icon-unlock' : 'el-icon-lock'
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
        saveList.push({ widgets: list, name: el.name, queryConfig: '', style: '', describe: '', indexNo: index })
        // }
      })
      const saveParmars = {
        boards: saveList
      }
      if (!this.isLock) {
        this.$api['kanbanView.saveHomeBoard'](saveParmars).then((res) => {
          if (res) {
            this.$message({ type: 'success', message: '保存成功' })
          }
        })
      }
    },
    removeTab(targetName) {
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
    addTabs() {
      this.addTabsVisible = true
      this.name = ''
      this.index = null
      this.title = '新增标签页'
    },
    modify(name, index) {
      this.addTabsVisible = true
      this.name = name
      this.index = index
      this.title = '修改标签页名称'
    },
    handleOk(name) {
      if (this.name) {
        this.editableTabs[this.index].name = name
      } else {
        this.editableTabs.push({
          name: name
        })
      }
      this.editableTabsValue = name
      this.addTabsVisible = false
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
</style>
