<script>
import { P8Tabs as CommonTabs } from 'p8-components-ui'
import aceEdit from 'packages/Base/Components/ace.vue'
import _cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'debugging',
  components: {
    CommonTabs,
    aceEdit
  },
  inject: ['type', 'interFace'],
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    tabsParam: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      debugType: 'offline',
      activeTabsTop: 'params',
      topTabsByServer: [
        {
          label: '参数',
          name: 'params',
          hide: true
        },
        {
          label: 'Path参数',
          name: 'pathParameters',
          hide: false
        },
        {
          label: 'Query参数',
          name: 'queryParameters',
          hide: false
        },
        {
          label: 'Headers',
          name: 'headerParameters'
        },
        {
          label: 'Body',
          name: 'bodyParams'
        }
      ],
      topTabsByClient: [
        {
          label: '启动参数',
          name: 'startParameters'
        },
        {
          label: 'Path参数',
          name: 'pathParameters',
          hide: false
        },
        {
          label: 'Query参数',
          name: 'queryParameters',
          hide: false
        },
        {
          label: 'Headers',
          name: 'headerParameters'
        },
        {
          label: 'Body',
          name: 'bodyParams'
        }
      ],
      activeTabsBottom: 'response',
      bottomTabsByServer: [
        {
          label: '响应',
          name: 'response'
        },
        {
          label: '调试日志',
          name: 'log'
        }
      ],
      bottomTabsByClient: [
        {
          label: '发送报文',
          name: 'response'
        },
        {
          label: '接收报文',
          name: 'receivingMsg'
        },
        {
          label: '调试日志',
          name: 'log'
        }
      ],
      startTable: [],
      paramsTable: [], // 参数
      pathTable: [], // query参数
      queryTable: [], // query参数
      headersTable: [],
      bodyParams: '',
      requestData: '',
      responseData: '',
      messageData: [],
      responseKey: Date.now(),
      status: 'default',
      interfaceStatus: 'default' // 接口状态
    }
  },
  computed: {
    statusClass() {
      return {
        'status-default': this.status === 'default',
        'status-success': this.status === 'success',
        'status-failed': this.status === 'failed'
      }
    },
    interfaceStatusClass() {
      return {
        'status-default': this.interfaceStatus === 'default',
        'status-progress': this.interfaceStatus === 'progress',
        'status-success': this.interfaceStatus === 'success',
        'status-failed': this.interfaceStatus === 'failed'
      }
    },
    statusText() {
      const texts = {
        default: '未开始',
        success: '成功',
        failed: '失败'
      }
      return texts[this.status] || ''
    },
    interfaceStatusText() {
      const texts = {
        default: '未开始',
        progress: '调用中',
        success: '成功',
        failed: '失败'
      }
      return texts[this.interfaceStatus] || ''
    }
  },
  watch: {
    'formData.interfaceAgreement': {
      handler(val) {
        if (val === 'REST') {
          this.topTabsByServer.forEach((item) => {
            if (item.name === 'params') {
              item.hide = true
            } else if (['pathParameters', 'queryParameters'].includes(item.name)) {
              item.hide = false
            }
          })
          this.topTabsByClient.forEach((item) => {
            if (['pathParameters', 'queryParameters'].includes(item.name)) {
              item.hide = false
            }
          })
          this.activeTabsTop = this.type === 'server' ? 'pathParameters' : 'startParameters'
        } else {
          this.topTabsByServer.forEach((item) => {
            if (item.name === 'params') {
              item.hide = false
            } else if (['pathParameters', 'queryParameters'].includes(item.name)) {
              item.hide = true
            }
          })
          this.topTabsByClient.forEach((item) => {
            if (['pathParameters', 'queryParameters'].includes(item.name)) {
              item.hide = true
            }
          })
          this.activeTabsTop = this.type === 'server' ? 'params' : 'startParameters'
        }
      },
      immediate: true
    },
    tabsParam: {
      handler() {
        this.getParamList()
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // this.getParamList()
  },
  methods: {
    // 合并新增参数
    concatParams(params, executeParams) {
      executeParams.forEach((t, index) => {
        const i = params.findIndex((p) => p.paramName === t.paramName)
        if (i === -1) {
          executeParams.splice(index, 1)
        }
      })
      params.forEach((p) => {
        const i = executeParams.findIndex((t) => t.paramName === p.paramName)
        if (i === -1) {
          executeParams.push({
            ...p,
            paramValue: p.paramDefault || null
          })
        } else {
          executeParams[i] = {
            ...p,
            paramValue: executeParams[i].paramValue || p.paramDefault || null
          }
        }
      })
      return executeParams
    },
    getParamList() {
      const { startParameters, params, pathParameters, queryParameters, headerParameters } = this.tabsParam
      if (startParameters?.length > -1) {
        this.startTable = this.concatParams(_cloneDeep(startParameters), _cloneDeep(this.startTable))
      }
      if (headerParameters?.length > -1) {
        this.headersTable = this.concatParams(_cloneDeep(headerParameters), _cloneDeep(this.headersTable))
      }
      if (this.formData.interfaceAgreement === 'REST') {
        if (pathParameters?.length > -1) {
          this.pathTable = this.concatParams(_cloneDeep(pathParameters), _cloneDeep(this.pathTable))
        }
        if (queryParameters?.length > -1) {
          this.queryTable = this.concatParams(_cloneDeep(queryParameters), _cloneDeep(this.queryTable))
        }
      } else {
        if (params?.length > -1) {
          this.paramsTable = this.concatParams(_cloneDeep(params), _cloneDeep(this.paramsTable))
        }
      }
    },
    onBodyParamsModify(v) {
      this.bodyParams = v
    },
    send() {
      this.messageData = []
      this.responseData = ''
      this.requestData = ''
      this.responseKey = Date.now()
      this.status = 'default'
      this.interfaceStatus = 'progress'
      const executeParams = {
        interfaceId: this.formData.interfaceId,
        debugType: this.debugType,
        headerParameters: {}
      }
      // startParameters
      if (this.type === 'client') {
        executeParams.startParameters = {}
        this.startTable.forEach((item) => {
          executeParams.startParameters[item.paramName] = item.paramValue
        })
      }
      // headersTable
      this.headersTable.forEach((item) => {
        executeParams.headerParameters[item.paramName] = item.paramValue
      })
      executeParams.bodyParams = this.bodyParams
      if (this.formData.interfaceAgreement === 'REST') {
        executeParams.pathParameters = {}
        executeParams.queryParameters = {}
        // pathParameters
        this.pathTable.forEach((item) => {
          executeParams.pathParameters[item.paramName] = item.paramValue
        })
        // queryTable
        this.queryTable.forEach((item) => {
          executeParams.queryParameters[item.paramName] = item.paramValue
        })
      } else {
        if (this.type === 'server') {
          executeParams.params = {}
          this.paramsTable.forEach((item) => {
            executeParams.params[item.paramName] = item.paramValue
          })
        }
      }
      const params = {
        ...this.formData,
        ...this.tabsParam,
        executeParams: executeParams
      }
      // 响应 responseData  日志 messageData  发送报文 requestData  接收报文 responseData
      this.$api[this.interFace.debug](params).then((res) => {
        if (res) {
          this.messageData = res.messageData || []
          this.responseData = res.responseData
          this.requestData = res.requestData
          this.responseKey = Date.now()
          // 接口状态
          if (res.interfaceStatus === '200') {
            this.interfaceStatus = 'success'
          } else {
            this.interfaceStatus = 'failed'
          }

          if (res.status === '200') {
            this.status = 'success'
          } else {
            this.status = 'failed'
          }
        } else {
          this.interfaceStatus = 'failed'
          this.status = 'failed'
          this.$message.error('接口调用失败')
        }
      })
    }
  }
}
</script>

<template>
  <div id="debugging">
    <div v-if="type === 'client'" style="padding: 10px 0">
      <label style="margin-right: 12px">调试模式</label>
      <el-radio-group v-model="debugType">
        <el-radio-button label="offline">单机模拟</el-radio-button>
        <el-radio-button label="online">联机调试</el-radio-button>
      </el-radio-group>
    </div>
    <CommonTabs v-if="type === 'server'" :tabs-data="topTabsByServer.filter((item) => !item.hide)" class="el_tabs" type="border-card" :active-tabs="activeTabsTop">
      <template #params>
        <el-table :data="paramsTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #pathParameters>
        <el-table :data="pathTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #queryParameters>
        <el-table :data="queryTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #headerParameters>
        <el-table :data="headersTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #bodyParams>
        <ace-edit :value="bodyParams" width="100%" height="100%" @update:value="onBodyParamsModify"></ace-edit>
      </template>
    </CommonTabs>
    <CommonTabs v-if="type === 'client'" :tabs-data="topTabsByClient.filter((item) => !item.hide)" class="el_tabs el_tabs_client" type="border-card" :active-tabs="activeTabsTop">
      <template #startParameters>
        <el-table :data="startTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #pathParameters>
        <el-table :data="pathTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #queryParameters>
        <el-table :data="queryTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #headerParameters>
        <el-table :data="headersTable" border height="100%">
          <el-table-column label="序号" type="index" width="50"> </el-table-column>
          <el-table-column label="参数名" prop="paramName"> </el-table-column>
          <el-table-column label="类型" prop="paramType"> </el-table-column>
          <el-table-column label="非空" prop="isEmpty">
            <template slot-scope="scope">
              <span>{{ scope.row.isEmpty === '1' ? '是' : '否' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue" style="width: 100%" placeholder="请输入参数值" clearable></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #bodyParams>
        <ace-edit :value="bodyParams" width="100%" height="100%" @update:value="onBodyParamsModify"></ace-edit>
      </template>
    </CommonTabs>
    <div class="middle-area">
      <div class="middle-area-item">
        <span>接口状态：</span>
        <el-tooltip :content="interfaceStatusText" placement="top" :disabled="!interfaceStatusText">
          <div class="status-box-interface" :class="interfaceStatusClass"></div>
        </el-tooltip>
      </div>
      <div class="middle-area-item">
        <span>成功定义：</span>
        <el-tooltip :content="statusText" placement="top" :disabled="!statusText">
          <div class="status-box" :class="statusClass"></div>
        </el-tooltip>
      </div>
      <el-button @click="send" :disabled="interfaceStatus === 'progress'">发送</el-button>
    </div>

    <CommonTabs v-if="type === 'client'" :tabs-data="bottomTabsByClient" :key="responseKey + 'client'" class="el_tabs el_tabs_client" type="border-card" :active-tabs="activeTabsBottom">
      <template #response>
        <!-- <MonacoEditor v-model="requestData" :readOnly="true" /> -->
        <ace-edit :value="requestData" :readOnly="true" width="100%" height="100%"></ace-edit>
      </template>
      <template #receivingMsg>
        <ace-edit :value="responseData" :readOnly="true" width="100%" height="100%"></ace-edit>
      </template>
      <template #log>
        <ul class="log">
          <li v-for="(item, index) in messageData" :key="index" class="log-item">
            {{ item }}
          </li>
        </ul>
        <!--        <ace-edit :value="messageData"-->
        <!--                  width="100%"-->
        <!--                  height="100%"></ace-edit>-->
      </template>
    </CommonTabs>
    <CommonTabs v-else :tabs-data="bottomTabsByServer" :key="responseKey + 'server'" class="el_tabs" type="border-card" :active-tabs="activeTabsBottom">
      <template #response>
        <!-- <MonacoEditor v-model="responseData" :readOnly="true" /> -->
        <ace-edit :value="responseData" :readOnly="true" width="100%" height="100%"></ace-edit>
      </template>
      <template #log>
        <ul class="log">
          <li v-for="(item, index) in messageData" :key="index" class="log-item">
            {{ item }}
          </li>
        </ul>
      </template>
    </CommonTabs>
  </div>
</template>

<style scoped lang="scss">
#debugging {
  height: 100%;
}

.el_tabs {
  box-sizing: border-box;
  height: calc((100% - 56px) / 2);
}
.el_tabs_client {
  height: calc((100% - 108px) / 2);
}

::v-deep .el_tabs {
  box-sizing: border-box;

  .el-tabs__content {
    padding: 0 !important;
  }
}

.log {
  box-sizing: border-box;
  font-size: 14px;
  height: calc(100% - 28px);
  padding: 12px 8px;
  overflow: auto;
  .log-item {
    padding: 6px 0;
  }
}
.middle-area {
  padding: 10px 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .middle-area-item {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 10px;
  }
}
.status-box {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.status-box-interface {
  width: 16px;
  height: 16px;
}
.status-default {
  background: #909399;
}

.status-progress {
  background: #e6a23c;
}

.status-success {
  background: #67c23a;
}

.status-failed {
  background: #f56c6c;
}
</style>
