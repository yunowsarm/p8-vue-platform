<!-- 园区话题顶部导航组件：提供排序、搜索、刷新和发帖入口。 -->
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
    <form class="forum-search" role="search" aria-label="论坛搜索" @submit.prevent="$emit('search')">
      <el-input
        :value="keyword"
        clearable
        size="small"
        prefix-icon="el-icon-search"
        placeholder="搜索帖子、版块或关键词"
        label="搜索园区论坛"
        @input="$emit('update:keyword', $event.trim())"
        @clear="$emit('search')" />
      <el-button size="small" native-type="submit">搜索</el-button>
    </form>
    <div class="forum-actions">
      <el-button size="small" icon="el-icon-refresh" :loading="refreshing" @click="$emit('refresh')">刷新</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="$emit('publish')">发布帖子</el-button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ForumNavigation',
  props: {
    activeSort: { type: String, required: true },
    keyword: { type: String, default: '' },
    sortTabs: { type: Array, default: () => [] },
    refreshing: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.forum-nav {
  min-height: 58px;
  min-width: 0;
  padding: 6px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}
.sort-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0 16px;
}
.sort-tabs button {
  position: relative;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}
.sort-tabs button.active {
  color: #409eff;
  font-weight: 600;
}
.sort-tabs button.active:after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #409eff;
  content: '';
}
.forum-search,
.forum-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}
.forum-search {
  flex: 1 1 240px;
  max-width: 480px;
}
.forum-search .el-input {
  min-width: 0;
  flex: 1 1 0;
}
.forum-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-inline-start: auto;
}
.forum-actions .el-button + .el-button {
  margin: 0;
}
button:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
@media (max-width: 760px) {
  .forum-nav {
    min-height: 0;
    padding: 8px 12px;
  }
  .sort-tabs {
    width: 100%;
    column-gap: 12px;
  }
  .sort-tabs button {
    min-width: 44px;
  }
  .forum-search {
    flex-basis: 100%;
    max-width: none;
  }
  .forum-search ::v-deep .el-input__inner,
  .forum-nav .el-button {
    min-height: 44px;
  }
  .forum-search ::v-deep .el-input__inner {
    font-size: 16px;
  }
}
</style>
