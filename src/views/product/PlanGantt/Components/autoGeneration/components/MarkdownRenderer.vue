<template>
  <div v-html="compiledMarkdown"></div>
</template>

<script>
import marked from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css' // 选择你喜欢的代码高亮样式

export default {
  props: {
    content: {
      type: String,
      required: true
    }
  },
  computed: {
    compiledMarkdown() {
      marked.setOptions({
        highlight: function (code, language) {
          const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
          return hljs.highlight(validLanguage, code).value
        }
      })
      return marked(this.content)
    }
  },
  created() {
    console.log(this.compiledMarkdown,'md内容解析后')
  }
}
</script>

<style scoped>
.markdown-content {
  /* 你可以在这里添加一些自定义样式 */
}
</style>
