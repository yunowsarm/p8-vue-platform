<!-- 首页待办统计容器：并排展示物业报修和园区帖子待审核数量。 -->
<template>
  <div class="new-statistics">
    <PendingPropertyRepair />
    <PendingParkTopicReview />
  </div>
</template>

<script>
import PendingPropertyRepair from './components/PendingPropertyRepair.vue'
import PendingParkTopicReview from './PendingParkTopicReview.vue'

export default {
  name: 'NewStatistics',
  components: {
    PendingParkTopicReview,
    PendingPropertyRepair
  }
}
</script>

<style lang="scss" scoped>
.new-statistics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  height: 100%;
}

::v-deep .pending-property-repair,
::v-deep .pending-park-topic-review {
  width: 100%;
  height: 100%;
}
</style>
