<template>
  <div class="c-button" :class="buttonDynamicClass">
    <template>
      <el-tooltip :content="cbutton.title" placement="top" :offset="-15" :enterable="false" effect="dark">
        <span>
          <el-button type="text" :disabled="isDisable(cbutton)" @click="btnClick(cbutton)">
            <div v-if="size === 'mini' && !cbutton.icon.startsWith('p8')" class="style-div-color" :style="colorDynamicStyle(cbutton)"></div>
            <div v-else>
              <i :class="cbutton.icon" :style="iconDynamicClass"></i>
              <span class="button-title" v-if="size !== 'mini'" v-show="false">{{ 1 }}</span>
            </div>
          </el-button>
        </span>
      </el-tooltip>
      <el-dropdown v-if="cbutton.children && cbutton.children.length && size != 'mini'">
        <i class="el-icon-caret-bottom" :class="{ disabled: dropVisible }"></i>
        <el-dropdown-menu slot="dropdown">
          <div v-for="(btnChild, index) in cbutton.children" :key="index" :class="{ isdisable: isDisable(btnChild) }">
            <el-dropdown-item @click.native="btnClick(btnChild)" :disabled="isDisable(btnChild)">
              <el-button v-if="btnChild.id !== 'createByNum'" type="text" :disabled="isDisable(btnChild)">
                <i :class="btnChild.icon"></i>
                {{ btnChild.title }}
              </el-button>
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>

<script>
import { DropdownMenu, DropdownItem, Button, Dropdown, Tooltip } from 'element-ui'
export default {
  name: 'CommandButton',
  components: {
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem,
    'el-button': Button,
    'el-dropdown': Dropdown,
    'el-tooltip': Tooltip
  },
  props: {
    cbutton: {
      type: Object,
      default: () => {}
    },
    btn: {
      type: Object,
      default: () => {}
    },
    size: {
      type: String, // large,small,mini
      default: ''
    },
    selectTasks: {
      type: Array,
      default: () => []
    },
    ganttObject: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showHelp: false,
      isBtnOver: false,
      isExpandOver: false,
      dropVisible: true,
      level: '',
      scheduling: ''
    }
  },
  watch: {
    selectTasks: function (newVal, oldVal) {
      this.scheduling = ''
    }
  },
  computed: {
    isDisable() {
      let that = this
      return function (btn) {
        let result
        if (!btn.isDisableFun(btn, this.ganttObject, this.selectTasks)) {
          result = this.isDisableFun(btn, this.ganttObject, this.selectTasks) // 添加额外逻辑处理
        } else {
          result = btn.isDisableFun(btn, this.ganttObject, this.selectTasks)
        }
        if (!result) {
          that.dropVisible = false
        }
        return result
      }
    },
    selectDisable() {
      return function (btn) {
        return btn.isDisableFun(this.ganttObject, this.selectTasks)
      }
    },
    expandEvents() {
      let eventsObj = {}
      if (!this.isDisable) {
        eventsObj = { mouseover: this.expandOver, mouseout: this.expandOut }
      }

      return eventsObj
    },
    buttonDynamicClass() {
      let sizeClass = 'c-button-' + this.size
      let classObj = [{ 'c-button-disabled': this.isDisable }, sizeClass]
      return classObj
    },
    iconDynamicClass() {
      let iconSize
      switch (this.size) {
        case 'large':
          iconSize = 'font-size: 24px;'
          break
        case 'mini':
          iconSize = 'font-size: 16px;'
          break
      }
      return iconSize
    },
    colorDynamicStyle() {
      return function (btn) {
        let styleObj = 'background:' + btn.icon
        if (this.isDisable(btn)) {
          styleObj = 'background: #6D6D6D'
        }
        return styleObj
      }
    }
  },
  mounted() {},
  methods: {
    btnClick(btn) {
      btn.clickFun(btn, this.ganttObject, this.selectTasks)
    },
    btnOver() {
      this.isBtnOver = true
    },
    btnOut() {
      this.isBtnOver = false
    },
    expandOver() {
      this.isExpandOver = true
    },
    expandOut() {
      this.isExpandOver = false
    },
    isDisableFun(btn, ganttObject, tasks) {
      let result = false
      // 额外的处理逻辑
      return result
    }
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
  width: 30px;
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

.c-button-disabled {
  color: #e0e0e0;
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
  color: $base-disabled-color;
}
.isdisable {
  cursor: no-drop;
}
</style>
