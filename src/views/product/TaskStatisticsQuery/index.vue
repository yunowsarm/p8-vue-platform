<script>
import { P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree } from 'p8-components-ui'
import { selectGenerateTree } from '@/utils/common'
import List from './list.vue'

export default {
  name: 'TaskStatisticsQuery',
  components: {
    List,
    NormalLayout,
    CommonTree
  },
  data() {
    return {
      renderKey: new Date().getTime(),
      treeSettingsParams: {
        optionLabelCol: 'NAME',
        optionPidCol: 'PARENTID',
        optionValueCol: 'ID',
        reportSqlId: 'aabf0802a94381c1a74a6d11cecf3b37'
      },
      treeData: [], // 树形数据
      defaultExpandedKeys: [], // 默认展开的节点
      projectId:''
    }
  },
  activated() {
    this.$refs.ganttList.$refs.planGantt.refreshGanttData()
  },
  created() {
    this.getTreeData(this.treeSettingsParams)
  },
  methods: {
    // 获取树形数据
    async getTreeData(treeSettingsParams) {
      const res = await this.$api['desLayout.execute']({ id: treeSettingsParams.reportSqlId })
      const config = {
        labelCol: treeSettingsParams.optionLabelCol,
        valueCol: treeSettingsParams.optionValueCol,
        pidCol: treeSettingsParams.optionPidCol
      }
      // 获取动态数据的参数映射所有列
      this.treeData = selectGenerateTree(res, JSON.stringify(config))
      this.getDefaultExpandedKeys(this.treeData)
    },
    // 展开所有树形数据
    getDefaultExpandedKeys(data) {
      data.forEach((item) => {
        if (item.children && item.children.length > 0) {
          this.defaultExpandedKeys.push(item.id)
          this.getDefaultExpandedKeys(item.children)
        }
      })
    },
    // 树形数据选中事件
    onSelect(data,node) {
      if(!!node && node.level === 1) {
        this.projectId = ''
      }else{
        this.projectId = data.ID
      }
      this.renderKey = new Date().getTime()
    }
  }
}
</script>

<template>
  <normal-layout :header-visible="false" :split-layout="true">
    <template #west>
      <common-tree :default-expanded-keys="defaultExpandedKeys" :default-expand-all="false" :data="treeData" ref="commonTree" @select="onSelect"></common-tree>
    </template>
    <template #center>
      <list :key='renderKey' ref='ganttList' :project-id="projectId"></list>
    </template>
  </normal-layout>
</template>

<style scoped lang="scss">
::v-deep .icon-zuozhedie{
  z-index: 1 !important;
}
</style>
