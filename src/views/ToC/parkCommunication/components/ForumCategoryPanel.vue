<template>
  <aside class="board-panel" aria-label="论坛版块">
    <div class="panel-title"><h2>浏览版块</h2></div>
    <button type="button" class="board-item" :class="{ active: activeCategory === 'all' }" @click="$emit('select-category', 'all')">
      <i class="el-icon-collection"></i><span>全部动态</span><b>{{ topicTotal }}</b>
    </button>
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      class="board-item"
      :class="{ active: activeCategory === category.id }"
      @click="$emit('select-category', category.id)">
      <img v-if="isImageIcon(category.icon)" class="category-image" :src="category.icon" :alt="category.name" />
      <i v-else :class="categoryIcon(category)" :style="{ color: category.color }"></i>
      <span>{{ category.name }}</span>
    </button>
    <div class="panel-rule"><i class="el-icon-warning-outline"></i><p>请勿发布广告、隐私信息或不实内容。</p></div>
  </aside>
</template>

<script>
export default {
  name: 'ForumCategoryPanel',
  props: {
    activeCategory: { type: [String, Number], required: true },
    categories: { type: Array, default: () => [] },
    topicTotal: { type: Number, default: 0 },
    categoryIcon: { type: Function, required: true },
    isImageIcon: { type: Function, required: true }
  }
}
</script>

<style scoped>
.board-panel { min-width: 0; padding: 14px 10px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; }
.panel-title { margin: 0 6px 10px; display: flex; align-items: center; justify-content: space-between; }
.panel-title h2 { margin: 0; font-size: 15px; }
.board-item { width: 100%; min-height: 44px; padding: 0 10px; display: flex; align-items: center; gap: 9px; border: 0; border-radius: 4px; background: transparent; color: #606266; text-align: left; cursor: pointer; }
.board-item:hover, .board-item.active { background: #ecf5ff; color: #409eff; }
.board-item > i, .category-image { width: 18px; height: 18px; object-fit: contain; text-align: center; font-size: 17px; }
.board-item span { flex: 1; font-size: 13px; }
.board-item b { color: #909399; font-size: 12px; font-weight: 400; }
.panel-rule { margin: 16px 4px 0; padding: 12px; display: flex; gap: 7px; border-radius: 8px; background: #f5f7fa; color: #909399; font-size: 12px; line-height: 19px; }
.panel-rule i { margin-top: 2px; color: #d1963c; }
.panel-rule p { margin: 0; }
button:focus-visible { outline: 2px solid #409eff; outline-offset: 2px; }
@media (max-width: 760px) {
  .board-panel { margin-bottom: 10px; padding: 10px; display: flex; gap: 7px; overflow-x: auto; }
  .board-panel .panel-title, .panel-rule { display: none; }
  .board-item { width: auto; min-width: max-content; border: 1px solid #e6ebf4; background: #fff; }
  .board-item b { display: none; }
}
</style>
