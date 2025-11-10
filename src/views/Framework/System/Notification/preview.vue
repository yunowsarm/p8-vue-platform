<template>
  <div class="form">
    <P8Form ref="form"
            :comp="comp"
            label-width="120px"
            :existDefaultBtn="false"
            :data-source="dataSource"
            :form="formData">
      <template #message>
        <div class="contentBody border-bottom"
             v-if="hasHtmlTag(formData.content)"
             v-html="formData.content"></div>
      </template>
    </P8Form>
  </div>
</template>

<script>
import { P8Form } from 'p8-components-ui'

export default {
  name: 'NoticeMsg',
  components: { P8Form },
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      setUserHeight: 200 + 'px',
      comp: this,
      formData: {
        title: '',
        notificationScope: '',
        noticeList: [],
        content: ''
      },
      dataSource: [
        {
          type: 'blank',
          labelText: '',
          fieldName: 'message',
          slotName: 'message',
          colLayout: 'singleCol'
        }
      ],
      visible: false
    }
  },
  mounted () {
    this.$api['documentManagement.selectNotice']({ id: this.row[0].ID }).then(res => {
      if (res) {
        this.formData = res
      }
    })
  },
  methods: {
    hasHtmlTag (str) {
      return /<[^>]*>/i.test(str)
    },
    cancel () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.form {
  height: 100%;
  margin: 20px 100px;
  text-align: center;
}
.quill_editor {
  height: 400px;
}
.userList {
  background: #ffffff;
  overflow: hidden;
}
.userList li {
  float: left;
  margin: 5px;
  border-radius: 3px;
  padding: 0 10px;
  border: 1px solid #e8e8e8;
}
::v-deep .contentBody {
  p {
    margin-top: 0 !important;
  }
}
</style>
