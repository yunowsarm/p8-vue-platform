<template>
  <div class="progressbar" ref="progressbar" :style="{ width: width, height: height }"></div>
</template>
<script>
export default {
  name: 'Progressbar',
  props: {
    type: {
      type: String,
      default() {
        return 'Circle' // Line / Circle / SemiCircle
      }
    },
    options: {
      type: Object,
      required: false,
      default() {
        return null
      }
    }
  },
  data() {
    return {
      shape: null,
      width: '',
      height: ''
    }
  },
  mounted() {
    if (this.options) {
      this.init()
    }
  },
  methods: {
    init() {
      const ProgressBar = require('progressbar.js')
      if (ProgressBar) {
        this.width = this.options.width || '100%'
        this.height = this.options.height || '100%'
        this.shape = new ProgressBar[this.type](this.$refs.progressbar, {
          svgStyle: {
            width: this.width,
            height: this.height
          },
          ...this.options
        })
      }
    },
    set(progress) {
      this.shape.set(progress)
    },
    stop() {
      this.shape.stop()
    },
    value() {
      return this.shape.value()
    },
    setText(text) {
      this.shape.setText(text)
    },
    destroy() {
      this.shape.destroy()
    }
  }
}
</script>
