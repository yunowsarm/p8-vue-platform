<template>
  <main class="main"
        id="contentMain">
    <!-- custom scroll bar for main area -->
    <VuePerfectScrollbar class="scroll-area"
                         :settings="scrollOptions">
      <transition name="fade-transform">
        <keep-alive :include="cachedViews">
          <router-view class="main-router" />
        </keep-alive>
      </transition>
    </VuePerfectScrollbar>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'Main',
  data () {
    return {
      scrollOptions: {
        // maxScrollbarLength: 500
      }
    }
  },
  computed: {
    ...mapGetters(['cachedViews'])
  },
  components: {
    VuePerfectScrollbar
  }
}
</script>

<style lang="scss" scoped>
.main {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  min-width: 800px;
  overflow: hidden;
  background: $base-white-color;

  .scroll-area {
    width: 100%;
    height: 100%;
    position: relative;
    // padding:10px;
    box-sizing: border-box;
    ::v-deep > .normal-layout.grid-table-render {
      margin: 14px;
      height: calc(100% - 28px);
    }
    .main-router {
      background: #fcfcfc;
      border-radius: 5px;
      // height: 100%;
      // overflow: auto;
      // height: 1000px;
    }
  }
  .fade-transform-enter-form {
    opacity: 0;
    transform: translateX(-20px);
  }
  .fade-transform-enter-active {
    transition: all 0.3s ease;
  }
  .fade-transform-enter-to {
    opacity: 1;
    transform: translateX(0);
  }

  .fade-transform-leave-form {
    opacity: 1;
  }
  .fade-transform-leave-active {
    transition: all 0.3s ease;
  }
  .fade-transform-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>
