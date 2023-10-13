/* eslint-disable vue/no-unused-components */
<template>
  <el-tabs height="100%"
           v-model="activeTabs"
           @tab-click="onSelect">
    <el-tab-pane label="已发布"
                 name="normal">
      <normal v-if="activeTabs === 'normal'"
              :isthematicPlan='false'></normal>
    </el-tab-pane>
    <el-tab-pane label="统筹中"
                 name="overallPlanning">
      <overall-planning v-if="activeTabs === 'overallPlanning'"
                        :isthematicPlan='false'></overall-planning>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import normal from './Components/normal'
import overallPlanning from './Components/overallPlanning'

export default {
  name: 'ProductionPlan',
  components: {
    normal,
    overallPlanning

  },
  data () {
    return {
      activeTabs: 'normal'
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
.main .scroll-area .main-router {
  height: 99%;
}
</style>
