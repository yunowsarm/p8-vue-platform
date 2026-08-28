<!-- 政府端政策查询入口：复用 ToB 惠企政策与政策解读查询页面。 -->
<template><benefit-policy /></template>

<script>
import BenefitPolicy from '../../ToB/publicServices/benefitPolicy.vue'

export default {
  name: 'EnterprisePolicy',
  components: { BenefitPolicy }
}
</script>
