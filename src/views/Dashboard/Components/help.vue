<template>
  <el-tabs tab-position="left" value="first" style="height: 100%">
    <el-tab-pane label="查询条件配置样例" name="first" style="height: 100%">
      <ace-edit :value="configExample" width="100%" height="100%" :config="editConfig"> </ace-edit>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import aceEdit from '@/views/Framework/ComponentsMananger/Kanban/Components/ace'

export default {
  name: 'Help',
  components: {
    aceEdit
  },
  data() {
    return {
      editConfig: {
        options: {
          readOnly: true // 默认 2 个空格缩进
        }
      },
      tabsData: [
        {
          label: '查询条件配置',
          name: 'searchConfigHelp'
        }
      ],
      configExample:
        '{\n' +
        '  enabled: true,\n' +
        '  searchForm: [\n' +
        '        {\n' +
        "          type: 'text',\n" +
        "          labelText: '短文本',\n" +
        "          fieldName: 'module',\n" +
        "          mode: '=',\n" +
        '          selectCode: null,\n' +
        '          replaceSearch: null,\n' +
        '          default: true\n' +
        '        },\n' +
        '        {\n' +
        "          type: 'text',\n" +
        "          labelText: '数量',\n" +
        "          fieldName: 'AMOUNT',\n" +
        "          mode: '=',\n" +
        '          selectCode: null,\n' +
        '          replaceSearch: null\n' +
        '        },\n' +
        '        {\n' +
        "          type: 'datetime',\n" +
        "          labelText: '日期1',\n" +
        "          fieldName: 'DATE1',\n" +
        "          mode: '=',\n" +
        '          selectCode: null,\n' +
        '          replaceSearch: null\n' +
        '        },\n' +
        '        {\n' +
        "          type: 'datetime',\n" +
        "          labelText: '日期2',\n" +
        "          fieldName: 'DATE2',\n" +
        "          mode: '=',\n" +
        '          selectCode: null,\n' +
        '          replaceSearch: null\n' +
        '        },\n' +
        '        {\n' +
        "          type: 'select',\n" +
        "          labelText: '远程下拉选',\n" +
        "          fieldName: 'REMOTE_SEL_LIST',\n" +
        "          mode: '=',\n" +
        "          selectCode: 'MSG_STATUS',\n" +
        '          replaceSearch: null\n' +
        '        },\n' +
        '        {\n' +
        "          type: 'treeSelect',\n" +
        "          labelText: '远程树形选',\n" +
        "          fieldName: 'REMOTE_SEL_TREE',\n" +
        "          mode: '=',\n" +
        "          selectCode: 'MSG_TYPE',\n" +
        '          replaceSearch: null,\n' +
        '          reset: false\n' +
        '        },\n' +
        '        {\n' +
        "          type: 'popUpSelect',\n" +
        "          labelText: '远程弹出选择',\n" +
        "          fieldName: 'REMOTE_SEL_POP',\n" +
        "          mode: '=',\n" +
        "          selectCode: 'BASE_COMP_POP_SEL',\n" +
        '          replaceSearch: null\n' +
        '        }\n' +
        '      ]' +
        '}'
    }
  }
}
</script>

<style>
.el-tabs__content {
  height: calc(100%);
  overflow-y: auto;
}
</style>
