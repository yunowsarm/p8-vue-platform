<template>
  <div style='height: 100%; position: relative;'>
    <list-layout>
      <template #north>
        <common-button :comp="comp" :customButtonData="customButtonData"></common-button>
      </template>
      <template #center>
        <P8Tinymce v-model="editorContent" :editorConfig="editorInit" />
      </template>
    </list-layout>
    <ViewRender :visible="visible" :editorContent="vueTemplateContent"
                @close="close"></ViewRender>
  </div>
</template>

<script>
import {
  P8Button as CommonButton,
  P8ListLayout as ListLayout,
  P8SplitPane as SplitPane,
  P8Tinymce
} from 'p8-components-ui'
import ViewRender from './components/ViewRender'

export default {
  name: 'richEditor',
  components: {
    ViewRender,
    ListLayout,
    CommonButton,
    SplitPane,
    P8Tinymce
  },
  data() {
    return {
      visible: false,
      templateValue: {
        firstParty: 'A有限责任公司',
        secondParty: 'B有限责任公司',
        detail: [
          {
            name: '条款1',
            note: '描述1'
          },
          {
            name: '条款2',
            note: '描述2'
          }
        ]
      },
      editorInit: {
        height: '100%',
        table_icons: {// 以下下为默认配置
          'align-right-table': '<svg width="24" height="24"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm6 4h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 0 1 0-2zm-6-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2z" fill-rule="evenodd"></path></svg>',
          'align-left-table': '<svg width="24" height="24"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm0 4h8c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2zm0-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2z" fill-rule="evenodd"></path></svg>',
          'align-center-table': '<svg width="24" height="24"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 1 1 0-2zm3 4h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 1 1 0-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 0 1 0-2zm-3-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 0 1 0-2z" fill-rule="evenodd"></path></svg>'
        },
        templates: [
          // {
          //   title: 'freemarker模板',
          //   description: '模板进行服务端解析并导出',
          //   url: 'http://localhost:3003/static/tinymce-template/freemarker-template.html'
          // },
          {
            title: 'vue模板',
            description: '模板进行客户端解析并服务端导出',
            url: '/static/tinymce-template/vue-template.html'
          }
        ],
        extended_valid_elements: 'div[*],tr[*]'
      },
      vueTemplateContent: "",
      editorContent: "",
      comp: this,
      customButtonData: [
        // {
        //   "id": "re-001",
        //   "title": "保存",
        //   "enable": "1",
        //   "indexNumber": 1,
        //   "name": null,
        //   "eventHandle": "save",
        //   "image": "p8 icon-add",
        //   "location": "head"
        // },
        // {
        //   "id": "re-002",
        //   "title": "服务端导出word",
        //   "enable": "1",
        //   "indexNumber": 2,
        //   "name": null,
        //   "eventHandle": "exportWord",
        //   "image": "p8 icon-project-export",
        //   "location": "head"
        // },
        {
          "id": "re-003",
          "title": "预览VUE并导出word",
          "enable": "1",
          "indexNumber": 3,
          "name": null,
          "eventHandle": "renderView",
          "image": "p8 icon-project-export",
          "location": "head"
        },
        // {
        //   "id": "re-004",
        //   "title": "生成word导入模板",
        //   "enable": "1",
        //   "indexNumber": 4,
        //   "name": null,
        //   "eventHandle": "exportWordTemplate",
        //   "image": "p8 icon-project-export",
        //   "location": "head"
        // }
      ]
    }
  },
  mounted() {
    // console.log(contentUiCss,contentCss)
  },
  methods: {

    save() {

      this.$api['richeditor.save']({value: this.editorContent}).then(res => {
        console.log('richeditor.save', res)
      })
    },
    exportWord() {

      this.$api['richeditor.remoteExportWord']({
        content: this.editorContent,
        templateValue: this.templateValue
      }, {responseType: 'blob'}).then(res => {
        console.log('richeditor.remoteExportWord', res)
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(new Blob([res.data]))
        link.download = 'test.docx'
        document.body.appendChild(link)

        link.click()
        window.URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
      })
    },
    renderView() {
      this.vueTemplateContent = this.editorContent
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    // exportWordTemplate() {
    //
    //   this.$api['richeditor.exportWordTemplate']({
    //     content: this.editorContent,
    //     templateValue: this.templateValue
    //   }, {responseType: 'blob'}).then(res => {
    //     console.log('richeditor.exportWordTemplate', res)
    //     let link = document.createElement('a')
    //     link.href = window.URL.createObjectURL(new Blob([res.data]))
    //     link.download = 'test.docx'
    //     document.body.appendChild(link)
    //
    //     link.click()
    //     window.URL.revokeObjectURL(link.href)
    //     document.body.removeChild(link)
    //   })
    // }
  }
}
</script>
<style scoped="scoped">

</style>

