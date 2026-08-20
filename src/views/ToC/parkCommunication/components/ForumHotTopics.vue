<template>
  <aside class="discover-panel" aria-label="论坛推荐">
    <section class="side-section">
      <div class="panel-title"><h2>热门讨论</h2><i class="el-icon-top"></i></div>
      <button v-for="(topic, index) in topics" :key="topic.id" type="button" class="rank-item" @click="$emit('open-topic', topic)">
        <b :class="{ highlight: index < 3 }">0{{ index + 1 }}</b><span>{{ topic.title }}</span><em>{{ topic.replyCount }}</em>
      </button>
      <el-empty v-if="!topics.length" description="暂无讨论" :image-size="54" />
    </section>
  </aside>
</template>

<script>
export default {
  name: 'ForumHotTopics',
  props: { topics: { type: Array, default: () => [] } }
}
</script>

<style scoped>
.discover-panel { min-width: 0; padding: 14px 10px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; }
.panel-title { margin: 0 6px 10px; display: flex; align-items: center; justify-content: space-between; }
.panel-title h2 { margin: 0; font-size: 15px; }
.panel-title i { color: #909399; font-size: 13px; }
.rank-item { width: 100%; min-height: 44px; padding: 0 5px; display: flex; align-items: center; gap: 8px; border: 0; background: transparent; color: #4e6078; text-align: left; cursor: pointer; }
.rank-item b { width: 20px; color: #a7b1bf; font-size: 12px; font-style: italic; }
.rank-item b.highlight { color: #e17a45; }
.rank-item span { flex: 1; overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.rank-item em { color: #a0acbc; font-size: 11px; font-style: normal; }
.rank-item:hover span { color: #409eff; }
button:focus-visible { outline: 2px solid #409eff; outline-offset: 2px; }
@media (max-width: 1180px) { .discover-panel { display: none; } }
</style>
