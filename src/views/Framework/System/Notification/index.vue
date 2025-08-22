<template>
  <div class="form">
    <P8Form ref="form" :comp="comp" label-width="120px" :exist-default-btn="false" :exist-custom-btn="true" :data-source="dataSource" :api="saveApi" @saved="saved" :form="formData">
      <template #notice>
        <div :style="{ height: setUserHeight, overflowY: 'auto' }">
          <el-main>
            <ul class="userList">
              <li>
                <el-button class="selectedBtn" type="link" size="small" icon="user-add" :disabled="formData.notificationScope === '0'" @click="showModal">选择人员</el-button>
              </li>
              <li v-for="item in selectedData.userList" :key="item.id">
                <span>{{ item.realName }} [ {{ item.departmentName }} ]</span>
                <i class="el-icon-circle-close" @click="deleteUser(item.id)"></i>
              </li>
            </ul>
          </el-main>
          <select-user v-if="visible" :visible="visible" @close-dialog="closeModal" :disabled-row="formData.noticeList" :tree-options="treeOptions"></select-user>
        </div>
      </template>
      <template #message>
        <P8Tinymce v-model="formData.content" :editor-config="{ height: '400px' }" />
      </template>
      <template #customBtn>
        <el-button size="mini" @click="cancel">取 消</el-button>
        <el-button type="primary" size="mini" @click="handleSubmit">确 定</el-button>
      </template>
    </P8Form>
  </div>
</template>

<script>
import { P8Form, P8SelectUser as SelectUser, P8Tinymce } from 'p8-components-ui'

export default {
  name: 'NoticeMsg',
  components: { P8Form, SelectUser, P8Tinymce },
  props: {
    row: {
      type: Array
    }
    // planInfoId: {
    //   type: String,
    //   default: ''
    // },
    // taskId: {
    //   type: String,
    //   default: ''
    // },
    // ganttName: {
    //   type: String,
    //   default: ''
    // }
  },
  data() {
    return {
      treeOptions: {
        treeApi: 'userManager.deptTree',
        treeParam: {},
        disabledRow: [],
        defaultExpandAll: true,
        defaultExpandedKeys: [],
        treeConfig: {
          'expand-on-click-node': false,
          'check-on-click-node': true
        }
      },
      setUserHeight: 200 + 'px',
      comp: this,
      selectedData: {
        userList: []
      },
      editorOption: {
        placeholder: '请输入'
      },
      saveApi: 'documentManagement.saveNotice',
      isCustomValidate: true,
      formData: {
        title: '',
        notificationScope: '',
        noticeList: [],
        content: ''
      },
      dataSource: [
        {
          type: 'text',
          labelText: '标题',
          fieldName: 'title',
          placeholder: '请输入标题',
          colLayout: 'doubleCol'
        },
        {
          type: 'select', // 控件类型
          labelText: '通知范围', // 控件显示的文本
          fieldName: 'notificationScope',
          colLayout: 'doubleCol',
          options: [
            {
              label: '所有成员',
              value: '0'
            },
            {
              label: '自定义成员',
              value: '1'
            }
          ]
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
  watch: {
    'formData.notificationScope': {
      handler: function (val) {
        if (val === '0') {
          this.formData.noticeList = []
          this.selectedData.userList = []
        }
      }
    }
  },
  mounted() {
    if (this.row) {
      this.$api['documentManagement.selectNotice']({ id: this.row[0].ID }).then((res) => {
        if (res) {
          if (res.notificationScope === 0) {
            res.notificationScope = '所有成员'
          } else {
            res.notificationScope = '自定义成员'
          }
          this.formData = res
        }
      })
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    closeModal(selectedRows) {
      this.visible = false
      this.selectedData.userList.push(...selectedRows)
      this.formData.noticeList = selectedRows
    },
    deleteUser(id) {
      this.formData.noticeList.splice(
        this.formData.noticeList.findIndex((v) => v === id),
        1
      )
      this.selectedData.userList.splice(
        this.selectedData.userList.findIndex((v) => v.id === id),
        1
      )
    },
    saved(params) {
      if (params) {
        this.$emit('close')
      }
    },
    handleSubmit(e) {
      this.$refs.form.handleSubmit(e)
    },
    cancel() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.form {
  height: 100%;
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
.userList li:first-child {
  border: none;
  padding: 0px;
}
.userList li:first-child .selectedBtn {
  border: 1px dashed #1890ff;
  height: 29px;
}
</style>
