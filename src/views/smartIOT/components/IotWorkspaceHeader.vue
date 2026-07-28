<template>
  <div class="iot-workspace-header">
    <div class="workspace-context">
      <el-button v-if="showBack" size="small" icon="el-icon-back" @click="$emit('back')">返回总览</el-button>
      <span v-if="showBack" class="workspace-divider"></span>
      <div>
        <b>{{ item.title }}</b>
        <small>{{ item.detail }}</small>
      </div>
    </div>
    <div class="workspace-meta">
      <span v-if="item.count !== null && item.count !== undefined"><i :class="item.icon"></i>{{ item.count }} {{ countLabel }}</span>
      <span v-if="updatedAt"><i class="el-icon-time"></i>更新 {{ updatedAt }}</span>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IotWorkspaceHeader',
  props: {
    item: {
      type: Object,
      required: true
    },
    updatedAt: {
      type: String,
      default: ''
    },
    countLabel: {
      type: String,
      default: '条记录'
    },
    showBack: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.iot-workspace-header {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 14px;
  background: #fbfcfe;
  border-bottom: 1px solid #e8edf4;
  box-sizing: border-box;
}
.workspace-context {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}
.workspace-divider {
  width: 1px;
  height: 28px;
  flex: 0 0 auto;
  background: #dde4ed;
}
.workspace-context > div {
  min-width: 0;
}
.workspace-context b,
.workspace-context small {
  display: block;
}
.workspace-context b {
  color: #2f3e53;
  font-size: 16px;
}
.workspace-context small {
  margin-top: 4px;
  overflow: hidden;
  color: #8592a4;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workspace-meta {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 14px;
  color: #7d899a;
  font-size: 12px;
}
.workspace-meta i {
  margin-right: 5px;
  color: #3977d7;
}
@media (max-width: 760px) {
  .iot-workspace-header,
  .workspace-context {
    align-items: flex-start;
  }
  .iot-workspace-header {
    flex-direction: column;
    padding-top: 12px;
    padding-bottom: 12px;
  }
  .workspace-meta {
    width: 100%;
    justify-content: flex-end;
  }
}
@media (max-width: 480px) {
  .workspace-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
