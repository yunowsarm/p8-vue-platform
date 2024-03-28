<template>
  <form-list ref="form"
             label-width="150px"
             @rendered="rendered"
             @saved="saved"
             :data-source="dataSource"
             :api="saveApi"
             :form="formData">
    <template #password>
      <div>
        <el-switch v-model="formData.resetPassword"
                   active-text="是"
                   inactive-text="否"
                   :disabled="checkResetPassword"></el-switch>
        是否重置密码为：000000
      </div>
    </template>
    <template slot="btn">
      <el-button @click="cancel">取 消</el-button>
    </template>
  </form-list>
</template>
<script>
import { P8Form as FormList, Switch } from 'p8-components-ui'

export default {
  name: 'SafeSet',
  components: {
    FormList,
    'el-switch': Switch
  },
  props: {
    userId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      saveApi: 'userManager.safeSave',
      checkResetPassword: false,
      dataSource: [
        {
          type: 'view', // 控件类型
          labelText: '用户名称', // 控件显示的文本
          fieldName: 'userName',
          colLayout: 'doubleCol'
        },
        {
          type: 'hidden', // 控件类型
          fieldName: 'entityId',
          urlParam: true
        },
        {
          type: 'view', // 控件类型
          labelText: '员工代码[身份证]', // 控件显示的文本
          fieldName: 'pid',
          colLayout: 'doubleCol'
        },
        {
          type: 'view', // 控件类型
          labelText: '真实姓名', // 控件显示的文本
          fieldName: 'realName',
          colLayout: 'doubleCol'
        },
        {
          type: 'view',
          labelText: '所属部门',
          fieldName: 'departmentName',
          colLayout: 'doubleCol'
        },
        {
          type: 'blank', // 控件类型
          labelText: '用户密码', // 控件显示的文本
          slotName: 'password',
          colLayout: 'doubleCol'
        },
        // {
        //   labelText: '用户密级',
        //   type: 'view',
        //   fieldName: 'secretDisplay',
        //   colLayout: 'doubleCol'
        // },
        {
          labelText: '出入证号',
          type: 'view',
          fieldName: 'empCode',
          colLayout: 'doubleCol'
        },
        {
          labelText: '性别',
          type: 'view',
          fieldName: 'genderDisp',
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
          colLayout: 'doubleCol'
        },
        {
          labelText: '用户角色',
          type: 'multiple',
          fieldName: 'roleIds',
          optionUrl: {
            api: 'userManager.getRoles'
          },
          options: [],
          colLayout: 'singleCol'
        }
      ],
      formData: {
        id: null,
        resetPassword: null,
        userName: null,
        pid: null,
        realName: null,
        departmentId: null,
        confidentialite: null,
        empCode: null,
        gender: null,
        birthDate: null,
        otel: null,
        workPost: null,
        tecPost: null,
        oemail: null,
        indexNo: null,
        roleIds: null
      }
    }
  },
  mounted () {
    const that = this
    this.$api['SystemSettings.checkBaseConfig']().then((res) => {
      if (res) {
        that.checkResetPassword = false
      } else {
        that.checkResetPassword = true
      }
    })
  },
  methods: {
    rendered () {
      console.log('userId', this.userId)
      if (this.userId && this.userId !== '') {
        this.getUserData(this.userId)
      }
    },
    getUserData (userId) {
      const that = this
      this.$api['userManager.userInfo']({
        id: that.userId
      })
        .then(function (res) {
          console.log('res:', res)
          const {
            id,
            userName,
            pid,
            realName,
            departmentId,
            departmentName,
            confidentialite,
            // secretDisplay,
            gender,
            genderDisp,
            otel,
            oemail,
            indexNo,
            roles,
            birthdate: birthDate,
            empcode: empCode,
            workpost: workPost,
            tecpost: tecPost
          } = res
          that.formData = {
            id,
            userName,
            pid,
            realName,
            departmentId,
            departmentName,
            confidentialite,
            // secretDisplay,
            gender,
            genderDisp,
            otel,
            oemail,
            indexNo,
            roles,
            birthDate,
            empCode,
            workPost,
            tecPost
          }
          if (res.roles && res.roles.length > 0) {
            const roleIds = res.roles.map((item, index, arr) => {
              return item.id
            })
            that.$set(that.formData, 'roleIds', roleIds)
          }
          // that.$refs.form.setViewFields(that.formData)

          console.log('formData', that.formData)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    cancel () {
      this.$emit('cancel')
    },
    saved (res) {
      console.log('safeset saved')
      this.$emit('save-success', res)
    }
  }
}
</script>
