<template>
  <div>
    <el-table :data="formData">
      <el-table-column label="任务类型" prop="name"></el-table-column>
      <el-table-column label="计划编辑只可标识子任务" prop="status">
        <template slot-scope="scope">
          <el-radio-group v-model="scope.row.status">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </template>
      </el-table-column>
    </el-table>
    <span class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
    </span>
  </div>
</template>

<script>
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
  created() {
    if (Array.isArray(this.row) && this.row.length > 0) {
      this.formData = this.row.map((item) => {
        return {
          id: item.ID,
          name: item.C_MEANING,
          status: '1'
        }
      })
    }
  }
}
</script>

<style></style>
