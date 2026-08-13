<template><PolicyServiceBoard :config="config" /></template>
<script>
import PolicyServiceBoard from './components/PolicyServiceBoard.vue'
import { policyPushConfig as config } from './components/policyServiceConfigs'
export default { name: 'PolicyPush', components: { PolicyServiceBoard }, data: () => ({ config }) }
</script>
