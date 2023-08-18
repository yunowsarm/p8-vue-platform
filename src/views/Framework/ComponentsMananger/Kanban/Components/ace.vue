<template>
  <div :style="{height: clientHeight, width: clientWidth}"></div>
</template>

<script>

const ace = require('brace')
const defaultConfig = { // Editor 默认配置
  lang: 'hjson', // 语言
  theme: 'xcode', // 编辑器主题
  options: { // Ace Editor 配置
    useSoftTabs: true, // 默认 2 个空格缩进
    tabSize: 2
  }
}

export default {
  computed: {
    editorConfig () { // 这里主要是防止 props `config` 中只配置了一部分，无法使用默认值
      return Object.assign({}, defaultConfig, this.config)
    },
    clientWidth () {
      return this.width
    },
    clientHeight () {
      return this.height
    }
  },
  props: {
    value: {
      type: String,
      required: true
    },
    height: {
      type: String
    },
    width: {
      type: String
    },
    fontSize: {
      type: Number,
      default: 12
    },
    config: {
      type: Object,
      default: function () {
        return defaultConfig
      }
    }
  },
  watch: {
    value: {
      handler: function (newValue, oldValue) {
        // console.log('value watch', newValue, oldValue)
        this.editor.setValue(newValue, -1)
      }
    }
  },
  data () {
    return {
      editor: null
    }
  },
  beforeDestroy: function () {
    this.editor.destroy()
    this.editor.container.remove()
  },
  mounted () {
    this.$nextTick(() => {
      let {
        lang,
        theme
      } = this.editorConfig
      let editor

      lang === 'html' && require('brace/ext/emmet')
      require('brace/ext/language_tools') // 自动补全 提示
      require('brace/ext/searchbox')
      require('brace/mode/' + lang) // 语言
      require('brace/theme/' + theme)
      require('brace/snippets/' + lang)
      require('brace/snippets/text')
      this.editor = editor = ace.edit(this.$el)

      editor.setTheme('ace/theme/' + theme)
      editor.setOption('enableBasicAutocompletion', true)
      editor.setOption('enableLiveAutocompletion', true)
      editor.setOption('enableSnippets', true)
      editor.getSession().setMode('ace/mode/' + lang)
      editor.$blockScrolling = Infinity
      editor.setFontSize(this.fontSize)
      editor.setValue(this.value, -1)
      this.editorConfig.options && editor.setOptions(this.editorConfig.options)

      this.$emit('init', editor)

      editor.on('change', _ => {
        this.dispatch('ElFormItem', 'el.form.change', editor.getValue())
        this.$emit('update:value', editor.getValue())
      })
    })
  },
  methods: {
    dispatch (componentName, eventName, params) {
      var parent = this.$parent || this.$root
      var name = parent.$options.componentName

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent

        if (parent) {
          name = parent.$options.componentName
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params))
      }
    }
  }
}
  </script>
