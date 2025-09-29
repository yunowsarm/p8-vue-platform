<script>
import { P8Tabs as CommonTabs } from 'p8-components-ui'
import InterfaceManagement from '../components/InterfaceManagement/index.vue'
import ExecutionLog from '../components/ExecutionLog/index.vue'
import ExceptionMonitoring from '../components/ExceptionMonitoring/index.vue'


export default {
  name: 'ServerSide',
  components: {
    CommonTabs,
    InterfaceManagement,
    ExecutionLog,
    ExceptionMonitoring
  },
  provide(){
    return {
      type: "client",
      interFace:{
        list:'integratedManagement.clientList',
        data:'integratedManagement.clientData',
        save:'integratedManagement.clientSave',
        delete:'integratedManagement.clientDelete',
        debug:'integratedManagement.clientDebug'
      }
    }
  },
  data () {
    return {
      activeTabs:'interfaceManagement',
      tabsData: [
        {
          label: '接口管理',
          name: 'interfaceManagement'
        },
        {
          label: '执行日志',
          name: 'executionLog'
        },
        {
          label: '异常监控',
          name: 'exceptionMonitoring'
        }
      ]
    }
  }
}
</script>

<template>
  <div id="ServerSide">
    <common-tabs :tabs-data="tabsData"
                 class="el_tabs"
                 :active-tabs="activeTabs">
      <template #interfaceManagement>
        <InterfaceManagement></InterfaceManagement>
      </template>
      <template #executionLog>
        <ExecutionLog></ExecutionLog>
      </template>
      <template #exceptionMonitoring>
        <ExceptionMonitoring></ExceptionMonitoring>
      </template>
    </common-tabs>
  </div>
</template>

<style scoped lang="scss">
#ServerSide {
  box-sizing: border-box;
  height: calc(100% - 32px);
  width: calc(100% - 32px);
  margin: 16px;
  background: #FFFFFF;

  .p8-tabs {
    height: 100%;
  }
}

::v-deep .list-layout {
  margin: 0;
  height: 100%;
}

::v-deep .el-tabs__header {
  margin: 0;
}

::v-deep .el-tabs__item {
  padding: 0 20px !important;
}

::v-deep .el-tabs--top .el-tabs__content {
  height: calc(100% - 40px);
  padding: 0;
}

::v-deep .search-wrapper {
  right: 0;
}
</style>
