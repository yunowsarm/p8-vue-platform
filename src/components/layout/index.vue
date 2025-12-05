<template>
  <div style='height: 100%;width: 100%'>
    <div class="layout" v-if='!isMobile'>
      <sidebar :style="{ width: sidebarState.width }"></sidebar>
      <section class="section" :style="{ width: `calc(100% - ${isMobile ? sidebarState.sidebarMinWidth : 0})` }">
        <headers></headers>
        <!-- <div v-if="isMobile" class="slide-bar-mobile"
          @click="slideSidebar">
          <div class="slider p8"
              :class="{ 'icon-youzhedie1': !this.sidebarState.isOpen, 'icon-zuozhedie1': this.sidebarState.isOpen }"></div>
        </div> -->
        <div class="main-content">
          <tag-tabs v-if="!isMobile"></tag-tabs>
          <app-main class="main-wrapper" id="mainWrapper"></app-main>
        </div>
      </section>
    </div>
    <div class='mobile-layout' v-else>
      <mobile-layout></mobile-layout>
    </div>
  </div>
</template>

<script>
import headers from './Components/header'
import sidebar from './Components/Sidebar'
import tagTabs from './Components/tagTabs'
import appMain from './Components/main'
import MobileLayout from './Components/MobileLayout.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'Layout',
  components: {
    headers,
    sidebar,
    tagTabs,
    appMain,
    MobileLayout
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile
    },
    ...mapGetters(['sidebarState'])
  },
  methods: {
    slideSidebar () {
      // if (this.isMobile) {
      //   this.$store.dispatch('hideSidebar', !this.sidebarState.isHidden)
      // }
      this.$store.dispatch('collapseSidebar', !this.sidebarState.isOpen)
    }
  }
}
</script>

<style lang="scss">
.slide-bar-mobile {
  position: absolute;
  top: 0;
  right: 0;
  width: 35px;
  height: 35px;
  display: inherit;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.3rem;
  border-right: 1px solid $base-line-color;
  .slider {
    transition: all 0.3s ease 0s;
    color: white;
    font-size: $font-size-medium;
    &.collapsed {
      transform: rotateZ(90deg);
    }
  }
  border-radius: 50%;
  z-index: 99999999;
  background: #3491FA;
}
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
