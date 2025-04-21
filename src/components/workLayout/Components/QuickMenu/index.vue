<template>
  <div class="quickMenu">
    <div class="myWork">
      <div class="moduleTitle">我的工作</div>
      <ul class="quickMenuItem">
        <li @click="quickEntry('myTask')">
          <span class="num" v-if="quickNum.myWorkNum>0"> {{ quickNum.myWorkNum }} </span>
          <div class="icon-myWork"></div>
          <span>我的工作</span>
        </li>
        <li @click="$emit('my-approval')">
          <span class="num" v-if="quickNum.myApprovalNum>0"> {{ quickNum.myApprovalNum }} </span>
          <div class="p8 icon-myApproval"></div>
          <span>我的审批</span>
        </li>
      </ul>
    </div>
    <div class="quickEntry">
      <div class="moduleTitle">快捷入口</div>
      <ul class="quickMenuItem">
        <li
          v-show="item.name == '科研项目管理'"
          v-for="item in menuModuleData"
          :key="item.id"
          @click="
            item.childMenus.length
              ? quickEntry(item.defaultMenu, item.childMenus)
              : null
          "
        >
          <div class="pic" :class="item.icon"></div>
          <span>{{ item.shortName }}</span>
          <div class="mask" v-if="item.childMenus.length === 0"></div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import store from '@/plugins/store'
export default {
  name: 'QuickMenu',
  data () {
    return {
      menuModuleData: [],
      quickNum: []
    }
  },
  mounted () {
    this.initListData()
    this.initData()
  },
  methods: {
    initListData () {
      let _this = this
      this.$api['workHomePage.menuModuleList']().then(function (res) {
        _this.menuModuleData = res
      })
    },
    initData () {
      let _this = this
      _this.$api['userMessage.myWorkData']().then(function (res) {
        _this.quickNum = res
      })
    },
    quickEntry (name, childMenus) {
      let _this = this
      let flag
      store.dispatch('generateFilterRouters', { roles: [], childMenus: childMenus })
        .then(context => {
          if (context.addRoutes.length) {
            context.addRoutes.map(item => {
              if (item.children) {
                item.children.map(item2 => {
                  if (item2.name === name) {
                    flag = 1
                  }
                })
              }
            })
            if (flag) {
              _this.$router.push({ name: name })
            } else {
              // alert(context.addRoutes[0].children[0].name)
              _this.$router.push({ name: context.addRoutes[0].children[0].name })
            }
          }
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.quickMenu {
  width: pxTorem(340px);
  height: 100%;
  background:#133B78;

  .moduleTitle {
    height: pxTorem(44px);
    line-height: pxTorem(44px);
    text-indent: pxTorem(10px);
    font-size: $font-size-small;
    border-bottom: pxTorem(1px) solid rgba(255,255,255,0.5);
    color: $base-white-color;
    font-weight: bold;
  }

  .myWork {
    width: 100%;
    height: pxTorem(160px);
    border-bottom: pxTorem(1px) solid rgba(255,255,255,0.5);

    .quickMenuItem {
      display: flex;
      cursor: pointer;

      li {
        width: 50%;
        text-align: center;
        position: relative;

        span {
          font-size: $font-size-small;
          color: $base-white-color;
        }
        .num {
          position: absolute;
          top: pxTorem(18px);
          left: pxTorem(100px);
          width: pxTorem(16px);
          height: pxTorem(16px);
          border-radius: pxTorem(16px);
          background: red;
          color: $base-white-color;
          font-size: $font-size-mini;
          line-height: pxTorem(16px);
          text-align: center;
          display: block;
          border: 1px solid $base-white-color;
        }
        div {
          width: 100%;
          height: pxTorem(40px);
          // margin: 25px 0 10px 0;
          @include remCalc(margin, 25px, 0px, 10px, 0px);
          &.icon-myWork {
            background: url('../../../../assets/image/workHome/my-work.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-myApproval {
            background: url('../../../../assets/image/workHome/my-approval.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }
        }
      }
    }
  }

  .quickEntry {
    width: 100%;
    height: calc(100% - #{pxTorem(181px)});

    .quickMenuItem {
      display: flex;
      flex-wrap: wrap;
      cursor: pointer;

      li {
        width: calc(100% / 3);
        text-align: center;
        margin-bottom: pxTorem(20px);
        position: relative;

        > .mask {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          background: rgba(255, 255, 255, 0.5);
        }

        span {
          font-size: $font-size-small;
          color: $base-white-color;
        }
        div.pic {
          width: 100%;
          height: pxTorem(40px);
          @include remCalc(margin, 20px, 0px, 10px, 0px);
          &.icon-scientific-manage {
            background: url('../../../../assets/image/workHome/scientific-project-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-afterSales-manage {
            background: url('../../../../assets/image/workHome/after-sales-project-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-ntegrated-manage {
            background: url('../../../../assets/image/workHome/ntegrated-project-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-investment-manage {
            background: url('../../../../assets/image/workHome/investment-project-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-quality-manage {
            background: url('../../../../assets/image/workHome/quality-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-supply-chain-manage {
            background: url('../../../../assets/image/workHome/supply-chain-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-asset-manage {
            background: url('../../../../assets/image/workHome/asset-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }

          &.icon-risk-manage {
            background: url('../../../../assets/image/workHome/risk-manage.png')
              no-repeat;
            background-position: center;
            background-size: contain;
          }
        }
      }
    }
  }
}
</style>
