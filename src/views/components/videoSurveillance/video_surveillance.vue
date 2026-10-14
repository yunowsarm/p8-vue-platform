<template>
  <div class="video-surveillance">
    <section class="video-surveillance__content" aria-labelledby="video-surveillance-title">
      <div class="video-surveillance__icon" aria-hidden="true">
        <i class="el-icon-video-camera"></i>
      </div>
      <h2 id="video-surveillance-title" class="video-surveillance__title">视频监控</h2>
      <p class="video-surveillance__description">在独立窗口中打开监控系统，查看实时视频。</p>
      <el-button class="video-surveillance__button" type="primary" icon="el-icon-top-right" @click="openVideoSurveillance">打开视频监控</el-button>
      <p class="video-surveillance__hint">
        <i class="el-icon-info" aria-hidden="true"></i>
        若新窗口未自动打开，请点击上方按钮
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'VideoSurveillance',
  mounted() {
    this.openVideoSurveillance()
  },
  methods: {
    openVideoSurveillance() {
      window.open('http://222.185.238.28:9019/', '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style scoped>
.video-surveillance {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 360px;
  padding: 24px;
  box-sizing: border-box;
  text-align: center;
}

.video-surveillance__content {
  width: 100%;
  max-width: 480px;
}

.video-surveillance__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
  border: 8px solid #f3f8ff;
  border-radius: 50%;
  background: #e8f3ff;
  color: #409eff;
  font-size: 42px;
}

.video-surveillance__title {
  margin: 0 0 12px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.video-surveillance__description {
  margin: 0 0 28px;
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
}

.video-surveillance__button {
  padding: 13px 28px;
  border-radius: 6px;
  font-size: 14px;
}

.video-surveillance__hint {
  margin: 18px 0 0;
  color: #909399;
  font-size: 12px;
  line-height: 1.8;
}
</style>
