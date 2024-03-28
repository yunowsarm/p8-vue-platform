<template>
  <div>
    <div>
      <el-alert title="初始密码为 000000，登录后请及时修改密码"
                :closable="false"
                type="warning"></el-alert>
    </div>
    <form-list ref="form"
               label-width="150px"
               @rendered="rendered"
               @saved="saved"
               :data-source="dataSource"
               :api="saveApi"
               :form="formData">
      <template slot="btn">
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
    <template v-if="formData.roles && formData.roles.length > 0">
      <div class="role-list-title">用户角色</div>
      <ul class="role-list">
        <li v-for="(item, index) in formData.roles"
            :key="index">
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
  name: 'UserEdit',
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
  data () {
    return {
      saveApi: 'userManager.save',
      dataSource: [
        {
          type: 'text', // 控件类型
          labelText: '用户名称', // 控件显示的文本
          fieldName: 'userName',
          placeholder: '请输入用户名称', // 默认控件的空值文本
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              maxLength: 32
            },
            {
              pattern: '^[0-9a-zA-Z_]{1,}$',
              message: '只可输入数字,字母或下划线',
              trigger: 'blur'
            },
            {
              validator: (rule, value, callback) => {
                let that = this
                // console.log(that.userId)
                this.$api['userManager.repeatedCheck']({ id: that.userId, userName: value }).then((response) => {
                  // console.log(response)
                  if (response.result) {
                    callback(new Error('用户名已被使用！'))
                  } else {
                    callback()
                  }
                })
              },
              trigger: 'blur'
            }
          ]
        },
        {
          type: 'text', // 控件类型
          labelText: '员工代码[身份证]', // 控件显示的文本
          fieldName: 'pid',
          placeholder: '请输入员工代码[身份证]', // 默认控件的空值文本
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              maxLength: 18
            },
            {
              pattern: '^[0-9a-zA-Z]{1,}$',
              message: '只可输入数字或字母',
              trigger: 'blur'
            }
          ]
        },
        {
          type: 'text', // 控件类型
          labelText: '真实姓名', // 控件显示的文本
          fieldName: 'realName',
          placeholder: '请输入真实姓名', // 默认控件的空值文本
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              maxLength: 32
            }
          ]
        },
        {
          type: 'treeSelect',
          labelText: '所属部门',
          fieldName: 'departmentId',
          placeholder: '请选择所属部门',
          colLayout: 'doubleCol',
          defaultExpandAll: true,
          optionUrl: {
            api: 'userManager.deptTree',
            params: { deptId: this.deptId }
          },
          rules: [
            {
              required: true
              // trigger: 'change'
            }
          ]
        },
        // {
        //   labelText: '用户密级',
        //   type: 'select',
        //   fieldName: 'confidentialite',
        //   placeholder: '请选择用户密级',
        //   colLayout: 'doubleCol',
        //   rules: [
        //     {
        //       required: true
        //     }
        //   ],
        //   optionUrl: {
        //     api: 'userManager.dicData',
        //     params: {
        //       dicType: 'USER_LEVEL'
        //     }
        //   }
        // },
        {
          labelText: '出入证号',
          type: 'text',
          fieldName: 'empCode',
          placeholder: '请输入出入证号',
          colLayout: 'doubleCol',
          rules: [
            {
              maxLength: 32
            }
          ]
        },
        {
          labelText: '性别',
          type: 'select',
          fieldName: 'gender',
          placeholder: '请选择性别',
          colLayout: 'doubleCol',
          optionUrl: {
            api: 'userManager.dicData',
            params: {
              dicType: 'GENDER'
            }
          }
        },
        {
          labelText: '生日',
          type: 'datetime',
          fieldName: 'birthDate',
          colLayout: 'doubleCol',
          placeholder: '请选择生日日期',
          fieldConfig: {
            'value-format': 'yyyy-MM-dd'
          }
        },
        {
          labelText: '电话号码',
          type: 'text',
          fieldName: 'otel',
          colLayout: 'doubleCol',
          placeholder: '请输入手机或座机号码',
          tip: '手机格式如:13512341234 座机格式如:010-40020020',
          rules: [
            {
              pattern: '^(((\\+\\d{2}-)?0\\d{2,3}-\\d{7,8})|((\\+\\d{2}-)?(\\d{2,3}-)?([1][3,4,5,7,8][0-9]\\d{8})))$',
              message: '请输入正确的电话号码',
              trigger: 'blur'
            }
          ]
        },
        {
          labelText: '行政岗位',
          type: 'text',
          fieldName: 'workPost',
          colLayout: 'doubleCol',
          placeholder: '请输入行政岗位',
          rules: [
            {
              maxLength: 32
            }
          ]
        },
        {
          labelText: '技术岗位',
          type: 'text',
          fieldName: 'tecPost',
          colLayout: 'doubleCol',
          placeholder: '请输入技术岗位',
          rules: [
            {
              maxLength: 32
            }
          ]
        },
        {
          labelText: '电子邮件',
          type: 'text',
          fieldName: 'oemail',
          colLayout: 'doubleCol',
          rules: [
            {
              type: 'email'
            }
          ]
        },
        {
          labelText: '用户排序',
          type: 'number',
          fieldName: 'indexNo',
          placeholder: '请输入用户排序号',
          colLayout: 'doubleCol',
          min: 0,
          max: 99999999
        }
      ],
      formData: {
        id: null,
        userName: null,
        pid: null,
        realName: null,
        departmentId: this.currentSelectDeptId,
        // confidentialite: null,
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
  mounted () { },
  methods: {
    rendered () {
      // console.log('currentSelectDeptId', this.currentSelectDeptId)
      if (this.userId && this.userId !== '') {
        this.getUserData(this.userId)
      }
    },
    clickEvent () {
      console.log('click')
    },
    cancel () {
      this.$emit('cancel')
    },
    getUserData (userId) {
      let that = this
      console.log('loadUserId', userId)

      this.$api['userManager.userInfo']({ id: that.userId })
        .then(function (res) {
          console.log('Success')
          let { id, userName, pid, realName, departmentId, gender, otel, oemail, indexNo, roles, birthdate: birthDate, empcode: empCode, workpost: workPost, tecpost: tecPost } = res
          that.formData = { id, userName, pid, realName, departmentId, gender, otel, oemail, indexNo, roles, birthDate, empCode, workPost, tecPost }
          // let { id, userName, pid, realName, departmentId, confidentialite, gender, otel, oemail, indexNo, roles, birthdate: birthDate, empcode: empCode, workpost: workPost, tecpost: tecPost } = res
          // that.formData = { id, userName, pid, realName, departmentId, confidentialite, gender, otel, oemail, indexNo, roles, birthDate, empCode, workPost, tecPost }
          console.log('formData', that.formData)
        })
        .catch(function (error) {
          console.log('error' + error)
        })
    },
    saved (res) {
      console.log('edit saved')
      this.$emit('saveSuccess', res)
    },
    handleChange (info) {
      console.log(info, 'info')
    }
  }
}
</script>
