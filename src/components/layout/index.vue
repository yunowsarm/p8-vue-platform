<template>
  <div class="layout">
    <sidebar :style="{ width: sidebarState.width }"></sidebar>
    <section class="section" :style="{ width: `calc(100% - ${sidebarState.width})` }">
      <headers></headers>
      <div class="main-content">
        <tag-tabs></tag-tabs>
        <app-main class="main-wrapper" id="mainWrapper"></app-main>
      </div>
    </section>
  </div>
</template>

<script>
import headers from './Components/header'
import sidebar from './Components/Sidebar'
import tagTabs from './Components/tagTabs'
import appMain from './Components/main'

import { mapGetters } from 'vuex'

export default {
  name: 'Layout',
  components: {
    headers,
    sidebar,
    tagTabs,
    appMain
  },
  computed: {
    ...mapGetters(['sidebarState'])
  }
}
</script>

<style lang="scss">
.main {
  background: #fafafa;
}
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;

  .section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    width: 100% !important;
    flex: 1 auto;
    display: inherit;
    flex-direction: column;
    transition: all 0.3s ease-in-out 0s;
    height: calc(100% - 35px);
    .main-wrapper {
      flex: 1;
      background: #f1f1f1;
    }
  }
}
</style>
