<script>
import { P8Dialog as CommonDialog, P8Form as FormList, P8SplitPane as SplitPane, P8Tabs as CommonTabs } from 'p8-components-ui'
import Server from './Server.vue'
import Params from './Params.vue'
import BodyParams from './BodyParams.vue'
import MessageDefinition from './MessageDefinition.vue'
import ProcessingTools from './ProcessingTools.vue' // 响应后处理
import _cloneDeep from 'lodash/cloneDeep'
import Debugging from './debugging.vue'
import aceEdit from 'packages/Base/Components/ace.vue'

export default {
  name: 'interfaceEdit',
  components: {
    aceEdit,
    Debugging,
    CommonTabs,
    FormList,
    CommonDialog,
    SplitPane,
    Server,
    Params,
    BodyParams,
    MessageDefinition,
    ProcessingTools
  },
  inject: ['type', 'interFace'],
  props: {
    recordId: {
      type: String,
      default: ''
    },
    urlPrefix: {
      type: String,
      default: ''
    },
    agreements: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      infoKey: new Date().getTime(),
      formData: {
        interfaceAgreement: '',
        interfaceUrl: '',
        definitionSuccess: ''
      },
      authentication: {
        type: 'none'
      },
      authenticationForm: {
        type: 'none'
      },
      dataSource: [
        {
          type: 'text', // 控件类型
          labelText: '接口ID', // 控件显示的文本
          fieldName: 'interfaceId',
          placeholder: '请输入接口ID', // 默认控件的空值文本
          colLayout: 'doubleCol'
          // rules: [
          //   {
          //     required: true,
          //     maxLength: 15
          //   },
          //   {
          //     validator: (rule, value, callback) => {
          //       const that = this
          //       this.$api['role.repeatedCheck']({ id: that.formData.id, name: value }).then((response) => {
          //         if (response.result) {
          //           callback(new Error('角色名称已被使用！'))
          //         } else {
          //           callback()
          //         }
          //       })
          //     },
          //     trigger: 'blur'
          //   }
          // ]
        },
        {
          type: 'text', // 控件类型
          labelText: '接口名称', // 控件显示的文本
          fieldName: 'interfaceName',
          placeholder: '请输入接口名称', // 默认控件的空值文本
          colLayout: 'doubleCol'
        },
        {
          type: 'select', // 控件类型
          labelText: '协议', // 控件显示的文本
          fieldName: 'interfaceAgreement',
          placeholder: '请选择协议', // 默认控件的空值文本
          colLayout: 'doubleCol',
          options: []
        },
        {
          type: 'blank', // 控件类型
          labelText: '调用路径', // 控件显示的文本
          fieldName: 'interfaceUrl',
          slotName: 'interfaceUrl',
          colLayout: 'doubleCol'
        },
        {
          type: 'textarea', // 控件类型
          labelText: '备注', // 控件显示的文本
          fieldName: 'remark',
          colLayout: 'singleCol'
        }
      ],
      activeTabs: this.type === 'server' ? 'pathParameters' : 'server',
      tabsDataByServer: [
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
          label: '认证',
          name: 'authentication'
        },
        {
          label: 'Headers',
          name: 'headerParameters'
        },
        {
          label: 'Body',
          name: 'bodyParams',
          hide: false
        },
        {
          label: '响应前处理',
          name: 'responsePreProcessing'
        },
        {
          label: '报文定义',
          name: 'messageDefinition'
        },
        {
          label: '响应后处理',
          name: 'postResponseProcessing'
        },
        {
          label: '成功定义',
          name: 'definitionSuccess'
        }
      ],
      tabsDataByClient: [
        {
          label: '服务',
          name: 'server',
          hide: true
        },
        {
          label: '启动参数',
          name: 'params'
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
          label: '认证',
          name: 'authentication'
        },
        {
          label: 'Headers',
          name: 'headerParameters'
        },
        {
          label: 'Body',
          name: 'bodyParams'
        },
        {
          label: '调用前处理',
          name: 'responsePreProcessing'
        },
        {
          label: '报文定义',
          name: 'messageDefinition'
        },
        {
          label: '调用后处理',
          name: 'postResponseProcessing'
        },
        {
          label: '成功定义',
          name: 'definitionSuccess'
        }
      ],
      dubugKey: Date.now(),
      fieldType: [],
      methodList: [],
      thirdUser: [],
      toolList: [],
      customisesList: [],
      defaultPercent: 100,
      authType: [],
      authForm: [],
      tabsParam: {
        serviceParam: null,
        parameters: null,
        startParameters: null,
        pathParameters: null,
        queryParameters: null,
        authParameters: null,
        headerParameters: null,
        bodyParams: null,
        messageDefinitionParam: null,
        beforeSteps: null,
        afterSteps: null
      },
      definitionSuccess: ''
    }
  },
  computed: {
    callPath() {
      const protocol = this.formData.interfaceAgreement
      const staticPath = protocol === 'REST' ? 'xardmu' : 'xardmu/webService'
      let callPath = `/${staticPath}/${this.formData.interfaceId ?? ''}`

      const { parameters, pathParameters, queryParameters } = this.tabsParam
      if (protocol === 'REST') {
        // 拼接pathParameters
        if (pathParameters?.length) {
          pathParameters.forEach((param) => {
            callPath += `/{${param.paramName}}`
          })
        }
        if (queryParameters?.length) {
          const queryString = queryParameters
            .map((param) => {
              return `{${param.paramName}}`
            })
            .join('&')
          callPath += `?${queryString}`
        }
      } else {
        if (parameters?.length) {
          const paramString = parameters
            .map((param) => {
              return `{${param.paramName}}`
            })
            .join('&')
          callPath += `?${paramString}`
        }
      }
      return callPath
    }
  },
  watch: {
    visible(val) {
      let drawerWidth
      let defaultPercent
      if (val) {
        drawerWidth = '100%'
        defaultPercent = 50
      } else {
        drawerWidth = '50%'
        defaultPercent = 100
      }
      this.defaultPercent = defaultPercent
      this.$emit('setDrawerWidth', drawerWidth)
    },
    callPath: {
      handler(val) {
        if (this.type !== 'server') return
        this.formData.interfaceUrl = val
      },
      immediate: true
    },
    authentication: {
      handler(val) {
        this.saveTabParam('authParameters', val)
      },
      deep: true
    },
    authenticationForm: {
      handler(val) {
        console.log(val)
        this.saveTabParam('authParameters', val)
      },
      deep: true
    },
    'formData.definitionSuccess': {
      handler(val) {
        this.definitionSuccess = val ?? ''
      },
      immediate: true
    },
    'formData.interfaceAgreement': {
      handler(val) {
        if (val === 'REST') {
          this.dataSource.splice(3, 0, {
            type: 'select', // 控件类型
            labelText: 'METHOD', // 控件显示的文本
            fieldName: 'interfaceMethod',
            placeholder: '请选择METHOD', // 默认控件的空值文本
            colLayout: 'doubleCol',
            options: this.methodList
          })
          if (this.type === 'server') {
            this.tabsDataByServer.forEach((item) => {
              if (item.name === 'params') {
                item.hide = true
                this.tabsParam[item.name] = null
              } else if (['pathParameters', 'queryParameters'].includes(item.name)) {
                item.hide = false
              }
            })
          } else if (this.type === 'client') {
            this.tabsDataByClient.forEach((item) => {
              if (item.name === 'server') {
                item.hide = true
                this.tabsParam[item.name] = null
              } else if (['pathParameters', 'queryParameters'].includes(item.name)) {
                item.hide = false
              }
            })
            const i = this.dataSource.findIndex((item) => item.fieldName === 'interfaceUrl')
            this.dataSource[i].labelText = 'API路径'
          }
          this.activeTabs = this.type === 'server' ? 'pathParameters' : 'params'
        } else {
          if (this.type === 'server') {
            this.tabsDataByServer.forEach((item) => {
              if (item.name === 'params') {
                item.hide = false
              } else if (['pathParameters', 'queryParameters'].includes(item.name)) {
                item.hide = true
                this.tabsParam[item.name] = null
              }
            })
          } else if (this.type === 'client') {
            this.tabsDataByClient.forEach((item) => {
              if (item.name === 'server') {
                item.hide = false
                this.tabsParam[item.name] = null
              }
              if (['pathParameters', 'queryParameters'].includes(item.name)) {
                item.hide = true
                this.tabsParam[item.name] = null
              }
            })
            const i = this.dataSource.findIndex((item) => item.fieldName === 'interfaceUrl')
            this.dataSource[i].labelText = 'WSDL路径'
          }
          this.activeTabs = this.type === 'server' ? 'params' : 'server'
          const index = this.dataSource.findIndex((item) => item.fieldName === 'interfaceMethod')
          if (index < 0) return
          this.dataSource.splice(index, 1)
        }
        this.$set(this.formData, 'interfaceMethod', '')
        // this.formData.definitionSuccess = ''
      }
    }
  },
  async created() {
    if (this.type === 'client') {
      this.dataSource.splice(4, 0, {
        type: 'text', // 控件类型
        labelText: '服务方', // 控件显示的文本
        fieldName: 'interfaceServiceProvider',
        placeholder: '请输入内容', // 默认控件的空值文本
        colLayout: 'doubleCol'
      })
    }
    // this.getAuthType()
    this.getAgreements()
    this.getFieldType()
    await this.getMethodList()
    this.getThirdUser()
    this.getToolList()
    this.getCustomisesList()
    if (this.recordId) {
      this.getInterfaceInfo()
    }
  },
  methods: {
    onSchemaModify(v) {
      this.formData.definitionSuccess = v
    },
    isfullscreen() {
      this.$refs.debug.responseKey = Date.now()
    },
    getThirdUser() {
      this.$api['integratedManagement.getThirdUser']().then((res) => {
        this.thirdUser = res
      })
    },
    getToolList() {
      this.$api['integratedManagement.getTools']({ type: this.type }).then((res) => {
        this.toolList = res
      })
    },
    getCustomisesList() {
      this.$api['integratedManagement.getCustomises']().then((res) => {
        this.customisesList = res
      })
    },
    getInterfaceInfo() {
      this.$api[this.interFace.data]({ thirdpartyId: this.recordId }).then((res) => {
        const formData = _cloneDeep(res)
        if (this.type === 'server') {
          this.authentication = res.authParameters || {}
        } else if (this.type === 'client') {
          this.authenticationForm = res.authParameters || {}
        }
        for (const key in this.tabsParam) {
          this.tabsParam[key] = res[key]
          delete formData[key]
        }
        this.formData = formData
        this.$forceUpdate()
        console.log(this.formData, '接口表单信息')
        console.log(this.tabsParam, '接口标签页信息')
        this.infoKey = new Date().getTime()
      })
    },
    getAuthType() {
      this.$api['integratedManagement.getAuthType']({ type: this.type }).then((res) => {
        console.log(res)
      })
    },
    getAgreements() {
      const index = this.dataSource.findIndex((item) => item.fieldName === 'interfaceAgreement')
      this.dataSource[index].options = this.agreements
    },
    async getMethodList() {
      const res = await this.$api['thirdPartInterface.getDic']({ dicType: 'METHOD_TYPE' })
      this.methodList = res.map((item) => {
        return {
          label: item.label,
          value: item.label
        }
      })
      this.formData.interfaceAgreement = 'REST'
    },
    getFieldType() {
      this.$api['formGenerator.getFieldList']().then((res) => {
        if (res) {
          this.fieldType = res
        }
      })
    },
    changeAuth(val) {
      this.authenticationForm = { type: val }
      // switch (val) {
      //   case 'none':
      //     this.authenticationForm = { type: 'none' }
      //     break
      //   case 'BASIC_AUTH':
      //     this.authenticationForm = { type: 'none' }
      //     break
      //   case 'API_KEY':
      //     delete this.authenticationForm.userName
      //     delete this.authenticationForm.password
      //     break
      //   default:
      //     this.authenticationForm = {}
      //     break
      // }
    },
    saveTabParam(key, data) {
      // this.tabsParam[key] = data
      this.$set(this.tabsParam, key, data)
      console.log(this.tabsParam[key], `${key}参数发生变化==========`)
      console.log(this.tabsParam, `标签页所有参数`)
    },
    customValidate(saveParams) {
      console.log(this.tabsParam)
      const params = {
        ...saveParams,
        ...this.tabsParam
      }
      console.log(params)
      this.$api[this.interFace.save](params).then((res) => {
        if (res) {
          this.$emit('saveCallBack')
        }
      })
    },
    openDebugging() {
      this.visible = !this.visible
    },
    closeDebugging() {
      this.visible = false
    },
    handleTabClick(val) {
      this.activeTabs = val.name
    }
  }
}
</script>

<template>
  <div style="height: 100%" :key="infoKey">
    <split-pane split="vertical" :defaultPercent="defaultPercent" :minPercent="50">
      <template #paneL>
        <div id="interfaceEdit">
          <form-list ref="form" :isShouEnter="false" :data-source="dataSource" :form="formData" :is-custom-validate="true" @custom-validate="customValidate">
            <template #interfaceUrl>
              <span v-if="type === 'server'">{{ urlPrefix + formData.interfaceUrl }}</span>
              <el-input v-else v-model="formData.interfaceUrl" placeholder="请输入路径" />
            </template>
            <template #btn>
              <el-button @click="openDebugging">调 试</el-button>
            </template>
          </form-list>
          <common-tabs v-if="type === 'server'" :tabs-data="tabsDataByServer.filter((item) => !item.hide)" class="el_tabs" type="border-card" @tab-click="handleTabClick" :active-tabs="activeTabs">
            <!--      <template #Server>-->
            <!--        <Server></Server>-->
            <!--      </template>-->
            <template #params>
              <Params v-if="activeTabs === 'params'" key="params"></Params>
            </template>
            <template #pathParameters>
              <Params v-if="activeTabs === 'pathParameters'" :data="tabsParam.pathParameters" :fieldType="fieldType" tab-name="pathParameters" @saveTabParam="saveTabParam"></Params>
            </template>
            <template #queryParameters>
              <Params v-if="activeTabs === 'queryParameters'" :data="tabsParam.queryParameters" :fieldType="fieldType" tab-name="queryParameters" @saveTabParam="saveTabParam"></Params>
            </template>
            <template #authentication>
              <el-form v-if="activeTabs === 'authentication'" label-width="120px" style="padding: 30px">
                <el-form-item label="认证类型">
                  <el-select v-model="authentication.type" placeholder="请选择认证类型" style="width: 100%" @change="changeAuth">
                    <el-option label="无" value="none"></el-option>
                    <el-option label="用户认证" value="USER_AUTH"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="authentication.type === 'USER_AUTH'" label="授权用户">
                  <el-select v-model="authentication.thirdUser" multiple placeholder="请选择授权用户" style="width: 100%">
                    <el-option v-for="item in thirdUser" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
            <template #headerParameters>
              <Params v-if="activeTabs === 'headerParameters'" :data="tabsParam.headerParameters" :fieldType="fieldType" tab-name="headerParameters" @saveTabParam="saveTabParam"></Params>
            </template>
            <template #bodyParams>
              <BodyParams v-if="activeTabs === 'bodyParams'" :data="tabsParam.bodyParams" @saveTabParam="saveTabParam"></BodyParams>
            </template>
            <template #responsePreProcessing>
              <ProcessingTools
                v-if="activeTabs === 'responsePreProcessing'"
                :toolList="toolList"
                :customisesList="customisesList"
                :tabsParam="tabsParam"
                :data="tabsParam.beforeSteps"
                key="beforeSteps"
                tab-name="beforeSteps"
                @saveTabParam="saveTabParam"
              ></ProcessingTools>
            </template>
            <template #messageDefinition>
              <MessageDefinition v-if="activeTabs === 'messageDefinition'" :data="tabsParam.messageDefinitionParam" @saveTabParam="saveTabParam"></MessageDefinition>
            </template>
            <template #postResponseProcessing>
              <ProcessingTools
                v-if="activeTabs === 'postResponseProcessing'"
                :toolList="toolList"
                :customisesList="customisesList"
                :tabsParam="tabsParam"
                :data="tabsParam.afterSteps"
                key="afterSteps"
                tab-name="afterSteps"
                @saveTabParam="saveTabParam"
              ></ProcessingTools>
            </template>
            <template #definitionSuccess>
              <ace-edit v-if="activeTabs === 'definitionSuccess'" :value.sync="definitionSuccess" height="100%" width="100%" theme="vs" :formatCode="false" @update:value="onSchemaModify"></ace-edit>
            </template>
          </common-tabs>
          <common-tabs v-if="type === 'client'" :tabs-data="tabsDataByClient.filter((item) => !item.hide)" class="el_tabs" type="border-card" @tab-click="handleTabClick" :active-tabs="activeTabs">
            <template #server>
              <Server :data="tabsParam.serviceParam" @saveTabParam="saveTabParam"></Server>
            </template>
            <template #params>
              <Params v-if="activeTabs === 'params'" :data="tabsParam.startParameters" :fieldType="fieldType" tab-name="startParameters" @saveTabParam="saveTabParam"></Params>
            </template>
            <template #pathParameters>
              <Params v-if="activeTabs === 'pathParameters'" :data="tabsParam.pathParameters" :fieldType="fieldType" tab-name="pathParameters" @saveTabParam="saveTabParam"></Params>
            </template>
            <template #queryParameters>
              <Params v-if="activeTabs === 'queryParameters'" :data="tabsParam.queryParameters" :fieldType="fieldType" tab-name="queryParameters" @saveTabParam="saveTabParam"></Params>
            </template>
            <template #authentication>
              <el-form v-if="activeTabs === 'authentication'" label-width="120px" style="padding: 30px">
                <el-form-item label="认证类型">
                  <el-select v-model="authenticationForm.type" placeholder="请选择认证类型" style="width: 100%" @change="changeAuth">
                    <el-option label="无" value="none"></el-option>
                    <el-option label="API Key" value="API_KEY"></el-option>
                    <el-option label="Basic Auth" value="BASIC_AUTH"></el-option>
                    <el-option label="OAuth2.0" value="OAuth2.0"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'API_KEY'" label="Key">
                  <el-input v-model="authenticationForm.key" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'API_KEY'" label="Value">
                  <el-input v-model="authenticationForm.value" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'API_KEY'" label="发送方式">
                  <el-select v-model="authenticationForm.sendMethod" placeholder="请选择发送方式" style="width: 100%">
                    <el-option label="Header" value="header"></el-option>
                    <el-option label="Query参数" value="query"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'BASIC_AUTH'" label="用户名">
                  <el-input v-model="authenticationForm.userName" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'BASIC_AUTH'" label="密码">
                  <el-input v-model="authenticationForm.password" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'OAuth2.0'" label="grant_type">
                  <el-input v-model="authenticationForm.grant_type" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'OAuth2.0'" label="client_id">
                  <el-input v-model="authenticationForm.client_id" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'OAuth2.0'" label="client_secret">
                  <el-input v-model="authenticationForm.client_secret" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item v-if="authenticationForm.type === 'OAuth2.0'" label="access_token_url">
                  <el-input v-model="authenticationForm.access_token_url" placeholder="请输入内容"></el-input>
                </el-form-item>
              </el-form>
            </template>
            <template #headerParameters>
              <Params v-if="activeTabs === 'headerParameters'" :data="tabsParam.headerParameters" :fieldType="fieldType" tab-name="headerParameters" @saveTabParam="saveTabParam"></Params>
            </template>
            <template #bodyParams>
              <BodyParams v-if="activeTabs === 'bodyParams'" :data="tabsParam.bodyParams" @saveTabParam="saveTabParam"></BodyParams>
            </template>
            <template #responsePreProcessing>
              <ProcessingTools
                v-if="activeTabs === 'responsePreProcessing'"
                :toolList="toolList"
                :customisesList="customisesList"
                :tabsParam="tabsParam"
                key="beforeSteps"
                :data="tabsParam.beforeSteps"
                tab-name="beforeSteps"
                @saveTabParam="saveTabParam"
              ></ProcessingTools>
            </template>
            <template #messageDefinition>
              <MessageDefinition v-if="activeTabs === 'messageDefinition'" :data="tabsParam.messageDefinitionParam" @saveTabParam="saveTabParam"></MessageDefinition>
            </template>
            <template #postResponseProcessing>
              <ProcessingTools
                v-if="activeTabs === 'postResponseProcessing'"
                :toolList="toolList"
                :customisesList="customisesList"
                :tabsParam="tabsParam"
                :data="tabsParam.afterSteps"
                key="afterSteps"
                tab-name="afterSteps"
                @saveTabParam="saveTabParam"
              ></ProcessingTools>
            </template>
            <template #definitionSuccess>
              <ace-edit v-if="activeTabs === 'definitionSuccess'" :value.sync="definitionSuccess" height="100%" width="100%" theme="vs" @update:value="onSchemaModify"></ace-edit>
              <!--              <ace-edit :value="tabsParam.definitionSuccess"-->
              <!--                        width="100%"-->
              <!--                        height="100%"-->
              <!--                        :formatCode="false"-->
              <!--                        @update:value="onSchemaModify"></ace-edit>-->
            </template>
            <!--      <template #responseParams>-->
            <!--        <ResponseParams></ResponseParams>-->
            <!--      </template>-->
          </common-tabs>
        </div>
      </template>
      <template #paneR>
        <div id="debugWrap" style="height: calc(100% - 20px); padding: 10px">
          <debugging v-show="visible" ref="debug" :formData="formData" :tabsParam="tabsParam"></debugging>
        </div>
      </template>
    </split-pane>
    <!--    <common-dialog title="调试"-->
    <!--                   class="debugDialog"-->
    <!--                   v-if="visible"-->
    <!--                   :visible="visible"-->
    <!--                   :showHandleBtn="false"-->
    <!--                   :dialogHeight="600"-->
    <!--                   @handle-cancel="closeDebugging"-->
    <!--                   @close="closeDebugging"-->
    <!--                   @isfullscreen="isfullscreen">-->
    <!--      <template #dialog>-->
    <!--        <debugging ref="debug" :formData="formData" :tabsParam="tabsParam"></debugging>-->
    <!--      </template>-->
    <!--    </common-dialog>-->
  </div>
</template>

<style scoped lang="scss">
#interfaceEdit {
  height: calc(100% - 51px);
  display: flex;
  flex-direction: column;

  .el-form {
    height: 33% !important;
  }

  .el_tabs {
    box-sizing: border-box;
    margin: 16px;
    height: calc(67% - 32px);
  }
}

::v-deep .el_tabs {
  box-sizing: border-box;

  .el-tabs__content {
    padding: 0 !important;

    .list-layout {
      margin: 0;
      height: 100%;
    }
  }

  #tab-editConfig {
    pointer-events: 'none';
    cursor: 'not-allowed';
  }

  #debugWrap {
    height: calc(100% - 20px);
    padding: 10px;
  }

  .splitBtn {
    width: 0px;
    height: 100%;
    float: left;
    position: relative;
    cursor: pointer;

    > i {
      background: #ccc;
      color: #999999;
      font-size: 12px;
      position: absolute;
      top: 20px;
      width: 12px;
      height: 18px;
      line-height: 18px;
      border-radius: 2px 0px 0px 2px;
      z-index: 99;
      border: 1px solid #e1e1e1;
      left: -13px;
      border-right: 1px solid #fff;
      background-color: #fff !important;
      font-weight: 900;
    }
  }
}

::v-deep .resize-icon {
  display: none;
}

::v-deep .formList.el-form > .el-row.existBtn:first-child {
  height: calc(100% - 40px);
}

::v-deep .el-tabs--top .el-tabs__content {
  height: calc(100% - 40px);
  padding: 0;
}

.debugDialog ::v-deep .is-fullscreen .el-dialog__body {
  height: calc(100% - 110px) !important;
}
</style>
