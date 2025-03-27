<template>
  <div class="simple-pdf-viewer">
    <!-- 最简单的方式 - 使用iframe -->
    <iframe 
      :src="pdfUrl"
      width="100%" 
      height="100%"
      style="border: none;"
    ></iframe>
  </div>
</template>

<script>
export default {
  props: {
    record: {
      type: Object,
      default: ()=> {return {}}
    }
  },
  data () {
    return {
      page: '',
      pdfUrl: './static/helpFile/系统操作手册.pdf'
    }
  },
  mounted() {
    // 如果需要跳转到指定页面
    this.page = this.record.mURL
    if(this.page > 1) {
      this.$nextTick(() => {
        // 注意：这种方法需要PDF支持#page=参数
        const viewer = this.$el.querySelector('iframe');
        viewer.src = `${this.pdfUrl}#page=${this.page}`;
      });
    }
  }
}
</script>

<style scoped>
.simple-pdf-viewer {
  width: 100%;
  height: 100%;
}
</style>