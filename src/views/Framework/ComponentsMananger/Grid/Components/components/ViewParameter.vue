<template>
  <div style="padding: 10px">
    <el-divider>系统参数出参</el-divider>
    <div class="tips">*单击参数key即可复制</div>
    <el-table :data="systemParamsGinseng" style="width: 100%" stripe border>
      <el-table-column align="center" label="参数key" prop="key">
        <template slot-scope="scope">
          <span class="pointer" v-copy="scope.row.key">{{ scope.row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="参数值" prop="value"></el-table-column>
    </el-table>
    <el-divider>页面参数出参</el-divider>
    <span style="padding: 0 10px; user-select: text">页面参数格式编写格式为：__PAGE_PARAMS.xxxx（例：__PAGE_PARAMS.ID）</span>
    <!-- <div class="tips">*单击参数key即可复制</div>
    <el-table :data="pageParamsGinseng" style="width: 100%" stripe border>
      <el-table-column align="center" label="参数key" prop="key">
        <template slot-scope="scope">
          <span class="pointer" v-copy="scope.row.key">{{ scope.row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="参数说明" prop="value"></el-table-column>
    </el-table> -->
  </div>
</template>

<script>
import Copy from './copy'
export default {
  name: 'Parameter',
  directives: { Copy },
  props: {
    // pageParamsList: {
    //   type: Array,
    //   default: () => {
    //     return []
    //   }
    // }
  },
  data() {
    return {
      systemParamsGinseng: [], // 系统参数出参systemParamsGinseng
      pageParamsGinseng: [] // 页面参数出参pageParamsGinseng
    }
  },
  mounted() {
    const { user } = this.$store.state
    this.systemParamsGinseng = Object.keys(user.userInfo).map((item) => {
      return {
        key: '$SYSTEM_PARAMS_SELECT.' + item,
        value: user.userInfo[item]
      }
    })
    this.pageParamsGinseng = [
      {
        key: '__PAGE_PARAMS.ID',
        value: '父ID'
      }
    ]
  },
  methods: {}
}
</script>

<style scoped lang="scss">
ul {
  min-height: 200px;
  &:empty::after {
    content: '暂无数据';
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 200px;
  }
}
.tips {
  color: red;
  font-size: 12px;
}
.pointer {
  cursor: pointer;
}
</style>
