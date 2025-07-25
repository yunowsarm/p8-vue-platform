<script>
import { selectGenerateTree } from '@/utils/common'
import List from './list.vue'

export default {
  name: 'TaskStatistics',
  components: {
    List
  },
  data () {
    return {
      treeConfig: {
        'current-node-key': ''
      },
      renderKey: new Date().getTime(),
      treeSettingsParams: {
        optionLabelCol: 'NAME',
        optionPidCol: 'PARENTID',
        optionValueCol: 'ID',
        reportSqlId: 'aabf0802a94381c1a74a6d11cecf3b37'
      },
      treeData: [], // 树形数据
      defaultExpandedKeys: [], // 默认展开的节点
      projectId: ''
    }
  },
  // activated() {
  //   console.log('activated')
  //   // this.renderKey = new Date().getTime()
  //   this.$refs.ganttList.$refs.planGantt.refreshGanttData()
  // },
  created () {
    this.getTreeData(this.treeSettingsParams)
  },
  methods: {
    // 获取树形数据
    async getTreeData (treeSettingsParams) {
      const res = await this.$api['desLayout.execute']({ id: treeSettingsParams.reportSqlId })
      const config = {
        labelCol: treeSettingsParams.optionLabelCol,
        valueCol: treeSettingsParams.optionValueCol,
        pidCol: treeSettingsParams.optionPidCol
      }
      // 获取动态数据的参数映射所有列
      this.treeData = selectGenerateTree(res, JSON.stringify(config))
      this.treeConfig['current-node-key'] = this.treeData[0].ID
      this.$nextTick(() => {
        this.$refs.commonTree.$refs.tree.setCurrentKey(this.treeData[0].ID, true)
        // this.onSelect(this.treeData[0])
      })
      // this.getDefaultExpandedKeys(this.treeData)
    },
    // // 展开所有树形数据
    // getDefaultExpandedKeys(data) {
    //   data.forEach((item) => {
    //     if (item.children && item.children.length > 0) {
    //       this.defaultExpandedKeys.push(item.id)
    //       this.getDefaultExpandedKeys(item.children)
    //     }
    //   })
    // },
    // 树形数据选中事件
    onSelect (data, node) {
      if (!!node && node.level === 1) {
        this.projectId = ''
      } else {
        this.projectId = data.ID
      }
      this.renderKey = new Date().getTime()
    }
  }
}
</script>

<template>
  <list :key='renderKey'
        ref='ganttList'
        :project-id="projectId"></list>
</template>

<style scoped lang="scss">
::v-deep .icon-zuozhedie {
  z-index: 1 !important;
}
</style>
