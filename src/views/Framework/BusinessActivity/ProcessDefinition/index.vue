<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <list-layout>
    <template #north>
      <common-button :comp="comp"
                     :button-type="'round'"></common-button>
      <search-form-list ref="search"
                        :data-source="searchData"
                        @search="search"
                        labelWidth="100px"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <div id="table-contain">
        <common-table ref="table"
                      :fiex="200"
                      :columns="columns"
                      :table-refresh="tableRefresh"
                      :params="queryParam"
                      :api="tableApi"
                      :comp="comp"
                      :pagination="true"></common-table>
        <edit v-if="visibleModelEditDialog"
              :visible="visibleModelEditDialog"
              :title="title"
              @close-modal="onCreateClose"
              @save-success="saveCallback"></edit>
      </div>
    </template>
    <template #drawer-panel>
      <common-drawer :title="modelPictureTitle"
                     :visible="visibleModelPicture"
                     :show-handle-btn="false"
                     size="80%"
                     @close="onModelPictureClose">
        <template #drawer>
          <model-view :process-definition-id="modelId"></model-view>
        </template>
      </common-drawer>

      <common-drawer :title="title"
                     :visible="deployLocalModelEdit"
                     :show-handle-btn="false"
                     size="40%"
                     @close="deployLocalCloseCallback">
        <template #drawer>
          <common-import @save-success="deployLocalSaveCallback"
                         :fields="importData"
                         :form-data="formData"
                         :upload-api="uploadApi"></common-import>
        </template>
      </common-drawer>

      <common-drawer :title="title"
                     :visible="visibleModelEditDrawer"
                     :show-handle-btn="false"
                     size="100%"
                     @close="onCreateBpmClose">
        <template #drawer>
          <BpmnNewEdit :bpm-id="modelId"
                       :bpm-name="modelName"
                       :api="saveApi"
                       @save="saveBpm"></BpmnNewEdit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>

<style lang="scss" scoped>
::v-deep .p8-bpmnNew {
  height: 100% !important;
}
</style>
<script>
import {
  P8Search as SearchFormList,
  P8Bpm as ModelEdit,
  BpmnNew as BpmnNewEdit,
  P8ProcessDefinition as ModelView,
  P8Import as CommonImport,
  P8ListLayout as ListLayout,
  P8Table as CommonTable,
  P8Button as CommonButton,
  P8Drawer as CommonDrawer
} from 'p8-components-ui'
import api from '@/plugins/api'
import Edit from './edit'

const columns = [
  {
    title: '序号',
    type: 'index',
    width: '50',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: 'KEY',
    dataIndex: 'myKey',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '名称',
    dataIndex: 'name',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '版本',
    dataIndex: 'version',
    align: 'left',
    headerAlign: 'left'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
    align: 'left',
    headerAlign: 'left'
  }
]

export default {
  name: 'ModelList',
  components: {
    edit: Edit,
    'model-edit': ModelEdit,
    'model-view': ModelView,
    ListLayout,
    CommonImport,
    CommonTable,
    // commonDialog,
    SearchFormList,
    CommonDrawer,
    CommonButton,
    BpmnNewEdit
  },
  data () {
    return {
      searchData: [
        {
          type: 'text',
          labelText: '流程名称',
          fieldName: 'name',
          placeholder: '请输入流程名称'
        },
        {
          type: 'text',
          labelText: '流程KEY',
          fieldName: 'key',
          placeholder: '请输入流程KEY'
        }
      ],
      title: '',
      drawerTitle: '',
      visibleModelEditDrawer: false,
      visibleModelEditDialog: false,
      visibleModelPicture: false,
      deployLocalModelEdit: false,
      modelPictureTitle: '',
      queryParam: {},
      tableApi: 'ProcessDefinition.listData',
      saveApi: 'ProcessDefinition.export',
      columns: columns,
      tableHeight: 1,
      comp: this,
      modelId: '',
      processTyep: true,
      modelName: '',
      tableConfig: {},
      buttonConfig: {
        icon: 'edit'
      },
      treeConfig: {},
      formData: Object.assign(
        {},
        {
          confidentialiteList: []
        }
      ),
      importData: {
        type: 'upload', // 控件类型
        labelText: '上传附件', // 控件显示的文本
        fieldName: 'importFiles',
        colLayout: 'singleCol',
        uploadConfig: {
          accept: '.bpmn20.xml',
          limit: 3
        },
        listType: 'secret' // 带密级的上传附件为'secret'，不带密级的listType分为'text'、'picture'、'picture-card'
      },
      uploadApi: '/bpm/manage/ProcessDefinition/deploy'
    }
  },
  mounted () { },
  computed: {},
  methods: {
    search (param) {
      let that = this
      if (param) {
        that.queryParam = param
      }
    },
    reSet () {
      let that = this
      Object.keys(that.queryParam).forEach(key => { that.queryParam[key] = null })
    },
    showMessage (obj, message, type) {
      obj.$message({
        message: message,
        type: type
      })
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    createBpm () {
      this.title = '新建流程'
      this.visibleModelEditDialog = true
    },
    onCreateClose () {
      this.visibleModelEditDialog = false
    },
    saveCallback (modelId) {
      this.visibleModelEditDialog = false
      this.$refs.table.searchData()
      if (modelId) {
        this.modelId = modelId
        this.visibleModelEditDrawer = true
      }
    },

    editModel (record) {
      this.title = '编辑流程模版'
      this.modelId = record.id
      this.modelName = record.name
      this.visibleModelEditDrawer = true
    },
    onCreateBpmClose () {
      this.visibleModelEditDrawer = false
    },
    saveBpm (res) {
      let that = this
      console.log(res, 'res')
      api['ProcessDefinition.bpmnSave']({ bpmnXML: res.xml }).then(function (res) {
        that.showMessage(that, '保存成功！', 'success')
        that.visibleModelEditDrawer = false
        that.$refs.table.searchData()
      })
    },

    deployLocalModel () {
      this.title = '部署本地文件'
      this.deployLocalModelEdit = true
    },
    deployLocalCloseCallback () {
      this.deployLocalModelEdit = false
    },
    deployLocalSaveCallback () {
      this.deployLocalModelEdit = false
      this.$refs.table.searchData()
      this.showMessage(this, '上传成功！', 'success')
      //每次上传完成后，将数组里面清空
      this.formData.confidentialiteList = []
    },
    deploy (record) {
      let that = this
      api['ProcessDefinition.deploy']({ id: record.id }).then(function (res) {
        that.$refs.table.searchData()
        that.showMessage(that, '部署成功！', 'success')
      })
    },

    getModelPicture (record) {
      this.modelId = record.id
      this.modelPictureTitle = '查看流程图'
      this.visibleModelPicture = true
      // api['ProcessDefinition.getModelPicture']({ id: record.id }).then(function (res) {
      //   if (res.imagePath) {
      //     // let image = new Image()
      //     // image.setAttribute('crossOrigin', 'anonymous')
      //     // image.src = res.imagePath
      //     // image.onload = () => {
      //     //   let canvas = document.createElement('canvas')
      //     //   canvas.width = image.width
      //     //   canvas.height = image.height
      //     //   let ctx = canvas.getContext('2d')
      //     //   ctx.drawImage(image, 0, 0, image.width, image.height)
      //     //   canvas.toBlob((blob) => {
      //     //     let url = URL.createObjectURL(blob)
      //     //     console.log(url)
      //     //     that.imagePath = url
      //     //     that.modelName = res.modelName
      //     //     that.modelPictureTitle = '查看流程图'
      //     //     that.visibleModelPicture = true
      //     //     URL.revokeObjectURL(url)
      //     //   })
      //     // }
      //     // let blob = new Blob([res.imagePath])
      //     // let url = window.URL.createObjectURL(blob)
      //     that.imagePath = res.imagePath
      //     that.modelName = res.modelName

      //     // console.log(url)
      //     // window.URL.revokeObjectURL(url)
      //   } else {
      //     that.showMessage(that, '查看流程图失败，请确认流程是否已部署！', 'error')
      //   }
      // })
    },
    onModelPictureClose () {
      this.visibleModelPicture = false
    },
    deleteModel (record) {
      let that = this
      that
        .$confirm('是否确定要删除该流程？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          that.$api['ProcessDefinition.delete']({ id: record.id }).then((res) => {
            that.$refs.table.searchData()
            that.showMessage(that, '删除成功！', 'success')
          })
        })
    },
    exportBpmn (record) {
      api['ProcessDefinition.export']({ id: record.id, type: 'bpmn' }, { responseType: 'blob' }).then(function (res) {
        console.log(res)
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(new Blob([res.data]))
        link.download = record.resourceName
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
      })
    }
  }
}
</script>
