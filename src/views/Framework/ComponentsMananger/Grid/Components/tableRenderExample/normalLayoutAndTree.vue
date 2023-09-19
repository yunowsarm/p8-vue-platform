<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <table-render :code="code"
                :report-param="reportParam">
    <template #westSlot>
      <common-tree></common-tree>
    </template>
  </table-render>
</template>
<script>
import TableRender from '../tableRender'
import { P8Tree as CommonTree } from 'p8-components-ui'
export default {
  name: 'NormalLayoutAndTree',
  components: {
    TableRender,
    CommonTree
  },
  props: {
    code: {
      // 报表code
      type: String,
      default: ''
    },
    reportParam: {
      // 给报表所传参数
      type: Object,
      default: () => {
        return {}
      }
    }
  }
}
</script>
