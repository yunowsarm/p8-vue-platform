/* eslint-disable vue/no-unused-components */
<template>
  <common-tabs :tabsData="tabsData"
               height="auto"
               :activeTabs="activeTabs"
               @tab-click="onSelect">
    <template #normal>
      <normal v-if="activeTabs === 'normal'"
              :isthematicPlan='false'></normal>
    </template>
    <template #overallPlanning>
      <overall-planning v-if="activeTabs === 'overallPlanning'"
                        :isthematicPlan='false'></overall-planning>
    </template>
  </common-tabs>
</template>

<script>
import { P8Tabs as CommonTabs } from 'p8-components-ui'
import normal from './Components/normal'
import overallPlanning from './Components/overallPlanning'

export default {
  name: 'ProductionPlan',
  components: {
    normal,
    overallPlanning,
    CommonTabs

  },
  data () {
    return {
      activeTabs: 'normal',
      tabsData: [
        {
          label: '已发布',
          name: 'normal',
          value: 0
        },
        {
          label: '统筹中',
          name: 'overallPlanning'
        }
      ]
    }
  },
  mounted () {
  },
  methods: {
    onSelect (tab, event) {
      this.activeTabs = tab.name
    }
  }
}
</script>

<style lang="scss" scoped>
#elTabsDiv {
  height: 100%;
}
</style>
