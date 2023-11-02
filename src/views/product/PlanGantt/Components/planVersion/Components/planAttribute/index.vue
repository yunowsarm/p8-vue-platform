<template>
  <anchor placement="left" style-sheet="tabs"
          :menu="anchorMenu"
          :menuKey="{label: 'label', value: 'value'}">
    <template #describeKey>
      <describe-view :task-id="taskId"
                     :versionType="versionType"
                     :versionId="versionId"></describe-view>
    </template>
    <template #inputKey>
      <input-view :task-id="taskId"
                  :versionType="versionType"
                  :versionId="versionId"></input-view>
    </template>
    <template #outputKey>
      <output-view :task-id="taskId"
                   :versionType="versionType"
                   :versionId="versionId"></output-view>
    </template>
    <template #specialKey>
      <special-view :task-id="taskId"
                    :versionType="versionType"
                    :versionId="versionId"></special-view>
    </template>
  </anchor>
</template>

<script>

import DescribeView from './Components/describeView'
import InputView from './Components/inputView'
import OutputView from './Components/outputView'
import SpecialView from './Components/specialView'
import { P8Anchor as Anchor } from 'p8-components-ui'
export default {
  name: 'PlanAttribute',
  props: ['taskId', 'versionType', 'versionId'],
  components: {
    InputView,
    Anchor,
    DescribeView,
    OutputView,
    SpecialView
  },
  mounted: function () {

  },
  data () {
    return {
      anchorMenu: [
        { label: '任务描述', value: 'describeKey' },
        { label: '输入', value: 'inputKey' },
        { label: '输出', value: 'outputKey' },
        { label: '特别说明', value: 'specialKey' }
      ]
    }
  },
  methods: {
    onSelect (tab, event) {
      this.activeKey = tab.name
    },
    saveCallback (res) {
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-area {
  height: 100%;
  position: absolute;
  padding: 0 6px;
}
.formList.el-form > .el-row.formBtn {
  border-top: none;
}
</style>
