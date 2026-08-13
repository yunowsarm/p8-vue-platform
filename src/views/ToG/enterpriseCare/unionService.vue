<template><EnterpriseCareBoard :config="config" /></template>
<script>
import EnterpriseCareBoard from './components/EnterpriseCareBoard.vue'
const config = { title: '工会服务', namespace: 'togUnionService', icon: 'el-icon-s-custom', statusOptions: ['待受理', '办理中', '已办结'] }
export default { name: 'UnionService', components: { EnterpriseCareBoard }, data: () => ({ config }) }
</script>
