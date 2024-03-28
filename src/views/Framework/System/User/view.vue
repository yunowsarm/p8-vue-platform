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
               :exist-default-btn="false"
               :exist-custom-btn="true"
               :form="formData">
      <template #customBtn>
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
::v-deep .el-form-item__content > .view {
  background: #f5f8fb;
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
  data () {
    return {
      saveApi: 'userManager.save',
      dataSource: [
        {
          type: 'view', // 控件类型
          labelText: '用户名称', // 控件显示的文本
          fieldName: 'userName',
          placeholder: '', // 默认控件的空值文本
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '员工代码[身份证]', // 控件显示的文本
          fieldName: 'pid',
          placeholder: '', // 默认控件的空值文本
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '真实姓名', // 控件显示的文本
          fieldName: 'realName',
          placeholder: '', // 默认控件的空值文本
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '所属部门',
          fieldName: 'departmentName',
          placeholder: '',
          colLayout: 'doubleCol'
        },
        // {
        //   labelText: '用户密级',
        //   type: 'view',
        //   fieldName: 'secretDisplay',
        //   placeholder: '',
        //   colLayout: 'doubleCol'
        // },
        {
          labelText: '出入证号',
          type: 'view',
          fieldName: 'empCode',
          placeholder: '',
          colLayout: 'doubleCol'
        },
        {
          labelText: '性别',
          type: 'view',
          fieldName: 'genderDisp',
          placeholder: '',
          colLayout: 'doubleCol'
        },
        {
          labelText: '生日',
          type: 'view',
          fieldName: 'birthDate',
          colLayout: 'doubleCol'
        },
        {
          labelText: '电话号码',
          type: 'view',
          fieldName: 'otel',
          colLayout: 'doubleCol'
        },
        {
          labelText: '行政岗位',
          type: 'view',
          fieldName: 'workPost',
          colLayout: 'doubleCol'
        },
        {
          labelText: '技术岗位',
          type: 'view',
          fieldName: 'tecPost',
          colLayout: 'doubleCol'
        },
        {
          labelText: '电子邮件',
          type: 'view',
          fieldName: 'oemail',
          colLayout: 'doubleCol'
        },
        {
          labelText: '用户排序',
          type: 'view',
          fieldName: 'indexNo',
          placeholder: '',
          colLayout: 'doubleCol'
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
        departmentName: null,
        // secretDisplay: null,
        genderDisp: null,
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
      const that = this
      console.log('loadUserId', userId)

      this.$api['userManager.userInfo']({ id: that.userId })
        .then(function (res) {
          console.log('Success')
          const { id, userName, pid, realName, departmentId, confidentialite, gender, otel, oemail, indexNo, roles, birthdate: birthDate, empcode: empCode, workpost: workPost, tecpost: tecPost, departmentName: departmentName, genderDisp: genderDisp } = res
          that.formData = { id, userName, genderDisp, pid, realName, departmentId, confidentialite, gender, otel, oemail, indexNo, roles, birthDate, empCode, workPost, tecPost, departmentName }
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
