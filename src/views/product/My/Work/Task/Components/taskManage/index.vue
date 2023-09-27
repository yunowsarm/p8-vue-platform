<template>
  <pane-view paneTitle="管理要素"
             icon="p8 icon-guanliyaosu">
    <template #paneTitle>
      <div></div>
    </template>
    <template #paneInfo>
      <div class="task-manage-con">
        <list-view :thirdMenuParam="thirdMenuParam"></list-view>
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
    }
  },
  data () {
    return {}
  },
  mounted () {

  },
  methods: {}
}
</script>

