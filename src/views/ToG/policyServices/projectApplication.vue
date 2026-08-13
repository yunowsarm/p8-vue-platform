<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
import { projectApplicationConfig as config } from './components/policyServiceConfigs'
export default { name: 'ProjectApplication', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
