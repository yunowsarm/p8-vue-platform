<template>
  <div style="width: 100%">
    <div style='width: 50%; position: relative;;float:left'>
     <plan-attribute :task-id='selectTaskId1'
                      :versionId='planVersionId1'></plan-attribute>
    </div>
    <div style='width: 50%; position: relative;;float:left'>
      <plan-attribute :task-id='selectTaskId2'
                      :versionId='planVersionId2'
                      :versionType="versionType"></plan-attribute>
    </div>
 </div>
</template>

<style lang="scss">

</style>
<script>

import PlanAttribute from './Components/planAttribute'

export default {
  name: 'planInfoList',
  props: {
    planVersionId1: {
      type: String,
      default: null
    },
    planVersionId2: {
      type: String,
      default: null
    },
    selectTaskId1: {
      type: String,
      default: null
    },
    selectTaskId2: {
      type: String,
      default: null
    },
    versionType: {
      type: String,
      default: null
    }
  },
  components: {
    PlanAttribute
  },
  data () {
    return {

    }
  },
  computed: {

  },
  mounted () {

  },
  methods: {

  }
}
</script>
