
<template>
  <div class="markdown-container"> <!-- 新增外层容器 -->
    <div class="loading-container"
         :class="{'fade-out': !isLoading}">
      <div class="loading-spinner"></div>
    </div>
    <!-- 目录区域 -->
    <div class="chapter-list">
      <ul>
        <li v-for="(chapter, index) in chapters"
            :key="index"
            :id="'view' + chapter.id"
            :class="{ 'active': activeChapter === index }"
            @click="scrollToChapterMenu(chapter, index)">
          <span :class="`chapter-level level-${chapter.level}`">{{ chapter.title }}</span>
        </li>
      </ul>
    </div>
    <!-- 预览区域 -->
    <div class="markdown-content">
      <vue-markdown :source="markdownContent"
                    @rendered="onMarkdownRendered"
                    class="contentView"></vue-markdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 外层容器：使用flex实现左右布局 */
.markdown-container {
  display: flex;
  width: 100%;
  height: calc(100% - 10px); /* 确保占满全屏高度 */
}

/* 目录区域：固定宽度，左侧显示 */
.chapter-list {
  width: 280px; /* 固定目录宽度 */
  height: 100%;
  overflow-y: auto;
  padding: 10px 0;
  border-right: 1px solid #eee; /* 加个分隔线 */
  box-sizing: border-box; /* 避免padding撑大宽度 */
}

.chapter-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chapter-list li {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chapter-list li:hover {
  background-color: #f5f7fa;
}

.chapter-list li.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.chapter-level {
  display: inline-block;
}

.level-1 {
  font-weight: bold;
  font-size: 16px;
  padding-left: 0;
}

.level-2 {
  font-size: 14px;
  padding-left: 16px;
}

.level-3 {
  font-size: 13px;
  padding-left: 32px;
}

/* 预览区域：自适应剩余宽度，右侧显示 */
.markdown-content {
  flex: 1; /* 占满剩余宽度 */
  padding: 20px 40px; /* 加大内边距，优化阅读体验 */
  overflow-y: auto; /* 内容超出时可滚动 */
  height: 100%; /* 限制高度，避免内容过短时目录高度不一致 */
  box-sizing: border-box;
}

.contentView h1,
.contentView h2,
.contentView h3 {
  scroll-margin-top: 20px;
  margin-top: 30px;
}

/* 图片自适应处理 */
.contentView ::v-deep img {
  max-width: 100%; /* 关键：图片最大宽度不超过容器宽度 */
  height: auto; /* 高度自动计算，保持宽高比 */
  // display: block; /* 让图片独占一行，避免与文字混排 */
  // margin: 16px auto; /* 上下边距16px，水平居中 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 可选：添加轻微阴影增强视觉效果 */
  border-radius: 4px; /* 可选：轻微圆角 */
}

/* 针对特别宽的图片（如代码截图）可进一步限制最大宽度 */
.contentView img.wide-image {
  max-width: 90%; /* 比容器略窄，留出边距 */
}
/* 在原有的样式中添加表格样式 */
.contentView ::v-deep table {
  width: 100%;
  border-collapse: collapse; /* 合并边框 */
  margin: 20px 0; /* 上下边距 */
}

.contentView ::v-deep th,
.contentView ::v-deep td {
  padding: 12px 15px; /* 单元格内边距 */
  border: 1px solid #ddd; /* 边框 */
  text-align: left; /* 文字左对齐 */
}

.contentView ::v-deep th {
  background-color: #f5f7fa; /* 表头背景色 */
  font-weight: bold;
}

/* 隔行变色（可选） */
.contentView ::v-deep tr:nth-child(even) {
  background-color: #f9f9f9;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(225, 225, 225, 0.7);
  z-index: 999;
  transition: opacity 0.5s ease;
}
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fade-out {
  opacity: 0;
  pointer-events: none;
}
</style>
<script>
import VueMarkdown from 'vue-markdown'
// 导入静态md文件
// import markdownFile from './public/static/helpFile/output.md'
import markdownFile from '../../../../../../public/static/helpFile/output.md'

export default {
  name: 'ModelList',
  components: {
    VueMarkdown,
  },
  props: {
    record: {
      type: Object,
      default: () => { return {} }
    }
  },
  data () {
    return {
      isLoading: true,
      drawerVisible: true, // 抽屉是否显示
      markdownContent: '', // markdown内容
      chapters: [], // 章节列表
      activeChapter: 0, // 当前激活的章节
      pendingScroll: null, // 用于存储待执行的滚动操作
      imageLoadCount: 0,  // 已加载的图片数量
      totalImages: 0,      // 总图片数量
      processedImages: new Set()
    }
  },
  mounted () {
    // 加载markdown文件
    this.loadMarkdownFile()
    this.imageLoadCount = 0
  },
  computed: {},
  methods: {
    // 加载markdown文件
    loadMarkdownFile () {
      // 这里使用import导入的方式，也可以使用axios请求
      markdownFile = markdownFile.replace(/\{[^}]*width=[^}]*height[^}]*\}/g, '')
      this.markdownContent = markdownFile
    },
    // markdown渲染完成后解析章节
    onMarkdownRendered () {
      this.$nextTick(() => {
        this.parseChapters();
        this.setupImageLoadListeners();
      });
    },
    // 解析markdown中的章节标题
    parseChapters () {
      // 先检查 .content 容器是否存在
      const contentContainer = document.querySelector('.contentView');
      // 再检查标题元素
      const chapterElements = contentContainer
        ? contentContainer.querySelectorAll('h1, h2, h3')
        : [];

      // 获取当前菜单
      let currentMenu = ''
      let indexNo
      let title = this.record.title ? this.record.title : this.record.meta.title ? this.record.meta.title : ''
      this.chapters = Array.from(chapterElements).map((el, index) => {
        // 获取标题级别 (h1->1, h2->2, h3->3)
        const level = parseInt(el.tagName.replace('h', ''))
        if (title && (title.includes(el.innerText) || el.innerText.includes(title))) {
          currentMenu = {
            title: el.innerText,
            level,
            id: el.id || el.innerText.toLowerCase().replace(/\s+/g, '-')
          }
          indexNo = index
        }
        return {
          title: el.innerText,
          level,
          id: el.id || el.innerText.toLowerCase().replace(/\s+/g, '-') // 生成唯一ID用于锚点
        }
      })
      this.$nextTick(() => {
        this.scrollToChapter(currentMenu, indexNo, true)
        if (!currentMenu) {
          this.isLoading = false
        }
      })
    },    // 设置图片加载监听器
    setupImageLoadListeners () {
      const contentContainer = document.querySelector('.contentView');
      if (!contentContainer) return;

      this.processedImages.clear()
      const images = contentContainer.querySelectorAll('img');
      this.totalImages = images.length;
      this.imageLoadCount = 0;
      // 如果没有图片，直接执行等待的滚动操作
      // 为每个图片添加加载完成事件监听
      images.forEach((img, index) => {
        if (!img.dataset.imgId) {
          img.dataset.imgId = `img-${index}}`
        }
        const imgId = img.dataset.imgId
        img.removeEventListener('load', this.handleImageLoad)
        // img.removeEventListener('error', this.handleImageLoad)

        const loadHandler = () => this.handleImageLoad(imgId)
        const errorHandler = () => this.handleImageLoad(imgId)
        img.addEventListener('load', this.handleImageLoad)
        // img.addEventListener('error', this.handleImageLoad)

        img.dataset.loadHandler = loadHandler
        img.dataset.errorHandler = errorHandler

        if (this.processedImages.has(imgId)) {
          this.checkAllImagesLoaded()
        }
      });
    },
    handleImageLoad (imgId) {
      if (!this.processedImages.has(imgId)) {
        this.processedImages.add(imgId)
        this.imageLoadCount++;
        this.checkAllImagesLoaded();
      }
    },
    // 检查所有图片是否已加载完成
    checkAllImagesLoaded () {
      if (this.imageLoadCount >= this.totalImages && this.pendingScroll) {
        // 所有图片加载完成，执行滚动
        this.executeScroll(this.pendingScroll);
        this.pendingScroll = null;
      }
    },
    // 执行滚动操作
    executeScroll ({ targetElement }) {
      this.isLoading = false
      if (targetElement) {
        // 平滑滚动到目标章节
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    },
    // 跳转到指定章节
    scrollToChapter (chapter, index, scrollLeft) {
      this.processedImages.clear()
      this.activeChapter = index;
      const targetId = chapter.id;
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // 存储待执行的滚动操作
        this.pendingScroll = {
          targetElement,
          index
        };

        // 检查是否所有图片已经加载完成
        const contentContainer = document.querySelector('.contentView');
        const images = contentContainer ? contentContainer.querySelectorAll('img') : [];

        // 如果没有图片，直接滚动
        if (images.length === 0) {
          this.executeScroll(this.pendingScroll, scrollLeft);
          this.pendingScroll = null;
        } else {
          // 否则等待图片加载完成（setupImageLoadListeners会处理）
          this.setupImageLoadListeners();
        }
      }
      if (scrollLeft) {
        this.$nextTick(() => {
          let ele = document.getElementById('view' + chapter.id)
          if (ele) {
            ele.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
          }
        })
      }
    },
    scrollToChapterMenu (chapter, index) {
      this.activeChapter = index
      const targetId = chapter.id
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        // 平滑滚动到目标章节
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
  }
}
</script>
