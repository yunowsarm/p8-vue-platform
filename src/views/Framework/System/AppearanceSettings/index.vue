<template>
  <div style="overflow: auto">
    <el-card class="card_box">
      <form-list ref="form"
                 label-width="150px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource1"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #interface>
          <el-alert title="界面风格"
                    :closable="false"
                    type="info"></el-alert>
        </template>
        <template #systemThemeType>
          <el-radio-group v-model="formData.systemThemeType"
                          @input="changeThemeType"
                          size="small">
            <el-radio-button label="systemThemeType1">主题1</el-radio-button>
            <el-radio-button label="systemThemeType2">主题2</el-radio-button>
            <el-radio-button label="systemThemeType3">主题3</el-radio-button>
          </el-radio-group>
          <el-tooltip effect="dark"
                      popper-class="testtooltip"
                      content="主题设计"
                      placement="top">
            <i class="el-icon-brush"
               @click="open"
               style="font-size: 20px;margin-left: 15px;"></i>
          </el-tooltip>
          <el-tooltip effect="dark"
                      popper-class="testtooltip"
                      content="恢复默认"
                      placement="top">
            <i class="p8 icon-zhongzhi1"
               @click="restoreDefault"
               style="font-size: 20px;margin-left: 15px;"></i>
          </el-tooltip>
        </template>
      </form-list>
    </el-card>
    <el-card class="card_box">
      <form-list ref="form"
                 label-width="150px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource2"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #tool>
          <el-alert title="工具栏样式"
                    :closable="false"
                    type="info"></el-alert>
        </template>
      </form-list>
    </el-card>
    <el-card class="card_box">
      <form-list ref="form"
                 label-width="150px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource3"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #assembly>
          <el-alert title="组件响应方式"
                    :closable="false"
                    type="info"></el-alert>
        </template>
        <template #pageViewType>
          <el-radio-group v-model="formData.pageViewType"
                          size="small">
            <el-radio-button label="pageViewType1">页码分页</el-radio-button>
            <el-radio-button label="pageViewType2">滚动分页</el-radio-button>
          </el-radio-group>
        </template>
      </form-list>
    </el-card>
    <el-card class="card_box">
      <form-list ref="form"
                 label-width="150px"
                 @rendered="rendered"
                 @saved="saved"
                 :data-source="dataSource4"
                 :api="saveApi"
                 :is-custom-validate="true"
                 @custom-validate="customValidate"
                 :form="formData">
        <template #tool>
          <el-alert title="表格样式"
                    :closable="false"
                    type="info"></el-alert>
        </template>
      </form-list>
    </el-card>
    <el-button type="primary"
               class="formBtn"
               @click="view">预览</el-button>

    <common-drawer v-if="isVisibleThemeDrawer"
                   title="主题设计"
                   :visible="isVisibleThemeDrawer"
                   placement="top"
                   size="100%"
                   @close="themeClose">
      <template #drawer>
        <theme-design ref="themeDesign"
                      :themeArray="themeArray"
                      :formData=formData
                      @save-success="saveSuccess" />
      </template>
    </common-drawer>
    <common-dialog title="预览"
                   v-if="visible"
                   :visible="visible"
                   width="50%"
                   :dialog-height="dialogHeight"
                   @close="handleCancel"
                   :show-handle-btn="false">
      <template #dialog>
        <list-layout>
          <template #north>
            <div v-if="formData.toolbarWritingDisplay">
              <el-button-group v-if="formData.toolbarCompactLayout">
                <el-button type="primary">新建</el-button>
                <el-button type="primary">修改</el-button>
              </el-button-group>
              <div v-else>
                <el-button type="primary">新建</el-button>
                <el-button type="primary">修改</el-button>
              </div>
            </div>
            <div v-else>
              <el-button-group v-if="formData.toolbarCompactLayout">
                <el-tooltip placement="top"
                            content="新建">
                  <el-button icon="p8 icon-add"
                             type="primary"></el-button>
                </el-tooltip>
                <el-tooltip placement="top"
                            content="修改">
                  <el-button icon="p8 icon-xiugai"
                             type="primary"></el-button>
                </el-tooltip>
              </el-button-group>
              <div v-else>
                <el-tooltip placement="top"
                            content="新建">
                  <el-button icon="p8 icon-add"
                             type="primary"></el-button>
                </el-tooltip>
                <el-tooltip placement="top"
                            content="修改">
                  <el-button icon="p8 icon-xiugai"
                             type="primary"></el-button>
                </el-tooltip>
              </div>
            </div>
          </template>
          <template #center>
            <common-table ref="table"
                          :comp="comp"
                          :columns="columns"
                          :no-api-table-data="infiniteList"
                          :table-setting="false"
                          :pagination="true">
              <template #six="{ scope }">
                <span v-if="formData.toolbarTextDisplay === '1'">男</span>
                <i v-else
                   class="p8 icon-xingbienan"></i>
              </template>
              <template #operation="{ scope }">
                <div v-if="formData.toolbarWritingDisplay">
                  <el-button-group v-if="formData.toolbarCompactLayout">
                    <el-button style="margin-right: 2px;"
                               type="text">查看</el-button>
                    <el-button type="text">删除</el-button>
                  </el-button-group>
                  <div v-else>
                    <el-button type="text">查看</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text">删除</el-button>
                  </div>
                </div>
                <div v-else>
                  <el-button-group v-if="formData.toolbarCompactLayout">
                    <el-tooltip placement="top"
                                content="查看">
                      <el-button style="margin-right: 2px;"
                                 icon="p8 icon-chakan"
                                 type="primary"></el-button>
                    </el-tooltip>
                    <el-tooltip placement="top"
                                content="删除">
                      <el-button icon="p8 icon-shanchu"
                                 type="primary"></el-button>
                    </el-tooltip>
                  </el-button-group>
                  <div v-else>
                    <el-tooltip placement="top"
                                content="查看">
                      <el-button icon="p8 icon-chakan"
                                 type="primary"></el-button>
                    </el-tooltip>
                    <el-divider direction="vertical"></el-divider>
                    <el-tooltip placement="top"
                                content="删除">
                      <el-button icon="p8 icon-shanchu"
                                 type="primary"></el-button>
                    </el-tooltip>
                  </div>
                </div>
              </template>
            </common-table>
          </template>
        </list-layout>
      </template>
    </common-dialog>
  </div>
</template>
<style lang="scss" scoped>
.el-alert--info.is-light {
  font-weight: 900;
  margin-left: -145px;
  background-color: white;
  color: black;
}
.main-router {
  height: calc(100% - 60px) !important;
}
.card_box {
  margin: 16px;
}
::v-deep .formList.el-form > .el-row.formBtn {
  background: #ffffff !important;
  padding-bottom: 22px !important;
}
.formBtn {
  position: absolute;
  bottom: 22px;
  right: 75px;
}
::v-deep .el-dialog__body {
  padding: 0 !important;
}
</style>
<script>
import { P8ListLayout as ListLayout, P8Form as FormList, Alert, RadioGroup, RadioButton, P8Drawer as CommonDrawer, P8Dialog as CommonDialog, P8Table as CommonTable } from 'p8-components-ui'
import themeDesign from './themeDesign.vue'
export default {
  name: 'AppearanceEdit',
  components: {
    ListLayout,
    FormList,
    'el-alert': Alert,
    'el-radio-group': RadioGroup,
    'el-radio-button': RadioButton,
    CommonDrawer,
    CommonDialog,
    themeDesign,
    CommonTable
  },
  data () {
    return {
      saveApi: 'SystemSettings.saveAppearanceSettings',
      dataSource1: [
        {
          type: 'blank',
          slotName: 'interface',
          colLayout: 'singleCol'
        },
        {
          labelText: '主题风格',
          type: 'blank',
          slotName: 'systemThemeType',
          colLayout: 'doubleCol'
        },
        {
          type: 'upload', // 控件类型
          labelText: '登录背景图',
          fieldName: 'uploadFileJson',
          colLayout: 'doubleCol',
          uploadConfig: {
            limit: 1,
            accept: '.jpeg,.jpg,.gif,.png'
            // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
          },
          listType: 'picture-card' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
        }
      ],
      dataSource2: [
        {
          type: 'blank',
          slotName: 'tool',
          colLayout: 'singleCol'
        },
        {
          labelText: '显示文字',
          type: 'switch',
          fieldName: 'toolbarWritingDisplay',
          colLayout: 'singleCol'
        },
        {
          labelText: '紧凑布局',
          type: 'switch',
          fieldName: 'toolbarCompactLayout',
          colLayout: 'singleCol'
        }
      ],
      dataSource3: [
        {
          type: 'blank',
          slotName: 'assembly',
          colLayout: 'singleCol'
        },
        {
          labelText: '列表分页方式',
          type: 'blank',
          slotName: 'pageViewType',
          colLayout: 'singleCol'
        },
        {
          labelText: '启用抽屉模式',
          type: 'switch',
          fieldName: 'componentEnableDrawer',
          colLayout: 'singleCol'
        }
      ],
      dataSource4: [
        {
          type: 'blank',
          slotName: 'tool',
          colLayout: 'singleCol'
        },
        {
          labelText: '图标展示方式',
          type: 'radio',
          options: [
            {
              label: '图标',
              value: '0'
            },
            {
              label: '文字',
              value: '1'
            }
          ],
          fieldName: 'toolbarTextDisplay',
          colLayout: 'singleCol'
        },
        {
          type: 'number',
          labelText: '行高(单位：px)',
          fieldName: 'tableRowHeight',
          placeholder: '请输入行高',
          colLayout: 'doubleCol',
          colSpan: 6,
          min: 35,
          max: 300
        }
      ],
      formData: {
        toolbarTextDisplay: '0',
        tableRowHeight: 50
      },
      modify: {},
      isVisibleThemeDrawer: false,
      defaultTheme: [
        [
          {
            key: 'tableBgColor',//表格背景色
            value: '#FFFFFF'
          },
          {
            key: 'tableHeaderBgColor',//表格表头背景色
            value: '#F4F8F8'
          },
          {
            key: 'tableStripeColor',//表格斑马纹颜色
            value: '#fbfbfb'
          },
          {
            key: 'tableRowHoverBgColor',//表格鼠标悬停颜色
            value: '#F1F9FF'
          },
          {
            key: 'tableBorderColor',//表格边框颜色
            value: '#E6E6E6'
          },
          {
            key: 'tableTextColor',//表格文字颜色
            value: '#606266'
          },
          {
            key: 'tableHeaderTextColor',//表格表头文字颜色
            value: '#1F2329'
          },
          {
            key: 'imageUrl',// 侧边栏背景图片
            url: './static/themeBackground/image3.png'
          },
          {
            key: 'bgTheme',// 侧边栏背景颜色
            value: '#3491FA'
          }
        ],
        [
          {
            key: 'tableBgColor',//表格背景色
            value: '#FFFFFF'
          },
          {
            key: 'tableHeaderBgColor',//表格表头背景色
            value: '#FBF4F4'
          },
          {
            key: 'tableStripeColor',//表格斑马纹颜色
            value: '#fbfbfb'
          },
          {
            key: 'tableRowHoverBgColor',//表格鼠标悬停颜色
            value: '#FFF1F1'
          },
          {
            key: 'tableBorderColor',//表格边框颜色
            value: '#E6E6E6'
          },
          {
            key: 'tableTextColor',//表格文字颜色
            value: '#606266'
          },
          {
            key: 'tableHeaderTextColor',//表格表头文字颜色
            value: '#1F2329'
          },
          {
            key: 'imageUrl',// 侧边栏背景图片
            url: './static/themeBackground/image9.png'
          },
          {
            key: 'bgTheme',// 侧边栏背景颜色
            value: '#C70019'
          }
        ]
        ,
        [
          {
            key: 'tableBgColor',//表格背景色
            value: '#FFFFFF'
          },
          {
            key: 'tableHeaderBgColor',//表格表头背景色
            value: '#F7F8FA'
          },
          {
            key: 'tableStripeColor',//表格斑马纹颜色
            value: '#fbfbfb'
          },
          {
            key: 'tableRowHoverBgColor',//表格鼠标悬停颜色
            value: '#E5E6EB'
          },
          {
            key: 'tableBorderColor',//表格边框颜色
            value: '#E6E6E6'
          },
          {
            key: 'tableTextColor',//表格文字颜色
            value: '#606266'
          },
          {
            key: 'tableHeaderTextColor',//表格表头文字颜色
            value: '#1F2329'
          },
          {
            key: 'imageUrl',// 侧边栏背景图片
            url: './static/themeBackground/image10.png'
          },
          {
            key: 'bgTheme',// 侧边栏背景颜色
            value: '#272E3B'
          }
        ]
      ],
      themeArray: this.defaultTheme,
      dialogHeight: 500,
      visible: false,
      comp: this,
      columns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          width: 55,
          headerAlign: 'center'
        },
        {
          title: '姓名',
          dataIndex: 'name',
          align: 'center'
        },
        {
          title: '年龄',
          dataIndex: 'age',
          align: 'center'
        },
        {
          title: '性别',
          dataIndex: 'six',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
          width: 100,
          align: 'center'
        }
      ],
      infiniteList: [
        {
          name: '张三',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '李四',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '王五',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '赵六',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        },
        {
          name: '钱七',
          age: 18,
          six: '男',
          address: '上海市普陀区金沙江路 1518 弄'
        }
      ],
      baseConfig: JSON.parse(JSON.stringify(this.$store.getters.baseConfig))
    }
  },
  mounted () {
  },
  methods: {
    view () {
      this.$store.getters.baseConfig.tableRowHeight = this.formData.tableRowHeight
      this.visible = true
    },
    handleCancel () {
      this.visible = false
      this.$store.getters.baseConfig.tableRowHeight = this.baseConfig.tableRowHeight
    },
    open () {
      this.isVisibleThemeDrawer = true
    },
    restoreDefault () {
      this.themeArray = this.defaultTheme
      // this.saveSuccess(this.themeArray)
      this.changeThemeType(this.formData.systemThemeType)
    },
    themeClose () {
      this.changeThemeType(this.formData.systemThemeType)
      this.isVisibleThemeDrawer = false
    },
    changeThemeType (key) {
      let themeArray = []
      switch (key) {
        case 'systemThemeType1':
          // 蓝色
          themeArray = this.themeArray[0]
          break;
        case 'systemThemeType2':
          // 红色
          themeArray = this.themeArray[1]
          break;
        case 'systemThemeType3':
          // 黑色
          themeArray = this.themeArray[2]
        default:
          break;
      }
      themeArray.forEach(item => {
        switch (item.key) {
          case 'imageUrl':
            this.$store.dispatch('setImage', item.url)
            break;
          case 'bgTheme':
            let theme = item.value
            this.$store.dispatch('setTheme', { theme, handler: true })
            break;
          default:
            this.$store.dispatch('setSystemColor', { [item.key]: item.value })
            break;
        }
      })
      this.formData.systemThemeArray = JSON.stringify(this.themeArray)
    },
    rendered () {
      this.getSettingData()
    },
    clickEvent () {
      // console.log('click')
    },
    getSettingData () {
      let that = this
      that.$api['SystemSettings.getAppearanceSettings']()
        .then(function (res) {
          res.settings.forEach(function (item) {
            that.modify[item.key] = item.value === 'true' ? true : item.value === 'false' ? false : item.value
            if (item.key === 'systemThemeArray' && item.value) {
              that.themeArray = JSON.parse(item.value)
            }
          })
          that.getFileUrl(res.uploadFileJson) // 获取图片流
        })
        .catch(function (error) {
          // console.log('error' + error)
        })
    },
    // 获取图片流
    getFileUrl (uploadFileJson) {
      let that = this
      if (uploadFileJson) {
        uploadFileJson.map((item) => {
          if (item.id) {
            that.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(function (res) {
              item.urlTemp = window.URL.createObjectURL(new Blob([res.data]))
            })
          }
        })
        that.modify.uploadFileJson = uploadFileJson
      }
      if (this.modify.toolbarTextDisplay === '1') {
        this.modify.toolbarTextDisplay = '1'
      } else {
        this.modify.toolbarTextDisplay = '0'
      }
      that.modify.tableRowHeight = that.modify.tableRowHeight ? Number(that.modify.tableRowHeight) : 48
      that.formData = Object.assign({}, that.modify)
    },
    saveSuccess (themeArray) {
      this.formData.systemThemeArray = JSON.stringify(themeArray)
      this.customValidate(this.formData)
    },
    customValidate (params) {
      let saveParams = {}
      let settings = [
        {
          key: 'systemThemeType', // 系统主题
          value: params.systemThemeType
        },
        {
          key: 'systemThemeArray', // 系统主题
          value: params.systemThemeArray
        },
        {
          key: 'toolbarWritingDisplay', // 工具栏启用文字
          value: params.toolbarWritingDisplay
        },
        {
          key: 'toolbarTextDisplay', // 图标显示方式
          value: params.toolbarTextDisplay
        },
        {
          key: 'toolbarCompactLayout', // 工具栏紧凑布局
          value: params.toolbarCompactLayout
        },
        {
          key: 'pageViewType', // 列表分页方式
          value: params.pageViewType
        },
        {
          key: 'componentEnableDrawer', // 组件响应方式
          value: params.componentEnableDrawer
        },
        {
          key: 'tableRowHeight', // 组件响应方式
          value: params.tableRowHeight
        }
      ]
      let uploadFileJson = params.uploadFileJson ? params.uploadFileJson : []
      saveParams.uploadFileJson = uploadFileJson
      if (saveParams.uploadFileJson[0]) {
        saveParams.uploadFileJson[0].confidentialite = '9001'
      }

      saveParams.settings = settings
      this.$refs.form.submitForm(saveParams, this.saveApi)
    },
    saved (res) { }
  }
}
</script>
