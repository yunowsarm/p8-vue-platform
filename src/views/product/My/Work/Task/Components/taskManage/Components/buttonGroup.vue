<template>
  <div class="btn-con">
    <template v-for="(button,btnIdx) in buttonGroup">
      <template v-if="btnIdx === 0">
        <!-- <el-tooltip> -->
        <span :key="button.name">
          <el-button type="text"
                     :disabled='btnDisabled'
                     @click="renderComp[button.eventHandle](button, stepsRow)">{{button.title}}</el-button>
        </span>
        <!-- </el-tooltip> -->
        <el-divider v-if="buttonGroup.length>1"
                    direction="vertical"
                    :key="button.id"></el-divider>
      </template>
      <template v-if="(buttonGroup.length === 2) && (btnIdx === 1)">
        <!-- <el-tooltip> -->
        <span :key="button.name">
          <el-button type="text"
                     :disabled='btnDisabled'
                     @click="renderComp[button.eventHandle](button, stepsRow)">{{button.title}}</el-button>
        </span>
        <!-- </el-tooltip> -->
      </template>
    </template>
    <template v-if="buttonGroup.length>2">
      <el-dropdown>
        <span class="el-dropdown-link">
          更多
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <template v-for="(button,btnIdx) in buttonGroup">
            <el-dropdown-item :key="button.id"
                              v-if="btnIdx > 0">
              <!-- <el-tooltip> -->
              <span>
                <el-button type="text"
                           :disabled='btnDisabled'
                           @click="renderComp[button.eventHandle](button, stepsRow)">
                  <i class="p8"></i>
                  {{button.title}}
                </el-button>
              </span>
              <!-- </el-tooltip> -->
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>
<script>
import { Divider, Button, Dropdown, DropdownMenu, DropdownItem } from 'p8-components-ui' // Tooltip,
export default {
  name: 'ButtonGroup',
  props: {
    comp: {
      type: Object
    },
    buttonGroup: {
      type: Array
    },
    nullity: {
      type: Number
    },
    stepsRow: {
      type: Object
    }
  },
  data () {
    return {
      btnDisabled: false
    }
  },
  components: {
    // 'el-tooltip': Tooltip,
    'el-button': Button,
    'el-divider': Divider,
    'el-dropdown': Dropdown,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem
  },
  computed: {
    renderComp () {
      return this.comp
    }
  },
  mounted () {
    if (this.nullity === 1) {
      this.btnDisabled = true
    } else {
      this.btnDisabled = false
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-button--small {
  padding: 0;
}

::v-deep .el-dropdown-link {
  color: #2196f3;
  font-size: 12px;
  cursor: pointer;
}

::v-deep.el-table--enable-row-transition .el-table__body tr:hover td {
  background: #e7f4ff;
}

::v-deep .el-pagination__jump {
  margin-left: 0;
}

::v-deep .el-pagination.is-background .btn-prev,
::v-deep .el-pagination.is-background .btn-next,
::v-deep .el-pagination.is-background .el-pager li {
  background-color: #f7f9ff;
}

::v-deep .el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: #1890ff;
}
.btn-con {
  text-align: center;
}
</style>
