<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" :title="title" :before-close="handleClose" :destroy-on-close="true">
      <div style="margin: 20px">
        <el-row>
          <el-col :span="8">选择操作类型：</el-col>
          <el-col :span="8">
            <el-switch v-model="optionType" active-text="启动" inactive-text="停止"></el-switch>
          </el-col>
        </el-row>
        <el-alert title="警告" :description="describe" type="warning" :closable="false" effect="dark" show-icon></el-alert>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Row, Button, Alert, Dialog, Switch } from 'p8-components-ui'
/* eslint-disable vue/require-prop-types */
export default {
  name: 'OptionType',
  components: {
    'el-row': Row,
    'el-button': Button,
    'el-alert': Alert,
    'el-dialog': Dialog,
    'el-switch': Switch
  },
  props: ['visible', 'schedulerTaskArray', 'title'],
  data() {
    return {
      dialogVisible: false,
      confirmLoading: false,
      oprtionResult: {},
      loading: false,
      optionType: true,
      bodyStyle: { paddingTop: 0, paddingLeft: 0, paddingRight: 0 }
    }
  },
  mounted() {
    this.dialogVisible = this.visible
  },
  computed: {
    describe: function () {
      let text = ''
      if (this.optionType) {
        text = '该操作对状态为‘停用’的任务无效。启动后按照任务时机分为立刻执行和按照定时策略轮询执行。'
      } else {
        text = '定时任务停止。'
      }
      return text
    }
  },
  methods: {
    handleClose(e) {
      this.$emit('close-option', this.oprtionResult)
    },
    confirm() {
      this.dialogVisible = false
      this.oprtionResult = { optionType: this.optionType }
      this.$emit('close-option', this.oprtionResult)
    }
  }
}
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
