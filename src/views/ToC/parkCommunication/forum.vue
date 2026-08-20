<template>
  <main class="park-forum">
    <forum-navigation :active-sort="activeSort" :keyword.sync="keyword" :sort-tabs="sortTabs" @set-sort="setSort" @search="searchTopics" @publish="openPublish" />

    <section class="forum-layout">
      <forum-category-panel
        :active-category="activeCategory"
        :categories="categories"
        :topic-total="topicTotal"
        :category-icon="categoryIcon"
        :is-image-icon="isImageIcon"
        @select-category="selectCategory" />

      <div class="topic-column">
        <forum-topic-list
          :topics="filteredTopics"
          :loading="topicsLoading || myTopicsLoading"
          :author-name="authorName"
          :category-by-id="categoryById"
          :format-date-time="formatDateTime"
          :is-own-topic="isOwnTopic"
          @open-topic="openTopic"
          @toggle-like="toggleLike"
          @toggle-favorite="toggleFavorite"
          @delete-topic="deleteTopic"
          @reset-filters="resetFilters" />
        <div ref="loadMoreTrigger" class="load-more" aria-live="polite">
          <span v-if="loadingMore">
            <i class="el-icon-loading"></i>
            正在加载更多内容
          </span>
          <span v-else-if="hasMoreTopics">向下滚动加载更多</span>
          <span v-else-if="filteredTopics.length">已经到底了</span>
        </div>
      </div>

      <forum-hot-topics :topics="hotTopics" @open-topic="openTopic" />
    </section>

    <el-dialog title="发布新帖子" :visible.sync="publishVisible" width="620px" append-to-body :close-on-click-modal="false" custom-class="forum-dialog" @closed="resetPublishForm">
      <el-form ref="publishForm" :model="publishForm" :rules="publishRules" label-position="top" @submit.native.prevent>
        <el-form-item label="发布到版块" prop="categoryId">
          <el-select v-model="publishForm.categoryId" placeholder="请选择版块" class="form-full">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title"><el-input v-model.trim="publishForm.title" maxlength="60" show-word-limit placeholder="用一句话说清你想讨论的事" /></el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model.trim="publishForm.content" type="textarea" :rows="6" maxlength="1000" show-word-limit placeholder="分享更多细节，让大家更容易帮到你" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="publishVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="submitPublish">发布帖子</el-button>
      </span>
    </el-dialog>

    <el-drawer :visible.sync="detailVisible" direction="rtl" size="680px" append-to-body custom-class="topic-drawer" :with-header="false">
      <article v-if="selectedTopic" class="topic-detail">
        <header class="detail-header">
          <button type="button" class="close-button" aria-label="关闭帖子详情" @click="detailVisible = false"><i class="el-icon-close"></i></button>
          <span class="category-tag" :style="{ color: categoryById(selectedTopic.categoryId).color, backgroundColor: categoryById(selectedTopic.categoryId).softColor }">
            {{ categoryById(selectedTopic.categoryId).name }}
          </span>
          <h2>{{ selectedTopic.title }}</h2>
          <div class="topic-author">
            <span class="avatar" :style="{ background: selectedTopic.avatarColor }">{{ authorName(selectedTopic).slice(0, 1) }}</span>
            <span>{{ authorName(selectedTopic) }}</span>
            <span class="author-separator"></span>
            <time>{{ formatDateTime(selectedTopic.createdAt) }}</time>
          </div>
        </header>
        <section class="detail-content">
          <p>{{ selectedTopic.content }}</p>
          <div class="detail-actions">
            <button
              type="button"
              class="detail-action-button like-action"
              :class="{ active: selectedTopic.liked }"
              :aria-label="selectedTopic.liked ? '取消点赞' : '点赞'"
              @click="toggleLike(selectedTopic)">
              <svg class="like-heart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3 4.7 13A5.1 5.1 0 0 1 12 5.8 5.1 5.1 0 0 1 19.3 13L12 20.3Z" /></svg>
              {{ selectedTopic.liked ? '已点赞' : '点赞' }} {{ selectedTopic.likeCount }}
            </button>
            <button
              type="button"
              class="detail-action-button favorite-action"
              :class="{ active: selectedTopic.favorited }"
              :aria-label="selectedTopic.favorited ? '取消收藏' : '收藏'"
              @click="toggleFavorite(selectedTopic)">
              <i :class="selectedTopic.favorited ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
              {{ selectedTopic.favorited ? '已收藏' : '收藏' }}
            </button>
            <span>
              <i class="el-icon-view"></i>
              {{ selectedTopic.viewCount }} 浏览
            </span>
          </div>
        </section>
        <section class="reply-section">
          <h3>
            全部回复
            <span>{{ selectedTopic.replyCount }}</span>
          </h3>
          <div v-loading="repliesLoading" v-if="replyTree.length" class="reply-list">
            <article v-for="reply in replyTree" :key="reply.id" class="reply-item" :class="{ 'is-nested': reply.depth > 0 }" :style="replyIndentStyle(reply.depth)">
              <span class="avatar reply-avatar" :style="{ background: reply.avatarColor }">{{ authorName(reply).slice(0, 1) }}</span>
              <div>
                <div class="reply-meta">
                  <b>{{ authorName(reply) }}</b>
                  <span v-if="hasReplyTarget(reply)" class="reply-to">回复 {{ replyToUserName(reply) }}</span>
                  <time>{{ formatDateTime(reply.createdAt) }}</time>
                </div>
                <p>{{ reply.content }}</p>
                <button type="button" class="reply-button" :aria-label="'回复 ' + authorName(reply)" @click="startReply(reply)">
                  <i class="el-icon-chat-dot-round"></i>
                  回复
                </button>
              </div>
            </article>
          </div>
          <el-empty v-else v-loading="repliesLoading" description="还没有回复，来抢沙发吧" :image-size="70" />
          <div ref="replyLoadTrigger" class="reply-load-more" aria-live="polite">
            <span v-if="replyLoadingMore">
              <i class="el-icon-loading"></i>
              正在加载更多回复
            </span>
            <span v-else-if="hasMoreReplies">向下滚动加载更多回复</span>
            <span v-else-if="replyTree.length">已加载全部回复</span>
          </div>
          <div class="reply-editor">
            <div v-if="replyTarget" class="reply-target">
              <span>回复 {{ authorName(replyTarget) }}</span>
              <button type="button" @click="cancelReply">取消回复</button>
            </div>
            <el-input ref="replyInput" v-model.trim="replyContent" type="textarea" :rows="3" maxlength="300" show-word-limit :placeholder="replyPlaceholder" />
            <el-button type="primary" size="small" :loading="replying" :disabled="!replyContent" @click="submitReply">发布回复</el-button>
          </div>
        </section>
      </article>
    </el-drawer>
  </main>
</template>

<script>
import ForumNavigation from './components/ForumNavigation.vue'
import ForumCategoryPanel from './components/ForumCategoryPanel.vue'
import ForumTopicList from './components/ForumTopicList.vue'
import ForumHotTopics from './components/ForumHotTopics.vue'

const CATEGORY_PALETTE = [
  { color: '#3674d9', softColor: '#eaf2ff', icon: 'el-icon-office-building' },
  { color: '#0f9a76', softColor: '#e7f8f1', icon: 'el-icon-service' },
  { color: '#e46d32', softColor: '#fff0e8', icon: 'el-icon-basketball' },
  { color: '#7a5bd7', softColor: '#f1edff', icon: 'el-icon-connection' },
  { color: '#197eae', softColor: '#e6f5fb', icon: 'el-icon-reading' },
  { color: '#bb7a18', softColor: '#fff6df', icon: 'el-icon-present' }
]
const AVATAR_COLORS = ['#4979ca', '#b16c46', '#6d8d67', '#986ab7', '#5788a3', '#e98652']

export default {
  name: 'ParkForum',
  components: {
    ForumNavigation,
    ForumCategoryPanel,
    ForumTopicList,
    ForumHotTopics
  },
  data() {
    return {
      categories: [],
      topics: [],
      myTopics: [],
      favoriteTopics: [],
      keyword: '',
      appliedKeyword: '',
      activeCategory: 'all',
      activeSort: 'latest',
      currentPage: 1,
      pageSize: 10,
      topicTotal: 0,
      topicsLoading: false,
      loadingMore: false,
      myTopicsLoading: false,
      repliesLoading: false,
      replyLoadingMore: false,
      replying: false,
      replyPage: 1,
      replyPageSize: 20,
      replyTotal: 0,
      selectedTopic: null,
      detailVisible: false,
      publishVisible: false,
      publishing: false,
      replyContent: '',
      replyTarget: null,
      likedTopicIds: {},
      favoritedTopicIds: {},
      publishForm: { categoryId: '', title: '', content: '' },
      sortTabs: [
        { key: 'latest', label: '最新' },
        { key: 'hot', label: '热门' },
        { key: 'favorites', label: '我的收藏' },
        { key: 'myTopics', label: '我的帖子' }
      ],
      publishRules: {
        categoryId: [{ required: true, message: '请选择发布版块', trigger: 'change' }],
        title: [{ required: true, message: '请输入帖子标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入帖子内容', trigger: 'blur' }]
      }
    }
  },
  computed: {
    filteredTopics() {
      const keyword = this.appliedKeyword.toLowerCase()
      const source = this.activeSort === 'myTopics' ? this.myTopics : this.activeSort === 'favorites' ? this.favoriteTopics : this.topics
      const list = source.filter((topic) => {
        const text = `${topic.title || ''}${topic.content || ''}${this.authorName(topic)}${this.categoryById(topic.categoryId).name}`.toLowerCase()
        const matchedCategory = this.activeCategory === 'all' || String(topic.categoryId) === String(this.activeCategory)
        return (!keyword || text.includes(keyword)) && matchedCategory
      })
      return list.slice().sort((a, b) => {
        if (this.activeSort === 'hot') return b.replyCount + b.likeCount - (a.replyCount + a.likeCount)
        return Number(b.isTop) - Number(a.isTop) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    },
    hasMoreTopics() {
      return (this.activeSort === 'latest' || this.activeSort === 'hot') && this.topics.length < this.topicTotal
    },
    hasMoreReplies() {
      return Boolean(this.selectedTopic) && this.selectedTopic.replies.length < this.replyTotal
    },
    hotTopics() {
      return this.topics
        .slice()
        .sort((a, b) => b.replyCount + b.likeCount - (a.replyCount + a.likeCount))
        .slice(0, 5)
    },
    replyTree() {
      if (!this.selectedTopic || !this.selectedTopic.replies) return []
      const nodes = {}
      const roots = []
      this.selectedTopic.replies.forEach((reply) => {
        nodes[reply.id] = Object.assign({}, reply, { children: [] })
      })
      this.selectedTopic.replies.forEach((reply) => {
        const node = nodes[reply.id]
        if (Number(reply.parentId) > 0 && nodes[reply.parentId]) nodes[reply.parentId].children.push(node)
        else roots.push(node)
      })
      const flattened = []
      const appendNode = (node, depth) => {
        flattened.push(Object.assign({}, node, { depth }))
        node.children.forEach((child) => appendNode(child, depth + 1))
      }
      roots.forEach((node) => appendNode(node, 0))
      return flattened
    },
    replyPlaceholder() {
      return this.replyTarget ? `回复 ${this.authorName(this.replyTarget)}…` : '写下你的想法…'
    }
  },
  created() {
    this.loadForum()
  },
  mounted() {
    this.initLoadMoreObserver()
    this.initReplyLoadObserver()
  },
  beforeDestroy() {
    if (this.loadMoreObserver) this.loadMoreObserver.disconnect()
    if (this.replyLoadObserver) this.replyLoadObserver.disconnect()
  },
  methods: {
    async loadForum() {
      await this.loadCategories()
      await this.loadTopics()
    },
    async loadCategories() {
      try {
        const response = await this.$api['forum.categories']()
        const items = Array.isArray(response) ? response : (response && response.records) || []
        this.categories = items.map((item, index) => this.normalizeCategory(item, index))
      } catch (error) {
        this.showRequestError(error, '版块列表加载失败')
      }
    },
    async loadTopics(append = false) {
      if (append) this.loadingMore = true
      else this.topicsLoading = true
      try {
        const params = { page: this.currentPage, size: this.pageSize }
        const options = this.userRequestOptions() || {}
        if (this.activeCategory !== 'all') params.categoryId = this.activeCategory
        const response = await this.$api['forum.topicsPage'](params, options)
        const page = response && response.records ? response : { records: [], total: 0 }
        const records = (page.records || []).map((item) => this.normalizeTopic(item))
        this.topics = append ? this.topics.concat(records) : records
        this.topicTotal = Number(page.total || 0)
      } catch (error) {
        if (!append) {
          this.topics = []
          this.topicTotal = 0
        }
        this.showRequestError(error, '帖子列表加载失败')
      } finally {
        if (append) this.loadingMore = false
        else this.topicsLoading = false
        this.$nextTick(() => this.observeLoadMoreTrigger())
      }
    },
    async loadMyTopics() {
      await this.loadUserTopics('myPosts', 'myTopics', '我的帖子加载失败')
    },
    async loadFavoriteTopics() {
      await this.loadUserTopics('myFavorites', 'favoriteTopics', '我的收藏加载失败', true)
    },
    async loadUserTopics(apiName, targetKey, errorMessage, forceFavorited = false) {
      const options = this.requireUserOptions()
      if (!options) {
        this[targetKey] = []
        return
      }
      this.myTopicsLoading = true
      try {
        const response = await this.$api[`forum.${apiName}`]({ page: 1, size: 100 }, options)
        const records = Array.isArray(response) ? response : (response && response.records) || []
        this[targetKey] = records.map((topic) => {
          const normalized = this.normalizeTopic(topic)
          return forceFavorited ? Object.assign(normalized, { favorited: true }) : normalized
        })
      } catch (error) {
        this[targetKey] = []
        this.showRequestError(error, errorMessage)
      } finally {
        this.myTopicsLoading = false
      }
    },
    normalizeCategory(item, index) {
      const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
      return Object.assign({}, item, { id: item.id, name: item.name || '未命名版块', icon: item.icon || palette.icon, color: palette.color, softColor: palette.softColor })
    },
    normalizeTopic(item, fallbackTopic) {
      const hasLiked = Object.prototype.hasOwnProperty.call(item, 'hasLiked')
      const hasFavorited = Object.prototype.hasOwnProperty.call(item, 'hasFavorited')
      return Object.assign({}, item, {
        likeCount: Number(item.likeCount || 0),
        replyCount: Number(item.replyCount || 0),
        viewCount: Number(item.viewCount || 0),
        liked: hasLiked ? this.toBoolean(item.hasLiked) : fallbackTopic ? fallbackTopic.liked : Boolean(this.likedTopicIds[item.id]),
        favorited: hasFavorited ? this.toBoolean(item.hasFavorited) : fallbackTopic ? fallbackTopic.favorited : Boolean(this.favoritedTopicIds[item.id]),
        avatarColor: this.avatarColor(item.userId),
        replies: []
      })
    },
    normalizeReply(item) {
      return Object.assign({}, item, { avatarColor: this.avatarColor(item.userId) })
    },
    categoryById(id) {
      return this.categories.find((category) => String(category.id) === String(id)) || { name: '未分类', color: '#909399', softColor: '#f4f4f5', icon: 'el-icon-collection' }
    },
    categoryIcon(category) {
      return (category && category.icon) || 'el-icon-collection'
    },
    isImageIcon(icon) {
      return typeof icon === 'string' && /^(https?:|data:image)/i.test(icon)
    },
    avatarColor(userId) {
      const index = Math.abs(Number(userId) || 0) % AVATAR_COLORS.length
      return AVATAR_COLORS[index]
    },
    toBoolean(value) {
      return value === true || value === 1 || value === '1' || value === 'true'
    },
    authorName(item) {
      if (item && item.userName) return item.userName
      return item && item.userId ? `用户${item.userId}` : '园区用户'
    },
    formatDateTime(value) {
      if (!value) return ''
      return String(value).replace('T', ' ').slice(0, 16)
    },
    currentUserId() {
      const storeId = this.$store && this.$store.getters && this.$store.getters.userId
      if (storeId) return storeId
      try {
        return JSON.parse(window.sessionStorage.getItem('userInfo') || '{}').id || ''
      } catch (error) {
        return ''
      }
    },
    currentUserName() {
      const storeName = this.$store && this.$store.getters && this.$store.getters.userName
      if (storeName) return storeName
      try {
        const userInfo = JSON.parse(window.sessionStorage.getItem('userInfo') || '{}')
        return userInfo.userName || userInfo.username || userInfo.name || ''
      } catch (error) {
        return ''
      }
    },
    userRequestOptions() {
      const userId = this.currentUserId()
      return userId ? { headers: { 'X-User-Id': userId } } : null
    },
    requireUserOptions() {
      const options = this.userRequestOptions()
      if (!options) this.$message.warning('未获取到当前用户，请重新登录后操作')
      return options
    },
    setSort(key) {
      this.activeSort = key
      if (key === 'myTopics') this.loadMyTopics()
      if (key === 'favorites') this.loadFavoriteTopics()
    },
    selectCategory(categoryId) {
      if (this.activeCategory === categoryId) return
      this.activeCategory = categoryId
      this.currentPage = 1
      this.appliedKeyword = ''
      this.keyword = ''
      if (this.activeSort === 'myTopics' || this.activeSort === 'favorites') return
      this.loadTopics()
    },
    loadMoreTopics() {
      if (!this.hasMoreTopics || this.topicsLoading || this.loadingMore) return
      this.currentPage += 1
      this.loadTopics(true)
    },
    initLoadMoreObserver() {
      if (!window.IntersectionObserver) return
      this.loadMoreObserver = new window.IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.loadMoreTopics()
        },
        { rootMargin: '0px 0px 160px' }
      )
      this.observeLoadMoreTrigger()
    },
    observeLoadMoreTrigger() {
      if (!this.loadMoreObserver || !this.$refs.loadMoreTrigger) return
      this.loadMoreObserver.disconnect()
      this.loadMoreObserver.observe(this.$refs.loadMoreTrigger)
    },
    loadMoreReplies() {
      if (!this.hasMoreReplies || this.repliesLoading || this.replyLoadingMore || !this.selectedTopic) return
      this.replyPage += 1
      this.loadReplies(this.selectedTopic.id, true)
    },
    initReplyLoadObserver() {
      if (!window.IntersectionObserver) return
      this.replyLoadObserver = new window.IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.loadMoreReplies()
        },
        { rootMargin: '0px 0px 120px' }
      )
      this.observeReplyLoadTrigger()
    },
    observeReplyLoadTrigger() {
      if (!this.replyLoadObserver || !this.$refs.replyLoadTrigger) return
      this.replyLoadObserver.disconnect()
      this.replyLoadObserver.observe(this.$refs.replyLoadTrigger)
    },
    resetFilters() {
      this.keyword = ''
      this.appliedKeyword = ''
      this.activeSort = 'latest'
      this.currentPage = 1
      if (this.activeCategory === 'all') this.loadTopics()
      else this.selectCategory('all')
    },
    searchTopics() {
      this.appliedKeyword = this.keyword
    },
    openPublish() {
      if (!this.categories.length) {
        this.$message.warning('版块加载中，请稍后再试')
        return
      }
      this.publishVisible = true
    },
    resetPublishForm() {
      this.publishForm = { categoryId: '', title: '', content: '' }
      this.$nextTick(() => this.$refs.publishForm && this.$refs.publishForm.clearValidate())
    },
    async submitPublish() {
      const valid = await new Promise((resolve) => this.$refs.publishForm.validate(resolve))
      const options = this.requireUserOptions()
      if (!valid || !options) return
      this.publishing = true
      try {
        const response = await this.$api['forum.topicCreate'](Object.assign({}, this.publishForm, { userName: this.currentUserName() }), options)
        const responseHead = response && response.head
        if ((response && String(response.success).toLowerCase() === 'false') || (responseHead && String(responseHead.success).toLowerCase() === 'false')) {
          this.$message.error((responseHead && responseHead.message) || response.message || '帖子发布失败，请修改后重试')
          return
        }
        this.publishVisible = false
        this.activeCategory = 'all'
        this.currentPage = 1
        await this.loadTopics()
        this.$message.success('帖子已发布')
      } catch (error) {
        // this.showRequestError(error, '帖子发布失败')
      } finally {
        this.publishing = false
      }
    },
    async openTopic(topic) {
      this.detailVisible = true
      this.replyContent = ''
      this.replyTarget = null
      this.replyPage = 1
      this.replyTotal = 0
      this.repliesLoading = true
      try {
        const detail = await this.$api['forum.topicDetail']({ id: topic.id }, this.userRequestOptions() || {})
        this.selectedTopic = Object.assign(this.normalizeTopic(detail || topic, topic), { replies: [] })
        this.syncTopic(this.selectedTopic)
        await this.loadReplies(this.selectedTopic.id)
      } catch (error) {
        this.selectedTopic = Object.assign({}, topic, { replies: [] })
        this.showRequestError(error, '帖子详情加载失败')
      } finally {
        this.repliesLoading = false
      }
    },
    async loadReplies(topicId, append = false) {
      if (append) this.replyLoadingMore = true
      else this.repliesLoading = true
      try {
        const response = await this.$api['forum.repliesPage']({ topicId, page: this.replyPage, size: this.replyPageSize })
        const page = response && response.records ? response : { records: [], total: 0 }
        if (this.selectedTopic && String(this.selectedTopic.id) === String(topicId)) {
          const records = (page.records || []).map((item) => this.normalizeReply(item))
          this.selectedTopic.replies = append ? this.selectedTopic.replies.concat(records) : records
          this.replyTotal = Number(page.total || 0)
        }
      } catch (error) {
        this.showRequestError(error, '回复列表加载失败')
      } finally {
        if (append) this.replyLoadingMore = false
        else this.repliesLoading = false
        this.$nextTick(() => this.observeReplyLoadTrigger())
      }
    },
    replyIndentStyle(depth) {
      return depth ? { marginLeft: `${Math.min(depth, 3) * 24}px` } : {}
    },
    replyToUserName(reply) {
      if (!this.hasReplyTarget(reply) || !this.selectedTopic) return ''
      const target = this.selectedTopic.replies.find((item) => String(item.userId) === String(reply.replyToUserId))
      return target ? this.authorName(target) : `用户${reply.replyToUserId}`
    },
    hasReplyTarget(reply) {
      if (!reply || reply.replyToUserId === null || reply.replyToUserId === undefined) return false
      const userId = String(reply.replyToUserId).trim()
      return userId !== '' && userId !== '0'
    },
    startReply(reply) {
      this.replyTarget = reply
      this.$nextTick(() => this.$refs.replyInput && this.$refs.replyInput.focus())
    },
    cancelReply() {
      this.replyTarget = null
    },
    syncTopic(topic) {
      ;['topics', 'myTopics', 'favoriteTopics'].forEach((key) => {
        const index = this[key].findIndex((item) => String(item.id) === String(topic.id))
        if (index !== -1) this.$set(this[key], index, Object.assign({}, this[key][index], topic))
      })
      if (!topic.favorited) this.favoriteTopics = this.favoriteTopics.filter((item) => String(item.id) !== String(topic.id))
      else if (!this.favoriteTopics.some((item) => String(item.id) === String(topic.id))) this.favoriteTopics.unshift(Object.assign({}, topic))
    },
    async toggleLike(topic) {
      const options = this.requireUserOptions()
      if (!options) return
      try {
        await this.$api['forum.actionToggle']({ targetType: 1, targetId: topic.id, actionType: 1 }, options)
        topic.liked = !topic.liked
        topic.likeCount = Math.max(0, topic.likeCount + (topic.liked ? 1 : -1))
        this.$set(this.likedTopicIds, topic.id, topic.liked)
        this.syncTopic(topic)
      } catch (error) {
        this.showRequestError(error, '点赞操作失败')
      }
    },
    async toggleFavorite(topic) {
      const options = this.requireUserOptions()
      if (!options) return
      try {
        await this.$api['forum.actionToggle']({ targetType: 1, targetId: topic.id, actionType: 2 }, options)
        topic.favorited = !topic.favorited
        this.$set(this.favoritedTopicIds, topic.id, topic.favorited)
        this.syncTopic(topic)
        this.$message.success(topic.favorited ? '已加入收藏' : '已取消收藏')
      } catch (error) {
        this.showRequestError(error, '收藏操作失败')
      }
    },
    isOwnTopic(topic) {
      const userId = this.currentUserId()
      return Boolean(userId) && topic && String(topic.userId) === String(userId)
    },
    async deleteTopic(topic) {
      if (!this.isOwnTopic(topic)) return
      const options = this.requireUserOptions()
      if (!options) return
      try {
        await this.$confirm(`确定删除“${topic.title}”吗？删除后无法恢复。`, '删除帖子', { type: 'warning' })
        await this.$api['forum.topicDelete']({ id: topic.id }, options)
        this.topics = this.topics.filter((item) => String(item.id) !== String(topic.id))
        this.myTopics = this.myTopics.filter((item) => String(item.id) !== String(topic.id))
        this.favoriteTopics = this.favoriteTopics.filter((item) => String(item.id) !== String(topic.id))
        if (this.selectedTopic && String(this.selectedTopic.id) === String(topic.id)) this.detailVisible = false
        if (this.activeSort === 'latest' || this.activeSort === 'hot') await this.loadTopics()
        this.$message.success('帖子已删除')
      } catch (error) {
        if (error === 'cancel' || error === 'close') return
        this.showRequestError(error, '帖子删除失败')
      }
    },
    async submitReply() {
      if (!this.replyContent || !this.selectedTopic) return
      const options = this.requireUserOptions()
      if (!options) return
      this.replying = true
      try {
        await this.$api['forum.replyCreate'](
          {
            topicId: this.selectedTopic.id,
            content: this.replyContent,
            parentId: this.replyTarget ? this.replyTarget.id : 0,
            replyToUserId: this.replyTarget ? this.replyTarget.userId : 0,
            userName: this.currentUserName()
          },
          options
        )
        this.replyContent = ''
        this.replyTarget = null
        this.replyPage = 1
        await this.loadReplies(this.selectedTopic.id)
        const detail = await this.$api['forum.topicDetail']({ id: this.selectedTopic.id }, this.userRequestOptions() || {})
        this.selectedTopic = Object.assign(this.normalizeTopic(detail, this.selectedTopic), { replies: this.selectedTopic.replies })
        this.syncTopic(this.selectedTopic)
        this.$message.success('回复已发布')
      } catch (error) {
        this.showRequestError(error, '回复发布失败')
      } finally {
        this.replying = false
      }
    },
    showRequestError(error, fallback) {
      const message = error && (error.message || (error.head && error.head.message))
      this.$message.error(message || fallback)
    }
  }
}
</script>

<style scoped>
.park-forum {
  min-height: 100%;
  padding: 12px;
  box-sizing: border-box;
  background: #f6f8fb;
  color: #303133;
}
.forum-layout {
  max-width: 1500px;
  margin: 12px auto 0;
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr) 258px;
  gap: 12px;
  align-items: start;
}
.topic-column {
  min-width: 0;
}
.category-tag {
  min-height: 20px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  border-radius: 4px;
  font-size: 11px;
  line-height: 20px;
}
.top-mark {
  background: #fff0ed;
  color: #d95a47;
}
.topic-author {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #909399;
  font-size: 12px;
}
.avatar {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
.author-separator {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #bbc5d2;
}
.like-heart-icon {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}
.detail-actions button.active .like-heart-icon {
  fill: currentColor;
}
.load-more {
  min-height: 32px;
  /* margin-top: 8px; */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}
.load-more .el-icon-loading {
  margin-right: 6px;
  color: #409eff;
}
.active-board {
  width: 100%;
  min-height: 44px;
  padding: 7px 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.active-board > i:first-child,
.active-category-image {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  border-radius: 7px;
  object-fit: contain;
  font-size: 15px;
}
.active-board span {
  flex: 1;
}
.active-board b,
.active-board small {
  display: block;
}
.active-board b {
  color: #50617a;
  font-size: 12px;
}
.active-board small {
  margin-top: 3px;
  color: #a2afbf;
  font-size: 11px;
}
.active-board .arrow {
  color: #bac4d2;
  font-size: 12px;
}
.form-full {
  width: 100%;
}
.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 4px;
  background: #f5f7fa;
  color: #606266;
  cursor: pointer;
}
.topic-detail {
  min-height: 100%;
  background: #fff;
}
.detail-header {
  position: relative;
  padding: 38px 32px 22px;
  border-bottom: 1px solid #edf1f6;
}
.detail-header h2 {
  max-width: 88%;
  margin: 11px 0 0;
  font-size: 22px;
  line-height: 32px;
}
.detail-content {
  padding: 24px 32px;
}
.detail-content > p {
  margin: 0;
  color: #606266;
  font-size: 15px;
  line-height: 27px;
  white-space: pre-wrap;
}
.detail-actions {
  margin-top: 22px;
  padding-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #edf1f6;
}
.detail-actions .detail-action-button {
  min-height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #edf1f6;
  border-radius: 18px;
  background: #f7f9fc;
  color: #718198;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}
.detail-actions .detail-action-button:hover {
  border-color: #b3d8ff;
  background: #ecf5ff;
  color: #409eff;
}
.detail-actions .detail-action-button:active {
  transform: scale(0.97);
}
.detail-actions .like-action.active {
  border-color: #b3d8ff;
  background: #ecf5ff;
  color: #409eff;
}
.detail-actions .favorite-action.active {
  border-color: #f5d6a7;
  background: #fff7e8;
  color: #d58a1c;
}
.detail-actions .detail-action-button i {
  font-size: 15px;
}
.detail-actions span {
  margin-left: auto;
  color: #9aa6b7;
  font-size: 12px;
}
.reply-section {
  padding: 0 32px 28px;
}
.reply-section h3 {
  margin: 0;
  padding: 19px 0;
  border-top: 8px solid #f5f7fa;
  color: #303133;
  font-size: 16px;
}
.reply-section h3 span {
  color: #409eff;
}
.reply-item {
  padding: 14px 0;
  display: flex;
  gap: 10px;
  border-top: 1px solid #eef2f6;
}
.reply-item.is-nested {
  padding-left: 12px;
  border-left: 2px solid #d9ecff;
}
.reply-avatar {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
}
.reply-item b {
  color: #5d6f88;
  font-size: 13px;
}
.reply-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}
.reply-to {
  color: #7c8da6;
  font-size: 12px;
}
.reply-item time {
  color: #a6b0bf;
  font-size: 11px;
}
.reply-item p {
  margin: 6px 0 0;
  color: #4d5f76;
  font-size: 13px;
  line-height: 20px;
}
.reply-button {
  min-height: 30px;
  margin-top: 5px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: #7c8da6;
  font-size: 12px;
  cursor: pointer;
}
.reply-button:hover {
  color: #409eff;
}
.reply-load-more {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}
.reply-load-more .el-icon-loading {
  margin-right: 6px;
  color: #409eff;
}
.reply-editor {
  margin-top: 18px;
}
.reply-target {
  min-height: 34px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #d9ecff;
  border-bottom: 0;
  border-radius: 4px 4px 0 0;
  background: #ecf5ff;
  color: #5b7da9;
  font-size: 12px;
}
.reply-target button {
  min-height: 30px;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: #409eff;
  font-size: 12px;
  cursor: pointer;
}
.reply-editor .el-button {
  min-height: 40px;
  margin-top: 10px;
  float: right;
}
.reply-editor:after {
  display: table;
  clear: both;
  content: '';
}
button:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .detail-actions .detail-action-button {
    transition: none;
  }
}
@media (max-width: 1180px) {
  .forum-layout {
    grid-template-columns: 190px minmax(0, 1fr);
  }
}
@media (max-width: 760px) {
  .park-forum {
    padding: 10px;
  }
  .forum-layout {
    margin-top: 10px;
    display: block;
  }
  .detail-header {
    padding: 36px 20px 18px;
  }
  .detail-header h2 {
    font-size: 19px;
    line-height: 28px;
  }
  .detail-content,
  .reply-section {
    padding-right: 20px;
    padding-left: 20px;
  }
  .detail-content {
    padding-top: 18px;
  }
  .detail-actions span {
    display: none;
  }
  ::v-deep .topic-drawer {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
