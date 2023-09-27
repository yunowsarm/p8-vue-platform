<template>
  <el-popover
    placement="top-start"
    width="220"
    trigger="hover"
    :disabled="row.idleDaysList && row.idleDaysList.length < 1">
    <!-- <template #content> -->
      <div class="popover-content-con">
        <div class="title"><span>空闲时段</span></div>
        <ul class="times">
          <li v-for="(item,index) in row.idleDaysList" :key="index">
            <span>{{item.startDate}} - {{item.endDate}}</span>
          </li>
        </ul>
      </div>
    <!-- </template> -->
    <div class="idle-con" slot="reference">
      <el-progress :percentage="row.utilization" :color="customColorMethod"></el-progress>
    </div>
  </el-popover>
</template>
<script>
import { Popover } from 'p8-components-ui'
// import moment from 'moment'
export default {
  name: 'IdleDays',
  props: {
    row: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
    }
  },
  methods: {
    customColorMethod() {
      let utilization = parseInt(this.row.utilization)
      if (utilization == 100) {
        return '#B22222' // 深红
      } else if (utilization > 80) {
        return '#FFA500' // 橙色
      } else if (utilization > 0 && utilization <= 80) {
        return '#3CB371' // 绿
      }
    },
  },
  components: {
    'el-popover': Popover
  }
}
</script>
<style lang="scss">
  .idle-con {
    width: 100%;
  }
  .popover-content-con {
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    .title {
      line-height: 30px;
      border-bottom: 1px solid #cccccc;
      padding-left: 10px;
    }
    ul.times {
      padding: 0 10px;
      li {
        height: 30px;
        line-height: 30px;
        color: #999;
      }
    }
  }
</style>
