<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <el-dropdown split-button
               @click="refreshList"
               type="primary">
    刷新
    <el-dropdown-menu key="refreshList"
                      slot="dropdown">
      <el-dropdown-item key="refreshList1"
                        @click.native="refreshList(1)">时间正序</el-dropdown-item>
      <el-dropdown-item key="refreshList0"
                        @click.native="refreshList(0)">时间倒序</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { Dropdown, DropdownMenu, DropdownItem } from 'p8-components-ui'
import { debounce } from 'lodash'

export default {
  components: {
    'el-dropdown': Dropdown,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem
  },
  data () {
    return {}
  },
  methods: {
    refreshList: debounce(
      function (type) {
        // 1-正序 0-倒叙
        this.$emit('refresh', type)
      },
      1000,
      {
        leading: true,
        trailing: false
      }
    )
  }
}
</script>

<style></style>
