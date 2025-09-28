<template>
  <pane-view paneTitle="管理要素"
             icon="p8 icon-guanliyaosu">
    <template #paneTitle>
      <!-- <div> -->
      <div v-if="$store.getters.isMobile"
           v-show="isShow"
           class="pane-title-right"
           @click="arrowClickHandle">
        <i class="p8 icon-zuoshoujin"
           style="color: #79bcfa;"></i>
      </div>
      <div v-if="$store.getters.isMobile"
           v-show="!isShow"
           class="pane-title-right"
           @click="rightClickHandle">
        <i class="p8 icon-youshoujin"
           style="color: #79bcfa;"></i>
      </div>
      <!-- </div> -->
    </template>
    <template #paneInfo>
      <div v-show="isShow"
           class="task-manage-con">
        <list-view :btnType="btnType"
                   :approveType="approveType"
                   :thirdMenuParam="thirdMenuParam"></list-view>
      </div>
    </template>
  </pane-view>
</template>
<script>
import PaneView from '../layout/Pane'
import ListView from './list'
export default {
  name: 'TaksManager',
  inject: ['getPlanInfo'],
  components: {
    PaneView,
    ListView
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    btnType: {
      type: Boolean
    },
    approveType: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isShow: true
    }
  },
  mounted () {

  },
  methods: {
    arrowClickHandle () {
      this.isShow = false
      this.$emit('onClick', this.isShow)
    },
    rightClickHandle () {
      this.isShow = true
      this.$emit('onClick', this.isShow)
    }
  }
}
</script>
<style lang="scss" scoped>
.pane-title-right {
  float: right;
  font-size: 16px;
}
</style>
