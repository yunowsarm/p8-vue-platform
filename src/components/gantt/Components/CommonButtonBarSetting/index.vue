<template>
  <common-dialog :title="title" :width="width" :dialog-config="dialogConfig" :visible="visible" :dialog-height="dialogHeight" @handle-ok="handleOk" @handle-cancel="handleCancel" @close="handleCancel">
    <template #dialog>
      <template title="主菜单配置">
        <div class="title">
          <span>主菜单配置</span>
        </div>
        <div class="content">
          <el-radio-group v-model="value">
            <el-radio v-for="item in radioOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </div>
      </template>
      <template title="排程设置">
        <div class="title">
          <span>排程设置</span>
        </div>
        <div class="content">
          <el-radio-group v-model="autoScheduling">
            <el-radio label="1">自动</el-radio>
            <el-radio label="0">手动</el-radio>
          </el-radio-group>
        </div>
      </template>
      <template title="右键功能区">
        <div class="title">
          <span>右键功能区</span>
        </div>
        <div class="content transferContent">
          <el-transfer v-model="valueBtns" :data="buttonListInLeft" filterable :props="{ key: 'buttonId', label: 'title' }" :titles="['功能列表', '右键菜单']">
            <span slot-scope="{ option }">
              <i :class="option.icon"></i>
              <span>{{ option.title }}</span>
            </span>
          </el-transfer>
        </div>
      </template>
    </template>
  </common-dialog>
</template>

<script>
import { P8Dialog as CommonDialog, RadioGroup, Radio, Transfer } from 'p8-components-ui'
import { getButtonData } from './func'
import { mapGetters } from 'vuex'
export default {
  components: {
    CommonDialog,
    'el-radio-group': RadioGroup,
    'el-radio': Radio,
    'el-transfer': Transfer
  },
  props: {
    width: {
      type: String,
      default: '45%'
    },
    title: {
      type: String,
      default: ''
    },
    showHandleBtn: {
      // 是否显示脚部
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      defalut: false
    },
    dialogConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dialogHeight: {
      type: Number,
      default: 510
    },
    isViewCsFooter: {
      type: Boolean,
      defalut: false
    },
    panelData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['userSettingAll'])
  },
  data() {
    return {
      radioOptions: [
        {
          label: '标签页',
          value: 'tabs'
        },
        {
          label: '多行',
          value: 'double'
        },
        {
          label: '单行',
          value: 'single'
        }
      ],
      value: 'double',
      autoScheduling: '',
      buttonListInLeft: [],
      valueBtns: [],
      updataParams: {
        description: '计划编制: 操作按钮排版配置 / 右键按钮配置',
        type: 'PlanButton',
        saveApi: '/framework/user/setting/save',
        id: '',
        key: 'plan-btn-setting'
      }
    }
  },
  mounted() {
    this.initButtonList()
  },
  methods: {
    initButtonList() {
      /**
       * 1. vuex中获取保存的值
       * 2. 有值, 则以vuex中为基准,进行解析
       * 3. 没有, 则以默认为基准,进行获取
       */

      this.buttonListInLeft = getButtonData(this.panelData)
      this.getSettingData()
    },
    getSettingData() {
      if (this.userSettingAll.PlanButton) {
        const settingData = this.userSettingAll.PlanButton[0]
        this.updataParamsHandle(settingData)
        this.value = settingData.value && settingData.value.type ? settingData.value.type : 'double'
        this.autoScheduling = settingData.value && settingData.value.autoScheduling ? settingData.value.autoScheduling : ''
        const rightBtns = settingData.value && settingData.value.rightBtns
        this.valueBtns = rightBtns.map((btn) => {
          return btn.buttonId
        })
      }
      return []
    },
    updataParamsHandle(data) {
      this.updataParams.id = data.id
    },
    handleOk() {
      const rightBtns = []
      this.buttonListInLeft.forEach((btn) => {
        if (this.valueBtns.includes(btn.buttonId)) {
          rightBtns.push(btn)
        }
      })
      this.$emit('submit', { type: this.value, autoScheduling: this.autoScheduling, rightBtns: rightBtns }, this.updataParams)
    },
    handleCancel() {
      this.$emit('hidden')
    }
  }
}
</script>

<style lang="scss" scoped>
$bgColor: #eeeeee;
.title {
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  background-color: $bgColor;
  font-size: 14px;
}
.content {
  padding: 14px 10px;
}
.transferContent {
  height: calc(100% - 155px);
}
.el-transfer {
  height: 100%;
}
::v-deep.el-transfer-panel {
  height: 100%;
}
::v-deep.el-transfer-panel__body {
  height: calc(100% - 60px);
}
::v-deep.el-transfer-panel__list.is-filterable {
  height: calc(100% - 42px);
}
</style>
