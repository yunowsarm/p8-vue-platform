<template>
  <div class="setting_box">
    <el-table class="setting_table" :data="formData">
      <el-table-column label="任务类型" prop="C_MEANING"></el-table-column>
      <el-table-column label="计划编辑只可标识子任务" prop="EDIT_MARK">
        <template slot-scope="scope">
          <el-radio-group v-model="scope.row.EDIT_MARK">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </template>
      </el-table-column>
    </el-table>
    <div class="dialog_footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </div>
  </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'TaskTypeSetting',
  data() {
    return {
      formData: []
    }
  },
  props: {
    row: {
      type: [Object, Array],
      default: null
    }
  },
  watch: {
    row: {
      handler(val) {
        if (Array.isArray(val) && val.length > 0) {
          this.formData = _cloneDeep(val)
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleSubmit() {
      const data = this.formData.map((item) => {
        return {
          id: item.ID,
          editMark: item.EDIT_MARK
        }
      })
      this.$api['documentManagement.saveTaskType']({ dictList: data }).then((res) => {
        this.$message.success('设置成功')
        this.close()
      })
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.setting_box {
  height: 100%;
  .setting_table {
    height: calc(100% - 52px);
    overflow: auto;
  }
}
.dialog_footer {
  height: 52px;
  line-height: 52px;
  margin-right: 16px;
  text-align: right;
}
</style>
