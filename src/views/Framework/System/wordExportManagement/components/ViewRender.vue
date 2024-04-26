<template>
  <Dialog
    width="50%"
    title="选择型号"
    :visible="visible"
    :showHandleBtn="true"
    :dialogHeight="500"
    :isViewCsFooter="true"
    @close="close"
    @handle-cancel="close"
    @handle-ok="handleOk">
    <template #dialog>
      <el-form :inline="true">
        <el-form-item label="数据视图">
          <el-select
            v-model="sqlid"
            clearable
            filterable
            style="width: 100%">
            <el-option
              v-for="(item, index) in sqlIdOption"
              :label="item.name"
              :value="item.sql"
              :key="index">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义数据源">
          <el-input v-model="customUrl" clearable placeholder="请输入自定义数据源"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getData">确认</el-button>
        </el-form-item>
      </el-form>
      <div id="tinymce" ref="tinymce" class="mce-content-body view-content-body" v-html="rendContent">
      </div>
    </template>
  </Dialog>
</template>

<script>
import Vue from 'vue'
import {P8Dialog as Dialog} from 'p8-components-ui'
// import artTemplate from 'art-template'
export default {
  name: 'ViewRender.vue',
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    editorContent: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      rendContent: '',
      sqlIdOption: [],
      sqlid: '',
      customUrl: '',
      urlPrefix: '',
      templateValue: null
    }
  },
  created () {
    const { devBaseUrl, prodBaseUrl, isDevMode } = this.$sysConfig.API_DEFAULT_CONFIG
    this.urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
    const param = {
      page: {
        current: -1,
        size: -1,
        orders: []
      }
    }
    this.$api['formGenerator.sqlList'](param).then((res) => {
      this.sqlIdOption = res.records
    })
  },
  mounted() { },
  methods: {
    getData () {
      if (this.customUrl) {
        const url = `${this.urlPrefix}${this.customUrl}`
        this.$ajax
          .post(url, {}, {
            headers: { Authorization: this.$store.getters.token }
          })
          .then(function (res) {
            this.templateValue = res
            this.renderTemplate()
          })
          .catch(error => {
            this.$message.error('自定义数据源请求错误！')
          })
      } else {
        if (!this.sqlid) return
        this.$api['formGenerator.getSqlexecute']({ sql: this.sqlid }).then((res) => {
          this.templateValue = res.records
          this.renderTemplate()
        })
      }
    },
    renderTemplate() {
      let ele = document.createElement("div");
      ele.setAttribute("id", "pic-point");
      let Profile = Vue.extend({
        template: `<div>${this.editorContent}</div>`,
        data: () => {
          return {
            templateValue: this.templateValue
          };
        },
      });
      this.rendContent = new Profile().$mount(ele).$el.outerHTML;
    },
    close() {
      this.$emit('close');
    },
    handleOk() {
      this.exportWord()
    },
    exportWord() {
      let viewContent = this.$refs['tinymce'].outerHTML;
      this.$api['documentManagement.viewExportWord']({
        content: viewContent
      }, {responseType: 'blob'}).then(res => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(new Blob([res.data]))
        link.download = 'test.docx'
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
      })
    }
  }
}
</script>

<style scoped="scoped">
@import '~tinymce/skins/ui/oxide/skin.css';
@import '~tinymce/skins/ui/oxide/content.css';
/*@import '~tinymce/skins/content/default/content.css';*/

.view-content-body {
  display: block;
  margin: 8px;
}
</style>
