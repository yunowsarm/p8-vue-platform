<script>
import { Row, Col, Divider, Tag, P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'InputView',
  components: {
    'el-row': Row,
    'el-col': Col,
    'el-divider': Divider,
    'el-tag': Tag,
    FormList
  },
  props: {
    /**
     * 任务ID，用于获取数据
     */
    taskId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // 当前激活的输出类型
      activeOutput: 'inputKey',
      // 数据源配置，用于表单渲染
      dataSource: [
        {
          labelText: '',
          type: 'addField', // 控件类型--增删行
          colLayout: 'singleCol',
          fieldName: 'additionalInput', // 保存时格式，类似detailList[0].roleName
          addFieldLayout: 'vertical',
          isView: true,
          children: [
            {
              type: 'hidden',
              fieldName: 'id'
            },
            {
              type: 'hidden',
              fieldName: 'activityInfoId'
            },
            {
              labelText: '输入要求',
              type: 'view',
              fieldName: 'describes',
              placeholder: '请输入输入要求',
              colLayout: 'singleCol',
              fieldConfig: {
                rows: '6'
              }
            },
            {
              labelText: '输入类型',
              type: 'view',
              fieldName: 'inPutTypeDisplay',
              placeholder: '请输入输入要求',
              colLayout: 'singleCol',
              fieldConfig: {
                rows: '6'
              }
            },
            {
              type: 'uploadView', // 控件类型
              labelText: '上传附件', // 控件显示的文本
              fieldName: 'uploadFiles',
              colLayout: 'singleCol',
              filesLayout: 'row',
              uploadConfig: {
                // drag: true// 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
              },
              listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
            }
          ]
        }
      ],
      // 表单数据
      formData: {
        additionalInput: []
      },
      // 前置输出物数据
      frontOutput: []
    }
  },
  created() {
    // 初始化时调用fetchData方法获取数据
    this.fetchData()
  },
  methods: {
    /**
     * 获取数据的方法
     */
    fetchData() {
      if (!this.taskId) {
        console.error('Task ID is required')
        return
      }

      // 获取增加的输入物
      this.getCustomInputData()
      // 获取前置输出物
      this.getInputData()
    },
    /**
     * 获取增加的输入物
     */
    getCustomInputData() {
      this.$api['planGanttManager.customInputInfo']({ taskId: this.taskId })
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            this.formData.additionalInput = res
          }
        })
        .catch((error) => {
          console.error('Error fetching custom input data:', error)
        })
    },
    /**
     * 获取前置输出物
     */
    getInputData() {
      this.$api['planGanttManager.inputInfo']({ taskId: this.taskId })
        .then((res) => {
          if (res) {
            this.frontOutput = res
          }
        })
        .catch((error) => {
          console.error('Error fetching input data:', error)
        })
    },
    /**
     * 下载输出请求文件
     * @param {Object} file - 文件对象
     */
    downloadOutputRequsetFile(file) {
      if (file && file.id) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: file.id }, { responseType: 'blob' })
          .then((backJson) => {
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(new Blob([backJson.data]))
            link.download = encodeURIComponent(file.attFilePath)
            document.body.appendChild(link)
            link.click()
            window.URL.revokeObjectURL(link.href)
            document.body.removeChild(link)
          })
          .catch((error) => {
            console.error('Error downloading file:', error)
          })
      }
    }
  }
}
</script>

<template>
  <div>
    <!-- 标签页组件 -->
    <el-tabs v-model="activeOutput" type="border-card">
      <!-- 增加的输入物标签页 -->
      <el-tab-pane label="增加的输入物" name="inputKey">
        <span slot="label"><i class="p8 icon-shuchuyaoqiu"></i> 增加的输入物</span>
        <!-- 渲染表单列表 -->
        <form-list v-if="formData.additionalInput.length" ref="form" form-layout="vertical" :data-source="dataSource" :form="formData" :exist-default-btn="false"></form-list>
        <!-- 当没有数据时显示空状态 -->
        <el-empty v-else class="custom_empty" :image-size="100"></el-empty>
      </el-tab-pane>
      <!-- 前置输出物标签页 -->
      <el-tab-pane label="前置输出物" name="getPreOutputKey">
        <span slot="label"><i class="p8 icon-xuanxiang1"></i> 前置输出物</span>
        <!-- 渲染前置输出物列表 -->
        <div v-if="frontOutput.length > 0">
          <div v-for="(item, index) in frontOutput" :key="index">
            <!-- 任务名称 -->
            <el-row type="flex">
              <el-col :span="3" class="baseTitle">任务名称 </el-col>
              <el-col :span="21" class="baseContent">{{ item.taskName }} </el-col>
              <br />
            </el-row>
            <!-- 输入物详情 -->
            <div v-for="(input, inIndex) in item.inputDatas" :key="inIndex + index">
              <!-- 输入要求 -->
              <el-row type="flex">
                <el-col :span="3" class="baseTitle">输入要求 </el-col>
                <el-col :span="21" class="baseContent">{{ input.describes }} </el-col>
                <br />
              </el-row>
              <!-- 补充要求 -->
              <el-row type="flex">
                <el-col :span="3" class="baseTitle">补充要求 </el-col>
                <el-col :span="21" class="baseContent">
                  <!-- 遍历上传文件 -->
                  <div v-for="attr in input.uploadFiles" :key="attr.label" :value="attr.value">
                    <el-row type="flex">
                      <!-- 文件名，点击下载 -->
                      <el-col :span="12" class="baseTitle"
                        ><span @click="downloadOutputRequsetFile(attr)">{{ attr.fileName }}</span></el-col
                      >
                      <!-- 密级 -->
                      <el-col :span="12" class="baseContent">{{ attr.confidentialite }} </el-col>
                      <br />
                    </el-row>
                  </div>
                </el-col>
              </el-row>
            </div>
            <!-- 分割线 -->
            <el-divider></el-divider>
          </div>
        </div>
        <!-- 当没有数据时显示空状态 -->
        <el-empty v-else class="custom_empty" :image-size="100"></el-empty>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss"></style>
