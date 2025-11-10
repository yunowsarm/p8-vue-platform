<template>
  <div class="form">
    <P8Form ref="form"
            :comp="comp"
            label-width="120px"
            :existDefaultBtn="false"
            :data-source="dataSource"
            :form="formData">
      <template #notice>
        <div :style="{ height: setUserHeight, overflowY: 'auto' }">
          <el-main>
            <ul class="userList">
              <li v-for="(item,index) in formData.noticeList"
                  :key="index">
                <span>{{ item.realName }} [ {{ item.deptName }} ] [
                  <span style="color:green"
                        v-if="item.isRead === '1501'">未读</span>
                  <span style="color: red;"
                        v-else>已读</span>
                  ]</span>
              </li>
            </ul>
          </el-main>
        </div>
      </template>
      <template #message>
        <div class="contentBody border-bottom"
             v-if="hasHtmlTag(formData.content)"
             v-html="formData.content"></div>
      </template>
    </P8Form>
  </div>
</template>

<script>
import { P8Form, P8SelectUser as SelectUser } from 'p8-components-ui'

export default {
  name: 'NoticeMsg',
  components: { P8Form, SelectUser },
  props: {
    row: {
      type: Array
    },
    businessKey: {
      type: String
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
          type: 'view',
          labelText: '标题',
          fieldName: 'title',
          placeholder: '请输入标题',
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '通知范围', // 控件显示的文本
          fieldName: 'notificationScope',
          colLayout: 'doubleCol'
        },
        {
          type: 'blank',
          labelText: '选择人员',
          fieldName: 'notice',
          slotName: 'notice',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '公告内容',
          fieldName: 'message',
          slotName: 'message',
          colLayout: 'singleCol'
        }
      ],
      visible: false
    }
  },
  mounted () {
    this.$api['documentManagement.selectNotice']({ id: this.row ? this.row[0].ID : this.businessKey }).then(res => {
      if (res) {
        if (res.notificationScope === '0') {
          res.notificationScope = '所有成员'
          res.noticeList = []
        } else {
          res.notificationScope = '自定义成员'
        }
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
  overflow: auto;
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
</style>
