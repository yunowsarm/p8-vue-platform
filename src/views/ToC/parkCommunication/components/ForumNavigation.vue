<template>
  <section class="forum-nav" aria-label="帖子操作">
    <div class="sort-tabs" role="tablist" aria-label="帖子排序方式">
      <button
        v-for="item in sortTabs"
        :key="item.key"
        type="button"
        :class="{ active: activeSort === item.key }"
        role="tab"
        :aria-selected="activeSort === item.key"
        @click="$emit('set-sort', item.key)">
        {{ item.label }}
      </button>
    </div>
    <div class="forum-toolbar">
      <el-input
        :value="keyword"
        clearable
        size="small"
        prefix-icon="el-icon-search"
        placeholder="搜索帖子、版块或关键词"
        aria-label="搜索园区论坛"
        @input="$emit('update:keyword', $event.trim())"
        @clear="$emit('search')"
        @keyup.enter.native="$emit('search')" />
      <el-button size="small" icon="el-icon-search" @click="$emit('search')">搜索</el-button>
    </div>
    <el-button class="publish-topic-button" type="primary" size="small" icon="el-icon-edit" @click="$emit('publish')">发布帖子</el-button>
  </section>
</template>

<script>
export default {
  name: 'ForumNavigation',
  props: {
    activeSort: { type: String, required: true },
    keyword: { type: String, default: '' },
    sortTabs: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.forum-nav {
  min-height: 58px;
  padding: 0 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 480px) minmax(0, 1fr);
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}
.sort-tabs { height: 58px; display: flex; gap: 20px; }
.sort-tabs button { position: relative; padding: 0; border: 0; background: transparent; color: #606266; font-size: 14px; cursor: pointer; }
.sort-tabs button.active { color: #409eff; font-weight: 600; }
.sort-tabs button.active:after { position: absolute; right: 0; bottom: 0; left: 0; height: 3px; border-radius: 3px 3px 0 0; background: #409eff; content: ''; }
.forum-toolbar { width: 100%; display: flex; align-items: center; gap: 10px; }
.forum-toolbar .el-input { min-width: 0; flex: 1; }
.publish-topic-button { justify-self: end; }
button:focus-visible { outline: 2px solid #409eff; outline-offset: 2px; }
@media (max-width: 1180px) {
  .forum-nav { grid-template-columns: minmax(0, 1fr) auto; gap: 10px; padding: 10px 16px; }
  .forum-toolbar { grid-row: 2; grid-column: 1/-1; }
}
@media (max-width: 760px) {
  .forum-nav { min-height: 0; padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 8px; }
  .sort-tabs { width: 100%; height: 36px; gap: 17px; overflow-x: auto; }
  .sort-tabs button { min-width: 44px; white-space: nowrap; }
  .forum-toolbar { width: 100%; order: 3; }
  .publish-topic-button { order: 2; }
}
</style>
