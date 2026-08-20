<template>
  <section v-loading="loading" class="topic-panel" aria-live="polite">
    <div v-if="topics.length" class="topic-list">
      <article v-for="topic in topics" :key="topic.id" class="topic-card" tabindex="0" role="button" @click="$emit('open-topic', topic)" @keydown.enter="$emit('open-topic', topic)">
        <div class="topic-card-main">
          <div class="topic-topline">
            <span v-if="topic.isTop" class="top-mark">置顶</span>
            <span class="category-tag" :style="{ color: categoryById(topic.categoryId).color, backgroundColor: categoryById(topic.categoryId).softColor }">{{ categoryById(topic.categoryId).name }}</span>
            <time>{{ formatDateTime(topic.createdAt) }}</time>
          </div>
          <h3>{{ topic.title }}</h3>
          <p>{{ topic.content }}</p>
          <div class="topic-author">
            <span class="avatar" :style="{ background: topic.avatarColor }">{{ authorName(topic).slice(0, 1) }}</span>
            <span>{{ authorName(topic) }}</span>
          </div>
        </div>
        <div class="topic-actions" @click.stop>
          <button type="button" :class="{ active: topic.liked }" :aria-label="'点赞 ' + topic.title" @click="$emit('toggle-like', topic)">
            <svg class="like-heart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3 4.7 13A5.1 5.1 0 0 1 12 5.8 5.1 5.1 0 0 1 19.3 13L12 20.3Z" /></svg>{{ topic.likeCount }}
          </button>
          <button type="button" aria-label="查看评论" @click="$emit('open-topic', topic)"><i class="el-icon-chat-dot-round"></i>{{ topic.replyCount }}</button>
          <button type="button" :class="{ active: topic.favorited }" :aria-label="'收藏 ' + topic.title" @click="$emit('toggle-favorite', topic)"><i class="el-icon-star-off"></i>{{ topic.favorited ? '已收藏' : '收藏' }}</button>
          <span><i class="el-icon-view"></i>{{ topic.viewCount }}</span>
          <button v-if="isOwnTopic(topic)" type="button" class="topic-manage-button topic-manage-start danger" :aria-label="'删除 ' + topic.title" @click="$emit('delete-topic', topic)"><i class="el-icon-delete"></i>删除</button>
        </div>
      </article>
    </div>
    <el-empty v-else description="没有找到相关帖子" :image-size="92"><el-button size="small" type="primary" @click="$emit('reset-filters')">查看全部帖子</el-button></el-empty>
  </section>
</template>

<script>
export default {
  name: 'ForumTopicList',
  props: {
    topics: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    authorName: { type: Function, required: true },
    categoryById: { type: Function, required: true },
    formatDateTime: { type: Function, required: true },
    isOwnTopic: { type: Function, required: true }
  }
}
</script>

<style scoped>
.topic-panel { min-width: 0; overflow: hidden; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; }
.topic-list { padding: 0 20px; }
.topic-card { position: relative; padding: 20px 0 15px; border-bottom: 1px solid #ebeef5; cursor: pointer; outline: none; }
.topic-card:last-child { border-bottom: 0; }
.topic-card:focus-visible { outline: 2px solid #409eff; outline-offset: -2px; }
.topic-card:focus-visible h3, .topic-card:hover h3 { color: #409eff; }
.topic-topline { display: flex; align-items: center; gap: 7px; }
.top-mark, .category-tag { min-height: 20px; padding: 0 7px; display: inline-flex; align-items: center; border-radius: 4px; font-size: 11px; line-height: 20px; }
.top-mark { background: #fff0ed; color: #d95a47; }
.topic-topline time { color: #9aa7b9; font-size: 12px; }
.topic-card h3 { margin: 9px 0 7px; overflow: hidden; color: #303133; font-size: 16px; line-height: 22px; text-overflow: ellipsis; white-space: nowrap; transition: color .2s; }
.topic-card-main > p { display: -webkit-box; margin: 0; overflow: hidden; color: #606266; font-size: 13px; line-height: 20px; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.topic-author { margin-top: 12px; display: flex; align-items: center; gap: 7px; color: #909399; font-size: 12px; }
.avatar { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: #409eff; color: #fff; font-size: 11px; font-weight: 600; }
.topic-actions { margin-top: 12px; display: flex; align-items: center; gap: 18px; }
.topic-actions button, .topic-actions span { min-height: 30px; padding: 0 2px; display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; color: #99a5b5; font-size: 12px; }
.topic-actions button { cursor: pointer; }
.topic-actions .topic-manage-button { min-height: 30px; }
.topic-actions .topic-manage-start { margin-left: auto; }
.topic-actions .danger, .topic-actions .danger:hover { color: #f56c6c; }
.topic-actions button:hover, .topic-actions button.active { color: #409eff; }
.topic-actions i { font-size: 15px; }
.like-heart-icon { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.topic-actions button.active .like-heart-icon { fill: currentColor; }
button:focus-visible { outline: 2px solid #409eff; outline-offset: 2px; }
@media (max-width: 760px) {
  .topic-list { padding: 0 14px; }
  .topic-card { padding: 16px 0 12px; }
  .topic-card h3 { font-size: 15px; }
  .topic-actions { gap: 14px; }
  .topic-actions span:last-child { margin-left: auto; }
}
</style>
