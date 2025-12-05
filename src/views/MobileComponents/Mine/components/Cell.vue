<template>
  <div class="cell" :class="{ danger: isDanger }" @click="$emit('click')">
    <i :class="icon"></i>
    <span class="title">{{ title }}</span>
    <i class="el-icon-arrow-right arrow"></i>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    icon: String,
    isDanger: Boolean,
  }
}
</script>

<style scoped>
.cell {
  display: flex;
  align-items: center;
  padding: 15px 18px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}
.cell i {
  margin-right: 12px;
  font-size: 20px;
}
.title {
  flex: 1;
}
.arrow {
  color: #bbb;
}
.danger {
  color: #ff4d4f;
}
</style>
