<template><EnterpriseCareBoard :config="config" /></template>
<script>
import EnterpriseCareBoard from './components/EnterpriseCareBoard.vue'
const config = { title: '党群服务', namespace: 'togPartyService', icon: 'el-icon-s-flag', statusOptions: ['待受理', '办理中', '已办结'] }
export default { name: 'PartyService', components: { EnterpriseCareBoard }, data: () => ({ config }) }
</script>
