<template>
  <normal-layout :normalLayout="normalLayout" :header-visible="false" :splitDefaultLeftWidth="22">
    <template #west>
      <div style="text-align:center;padding:0 15px;padding-right: 30px;">
        <el-button type="primary" plain style="margin: 5px;width:100%;" @click="createRoles"><i class="el-icon-plus" type="primary"></i>新建角色类别</el-button>
      <ul style="text-align:left;">
        <li v-for="(el, index) in rolesList" :key="el.id" @click="openRight(el,index)" :class="{'active': clickIndex == index}" class="listSettings">
          <i class="el-icon-s-custom" style="padding-right:10px;"></i>
          <span class="name">{{el.name}}</span>
          <span style="float: right;">
            <i class="el-icon-edit"></i>
            <i class="el-icon-delete" @click.stop="deleteRoles(el)" style="padding-left: 5px;"></i>
          </span>
        </li>
      </ul>
      </div>
    </template>
    <template #center>
      <div style="position:relative;height:100%;">
        <form-list ref="form"
                    style="height: 270px;overflow:hidden;"
                    @rendered="rendered"
                    @saved="saved"
                    :dataSource="dataSource"
                    :api="saveApi"
                    labelWidth="80px"
                    :isCustomValidate="true"
                    @custom-validate="customValidate"
                    :form="formData">
                  <template #roleCategory><span class="title">角色类别信息</span></template>
        </form-list>
        <div style="display:inline-block;position:relative;bottom:40px;height:calc(100% - 280px);width:100%;">
          <span style="font-weight:bold;font-size:12px;position:relative;left:20px;">角色信息</span>
          <editable-table
            style="margin:0;"
            :columns="paramColumns"
            :add-row="true"
            :data="formData.roles"
            @save-param-data="saveParamData"
          >
            <template #name="{ scope, data }">
              <el-input v-model="scope.row.name" @blur="saveParamData(data)" placeholder="请输入"></el-input>
            </template>
            <template #sysRole="{ scope, data }">
              <el-select v-model="scope.row.textType" size="mini" style="width: 100%" clearable @change="saveParamData(data)">
                <el-option v-for="(item,index) in rolesSelectData" :key="index" :label="item.NAME" :value="item.ID"> </el-option>
              </el-select>
            </template>
            <template #isRequired="{ scope, data }">
              <el-radio-group v-model="scope.row.isRequired" size="small" @change="saveParamData(data)">
                <el-radio-button label="1" value="1">是</el-radio-button>
                <el-radio-button label="0" value="0">否</el-radio-button>
              </el-radio-group>
            </template>
            <template #isFixed="{ scope, data }">
              <el-radio-group v-model="scope.row.isFixed" size="small" @change="saveParamData(data)">
                <el-radio-button label="1" value="1">是</el-radio-button>
                <el-radio-button label="0" value="0">否</el-radio-button>
              </el-radio-group>
            </template>
            <template #indexNo="{ scope, data }">
              <el-input-number v-model="scope.row.indexNo" style="width:100%;" size="mini" @change="saveParamData(data)" placeholder="请输入"></el-input-number>
            </template>
          </editable-table>
        </div>
      </div>
    </template>
  </normal-layout>
</template>

<style lang="scss" scoped>
.listSettings {
  padding: 10px 5px;
  border-bottom: 1px solid #e7e8ea;
}
i {
  font-size: 14px !important;
  cursor: pointer;
}
.name {
  display: inline-block;
  width: calc(100% - 70px);
  overflow:hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom;
}
.title{
  color: black;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  right: 70px;
}
.active {
  background: #f0f8ff;
}
.el-radio-button {
  min-width: 40px !important;
}
::v-deep .el-radio-button__inner{
  min-width: 40px !important;
}
</style>
<script>
import { P8Form as FormList, P8NormalLayoutV1 as NormalLayout, P8EditTable as EditableTable } from 'p8-components-ui'
export default {
  name: 'RoleClassifyList',
  components: {
    FormList,
    NormalLayout,
    EditableTable
  },
  props: {
    row: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      normalLayout: {
        west: {
          xs: 7, sm: 7, md: 7, lg: 7, xl: 7
        },
        center: {
          xs: 17, sm: 17, md: 17, lg: 17, xl: 17
        }
      },
      saveApi: 'knowledgeManagement.saveRoleClassify',
      dataSource: [
        {
          type: 'blank', // 控件类型
          labelText: '', // 控件显示的文本
          fieldName: 'roleCategory',
          slotName: 'roleCategory'
        },
        {
          type: 'text', // 控件类型
          labelText: '类别名称', // 控件显示的文本
          fieldName: 'name',
          placeholder: '请输入类别名称', // 默认控件的空值文本
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            },
          ]
        },
        {
          type: 'text', // 控件类型
          labelText: '类别描述', // 控件显示的文本
          fieldName: 'describes',
          placeholder: '请输入类别描述', // 默认控件的空值文本
          colLayout: 'singleCol',
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'number',
          labelText: '排序号',
          fieldName: 'indexNo',
          placeholder: '请输入排序号',
          colLayout: 'singleCol'
        }
      ],
      formData: {
        roles:[]
      },
      paramColumns: [
        {
          title: '团队角色名称',
          dataIndex: 'name',
          minWidth: '120px',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '系统角色',
          dataIndex: 'sysRole',
          minWidth: '110px',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '必选角色',
          dataIndex: 'isRequired',
          minWidth: '110px',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '固定角色',
          dataIndex: 'isFixed',
          minWidth: '110px',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '排序号',
          dataIndex: 'indexNo',
          minWidth: '110px',
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
      ],
      rolesList: [],
      editableData: [],
      clickIndex: null,
      rolesSelectData: []
    }
  },
  created () {
    this.$api['formGenerator.getSelectionData']({selectCode: 'SYSTEM_ROLE_LIST'}).then(res => {
      this.rolesSelectData = res.data
    })
  },
  methods: {
    rendered () {
      this.$api['knowledgeManagement.roleClassifyList']({klTeamsId: this.row.ID}).then(res => {
        this.rolesList = res
        if (this.rolesList && this.rolesList.length) {
          this.clickIndex = 0
          this.formData = this.rolesList[0]
        }
        this.formData.klTeamsId = this.row.ID
      })
    },
    customValidate (saveParams) {
      saveParams.roles = this.editableData
      this.$refs.form.submitForm(saveParams, this.saveApi)
    },
    saved (res) {
      this.rendered()
    },
    saveParamData (data) {
      this.editableData = data
      console.log(data,'--data');
    },
    openRight (item,index) {
      this.clickIndex = index
      this.editableData = item.roles
      this.formData = {...this.formData,...item}
    },
    deleteRoles (item) {
      let that = this
      this.$confirm('是否要删除该条数据?', '提醒', {
        lockScroll: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
        .then(() => {
          that.$api['knowledgeManagement.removeRoleClassify']({ids: [item.id]}).then(res => {
            if (res) {
              that.$message({message:'删除成功',type:'success'})
              this.rendered()
            }
          })
        })
        .catch(() => {})
    },
    createRoles () {
      this.formData = {klTeamsId: this.row.ID}
    }
  }
}
</script>
