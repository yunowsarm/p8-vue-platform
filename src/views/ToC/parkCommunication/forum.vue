<template>
  <main class="park-forum">
    <section class="forum-nav" aria-label="帖子操作">
      <div class="sort-tabs" role="tablist" aria-label="帖子排序方式">
        <button v-for="item in sortTabs" :key="item.key" type="button" :class="{ active: activeSort === item.key }" role="tab" :aria-selected="activeSort === item.key" @click="setSort(item.key)">
          {{ item.label }}
        </button>
      </div>
      <div class="forum-toolbar">
        <el-input
          v-model.trim="keyword"
          clearable
          size="small"
          prefix-icon="el-icon-search"
          placeholder="搜索帖子、版块或关键词"
          aria-label="搜索园区论坛"
          @clear="searchTopics"
          @keyup.enter.native="searchTopics" />
        <el-button size="small" icon="el-icon-search" @click="searchTopics">搜索</el-button>
      </div>
      <el-button class="publish-topic-button" type="primary" size="small" icon="el-icon-edit" @click="openPublish">发布帖子</el-button>
    </section>

    <section class="forum-layout">
      <aside class="board-panel" aria-label="论坛版块">
        <div class="panel-title">
          <h2>浏览版块</h2>
        </div>
        <button type="button" class="board-item" :class="{ active: activeCategory === 'all' }" @click="selectCategory('all')">
          <i class="el-icon-collection"></i>
          <span>全部动态</span>
          <b>{{ topicTotal }}</b>
        </button>
        <button v-for="category in categories" :key="category.id" type="button" class="board-item" :class="{ active: activeCategory === category.id }" @click="selectCategory(category.id)">
          <img v-if="isImageIcon(category.icon)" class="category-image" :src="category.icon" :alt="category.name" />
          <i v-else :class="categoryIcon(category)" :style="{ color: category.color }"></i>
          <span>{{ category.name }}</span>
        </button>
        <div class="panel-rule">
          <i class="el-icon-warning-outline"></i>
          <p>请勿发布广告、隐私信息或不实内容。</p>
        </div>
      </aside>

      <section v-loading="topicsLoading || myTopicsLoading" class="topic-panel" aria-live="polite">
        <!-- <div class="topic-head">
          <div>
            <h2>{{ activeCategoryName }}</h2>
            <p>{{ activeCategory === 'all' ? '园区里的新鲜事，都在这里发生' : '当前版块的讨论内容' }}</p>
          </div>
          <span>{{ topicResultCount }} 个结果</span>
        </div> -->
        <div v-if="filteredTopics.length" class="topic-list">
          <article v-for="topic in filteredTopics" :key="topic.id" class="topic-card" tabindex="0" role="button" @click="openTopic(topic)" @keydown.enter="openTopic(topic)">
            <div class="topic-card-main">
              <div class="topic-topline">
                <span v-if="topic.isTop" class="top-mark">置顶</span>
                <span class="category-tag" :style="{ color: categoryById(topic.categoryId).color, backgroundColor: categoryById(topic.categoryId).softColor }">
                  {{ categoryById(topic.categoryId).name }}
                </span>
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
              <button type="button" :class="{ active: topic.liked }" :aria-label="'点赞 ' + topic.title" @click="toggleLike(topic)">
                <svg class="like-heart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3 4.7 13A5.1 5.1 0 0 1 12 5.8 5.1 5.1 0 0 1 19.3 13L12 20.3Z" /></svg>
                {{ topic.likeCount }}
              </button>
              <button type="button" aria-label="查看评论" @click="openTopic(topic)">
                <i class="el-icon-chat-dot-round"></i>
                {{ topic.replyCount }}
              </button>
              <button type="button" :class="{ active: topic.favorited }" :aria-label="'收藏 ' + topic.title" @click="toggleFavorite(topic)">
                <i class="el-icon-star-off"></i>
                {{ topic.favorited ? '已收藏' : '收藏' }}
              </button>
              <template v-if="isOwnTopic(topic)">
                <button type="button" class="topic-manage-button" :aria-label="'编辑 ' + topic.title" @click="openEdit(topic)">
                  <i class="el-icon-edit-outline"></i>
                  编辑
                </button>
                <button type="button" class="topic-manage-button danger" :aria-label="'删除 ' + topic.title" @click="deleteTopic(topic)">
                  <i class="el-icon-delete"></i>
                  删除
                </button>
              </template>
              <span>
                <i class="el-icon-view"></i>
                {{ topic.viewCount }}
              </span>
            </div>
          </article>
        </div>
        <el-empty v-else description="没有找到相关帖子" :image-size="92"><el-button size="small" type="primary" @click="resetFilters">查看全部帖子</el-button></el-empty>
        <div ref="loadMoreTrigger" class="load-more" aria-live="polite">
          <span v-if="loadingMore"><i class="el-icon-loading"></i> 正在加载更多内容</span>
          <span v-else-if="hasMoreTopics">向下滚动加载更多</span>
          <span v-else-if="filteredTopics.length">已经到底了</span>
        </div>
      </section>

      <aside class="discover-panel" aria-label="论坛推荐">
        <section class="side-section">
          <div class="panel-title">
            <h2>热门讨论</h2>
            <i class="el-icon-top"></i>
          </div>
          <button v-for="(topic, index) in hotTopics" :key="topic.id" type="button" class="rank-item" @click="openTopic(topic)">
            <b :class="{ highlight: index < 3 }">0{{ index + 1 }}</b>
            <span>{{ topic.title }}</span>
            <em>{{ topic.replyCount }}</em>
          </button>
          <el-empty v-if="!hotTopics.length" description="暂无讨论" :image-size="54" />
        </section>
      </aside>
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
            <button type="button" :class="{ active: selectedTopic.liked }" @click="toggleLike(selectedTopic)">
              <svg class="like-heart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3 4.7 13A5.1 5.1 0 0 1 12 5.8 5.1 5.1 0 0 1 19.3 13L12 20.3Z" /></svg>
              {{ selectedTopic.liked ? '已点赞' : '点赞' }} {{ selectedTopic.likeCount }}
            </button>
            <button type="button" :class="{ active: selectedTopic.favorited }" @click="toggleFavorite(selectedTopic)">
              <i class="el-icon-star-off"></i>
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
                  <span v-if="reply.replyToUserId" class="reply-to">回复 {{ replyToUserName(reply) }}</span>
                  <time>{{ formatDateTime(reply.createdAt) }}</time>
                </div>
                <p>{{ reply.content }}</p>
                <button type="button" class="reply-button" :aria-label="'回复 ' + authorName(reply)" @click="startReply(reply)"><i class="el-icon-chat-dot-round"></i> 回复</button>
              </div>
            </article>
          </div>
          <el-empty v-else v-loading="repliesLoading" description="还没有回复，来抢沙发吧" :image-size="70" />
          <div class="reply-editor">
            <div v-if="replyTarget" class="reply-target"><span>回复 {{ authorName(replyTarget) }}</span><button type="button" @click="cancelReply">取消回复</button></div>
            <el-input ref="replyInput" v-model.trim="replyContent" type="textarea" :rows="3" maxlength="300" show-word-limit :placeholder="replyPlaceholder" />
            <el-button type="primary" size="small" :loading="replying" :disabled="!replyContent" @click="submitReply">发布回复</el-button>
          </div>
        </section>
      </article>
    </el-drawer>
  </main>
</template>

<script>
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
  data() {
    return {
      categories: [],
      topics: [],
      myTopics: [],
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
      replying: false,
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
    activeCategoryName() {
      if (this.activeSort === 'myTopics') return '我的帖子'
      return this.activeCategory === 'all' ? '全部动态' : this.categoryById(this.activeCategory).name
    },
    filteredTopics() {
      const keyword = this.appliedKeyword.toLowerCase()
      const source = this.activeSort === 'myTopics' ? this.myTopics : this.topics
      const list = source.filter((topic) => {
        const text = `${topic.title || ''}${topic.content || ''}${this.authorName(topic)}${this.categoryById(topic.categoryId).name}`.toLowerCase()
        const matchedCategory = this.activeCategory === 'all' || String(topic.categoryId) === String(this.activeCategory)
        return (!keyword || text.includes(keyword)) && matchedCategory && (this.activeSort !== 'favorites' || topic.favorited)
      })
      return list.slice().sort((a, b) => {
        if (this.activeSort === 'hot') return b.replyCount + b.likeCount - (a.replyCount + a.likeCount)
        return Number(b.isTop) - Number(a.isTop) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    },
    topicResultCount() {
      return this.appliedKeyword || this.activeSort === 'favorites' || this.activeSort === 'myTopics' ? this.filteredTopics.length : this.topicTotal
    },
    hasMoreTopics() {
      return this.activeSort !== 'myTopics' && this.topics.length < this.topicTotal
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
  },
  beforeDestroy() {
    if (this.loadMoreObserver) this.loadMoreObserver.disconnect()
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
        if (this.activeCategory !== 'all') params.categoryId = this.activeCategory
        const response = await this.$api['forum.topicsPage'](params)
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
      const userId = this.currentUserId()
      if (!userId) {
        this.myTopics = []
        this.requireUserOptions()
        return
      }
      this.myTopicsLoading = true
      try {
        const firstPage = await this.$api['forum.topicsPage']({ page: 1, size: 100 })
        const pages = Math.max(1, Number(firstPage && firstPage.pages) || 1)
        const requests = []
        for (let page = 2; page <= pages; page += 1) requests.push(this.$api['forum.topicsPage']({ page, size: 100 }))
        const results = await Promise.all(requests)
        const records = (firstPage && firstPage.records ? firstPage.records : []).concat(...results.map((item) => (item && item.records) || []))
        this.myTopics = records.filter((topic) => String(topic.userId) === String(userId)).map((topic) => this.normalizeTopic(topic))
      } catch (error) {
        this.myTopics = []
        this.showRequestError(error, '我的帖子加载失败')
      } finally {
        this.myTopicsLoading = false
      }
    },
    normalizeCategory(item, index) {
      const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
      return Object.assign({}, item, { id: item.id, name: item.name || '未命名版块', icon: item.icon || palette.icon, color: palette.color, softColor: palette.softColor })
    },
    normalizeTopic(item) {
      return Object.assign({}, item, {
        likeCount: Number(item.likeCount || 0),
        replyCount: Number(item.replyCount || 0),
        viewCount: Number(item.viewCount || 0),
        liked: Boolean(this.likedTopicIds[item.id]),
        favorited: Boolean(this.favoritedTopicIds[item.id]),
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
    },
    selectCategory(categoryId) {
      if (this.activeCategory === categoryId) return
      this.activeCategory = categoryId
      this.currentPage = 1
      this.appliedKeyword = ''
      this.keyword = ''
      if (this.activeSort === 'myTopics') return
      this.loadTopics()
    },
    loadMoreTopics() {
      if (!this.hasMoreTopics || this.topicsLoading || this.loadingMore) return
      this.currentPage += 1
      this.loadTopics(true)
    },
    initLoadMoreObserver() {
      if (!window.IntersectionObserver) return
      this.loadMoreObserver = new window.IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) this.loadMoreTopics()
      }, { rootMargin: '0px 0px 160px' })
      this.observeLoadMoreTrigger()
    },
    observeLoadMoreTrigger() {
      if (!this.loadMoreObserver || !this.$refs.loadMoreTrigger) return
      this.loadMoreObserver.disconnect()
      this.loadMoreObserver.observe(this.$refs.loadMoreTrigger)
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
      this.repliesLoading = true
      try {
        const detail = await this.$api['forum.topicDetail']({ id: topic.id })
        this.selectedTopic = Object.assign(this.normalizeTopic(detail || topic), { replies: [] })
        this.syncTopic(this.selectedTopic)
        await this.loadReplies(this.selectedTopic.id)
      } catch (error) {
        this.selectedTopic = Object.assign({}, topic, { replies: [] })
        this.showRequestError(error, '帖子详情加载失败')
      } finally {
        this.repliesLoading = false
      }
    },
    async loadReplies(topicId) {
      const response = await this.$api['forum.repliesPage']({ topicId, page: 1, size: 100 })
      const page = response && response.records ? response : { records: [] }
      if (this.selectedTopic && String(this.selectedTopic.id) === String(topicId)) this.selectedTopic.replies = (page.records || []).map((item) => this.normalizeReply(item))
    },
    replyIndentStyle(depth) {
      return depth ? { marginLeft: `${Math.min(depth, 3) * 24}px` } : {}
    },
    replyToUserName(reply) {
      if (!reply || !reply.replyToUserId || !this.selectedTopic) return ''
      const target = this.selectedTopic.replies.find((item) => String(item.userId) === String(reply.replyToUserId))
      return target ? this.authorName(target) : `用户${reply.replyToUserId}`
    },
    startReply(reply) {
      this.replyTarget = reply
      this.$nextTick(() => this.$refs.replyInput && this.$refs.replyInput.focus())
    },
    cancelReply() {
      this.replyTarget = null
    },
    syncTopic(topic) {
      const index = this.topics.findIndex((item) => String(item.id) === String(topic.id))
      if (index !== -1) this.$set(this.topics, index, Object.assign({}, this.topics[index], topic))
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
    openEdit() {
      this.$message.warning('编辑接口尚未提供，暂不能保存修改')
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
        if (this.selectedTopic && String(this.selectedTopic.id) === String(topic.id)) this.detailVisible = false
        if (this.activeSort !== 'myTopics') await this.loadTopics()
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
        await this.$api['forum.replyCreate']({
          topicId: this.selectedTopic.id,
          content: this.replyContent,
          parentId: this.replyTarget ? this.replyTarget.id : 0,
          replyToUserId: this.replyTarget ? this.replyTarget.userId : 0
        }, options)
        this.replyContent = ''
        this.replyTarget = null
        await this.loadReplies(this.selectedTopic.id)
        const detail = await this.$api['forum.topicDetail']({ id: this.selectedTopic.id })
        this.selectedTopic = Object.assign(this.normalizeTopic(detail), { replies: this.selectedTopic.replies })
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
.sort-tabs {
  height: 58px;
  display: flex;
  gap: 20px;
}
.sort-tabs button {
  position: relative;
  padding: 0;
  border: 0;
  background: transparent;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
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
.forum-toolbar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}
.forum-toolbar .el-input {
  min-width: 0;
  flex: 1;
}
.publish-topic-button {
  justify-self: end;
}
.forum-layout {
  max-width: 1500px;
  margin: 12px auto 0;
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr) 258px;
  gap: 12px;
  align-items: start;
}
.board-panel,
.topic-panel,
.discover-panel {
  min-width: 0;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}
.board-panel,
.discover-panel {
  padding: 14px 10px;
}
.panel-title {
  margin: 0 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-title h2 {
  margin: 0;
  font-size: 15px;
}
.panel-title span,
.panel-title i {
  color: #909399;
  font-size: 13px;
}
.board-item {
  width: 100%;
  min-height: 44px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #606266;
  text-align: left;
  cursor: pointer;
}
.board-item:hover,
.board-item.active {
  background: #ecf5ff;
  color: #409eff;
}
.board-item > i,
.category-image {
  width: 18px;
  height: 18px;
  object-fit: contain;
  text-align: center;
  font-size: 17px;
}
.board-item span {
  flex: 1;
  font-size: 13px;
}
.board-item b {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}
.panel-rule {
  margin: 16px 4px 0;
  padding: 12px;
  display: flex;
  gap: 7px;
  border-radius: 8px;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
  line-height: 19px;
}
.panel-rule i {
  margin-top: 2px;
  color: #d1963c;
}
.panel-rule p {
  margin: 0;
}
.topic-panel {
  overflow: hidden;
}
.topic-head {
  min-height: 70px;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
}
.topic-head h2 {
  margin: 0;
  font-size: 17px;
}
.topic-head p {
  margin: 5px 0 0;
  color: #909399;
  font-size: 12px;
}
.topic-head > span {
  color: #909399;
  font-size: 12px;
}
.topic-list {
  padding: 0 20px;
}
.topic-card {
  position: relative;
  padding: 20px 0 15px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  outline: none;
}
.topic-card:last-child {
  border-bottom: 0;
}
.topic-card:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: -2px;
}
.topic-card:focus-visible h3,
.topic-card:hover h3 {
  color: #409eff;
}
.topic-topline {
  display: flex;
  align-items: center;
  gap: 7px;
}
.top-mark,
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
.topic-topline time {
  color: #9aa7b9;
  font-size: 12px;
}
.topic-card h3 {
  margin: 9px 0 7px;
  overflow: hidden;
  color: #303133;
  font-size: 16px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}
.topic-card-main > p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
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
.topic-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.topic-actions button,
.topic-actions span {
  min-height: 30px;
  padding: 0 2px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  background: transparent;
  color: #99a5b5;
  font-size: 12px;
}
.topic-actions button {
  cursor: pointer;
}
.topic-actions .topic-manage-button {
  min-height: 30px;
}
.topic-actions .danger,
.topic-actions .danger:hover {
  color: #f56c6c;
}
.topic-actions button:hover,
.topic-actions button.active {
  color: #409eff;
}
.topic-actions i {
  font-size: 15px;
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
.topic-actions button.active .like-heart-icon,
.detail-actions button.active .like-heart-icon {
  fill: currentColor;
}
.load-more {
  min-height: 48px;
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
.side-section + .side-section {
  margin-top: 22px;
}
.rank-item {
  width: 100%;
  min-height: 44px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #4e6078;
  text-align: left;
  cursor: pointer;
}
.rank-item b {
  width: 20px;
  color: #a7b1bf;
  font-size: 12px;
  font-style: italic;
}
.rank-item b.highlight {
  color: #e17a45;
}
.rank-item span {
  flex: 1;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-item em {
  color: #a0acbc;
  font-size: 11px;
  font-style: normal;
}
.rank-item:hover span {
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
.detail-actions button {
  min-height: 44px;
  padding: 0 11px;
  border: 1px solid #e4eaf2;
  border-radius: 5px;
  background: #fff;
  color: #728198;
  cursor: pointer;
}
.detail-actions button.active {
  border-color: #b3d8ff;
  background: #ecf5ff;
  color: #409eff;
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
@media (max-width: 1180px) {
  .forum-nav {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    padding: 10px 16px;
  }
  .forum-toolbar {
    grid-row: 2;
    grid-column: 1/-1;
  }
  .forum-layout {
    grid-template-columns: 190px minmax(0, 1fr);
  }
  .discover-panel {
    display: none;
  }
}
@media (max-width: 760px) {
  .park-forum {
    padding: 10px;
  }
  .forum-nav {
    min-height: 0;
    padding: 8px 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .sort-tabs {
    width: 100%;
    height: 36px;
    gap: 17px;
    overflow-x: auto;
  }
  .sort-tabs button {
    min-width: 44px;
    white-space: nowrap;
  }
  .forum-toolbar {
    width: 100%;
    order: 3;
  }
  .publish-topic-button {
    order: 2;
  }
  .forum-layout {
    margin-top: 10px;
    display: block;
  }
  .board-panel {
    margin-bottom: 10px;
    padding: 10px;
    display: flex;
    gap: 7px;
    overflow-x: auto;
  }
  .board-panel .panel-title,
  .panel-rule {
    display: none;
  }
  .board-item {
    width: auto;
    min-width: max-content;
    border: 1px solid #e6ebf4;
    background: #fff;
  }
  .board-item b {
    display: none;
  }
  .topic-head {
    min-height: 58px;
    padding: 0 14px;
  }
  .topic-head p {
    display: none;
  }
  .topic-list {
    padding: 0 14px;
  }
  .topic-card {
    padding: 16px 0 12px;
  }
  .topic-card h3 {
    font-size: 15px;
  }
  .topic-actions {
    gap: 14px;
  }
  .topic-actions span:last-child {
    margin-left: auto;
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
