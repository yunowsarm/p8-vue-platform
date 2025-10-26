<template>
  <div class="ele-steps-wrap">
    <div class="ele-steps-content">
      <div class="content-header">
        <span v-for="item in header" :key="item.id" :class="'header ' + item.id">{{ item.name }}</span>
      </div>
      <VuePerfectScrollbar
        ref="scrollarea"
        class="scroll-area"
        :settings="scrollSetting"
        @ps-scroll-y="psScrollYHandle"
        @ps-scroll-up="psScrollUpHandle"
        @ps-scroll-down="psScrollDownHandle"
        @ps-y-reach-end="psScrollEndHandle"
      >
        <div v-for="(item, index) in steps" :key="item.id" :id="`stepsBody${index}`" :ref="item.id" class="content-list-wrap" :class="{ activeAni: item.id === selectStepsId }">
          <div class="content-list-cont">
            <div class="classify">
              <span style="width: 65px" v-if="item.id === 'activityDesc'">任务描述</span>
              <span style="width: 65px" v-if="item.id === 'putin'">输入</span>
              <span style="width: 65px" v-if="item.id === 'output'">输出</span>
              <span style="width: 65px" v-if="item.id === 'varsion'">特别说明</span>
            </div>
            <div class="list-con">
              <template v-if="item.id === 'activityDesc'">
                <template v-if="activityDescData && activityDescData.length">
                  <div v-for="(citem, cindex) in activityDescData" :key="cindex" class="list-con-item">
                    <div class="list-con-item__content request">
                      <el-tooltip :disabled="$isMobile" placement="top-start">
                        <div slot="content" class="custom-tooltip" v-html="citem.description"></div>
                        <span>{{ citem.descriptionDisplay }}</span>
                      </el-tooltip>
                    </div>
                    <div class="list-con-item__content remark"></div>
                    <div class="list-con-item__content file"></div>
                  </div>
                </template>
                <template v-else>
                  <div class="no-info">
                    <span>暂无信息</span>
                  </div>
                </template>
              </template>
              <template v-if="item.id === 'putin'">
                <template v-if="inputRequestData && inputRequestData.length">
                  <div v-for="citem in inputRequestData" :key="citem.attId" class="list-con-item">
                    <div class="list-con-item__content request">
                      <el-tooltip :disabled="$isMobile" placement="top" :content="citem.descriptionStr">
                        <span>{{ citem.descriptionStr }}</span>
                      </el-tooltip>
                    </div>
                    <div class="list-con-item__content remark">{{ citem.aorDetail || '' }}</div>
                    <div class="list-con-item__content file" @click="downloadOutputRequsetFile(citem)">
                      <el-tooltip :disabled="$isMobile" placement="top" :content="citem.attFileName">
                        <span>{{ citem.attFileName }}</span>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="no-info">
                    <span>暂无信息</span>
                  </div>
                </template>
              </template>
              <template v-if="item.id === 'output'">
                <template v-if="outputIoData && outputIoData.length">
                  <div v-for="citem in outputIoData" :key="citem.aorId" class="list-con-item">
                    <div v-if="!$store.getters.isMobile" class="list-con-item__content request">
                      <el-tooltip :disabled="$isMobile" placement="top" :content="citem.aorName">
                        <span>{{ citem.aorName }}</span>
                      </el-tooltip>
                    </div>
                    <div v-if="!$store.getters.isMobile" class="list-con-item__content remark">
                      <el-tooltip :disabled="$isMobile" placement="top" :content="citem.aorDetail">
                        <span>{{ citem.aorDetail }}</span>
                      </el-tooltip>
                    </div>
                    <div class="list-con-item__content file" @click="downloadOutputRequsetFile(citem)">
                      <el-tooltip :disabled="$isMobile" placement="top" :content="citem.attFileName">
                        <span style="color: blue; text-decoration: underline">{{ citem.attFileName }}</span>
                      </el-tooltip>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="no-info">
                    <span>暂无信息</span>
                  </div>
                </template>
              </template>
              <template v-if="item.id === 'varsion'">
                <template v-if="specialVersionData && specialVersionData.length">
                  <div v-for="citem in specialVersionData" :key="citem.aorId" class="list-con-item">
                    <div class="list-con-item__content request">
                      <el-tooltip :disabled="$isMobile" placement="top" :content="citem.aoDescribes">
                        <span>{{ citem.aoDescribes }}</span>
                      </el-tooltip>
                    </div>
                    <div class="list-con-item__content remark">{{ citem.aorDetail }}</div>
                    <div v-if="citem.attFileName" class="list-con-item__content file" @click="downloadOutputRequsetFile(citem)">
                      <i class="el-icon-link" style="font-size: 14px"></i>
                      <span>{{ citem.attFileName }}</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="no-info">
                    <span>暂无信息</span>
                  </div>
                </template>
              </template>
            </div>
            <div class="operation">
              <button-group :buttonGroup="item.btns" :stepsRow="item" :nullity="nullity" :btnType="btnType" :approveType="approveType" :comp="comp"></button-group>
            </div>
          </div>
        </div>
      </VuePerfectScrollbar>
    </div>
    <common-drawer size="50%" class="manager-drawer" :title="drawerTitle" :visible="drawerVisible" :drawerConfig="drawerConfig" @close="onDrawerClose">
      <template #drawer>
        <template v-if="drawerViewVisible === 'activityDesc'">
          <activity-desc-edit-view :activityDescData="activityDescData" @editSaveOK="editSaveOK"></activity-desc-edit-view>
        </template>
        <template v-if="drawerViewVisible === 'putin'">
          <input-io-view :inputIoData="inputIoData" :inputRequest="inputRequestData" @editSaveOK="editSaveOK"></input-io-view>
        </template>
        <template v-if="drawerViewVisible === 'output'">
          <output-edit-view :taskId="getPlanInfo().TASKID" :thirdMenuParam="thirdMenuParam" :approveType="approveType" :outputRequest="outputRequestData" @editSaveOK="editSaveOK"></output-edit-view>
        </template>
        <template v-if="drawerViewVisible === 'varsion'">
          <version-view :versionData="specialVersionData"></version-view>
        </template>
      </template>
    </common-drawer>
  </div>
</template>
<script>
import ButtonGroup from './Components/buttonGroup'
import ActivityDescEditView from './Components/activityDescEdit'
import InputIoView from './Components/inputIoView'
import OutputEditView from './Components/outputEdit'
import VersionView from './Components/versionView'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { P8Drawer as CommonDrawer, Tooltip, Tag } from 'p8-components-ui'

export default {
  name: '',
  inject: ['getPlanInfo'],
  components: {
    VuePerfectScrollbar,
    ButtonGroup,
    CommonDrawer,
    ActivityDescEditView,
    InputIoView,
    OutputEditView,
    VersionView,
    'el-tag': Tag,
    'el-tooltip': Tooltip
  },
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    btnType: {
      type: Boolean
    },
    approveType: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const steps = [
      { name: '任务描述', id: 'activityDesc', btns: [{ title: '查看', eventHandle: 'detailsSettings' }] },
      { name: '输入', id: 'putin', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'putin' }] },
      { name: '输出', id: 'output', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'output' }] },
      { name: '特别说明', id: 'varsion', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'varsion' }] }
    ]

    return {
      comp: this,
      nullity: 0,
      descriptionStr: '',
      outputRequestData: null,
      outputIoData: null,
      inputRequestData: null,
      inputIoData: null,
      activityDescData: null,
      specialVersionData: null,

      steps,
      selectStepsId: steps[0].id,
      header: [],
      scrollSetting: {
        suppressScrollY: false
      },

      // drawer 抽屉相关
      drawerTitle: '',
      drawerVisible: false,
      drawerViewVisible: false,
      drawerConfig: {
        modal: false,
        'modal-append-to-body': false,
        'append-to-body': true
      }
    }
  },
  mounted() {
    // if (this.getPlanInfo().STATUS === '6070' || this.getPlanInfo().STATUS === '6090' || this.getPlanInfo().pageType === 'view') {
    //   this.steps[2].btns = []
    // }
    if (window.innerWidth > 600) {
      this.header = [
        { name: '要素分类', id: 'classify' },
        { name: '名称/说明/描述', id: 'request' },
        { name: '附加说明/备注', id: 'remark' },
        { name: '交付物/模板/文档', id: 'file' },
        { name: '操作', id: 'operation' }
      ]
    } else {
      this.header = [
        { name: '要素分类', id: 'classify' },
        { name: '名称/说明/描述', id: 'request' },
        { name: '操作', id: 'operation' }
      ]
    }
    if (this.approveType) {
      this.steps = [
        { name: '任务描述', id: 'activityDesc', btns: [{ title: '查看', eventHandle: 'detailsSettings' }] },
        { name: '输入', id: 'putin', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'putin' }] },
        { name: '输出', id: 'output', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'output' }] },
        { name: '特别说明', id: 'varsion', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'varsion' }] }
      ]
    } else {
      this.steps = [
        { name: '任务描述', id: 'activityDesc', btns: [{ title: '查看', eventHandle: 'detailsSettings' }] },
        { name: '输入', id: 'putin', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'putin' }] },
        { name: '输出', id: 'output', btns: [{ title: '编辑', eventHandle: 'modifyMenu', type: 'output' }] },
        { name: '特别说明', id: 'varsion', btns: [{ title: '查看', eventHandle: 'detailsSettings', type: 'varsion' }] }
      ]
    }
    this.initData()
  },
  created() {
    let nullity = this.getPlanInfo().NULLITY
    this.nullity = nullity
  },
  methods: {
    initData() {
      const _this = this
      const taskId = _this.getPlanInfo().TASKID
      // 输出
      const requestApi = 'taskManager.getOutputRequire'

      const outputApi = 'taskManager.getOutputIo'
      // 输入
      const inputRequestApi = 'taskManager.getInputRequire'

      const inputApi = 'taskManager.getInputIo'
      // 任务描述
      const descApi = 'taskManager.getActivityDescription'
      // 特别说明
      const versionApi = 'taskManager.getSpecialVersion'
      Promise.all([
        _this.$api[requestApi]({ taskId }),
        _this.$api[outputApi]({ taskId }),
        _this.$api[inputRequestApi]({ taskId }),
        _this.$api[inputApi]({ taskId }),
        _this.$api[descApi]({ taskId }),
        _this.$api[versionApi]({ taskId })
      ])
        .then((values) => {
          _this.outputRequestData = values[0]
          _this.outputIoData = values[1]
          _this.inputRequestData = values[2]
          _this.inputIoData = values[3]
          _this.activityDescData = values[4]
          if (_this.activityDescData) {
            _this.activityDescData.forEach((item) => {
              if (item.description) {
                function stripHtmlTags(html) {
                  return html.replace(/<\/?[^>]+(>|$)/g, '') // 使用正则去除 HTML 标签
                }

                var plainText = stripHtmlTags(item.description)

                function decodeHtmlEntities(text) {
                  var textarea = document.createElement('textarea')
                  textarea.innerHTML = text
                  return textarea.value
                }

                var decodedStr = decodeHtmlEntities(plainText)
                item.descriptionDisplay = decodedStr
              }
            })
          }
          _this.specialVersionData = values[5]
        })
        .catch((err) => {
          console.error('error-all', err)
        })
    },
    getActivityDesc() {
      // 获取活动描述
      const _this = this
      const api = 'taskManager.getActivityDescription'
      const taskId = _this.getPlanInfo().TASKID
      this.$api[api]({ taskId }).then((res) => {
        _this.activityDescData = res
      })
    },
    getOutputIo() {
      // 获取输出物
      const _this = this
      const api = 'taskManager.getOutputIo'
      const taskId = _this.getPlanInfo().TASKID
      this.$api[api]({ taskId }).then((res) => {
        _this.outputIoData = res
      })
    },
    stepsSliderClickHandle(item, index) {
      if (item.id === this.selectStepsId) {
        return false
      }
      this.selectStepsId = item.id
      const _this = this
      let scrollTotal = 0
      if (index > 0) {
        for (let i = 0; i < index; i++) {
          let off = _this.$el.querySelector(`#stepsBody${i}`).offsetHeight
          scrollTotal += off
        }
      }
      _this.$refs.scrollarea.$el.scrollTop = scrollTotal
    },
    psScrollYHandle() {
      // this.selectStepsId = ''
    },
    psScrollUpHandle(e) {},
    psScrollDownHandle(e) {},
    psScrollEndHandle(e) {},
    detailsSettings(button, stepsItem) {
      // 查看
      this.drawerTitle = stepsItem.name
      this.drawerVisible = true
      this.drawerViewVisible = stepsItem.id
    },
    modifyMenu(button, stepsItem) {
      // 编辑
      this.drawerTitle = stepsItem.name
      this.drawerVisible = true
      this.drawerViewVisible = stepsItem.id
    },
    onDrawerClose() {
      this.drawerTitle = ''
      this.drawerVisible = false
      this.drawerViewVisible = false
    },
    editSaveOK(type) {
      // 输出-抽屉form组件保存后回调
      this.onDrawerClose()
      if (type === 'activityDesc') {
        this.getActivityDesc()
      }
      if (type === 'output') {
        this.getOutputIo()
      }
    },
    downloadOutputRequsetFile(item) {
      if(this.$isMobile){
        if(window.plus){
          alert('当前包含plus API')
        }else{
          alert('当前环境不支持plus API，无法进行下载操作')
        }
      }
      if (item.attId) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.attId }, { responseType: 'blob' })
          .then(async (backJson) => {
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(new Blob([backJson.data],{type:backJson.data.type}))
            link.download = item.attFileName
            document.body.appendChild(link)
            link.click()
            window.URL.revokeObjectURL(link.href)
            document.body.removeChild(link)
          })
          .finally(() => {})
      }
    }
  }
}
</script>
<style lang="scss" scoped>
$borderBottomLine: 1px solid #efefef;
$fixedWidth: 130px;
$fixedHeaderHeight: 40px;
$fixedListHeight: 40px;
$blue-color: #1b8af9;
.ele-steps-wrap {
  height: 100%;
  box-sizing: border-box;
  position: relative;
  // padding-left: 180px;
  .ele-steps-slider {
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    width: 180px;
    height: 100%;
    // padding-top: $fixedHeaderHeight;
    .ele-steps-slider__ul {
      // padding-left: 40%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;

      li {
        position: relative;
        width: 40%;
        margin: 0 auto 10px 30px;
        height: 28px;
        line-height: 28px;
        background: #e3f2fd;
        cursor: pointer;
        text-align: center;

        &.active {
          background: #1565c0;
          color: #ffffff;

          &::after {
            border-color: transparent transparent transparent #1565c0;
          }
        }

        &::after {
          content: '';
          border-width: 14px;
          border-color: transparent transparent transparent #e3f2fd;
          border-style: solid;
          position: absolute;
          right: -58%;
          transform: translate(-50%, -50%);
          top: 50%;
        }
      }
    }
  }

  .ele-steps-content {
    height: 100%;
    overflow: hidden;

    .content-header {
      height: $fixedHeaderHeight;
      display: flex;
      box-sizing: border-box;
      align-items: center;
      border-bottom: $borderBottomLine;
      font-weight: bolder;
      color: #606266;

      span.header {
        line-height: $fixedHeaderHeight;
        flex: 1.5;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        padding: 0 4px;
        box-sizing: border-box;
      }

      span.header.file {
        flex: 1;
      }

      span.header.classify,
      span.header.operation {
        flex: 0 0 $fixedWidth;
        text-align: center;
      }
    }

    .scroll-area {
      height: calc(100% - #{$fixedHeaderHeight});

      .content-list-wrap.activeAni {
        animation: activeAni 1s ease;
      }

      @keyframes activeAni {
        to {
          background-color: #e7f3ff;
        }
      }

      .content-list-cont {
        display: flex;
        box-sizing: border-box;

        div.classify,
        div.operation {
          color: #606266;
          font-weight: bold;
          position: relative;
          flex: 0 0 $fixedWidth;
          margin-left: 0; // 修改：移除左边距
          box-sizing: border-box;
          padding: 0; // 修改：移除内边距
          border-bottom: $borderBottomLine;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: $fixedWidth; // 添加：确保最小宽度
        }

        div.list-con {
          width: calc(100% - #{$fixedWidth * 2});
          flex: 1; // 添加：让中间内容区域自适应
          .list-con-item {
            display: flex;
            align-items: center;
            height: 40px;
            box-sizing: border-box;
            border-bottom: $borderBottomLine;

            div.list-con-item__content {
              flex: 1.5;
              box-sizing: border-box;
              padding: 0 4px;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;

              &.file {
                flex: 1;
                cursor: pointer;
              }
            }
          }
        }

        div.no-info {
          height: 40px;
          line-height: 40px;
          border-bottom: 1px solid #efefef;
          // color: #909399;
        }
      }
    }
  }
}

// 同时修改header部分的样式以保持一致
.content-header {
  span.header.classify,
  span.header.operation {
    flex: 0 0 $fixedWidth;
    text-align: center;
    padding: 0; // 添加：移除内边距
    min-width: $fixedWidth; // 添加：确保最小宽度
  }
}

::v-deep .manager-drawer .el-drawer__header {
  padding: 11px;
}

.custom-tooltip {
  max-width: 600px;
  max-height: 600px;
  overflow: auto;
}
</style>
