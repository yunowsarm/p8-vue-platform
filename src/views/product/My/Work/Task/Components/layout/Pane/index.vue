<template>
  <div class="pane-wrap">
    <div class="pane-title">
      <span>
        <i :class="icon"></i>
        {{paneTitle}}
      </span>
      <slot name="paneTitle"></slot>
    </div>
    <div class="pane-info">
      <slot name="paneInfo"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PaneView',
  props: {
    paneTitle: {
      type: String,
      default: 'Title名称'
    },
    icon: {
      type: String
    }
  },
  components: {

  }
}
</script>
<style lang="scss" scoped>
.pane-wrap {
  // height: 100%;
  .pane-title {
    position: relative;
    height: 40px;
    line-height: 40px;
    box-sizing: border-box;
    padding: 0 8px;
    background-color: #f5f7fa;
    color: #333333;
    font-weight: 600;
  }
}
@media screen and (min-width: 800px) and (max-width: 1920px) {
  .pane-info {
    height: calc(100% - 30px);
    overflow-y: auto;
  }
}
</style>
