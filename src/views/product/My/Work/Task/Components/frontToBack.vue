<template>
  <common-dialog :title="title"
                 width="80%"
                 :dialog-config="dialogConfig"
                 :showHandleBtn="false"
                 :visible="visible"
                 :dialog-height="dialogHeight"
                 @close="handleCancel">
    <template #dialog>
      <table-render ref="tableRender"
                    :headerVisible="false"
                    code="MyTaskPreDrillDown"
                    :columnType="columnType"
                    :taskId="taskId"
                    :permission-vo="componentsConfig.permissionVo"
                    :west-tree-param="provideParams.searchParams"
                    @refresh="init()">
        <template #PROGRESS="{scope}">
          <span>{{Math.round(scope.row.PROGRESS * 100)}}%</span>
        </template>
        <template #outputs="{scope}">
          <el-popover placement="bottom-start"
                      trigger="hover"
                      @show=show(scope.row.id)>
            <div v-for="(item, index) in uploadFiles"
                 :key="index">
              <span>{{ item.fileName }}</span>
              <span style="margin-left: 10px;color: #49a6ff"
                    @click="downloadFile(item)">下载</span>
            </div>
            <span slot="reference"
                  style="color: #49a6ff">{{ scope.row.OUTPUTS }}</span>
          </el-popover>
        </template>
      </table-render>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.underline {
  color: skyblue;
}
</style>
<script>
import { P8Dialog as CommonDialog } from 'p8-components-ui'
import tableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender.vue'
export default {
  name: 'ButtonNavigationView',
  data () {
    return {
      dialogHeight: 600,
      asyncComponents: '',
      paramsObj: {},
      provideParams: {
        searchParams: {}
      },
      componentsConfig: {},
      dialogConfig: {
        modal: false
      },
      uploadFiles: []
    }
  },
  props: {
    layoutConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    title: {
      type: String
    },
    columnType: {
      type: String
    },
    taskId: {
      type: String
    },
    visible: {
      type: Boolean
    }
  },
  components: {
    tableRender,
    CommonDialog
  },
  created () {
    this.init()
  },
  watch: {
    $route: {
      handler (val) {
        this.init()
      }
    }
  },
  methods: {
    show (val) {
      this.$api['taskManager.preAndPostTaskAnnex']({ taskId: val }).then(res => {
        if (res) {
          this.uploadFiles = res
        }
      })
    },
    downloadFile (item) { // 输出要求-文件下载
      if (item.id) {
        this.$api['SystemSettings.getFileUrl']({ attachmentId: item.id }, { responseType: 'blob' }).then(backJson => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([backJson.data]))
          link.download = item.fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }).finally(() => {
        })
      }
    },
    handleCancel () {
      this.$emit('close')
    },
    async init () {
      const code = this.layoutConfig.layoutCode ? this.layoutConfig.layoutCode : this.$route.meta.code
      const version = this.layoutConfig.layoutVersion ? this.layoutConfig.layoutVersion : this.$route.meta.version
      const res = await this.$api['desLayout.getLayoutJson']({ layoutCode: code, version: version })
      if (!res) {
        return
      }
      this.previewParmars = JSON.parse(res)
      const { treeSettingsParmars, treeData, defaultComponents } = this.previewParmars
      this.asyncComponents = defaultComponents.url ? defaultComponents.url : ''
      if (!this.asyncComponents) {
        const that = this
        const resault = this.getFirstChild(this.treeData)
        this.$nextTick(() => {
          that.$refs.commonTree.$refs.tree.setCurrentKey(resault.id, true)
          if (resault.componentsConfig) {
            that.componentsConfig = resault.componentsConfig
            that.asyncComponents = resault.componentsConfig.url
          }
        })
      } else {
        this.asyncComponents = defaultComponents.url ? defaultComponents.url : ''
        this.componentsConfig = defaultComponents
      }
    },
    getFirstChild (data) {
      let result = ''
      function filterData (treeData) {
        if (treeData[0].children && treeData[0].children.length) {
          filterData(treeData[0].children)
        } else {
          result = treeData[0]
        }
      }
      filterData(data)
      return result
    }
  }
}
</script>
