<template>
  <normal-layout :header-visible="false"
                 :normal-layout="normalLayout">
    <template #west>
      <tree :data="treeData"
            @select="onSelect"></tree>
    </template>
    <template #center>
      <el-tabs v-if="configExample != ''"
               v-model="activeName"
               type="card">
        <el-tab-pane label="Json配置"
                     name="first">
          <ace-edit :value="configExample"
                    width="100%"
                    height="100%"
                    :config="jsonEditConfig"> </ace-edit>
        </el-tab-pane>
        <el-tab-pane v-if="sqlExample != ''"
                     label="数据视图SQL配置"
                     name="second">
          <ace-edit :value="sqlExample"
                    width="100%"
                    height="100%"
                    :config="sqlEditConfig"> </ace-edit>
        </el-tab-pane>
      </el-tabs>
    </template>
  </normal-layout>
</template>

<script>
import { P8NormalLayoutV1 as NormalLayout, P8Tree as tree } from 'p8-components-ui'
import aceEdit from '@/views/Framework/ComponentsMananger/Kanban/Components/ace'
import treeDataConfig from '@/views/Framework/ComponentsMananger/Kanban/script/help/tree-data'

export default {
  name: 'Help',
  components: {
    aceEdit,
    NormalLayout,
    tree
  },
  data () {
    let normalLayout = {
      west: {
        xs: 12,
        sm: 8,
        md: 8,
        lg: 7,
        xl: 4
      },
      center: {
        xs: 12,
        sm: 16,
        md: 16,
        lg: 17,
        xl: 20
      }
    }
    return {
      activeName: 'first',
      normalLayout: normalLayout,
      treeData: treeDataConfig,
      jsonEditConfig: {
        options: {
          readOnly: true // 默认 2 个空格缩进
        }
      },
      sqlEditConfig: {
        lang: 'sql',
        options: {
          readOnly: true // 默认 2 个空格缩进
        }
      },
      configExample: '',
      sqlExample: ''
    }
  },
  methods: {
    onSelect (node) {
      // console.log(node)
      this.configExample = ''
      this.sqlExample = ''
      if (node && node.example) {
        this.loadCodeTemplate(node.example)
      }
    },
    loadCodeTemplate (example) {
      let _this = this
      import('../script/help/' + example).then((res) => {
        console.log('res', res)
        if (res && res.code) {
          let codeStr = res.code
          // let codeStr = JSON.stringify(res.code, null, 2)
          console.log('codeStr:', codeStr)
          _this.configExample = codeStr
          if (res.sql) {
            _this.sqlExample = res.sql
          }
        }
        this.activeName = 'first'
      })
    }
  }
}
</script>

<style>
.el-tabs__header {
  margin: unset;
}
.el-tabs__content {
  padding-top: 2px;
  overflow-y: auto;
}
</style>
