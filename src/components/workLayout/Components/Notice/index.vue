<template>
  <div class="notice">
    <div class="moduleTitle">通知公告</div>
    <ul class="quickMenuItem" v-if="secondMessage.length">
      <li @click="$emit('message',item.id)" v-for="item in secondMessage" :key="item.id">
        <i class="p8" :class="item.icon"></i>
        <span class="text">{{item.cmeaning}}</span>
        <span v-if="item.noread>0" class="num">{{item.noread}}</span>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Notice',
  data () {
    return {
      secondMessage: [] // 展示二级菜单
    }
  },
  mounted () {
    let _this = this
    if (this.messageInfo && this.messageInfo.length) {
      this.messageInfo.map(item => {
        _this.messageNum.map(itemNum => {
          if ((item.cparentid === '18') && (item.id === itemNum.id)) {
            _this.secondMessage.push({ ...item, ...itemNum })
          }
        })
      })
    }
  },
  watch: {
    messageNum (val, oldVal) {
      let _this = this
      if (this.messageInfo && this.messageInfo.length) {
        this.secondMessage = []
        this.messageInfo.map(item => {
          val.map(itemNum => {
            if ((item.cparentid === '18') && (item.id === itemNum.id)) {
              _this.secondMessage.push({ ...item, ...itemNum })
            }
          })
        })
      }
    }
  },
  computed: {
    ...mapGetters([
      'messageNum',
      'messageInfo'
    ])
  }
}
</script>
<style lang="scss" scoped>
  .notice{
    width:100%;
    height:pxTorem(130px);
    background:$base-white-color;
    box-shadow: 5px 5px 13px rgba(99, 99, 99, 0.1);

    .moduleTitle {
      height:pxTorem(44px);
      line-height:pxTorem(44px);
      text-indent:pxTorem(10px);
      font-size:$font-size-small;
      border-bottom:pxTorem(1px) solid $base-line-color;
      color:#5d5d5d;
      font-weight:bold;
    }

    .quickMenuItem{
      height:pxTorem(41px);
      width: 100%;
      border-bottom:pxTorem(1px) solid $base-line-color;
      margin-top:pxTorem(22px);
      overflow:hidden;

      li{
        float:left;
        @include remCalc(padding, 9px, 25px, 9px, 20px);
        border:pxTorem(1px) solid $base-line-color;
        margin-left:pxTorem(10px);
        border-top-left-radius: pxTorem(2px);
        border-top-right-radius: pxTorem(2px);
        border-bottom:0;
        line-height:pxTorem(22px);
        position:relative;
        cursor:pointer;

        i{
          font-size:pxTorem(22px);
          margin-right:pxTorem(5px);
          float:left;
        }

        .text{
          font-size:$font-size-small;
        }

        .num{
          position:absolute;
          right:pxTorem(10px);
          top:pxTorem(2px);
          width:pxTorem(16px);
          height:pxTorem(16px);
          border-radius:pxTorem(16px);
          background:red;
          color:$base-white-color;
          font-size:$font-size-mini;
          line-height:pxTorem(16px);
          text-align:center;
        }
      }
    }
  }

</style>
