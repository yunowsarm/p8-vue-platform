<!-- 太阳能表导入 -->
<template>
  <div>
    <form-list label-width="100px"
               ref="form"
               :data-source="dataSource"
               :form="formData"
               :api="saveApi"
               :is-custom-validate="isCustomValidate"
               :visible.sync="visibleImportExcel"
               @custom-validate="customValidate"
               @saved="saved"
               @rendered="rendered">
      <template #outputRequest>
        <div class="edit-outputdata-view">
          <div class="title">导入模板:</div>
          <ul class="file-list">
            <li>
              <p>
                模板下载:
                <span class="filename">
                  <el-link type="success"
                           :underline="true"
                           @click="downLoadMyList">太阳能表信息导入模板</el-link>
                </span>
              </p>
            </li>
          </ul>
        </div>
      </template>
      <template #outputIo>
        <div class="edit-outputIo-view"
            v-if="visibleImportExcel">
          <div class="title">Excel:导入模板</div>
            <el-upload
            :before-upload="beforeUpload"
            :http-request="uploadExcelFile"
            accept=".xls,.xlsx"
            action="fileUrl"
            ref="upload"
            class="upload-demo"
          >
            <el-button type="warning">导入</el-button>
          </el-upload>
        </div>
      </template>
    </form-list>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import { P8Form as FormList, Link, Notification } from 'p8-components-ui'
export default {
  name: 'ImportExcel',
  components: {
    FormList,
    'el-link': Link,
    Notification
  },
  props: {
    taskId: {
      type: String,
      default: '00001'
    },
  },
  data () {
    const dataSource = [
      {
        type: 'blank',
        labelText: '',
        slotName: 'outputRequest',
        colLayout: ''
      },
      {
        type: 'blank',
        labelText: '',
        slotName: 'outputIo',
        colLayout: ''
      },
      // {
      //   type: 'upload',
      //   labelText: '', // 控件显示的文本
      //   fieldName: 'uploadFileJson',
      //   defaultValue: [],
      //   colLayout: 'singleCol',
      //   uploadConfig: {
      //     drag: true, // 上传附件按钮形式：单击或拖动到某区域上传设置为'drag:true'，单击按钮上传不做设置
      //     limit: 1
      //   },
      //   listType: 'text' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
      // }
    ]
    return {
      saveApi: 'baseData.importsunMeter',
      dataSource,
      isCustomValidate: true,
      importExcel: true,
      visibleImportExcel: true,
      fileList: [{name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}, {name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}],
      formData: Object.assign(
        {},
        {
          uploadFileJson: []
        }
      )
    }
  },
  mounted () {
  },
  computed: {
    ...mapGetters(['token', 'userId', 'userInfo'])
  },
  methods: {
    rendered () { },
    // saved (res) {
    //   if (res.length > 0) {
    //     let messages = '<ol> '
    //     res.forEach((message) => {
    //       messages += '<li> ' + message + ' </li>'
    //     })
    //     messages += '</ol>'
    //     Notification.warning({
    //       title: '导入警告信息',
    //       dangerouslyUseHTMLString: true,
    //       message: messages
    //     })
    //   }
    //   this.formData.uploadFileJson = []
    //   this.$emit('save-success', 'output')
    // },
    uploadExcelFile(item) {
      console.log(item.file,"item")
      // this.dialogTableVisible = true;
      let formData = new FormData();
      formData.append('excel', item.file);
      console.log(this.token,"this.token")
      axios.post(CONFIG.devBaseUrl + '/jt/sun/importMeter',formData,{
        headers: { 
          Authorization: this.token 
        }
      }).then((res) => {
        console.log(res,"res")
        if(res.data.head.code==500){
          this.$message.error(res.data.head.message)
          console.log(res.data.head.message,"res.data.head.message")
          return
        }
        this.$message.success('导入成功')
        // this.$emit('save-success', 'output')
      }).catch((error) => {
        this.$message.error('请求失败')
      })
      // this.$api['baseData.gridimport'](formData).then((res) => {
      //   console.log(res,"res")
      // }).catch((error) => {
      //   this.$message.error('请求失败')
      // })
 
    },
    beforeUpload(file) {
      let regExp = file.name.replace(/.+\./, '');
      let lower = regExp.toLowerCase(); //把大写字符串全部转为小写字符串
      let suffix = ['xls', 'xlsx'];
      if (suffix.indexOf(lower) === -1) {
        return this.$message.warning('请上传后缀名为 xls、xlsx 的附件 !');
      }
    },
    customValidate (saveParams) {
      this.$message.success('保存成功')
      this.$emit('save-success', 'output')
      // console.log(saveParams,"saveParams")
      // const params = {
      //   // params: 保存时请求接口所需的参数
      //   taskId: this.taskId,
      //   createSource: '0',
      //   uploadFileJson: []
      // }
      // if (saveParams.uploadFileJson && saveParams.uploadFileJson.length) {
      //   saveParams.uploadFileJson.forEach((item, index) => {
      //     const tempObj = {}
      //     tempObj.aorId = this.taskId
      //     tempObj.aorName = item.aorName ? item.aorName : ''
      //     tempObj.aorDetail = item.aorDetail ? item.aorDetail : ''
      //     tempObj.taskId = item.taskId ? item.taskId : this.taskId
      //     tempObj.attId = item.id
      //     tempObj.attFilePath = item.filePath
      //     tempObj.attFileName = item.fileName
      //     tempObj.attFileType = item.fileType
      //     tempObj.attConfidentialite = item.confidentialite
      //     this.$set(params.uploadFileJson, index, tempObj)
      //   })
      // }
      // this.$refs.form.submitForm(params, this.saveApi)
    },
    downLoadMyList () {
      this.$api['baseData.griddownload']({ url: "sunMeter.xlsx" }, { responseType: 'blob' })
      .then((data) => {
          const date = new Date()
          const fileName = '太阳能表信息导入模板' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
          const fileType = 'xlsx'
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = `${fileName}.${fileType}`
          document.body.appendChild(link)
          link.click()
        })
        .catch(() => {
          this.$message({
            message: 'excel下载失败！',
            type: 'error'
          })
        })
    },
  }
}
</script>
<style lang="scss" scoped>
.el-form.formList .el-row {
  height: auto;
}
.edit-outputdata-view {
  background-color: rgba(239, 239, 239, 0.5);
  position: relative;
  min-height: 40px;
  .title {
    position: absolute;
    left: -100px;
    width: 100px;
    height: 100%;
    text-align: center;
    background-color: rgba(239, 239, 239, 0.5);
  }
  .file-list {
    li {
      box-sizing: border-box;
      list-style: decimal;
      padding: 0 10px;
      margin-left: 20px;
      &.not-last {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
      p {
        margin: 0;
        padding: 0;
      }
      p span.filename {
        cursor: pointer;
      }
    }
  }
}
.edit-outputIo-view {
  position: relative;
  .title {
    position: absolute;
    left: -100px;
    width: 100px;
    text-align: center;
  }
}
</style>
