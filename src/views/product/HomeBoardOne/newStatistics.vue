<template>
  <div class="new-statistics">
    <PendingPropertyRepair />
  </div>
</template>

<script>
import PendingPropertyRepair from './components/PendingPropertyRepair.vue'

export default {
  name: 'NewStatistics',
  components: {
    PendingPropertyRepair
  }
}
</script>

<style lang="scss" scoped>
.new-statistics {
  height: 100%;
}

::v-deep .pending-property-repair {
  width: 100%;
  height: 100%;
}
</style>
