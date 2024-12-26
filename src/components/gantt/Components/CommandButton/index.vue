<template>
  <div class="c-button"
       :class="buttonDynamicClass">
    <!-- 层级按钮 -->
    <template v-if="cbutton.id === 'hierarchy-filter'">
      <el-tooltip :content="isDisable(cbutton) ? cbutton.msg : cbutton.title"
                  placement="top"
                  :offset="-15"
                  :enterable="false"
                  effect="dark">
        <el-select v-model="level"
                   :placeholder="cbutton.title"
                   class="c-select"
                   size="mini"
                   style="width: 70px"
                   @change="cbutton.clickFun(level, ganttName)"
                   :clearable="true">
          <el-option v-for="(item, index) in vueThis.deep"
                     :key="item"
                     :label="index + 1"
                     :value="index + 1"> </el-option>
        </el-select>
      </el-tooltip>
    </template>
    <template v-else-if="cbutton.type && cbutton.type === 'select' && cbutton.userDefault && cbutton.userDefault === 'true'">
      <el-tooltip :content="isDisable(cbutton) ? cbutton.msg : cbutton.title"
                  placement="top"
                  :offset="-15"
                  :enterable="false"
                  effect="dark">
        <el-select v-model="scheduling"
                   :placeholder="cbutton.title"
                   class="c-select"
                   size="mini"
                   style="width: 125px"
                   @change="cbutton.clickFun(scheduling, ganttName, currentRecords)">
          <el-option v-for="(item, index) in cbutton.options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
                     :disabled="selectDisable(cbutton)"> </el-option>
        </el-select>
      </el-tooltip>
    </template>
    <template v-else>
      <div @mouseenter="detectionState(cbutton)"
           v-loading="iconStateLoading"
           element-loading-spinner="el-icon-loading"
           class="loading-but">
        <el-tooltip placement="top"
                    :enterable="false"
                    effect="dark"
                    transition=" ">
          <div slot="content">{{ isDisable(cbutton) ? cbutton.msg : cbutton.title }}</div>
          <span @mouseleave="styleMouseleave(cbutton)"
                ref="span">
            <el-button type="text"
                       :disabled="isDisable(cbutton)"
                       @click="btnClick(cbutton)">
              <div v-if="size === 'mini' && !cbutton.icon.startsWith('p8')"
                   class="style-div-color"
                   :style="colorDynamicStyle(cbutton)"></div>
              <div v-else>
                <i :class="cbutton.icon"
                   :style="[iconDynamicClass, !isDisable(cbutton) ? { color: cbutton.color || '' } : {}]"></i>
                <span class="button-title"
                      v-if="size !== 'mini'"
                      v-show="ganttButtonMode === 'tabs'"
                      :style="!isDisable(cbutton) ? { color: cbutton.color || '' } : {}">{{ cbutton.title }}</span>
              </div>
            </el-button>
          </span>
        </el-tooltip>
        <el-dropdown v-if="cbutton.children && cbutton.children.length && size != 'mini'">
          <i class="el-icon-caret-bottom"
             @mouseleave="styleMouseleave(cbutton)"
             :class="{ disabled: dropVisible }"></i>
          <el-dropdown-menu slot="dropdown">
            <div v-for="(btnChild, index) in cbutton.children"
                 :key="btnChild.title"
                 class="c_btn_dropmenu"
                 :class="{ isdisable: isDisable(btnChild) }">
                 <el-tooltip :content="isDisable(btnChild) ? btnChild.msg : btnChild.title"
                  placement="top"
                  :offset="-15"
                  :enterable="false"
                  effect="dark">
                  <div>
                    <el-dropdown-item @click.native="btnClick(btnChild)"
                                :disabled="isDisable(btnChild)">
                <el-button v-if="btnChild.id !== 'createByNum'"
                           type="text"
                           :disabled="isDisable(btnChild)">
                  <i :class="btnChild.icon"></i>
                  {{ btnChild.title }}
                </el-button>
              </el-dropdown-item>
                  </div>
                 </el-tooltip>
            </div>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </template>
  </div>
</template>

<script>
import { DropdownMenu, DropdownItem, Button, Dropdown, Select, Option, Tooltip } from 'p8-components-ui'
import { mapGetters } from 'vuex'
const changeGanttWhiteList = [
  'create-children',
  'create-children-two',
  'create-children-four',
  'create-children-six',
  'create-children-eight',
  'createByNum',
  'create-equative',
  'create-equative-two',
  'create-equative-four',
  'create-equative-six',
  'create-equative-eight',
  'remove-tasks',
  'issue-message',
  'plan-edit-gantt',
  'plan-gantt',
  'detail-info',
  'plan-gantt-resource',
  'critical-path',
  'search-list',
  'full-screen',
  'demand-management'
]
const analysisGanttWhiteList = ['full-screen']
export default {
  name: 'CommandButton',
  components: {
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem,
    'el-button': Button,
    'el-dropdown': Dropdown,
    'el-select': Select,
    'el-option': Option,
    'el-tooltip': Tooltip
  },
  props: {
    cbutton: Object,
    btn: Object,
    size: String, // large,small,mini
    currentRecords: Array,
    classifyData: Array,
    ganttName: String
  },
  data () {
    return {
      showHelp: false,
      isBtnOver: false,
      isExpandOver: false,
      dropVisible: true,
      level: '',
      scheduling: '',
      iconLoading: false,
      iconState: null,
      dutyHintTitle: '',
      iconStateLoading: false
    }
  },
  watch: {
    currentRecords: function (newVal, oldVal) {
      this.scheduling = ''
    }
  },
  computed: {
    isDisable () {
      return (btn) => {
        // 判断是否禁用
        let result = this.checkButtonDisable(btn);

        if (!result) {
          this.dropVisible = false;
        }

        return result;
      };
    },
    selectDisable () {
      return function (btn) {
        if (this.ganttName === 'analysisGantt') {
          return true
        } else if (this.ganttName === 'changeGantt') {
          return true
        } else {
          return btn.isDisableFun(this.ganttName, this.currentRecords)
        }
      }
    },
    expandEvents () {
      let eventsObj = {}
      if (!this.isDisable) {
        eventsObj = { mouseover: this.expandOver, mouseout: this.expandOut }
      }

      return eventsObj
    },
    buttonDynamicClass () {
      const sizeClass = 'c-button-' + this.size
      const classObj = [{ 'c-button-disabled': this.isDisable }, sizeClass]
      return classObj
    },
    iconDynamicClass () {
      let iconSize
      switch (this.size) {
        case 'large':
          iconSize = 'font-size: 24px;'
          break
        case 'mini':
          iconSize = 'font-size: 16px;'
          break
        default:
          iconSize = 'font-size: 16px;'
      }
      return iconSize
    },
    colorDynamicStyle () {
      return function (btn) {
        let styleObj = 'background:' + btn.icon
        if (this.isDisable(btn)) {
          styleObj = 'background: #6D6D6D'
        }
        return styleObj
      }
    },
    ...mapGetters(['vueThis', 'ganttButtonMode'])
  },
  mounted () {
    if(this.cbutton.title === '设计工艺'){
      console.log(this.cbutton)
    }
    let that = this
    if (this.cbutton && this.cbutton.id == 'full-screen') {
      this.$bus.$on('ganttOnFullscreen', function (state) {
        if (state) {
          that.cbutton.title = '退出全屏'
          that.cbutton.icon = 'p8 icon-exit-fullscreen'
          that.cbutton.help = '退出全屏'
        } else {
          that.cbutton.title = '全屏'
          that.cbutton.icon = 'p8 icon-full-screen'
          that.cbutton.help = '全屏'
        }
      })
    }
  },
  methods: {
    // 处理按钮禁用逻辑
    checkButtonDisable (btn) {
      let result;
      if (this.ganttName === 'changeGantt' && this.classifyData) {
        let disableResult = true;

        // 判断按钮是否在任务列表中
        this.classifyData.forEach(item => {
          if (btn.title === item.title) {
            if (this.currentRecords.length > 0) {
              const record = this.currentRecords[0];
              if (record.parent && ['6403', '6404', '6407', '6408'].includes(record.managerStatus)) {
                disableResult = false;
              }
            }
          }
        });

        if (!disableResult) {
          return false;
        }

        // 更新msg
        this.updateButtonMsg(btn);
        return true;
      }

      // 执行btn的isDisableFun逻辑
      if (!btn.isDisableFun(btn, this.ganttName, this.currentRecords)) {
        result = this.isDisableFun(btn, this.ganttName, this.currentRecords);
      } else {
        result = btn.isDisableFun(btn, this.ganttName, this.currentRecords);
      }

      return result;
    },

    // 更新按钮的msg
    updateButtonMsg (btn) {
      const statusName = {
          6401: '已创建',
          6402: '协同编制',
          6403: '待下发',
          6404: '已下发',
          6405: '变更中',
          6406: '提交审批',
          6407: '审批驳回',
          6408: '审批撤销',
          6409: '审批完成'
        };
      if (this.currentRecords.length > 0) {
        const status = this.currentRecords[0].managerStatus;
        this.$set(btn, 'msg', `任务为${statusName[status]}，不可操作`);
      } else {
        this.$set(btn, 'msg', '请选择任务');
      }
    },
    btnClick (btn) {
      if (btn.id === '1015' && this.iconState.zrlXz) {
        return null
      }

      if (btn.id === '1008' && this.iconState.yjhXzQx) {
        return null
      }

      btn.clickFun(btn, this.ganttName, this.currentRecords)
      // 变更页面修改保存按钮文字
      if (this.vueThis.ganttName === 'changeGantt') {
        this.vueThis.hasSave = true
      }
    },
    detectionState (btn) {
      if (btn.id === '1008' || btn.id === '1015') {
        this.getMonitorPointState(this.vueThis.planInfoId, btn)
        if (btn.id === '1015') {
          this.getMonitorPointInfo(this.vueThis.planInfoId, btn)
        }
      }
    },
    styleMouseleave (btn) {
      // if (btn.id === '1015') {
      //   this.dutyHintTitle = ''
      // }
    },
    // 获取责任令和计划各种状态锁定
    getMonitorPointState (planInfoId, btn) {
      if (!planInfoId) return null
      this.iconStateLoading = true
      this.$api['planGanttManager.zrlOrMonthlyPlanLockingSituation']({
        planInfoId: planInfoId
      })
        .then((res) => {
          if (Object.keys(res).length > 0) {
            this.iconState = res
          }
          this.isDisable(btn)
          this.iconStateLoading = false
        })
        .catch(function (error) {
          this.iconStateLoading = false
          console.error(error)
        })
    },
    // 获取责任令锁定详情
    getMonitorPointInfo (planInfoId, btn) {
      if (!this.vueThis.planInfoId) return null
      this.dutyHintTitle = `${btn.title}`
      this.$api['planGanttManager.loadMonitorPointDataInfo']({
        planInfoId: planInfoId
      })
        .then((res) => {
          if (res[0]) {
            this.dutyHintTitle = `${btn.title}（${res.join(',')}）`
          }
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    btnOver () {
      this.isBtnOver = true
    },
    btnOut () {
      this.isBtnOver = false
    },
    expandOver () {
      this.isExpandOver = true
    },
    expandOut () {
      this.isExpandOver = false
    },
    isDisableFun (btn, ganttName, tasks) {
      const result = false
      // 额外的处理逻辑
      return result
    }
  },
  beforeDestroy () {
    this.$bus.$off('ganttOnFullscreen')
  }
}
</script>

<style lang="scss" scoped>
.c-button {
  display: block;

  .el-dropdown {
    margin-top: -5px;
    color: $base-light-color;
  }
}

.c-button-large .button-title {
  display: block;
  font-size: 13px;
  margin-top: 3px;
}

.c-button-large .el-dropdown {
  display: block;
  text-align: center;
  // width: 30px;
}

.c-button-small {
  width: auto;
  height: auto;
  text-align: left;
}

.c-button-small .button-title {
  text-align: left;
  font-size: 13px;
  margin-left: 5px;
}

.c-button-large .children-expand-icon {
  width: 100%;
}

.c-button-over {
  display: inline-block;
  background-color: #e6f7ff;
}

.c-button-disabled,
.c_btn_dropmenu {
  color: #e0e0e0;

  .el-button.is-disabled,
  .el-button.is-disabled:hover,
  .el-button.is-disabled:focus {
    color: #a0afc5;
  }
}

.c-button-mini {
  width: 30px;
  height: auto;
  text-align: left;
}

.style-div-color {
  width: 12px;
  height: 12px;
  // border: 1px solid #ccc;
}

.disabled {
  color: #a0afc5;
}

.isdisable {
  cursor: no-drop;
}
</style>

<style>
.loading-but .el-loading-spinner {
  margin-top: -9px;
  right: 8px;
}
</style>
