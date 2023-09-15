<template>
  <div>
    <div>
      <el-alert title="初始密码为 000000，登录后请及时修改密码" :closable="false" type="warning"></el-alert>
    </div>
    <form-list ref="form" label-width="150px" @rendered="rendered" @saved="saved" :data-source="dataSource" :api="saveApi" :exist-default-btn="false" :exist-custom-btn="true" :form="formData">
      <template #customBtn>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
    <template v-if="formData.roles && formData.roles.length > 0">
      <div class="role-list-title">用户角色</div>
      <ul class="role-list">
        <li v-for="(item, index) in formData.roles" :key="index">
          {{ item.name }}
        </li>
      </ul>
    </template>
  </div>
</template>
<style scoped>
.role-list-title {
  font-size: 14px;
  color: #303133;
  padding-left: 20px;
}
.role-list {
  background: #ffffff;
  overflow: hidden;
}
.role-list li {
  float: left;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 3px;
  /*border:1px solid #1890FF;*/
  border: 1px solid #e8e8e8;
}
</style>
<script>
import { P8Form as FormList, Alert } from 'p8-components-ui'

export default {
  name: 'UserView',
  components: {
    FormList,
    'el-alert': Alert
  },
  props: {
    userId: {
      type: String,
      default: ''
    },
    currentSelectDeptId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      saveApi: 'userManager.save',
      dataSource: [
        {
          type: 'text', // 控件类型
          labelText: '用户名称', // 控件显示的文本
          fieldName: 'userName',
          placeholder: '', // 默认控件的空值文本
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'text', // 控件类型
          labelText: '员工代码[身份证]', // 控件显示的文本
          fieldName: 'pid',
          placeholder: '', // 默认控件的空值文本
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'text', // 控件类型
          labelText: '真实姓名', // 控件显示的文本
          fieldName: 'realName',
          placeholder: '', // 默认控件的空值文本
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: true
          }
        },
        {
          type: 'treeSelect',
          labelText: '所属部门',
          fieldName: 'departmentId',
          placeholder: '',
          colLayout: 'doubleCol',
          defaultExpandAll: true,
          disabled: true,
          optionUrl: {
            api: 'userManager.deptTree',
            params: { deptId: this.deptId }
          }
        },
        {
          labelText: '用户密级',
          type: 'select',
          fieldName: 'confidentialite',
          placeholder: '',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'userManager.dicData',
            params: {
              dicType: 'USER_LEVEL'
            }
          },
          fieldConfig: {
            disabled: true
          }
        },
        {
          labelText: '出入证号',
          type: 'text',
          fieldName: 'empCode',
          placeholder: '',
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: true
          }
        },
        {
          labelText: '性别',
          type: 'select',
          fieldName: 'gender',
          placeholder: '',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'userManager.dicData',
            params: {
              dicType: 'GENDER'
            }
          },
          fieldConfig: {
            disabled: true
          }
        },
        {
          labelText: '生日',
          type: 'datetime',
          fieldName: 'birthDate',
          colLayout: 'doubleCol',
          placeholder: '',
          fieldConfig: {
            'value-format': 'yyyy-MM-dd',
            disabled: true
          }
        },
        {
          labelText: '电话号码',
          type: 'text',
          fieldName: 'otel',
          colLayout: 'doubleCol',
          placeholder: '',
          fieldConfig: {
            disabled: true
          }
        },
        {
          labelText: '行政岗位',
          type: 'text',
          fieldName: 'workPost',
          colLayout: 'doubleCol',
          placeholder: '',
          fieldConfig: {
            disabled: true
          }
        },
        {
          labelText: '技术岗位',
          type: 'text',
          fieldName: 'tecPost',
          colLayout: 'doubleCol',
          placeholder: '',
          fieldConfig: {
            disabled: true
          }
        },
        {
          labelText: '电子邮件',
          type: 'text',
          fieldName: 'oemail',
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: true
          }
        },
        {
          labelText: '用户排序',
          type: 'number',
          fieldName: 'indexNo',
          placeholder: '',
          colLayout: 'doubleCol',
          min: 0,
          max: 99999999,
          fieldConfig: {
            disabled: true
          }
        }
      ],
      formData: {
        id: null,
        userName: null,
        pid: null,
        realName: null,
        departmentId: this.currentSelectDeptId,
        confidentialite: null,
        empCode: null,
        gender: null,
        birthDate: null,
        otel: null,
        workPost: null,
        tecPost: null,
        oemail: null,
        indexNo: null,
        roles: null
      }
    }
  },
  mounted() {},
  methods: {
    rendered() {
      // console.log('currentSelectDeptId', this.currentSelectDeptId)
      if (this.userId && this.userId !== '') {
        this.getUserData(this.userId)
      }
    },
    clickEvent() {
      console.log('click')
    },
    cancel() {
      this.$emit('cancel')
    },
    getUserData(userId) {
      const that = this
      console.log('loadUserId', userId)

      this.$api['userManager.userInfo']({ id: that.userId })
        .then(function (res) {
          console.log('Success')
          const { id, userName, pid, realName, departmentId, confidentialite, gender, otel, oemail, indexNo, roles, birthdate: birthDate, empcode: empCode, workpost: workPost, tecpost: tecPost } = res
          that.formData = { id, userName, pid, realName, departmentId, confidentialite, gender, otel, oemail, indexNo, roles, birthDate, empCode, workPost, tecPost }
          // that.formData.birthDate = res.birthdate
          // that.formData.empCode = res.empcode
          // that.formData.workPost = res.workpost
          // that.formData.tecPost = res.tecpost
          console.log('formData', that.formData)
          // if (res.birthDate) {
          // } else {
          //   that.formData.birthDate = null
          // }
        })
        .catch(function (error) {
          console.log('error' + error)
        })
    },
    saved(res) {
      console.log('edit saved')
      this.$emit('saveSuccess', res)
    },
    handleChange(info) {
      console.log(info, 'info')
    }
  }
}
</script>
