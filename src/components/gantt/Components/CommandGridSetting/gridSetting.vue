<template>
  <common-dialog
    title="列设置"
    v-if="visible"
    :visible="visible"
    :width="dialogWidth"
    :dialog-height="dialogHeight"
    :dialog-config="dialogConfig"
    @handle-cancel="close"
    @handle-ok="save"
    @close="close"
  >
    <template #dialog>
      <vue-perfect-scrollbar class="setting-wrap">
        <div class="columns">
          <draggable class="list-group" tag="ul" v-model="initialColumns" v-bind="dragOptions" :move="checkDraggableMove" @start="drag = true" @end="drag = false" @change="draggableChangeHandle">
            <li class="list-group-item" v-for="(item, index) in initialColumns" :key="item.name">
              <span class="icon-rank"><i class="el-icon-rank"></i></span>
              <el-checkbox :checked="!item.hide" @change="checkedHandle(index)">
                <span>{{ item.label }}</span>
              </el-checkbox>
            </li>
          </draggable>
        </div>
      </vue-perfect-scrollbar>
    </template>
  </common-dialog>
</template>
<script>
import { P8Dialog as CommonDialog, Checkbox } from 'p8-components-ui'
import draggable from 'vuedraggable'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

import { API_DEFAULT_CONFIG } from '@/config/settings'
import { GanttObject } from '@/assets/commonJS/ganttJS/ganttObject'

export default {
  name: 'TableSetting',
  components: {
    CommonDialog,
    draggable,
    VuePerfectScrollbar,
    'el-checkbox': Checkbox
  },
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    },
    ganttName: {
      type: String,
      default: ''
    },
    createPage: {
      type: String,
      default: ''
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    }
  },
  data() {
    return {
      dialogWidth: '300px',
      dialogHeight: 400,
      dialogConfig: {
        'append-to-body': true
      },
      drag: false,
      api_default_config: API_DEFAULT_CONFIG,
      initialColumns: [],
      tableSettings: [],
      description: 'grid-setting',
      type: 'Gantt',
      saveApi: '/framework/user/setting/save'
    }
  },
  watch: {
    columns: {
      handler(val) {
        const that = this
        if (val && val.length) {
          that.render()
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {},
  methods: {
    removeHTMLTags(str) {
      return str.replace(/<\/?[^>]+(>|$)/g, "");
    },
    render() {
      this.tableSettings = []
      this.initialColumns = this.columns.map((item) => {
        item.hide = item.hide ? item.hide : false
        // 正则处理，只保留表头中文，去掉多余字符
        const reg = /[\u4e00-\u9fa5]/g
        // const result = item.label.match(reg)
        // item.label = result.join('')
        item.label = this.removeHTMLTags(item.label)
        const tempObj = {
          hide: item.hide ? item.hide : false,
          name: item.name || null
        }
        this.tableSettings.push(tempObj)
        return item
      })
    },
    checkedHandle(index) {
      // 手动处理原因[未使用 v-model 绑定 checkbox' v-model绑定时,值改变会立即体现到Table上(但不想这样体现),]
      this.tableSettings[index].hide = !this.tableSettings[index].hide
    },
    checkDraggableMove(evt) {
      // let currIndex = evt.draggedContext.index
      // if (this.tableSettings[currIndex].name && this.tableSettings[currIndex].name !== 'select_grid') {
      //   return false
      // }
      return true
    },
    draggableChangeHandle(v) {
      this.tableSettings = this.updateArray(this.tableSettings, v.moved.newIndex, v.moved.oldIndex)
    },
    updateArray(array, newIndex, oldIndex) {
      array.splice(newIndex, 0, array.splice(oldIndex, 1)[0])
      return array
    },
    close() {
      this.$emit('close')
    },
    save() {
      const _this = this
      const ganttSetting = GanttObject.getGanttSettingGrid(_this.ganttName, _this.createPage)
      let id = null
      if (ganttSetting) {
        id = ganttSetting.id
      }
      const params = [
        {
          id: id,
          key: _this.ganttName + '-' + _this.createPage,
          description: _this.description,
          type: _this.type,
          value: JSON.stringify({ columns: _this.tableSettings })
        }
      ]
      const { devBaseUrl, prodBaseUrl, isDevMode } = _this.api_default_config
      const urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
      /** 使用$ajax请求: 是因为 this.$api请求会将请求参数处理成对象, 而保存设置接口请求参数为数组 */
      _this.$ajax
        .post(urlPrefix + _this.saveApi, params, { headers: { Authorization: this.$store.getters.token } })
        .then((res) => {
          _this.tableSettingVisible = false
          _this.$nextTick(function () {
            _this.renderColumns = _this.initialColumns.map((item, index) => {
              item.isshow = _this.tableSettings[index].isshow
              return item
            })
          })
          // 更新vuex || this.$store.dispatch('getSettingAll')[dispatch会触发请求获取设置信息]
          _this.$store.commit('SET_SETTING_ALL', res)
          _this.$emit('save-setting')
        })
        .catch((err) => {
          console.error('user.setting.save--err', err)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.setting-wrap {
  width: 100%;
  height: 100%;
}
.columns {
  box-sizing: border-box;
  width: 100%;
  padding: 4px 10px;
  .title {
    line-height: 30px;
    color: #444444;
    font-size: 14px;
    i {
      padding-left: 4px;
    }
  }
  .list-group {
    min-height: 20px;
    .list-group-item {
      cursor: move;
      padding: 12px 8px;
      border-bottom: 1px solid #f1f1f1;
      .icon-rank {
        padding-right: 10px;
        font-size: 16px;
      }
      .fixed-select {
        float: right;
        margin-top: -4px;
      }
    }
  }
}
::v-deep .el-radio-button--mini .el-radio-button__inner {
  padding: 6px 10px;
}
</style>
