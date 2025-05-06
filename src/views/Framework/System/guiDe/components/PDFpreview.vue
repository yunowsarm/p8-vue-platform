<template>
  <div class="simple-pdf-viewer">
    <!-- 最简单的方式 - 使用iframe -->
      <iframe
      v-if="pdfUrl"
      class="iframe-preview"
      :src=" isLinePath ? `static/pdfjs/web/viewer.html?file=${pdfUrl}`: pdfUrl"
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
      pdfUrl: '',
      objectUrl: null, // 用于存储和清理 URL 对象
      isLinePath: true
    }
  },
 mounted() {
   this.loadPdf()
  },
  methods:{
    async loadPdf() {
      if (this.record.mTitle?.length) {
        const res = await this.$api['SystemSettings.getFileUrl']({ 
          attachmentId: this.record.mTitle[0].id 
        }, { 
          responseType: 'blob' 
        })
        if (res?.data) {
          const blob = new Blob([res.data],{ type: res.data.type });
          this.objectUrl = window.URL.createObjectURL(blob);
          this.pdfUrl = this.objectUrl
        }
        this.isLinePath = true
      } else if (this.record.mURL) {
        // 如果获取失败，直接使用原始URL
        this.isLinePath = false
        this.pdfUrl = this.record.mURL;
      }
    },
  },
  beforeDestroy() {
    // 组件销毁时清理 URL 对象
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }
}
</script>

<style scoped>
.simple-pdf-viewer {
  width: 100%;
  height: 100%;
}
.iframe-preview {
  width: 100%;
  height: 100%;
}
</style>