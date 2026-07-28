<template>
  <nav class="iot-workspace-nav" :style="{ '--workspace-columns': Math.min(items.length, 5) }" :aria-label="ariaLabel">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="workspace-item"
      :class="{ active: value === item.key }"
      :aria-current="value === item.key ? 'page' : null"
      @click="selectWorkspace(item.key)"
    >
      <span class="workspace-icon"><i :class="item.icon"></i></span>
      <span class="workspace-copy"><b>{{ item.title }}</b><small>{{ item.description }}</small></span>
      <em v-if="item.count !== null && item.count !== undefined" :class="{ danger: item.danger }">{{ item.count }}</em>
    </button>
  </nav>
</template>

<script>
export default {
  name: 'IotWorkspaceNav',
  props: {
    value: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    ariaLabel: {
      type: String,
      default: '业务工作区'
    }
  },
  methods: {
    selectWorkspace(key) {
      if (key === this.value) return
      this.$emit('input', key)
      this.$emit('change', key)
    }
  }
}
</script>

<style lang="scss" scoped>
.iot-workspace-nav {
  display: grid;
  grid-template-columns: repeat(var(--workspace-columns), minmax(150px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  padding: 6px;
  background: #fff;
  border: 1px solid #e8edf4;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(34, 48, 68, 0.025);
}
.workspace-item {
  display: flex;
  min-width: 0;
  min-height: 70px;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  color: #516176;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease;
}
.workspace-item:hover {
  color: #2f68bd;
  background: #f6f9fe;
}
.workspace-item:focus-visible {
  outline: 2px solid #2468f2;
  outline-offset: 1px;
}
.workspace-item.active {
  color: #245fae;
  background: #edf4ff;
  border-color: #d6e5fb;
  box-shadow: inset 3px 0 0 #2468f2;
}
.workspace-icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: #5277a8;
  background: #eef3f9;
  border-radius: 7px;
  font-size: 16px;
}
.workspace-item.active .workspace-icon {
  color: #fff;
  background: #3478df;
}
.workspace-copy {
  min-width: 0;
  flex: 1;
}
.workspace-copy b,
.workspace-copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.workspace-copy b {
  color: #34445a;
  font-size: 14px;
}
.workspace-item.active .workspace-copy b {
  color: #245fae;
}
.workspace-copy small {
  margin-top: 4px;
  color: #8a97a8;
  font-size: 12px;
}
.workspace-item em {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  color: #627288;
  background: #edf1f6;
  border-radius: 11px;
  font-size: 11px;
  font-style: normal;
  box-sizing: border-box;
}
.workspace-item em.danger {
  color: #d74747;
  background: #fff0f0;
}
@media (max-width: 1250px) {
  .iot-workspace-nav {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .iot-workspace-nav {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .iot-workspace-nav {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .workspace-item {
    transition: none;
  }
}
</style>
