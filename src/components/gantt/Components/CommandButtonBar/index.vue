<template>
  <div class="card-container" v-if="panelData.length > 1">
    <i :class="advance ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="changeCommandButton"></i>
    <i class="el-icon-setting" @click.stop="showButtonBarSetting"></i>
    <el-tabs type="card" v-if="advance">
      <el-tab-pane
        v-for="(panel, index) in panelData"
        :label="panel.panelName"
        :key="index + 1"
        :class="{ noWrap: panel.noWrap, taskTabPane: index === 0 }"
        id="taskTabPane"
        @mouseover.native="tabHover"
      >
        <div v-if="isExecute(panel.groups)" class="group-search">
          <component :is="panel.groups" :gantt-name="ganttName" :special-plan="specialPlan" :plan-info-id="planInfoId" :task-id="taskId" :row-num="rowNum"></component>
        </div>
        <div v-else class="groupContain" :class="{ taskGroupContain: index === 0 }">
          <div class="group" v-for="(group, index) in panel.groups" :key="index">
            <div v-if="isExecute(group.buttonConfigs)" class="group-container">
              <component
                :is="group.buttonConfigs"
                :current-records="selectedTasks"
                :gantt-name="ganttName"
                :plan-info-id="planInfoId"
                :special-plan="specialPlan"
                :task-id="taskId"
                :row-num="rowNum"
              ></component>
            </div>
            <div v-else class="group-container">
              <template v-for="(childGroup, idx) in childGroups(group.buttonConfigs)">
                <div class="child-group" :key="idx">
                  <command-button
                    v-for="(config, index) in childGroup.configs"
                    :key="index"
                    :cbutton="buttonData(config)"
                    :size="config.size"
                    :current-records="selectedTasks"
                    :gantt-name="ganttName"
                  ></command-button>
                </div>
              </template>
            </div>
            <div class="group-title">
              {{ group.groupName }}
            </div>
          </div>
        </div>
        <span v-if="showArrow" id="leftArrow" :class="{ noAction: leftNoAction }" @click.stop="sliderClickHandle('left')"><i class="el-icon-caret-left"></i></span>
        <span v-if="showArrow" id="rightArrow" :class="{ noAction: rightNoAction }" @click.stop="sliderClickHandle('right')"><i class="el-icon-caret-right"></i></span>
      </el-tab-pane>
    </el-tabs>
    <el-tabs type="card" v-else>
      <el-tab-pane v-for="(panel, index) in panelData" :label="panel.panelName" :key="index + 1"> </el-tab-pane>
    </el-tabs>
  </div>
  <div class="card-container" :class="{ double: ganttButtonMode === 'double' && !isGanttChange, single: isGanttChange || ganttButtonMode === 'single' }" v-else>
    <div class="el-tab-pane taskTabPane" :class="{ noWrap: panelData[0].noWrap }">
      <div class="groupContain taskGroupContain">
        <div class="group" v-for="(group, index) in panelData[0].groups" :key="index">
          <div v-if="isExecute(group.buttonConfigs)" class="group-container">
            <div class="group-icon">
              <component
                :is="group.buttonConfigs"
                :current-records="selectedTasks"
                :gantt-name="ganttName"
                :plan-info-id="planInfoId"
                :special-plan="specialPlan"
                :task-id="taskId"
                :row-num="rowNum"
              ></component>
            </div>
            <div class="group-title" v-if="panelData[0].groupNameVisible">
              {{ group.groupName }}
            </div>
          </div>
          <div v-else class="group-container">
            <div class="group-icon">
              <template v-for="(childGroup, idx) in childGroups(group.buttonConfigs)">
                <div class="child-group" :key="idx">
                  <span v-for="(config, index) in childGroup.configs" :key="index">
                    <command-button
                      v-if="config.position.indexOf('top') > -1"
                      :cbutton="buttonData(config)"
                      :size="config.size"
                      :current-records="selectedTasks"
                      :gantt-name="ganttName"
                    ></command-button>
                  </span>
                </div>
              </template>
            </div>
            <div class="group-title" v-if="panelData[0].groupNameVisible">
              {{ group.groupName }}
            </div>
          </div>
          <span v-if="showArrow" id="leftArrow" :class="{ noAction: leftNoAction }" @click.stop="sliderClickHandle('left')"><i class="el-icon-caret-left"></i></span>
          <span v-if="showArrow" id="rightArrow" :class="{ noAction: rightNoAction }" @click.stop="sliderClickHandle('right')"><i class="el-icon-caret-right"></i></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Tabs, TabPane } from 'p8-components-ui'
import CommandButton from '@/components/gantt/Components/CommandButton'
import { CommandButtonData } from '@/assets/commonJS/ganttJS/commandButtonData'
import CommandClassify from '@/components/gantt/Components/CommandClassify'
import CommandMonitor from '@/components/gantt/Components/CommandMonitor'
import CommandSearch from '@/components/gantt/Components/CommandSearch'
import CommandStatistic from '@/components/gantt/Components/CommandStatistic'
export default {
  name: 'CommandButtonBar',
  components: {
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    CommandButton,
    CommandClassify,
    CommandMonitor,
    CommandSearch,
    CommandStatistic
  },
  props: {
    planInfoId: {
      type: String,
      default: ''
    },
    specialPlan: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    panelData: Array,
    selectedTasks: Array,
    ganttName: String,
    isGanttChange: {
      // 是否在计划变更页面使用，默认为不是
      type: Boolean,
      default: false
    },
    ganttType: {
      type: String,
      default: 'common'
    }
  },
  computed: {
    ...mapGetters(['vueThis', 'ganttButtonMode', 'ganttRightButtons']),
    isExecute() {
      return function (configs) {
        if (typeof configs === 'string') {
          return true
        } else {
          return false
        }
      }
    },
    buttonData() {
      const that = this
      return function (btnConfig) {
        const btnData = that.buttonDatas.filter((btn) => btn.id === btnConfig.buttonId)
        return btnData[0]
      }
    },
    childGroups() {
      return function (btnConfigs) {
        const configArray = []
        let childGroup = { configs: [] }
        btnConfigs.map((item, index) => {
          if (item.size === 'large') {
            if (childGroup.configs.length > 0) {
              configArray.push(childGroup)
              childGroup = { configs: [] }
            }
            childGroup.configs.push(item)
            configArray.push(childGroup)
            childGroup = { configs: [] }
          } else if (item.size === 'small') {
            if (childGroup.configs.length < this.rowNum) {
              childGroup.configs.push(item)
            }
            if (childGroup.configs.length === this.rowNum || btnConfigs.length === index + 1) {
              configArray.push(childGroup)
              childGroup = { configs: [] }
            }
          } else if (item.size === 'mini') {
            // 只显示图标
            if (childGroup.configs.length < this.rowNum) {
              childGroup.configs.push(item)
            }
            if (childGroup.configs.length === this.rowNum || btnConfigs.length === index + 1) {
              configArray.push(childGroup)
              childGroup = { configs: [] }
            }
          }
        })
        return configArray
      }
    }
  },
  watch: {
    ganttButtonMode: {
      handler(val) {
        if (!this.isGanttChange) {
          this.rowNum = val === 'single' ? 1 : 2
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      buttonDatas: CommandButtonData,
      advance: true,
      scrollArea: '', // 内容滚动盒子
      scrollContent: '', // 内容滚动dom
      showArrow: true, // 默认展示左右切换按钮
      leftNoAction: true,
      rightNoAction: false,
      rowNum: this.isGanttChange ? 1 : this.ganttButtonMode === 'single' ? 1 : 2
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initDom()
    })

    window.addEventListener('resize', this.resizeShowArrow)
  },
  methods: {
    resizeShowArrow() {
      if (this.scrollContent[0] && this.scrollContent[0].scrollWidth === this.scrollContent[0].offsetWidth) {
        this.showArrow = false
      } else {
        this.showArrow = true
      }
    },
    // 鼠标悬浮事件控制左右切换按钮是否出现
    tabHover() {
      if (this.scrollContent[0].scrollWidth === this.scrollContent[0].offsetWidth) {
        this.showArrow = false
      } else {
        this.showArrow = true
      }
    },
    changeCommandButton() {
      this.advance = !this.advance
      this.$emit('change-command-button', this.advance)
    },
    initDom() {
      this.scrollArea = document.getElementsByClassName('taskTabPane')
      this.scrollContent = document.getElementsByClassName('taskGroupContain')
    },
    sliderClickHandle(pos) {
      const scrollLeft = this.scrollArea[0].scrollLeft
      const scrollWidth = this.scrollContent[0].scrollWidth
      const offsetWidth = this.scrollContent[0].offsetWidth
      if (pos === 'left' && scrollLeft <= 0) return false
      if (pos === 'right' && scrollWidth - offsetWidth - scrollLeft <= 0) return false
      const rightCanScroll = scrollWidth - offsetWidth - scrollLeft
      if (pos === 'right') {
        if (rightCanScroll > 0) {
          this.scrollArea[0].scrollTo({
            left: rightCanScroll >= 250 ? scrollLeft + 250 : scrollLeft + rightCanScroll,
            behavior: 'smooth' // 平滑滚动
          })
          if (rightCanScroll < 250) {
            this.rightNoAction = true
            this.leftNoAction = false
          }
        }
      }
      if (pos === 'left') {
        if (scrollLeft > 0) {
          this.scrollArea[0].scrollTo({
            left: scrollLeft >= 250 ? scrollLeft - 250 : 0,
            behavior: 'smooth' // 平滑滚动
          })
          if (scrollLeft < 250) {
            this.rightNoAction = false
            this.leftNoAction = true
          }
        }
      }
    },
    showButtonBarSetting() {
      this.vueThis.rightMenuConfigVisible = true
    }
  }
}
</script>

<style lang="scss" scope>
.card-container {
  background: $base-white-color;
  overflow: hidden;

  .el-tabs--card {
    > .el-tabs__header {
      margin: 0;
      .el-tabs__nav-wrap {
        background: transparent;
      }

      .el-tabs__nav {
        border: none;
      }

      .el-tabs__item {
        border-left: none;
        color: $base-text-color;

        &.is-active {
          border-left: 1px solid $base-line-color;
          border-right: 1px solid $base-line-color;
          color: $base-light-color;
        }

        &:hover {
          color: $base-light-color;
        }
      }

      .el-tabs__item:first-child {
        &.is-active {
          border-left: none;
        }
      }
    }
  }

  .el-tab-pane {
    overflow-x: auto;
    // height: 122px!important;
    padding: 5px 0;
  }

  .noWrap {
    white-space: nowrap;
  }

  > .el-icon-arrow-down,
  > .el-icon-arrow-up,
  > .el-icon-setting {
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 14px;
    cursor: pointer;
    z-index: 2;
  }

  > .el-icon-setting {
    right: 40px;
  }

  .el-button--text {
    padding-left: 8px;
    padding-right: 4px;
  }

  #leftArrow,
  #rightArrow {
    position: absolute;
    top: 0px;
    width: 15px;
    height: 114px;
    // background: #e4e7ed;
    background: rgba(228, 231, 237, 0.6);
    line-height: 114px;
    text-align: center;
    cursor: pointer;
    display: none;

    > i {
      color: $base-light-color;
      font-size: 16px;
    }
  }
  #leftArrow.noAction,
  #rightArrow.noAction {
    > i {
      color: #999999;
    }
  }

  #leftArrow {
    left: 0px;
  }

  #rightArrow {
    right: 0px;
  }

  .taskTabPane:hover #leftArrow,
  .taskTabPane:hover #rightArrow {
    display: block;
  }

  .group {
    padding: 0px 5px 0px 5px;
    display: inline-block;
    height: 100px;
    min-width: 150px;
    /* width: 150px; */
    border-right: 1px solid $base-line-color;
    // padding: 0;
    box-sizing: border-box;

    .group-container {
      height: 75px;
      padding: 0px 12px;
      box-sizing: border-box;
    }

    .group-title {
      height: 20px;
      color: #6d6d6d;
      text-align: center;
      font-size: $base-font-size;
    }

    .child-group {
      float: left;

      > div:hover,
      > span > div:hover {
        background: $base-active-color;
      }
    }
  }

  .group-search {
    height: 140px;
  }
}

.double {
  height: 78px;
  .el-tab-pane {
    height: 100%;
    overflow-y: hidden;
  }

  .group {
    height: 62px;
    min-width: 40px;
    .group-container {
      height: 68px;

      .group-icon {
        height: 48px;
      }
    }
    .child-group {
      margin-left: 1px;
      margin-right: 1px;
    }
  }

  .el-button--text {
    padding: 2px;
  }

  #leftArrow,
  #rightArrow {
    height: 72px;
    line-height: 72px;
  }
}

.single {
  height: 64px;
  .el-tab-pane {
    height: 100%;
    overflow-y: hidden;
  }

  .group {
    height: 48px;
    min-width: 40px;
    .group-container {
      height: 48px;
      padding: 4px 12px;

      .group-icon {
        height: 28px;
      }
    }
    .child-group {
      margin-left: 1px;
      margin-right: 1px;
    }
  }

  .el-button--text {
    padding: 2px;
  }

  #leftArrow,
  #rightArrow {
    height: 58px;
    line-height: 58px;
  }
}
</style>
