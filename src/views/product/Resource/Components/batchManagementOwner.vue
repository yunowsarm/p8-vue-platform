<template>
  <div>
    <form-list ref="form"
               :dataSource="dataSource"
               :existDefaultBtn="false"
               :existCustomBtn="true"
               :form="formData"
               @rendered="rendered"
               :isCustomValidate="true">
      <template #dutyUserId>
        <el-input v-model='formData["dutyUserName"]'
                  readonly
                  autosize
                  placeholder="请选择责任人">
          <el-button icon="el-icon-link"
                     slot="append"
                     @click="selectDutyUser"></el-button>
        </el-input>
      </template>

      <template #customBtn>
        <el-button type="primary"
                   :disabled='btnDisabled'
                   @click="handleSave">保存</el-button>
      </template>
    </form-list>
    <editable-table ref="table"
                    :columns="columns"
                    :params="queryParam"
                    :style="{height: customHeight + 'px'}"
                    :data="tableData"
                    @save-param-data="saveParamData">
      <template #replaceMan="{scope, data}">
        <el-input v-model='scope.row.replaceMan'
                  @blur="saveParamData(data)"
                  @focus='selectRuleOutSelfUser(scope, data)'
                  readonly
                  autosize
                  placeholder="请选择责任人">
        </el-input>
        <!-- <el-input v-model="scope.row.replaceMan"
                  @blur="saveParamData(data)"></el-input> -->
      </template>
    </editable-table>
    <user-select v-if="selectDutyUserVisible"
                 :visible="selectDutyUserVisible"
                 :plan-info-id="comprehensivePlanId"
                 :id='id'
                 :userId="formData.dutyUserId"
                 :ruleOutSelf='ruleOutSelf'
                 @closed="selectDutyUserClosed"
                 @ruleOutSelfUserSelected='ruleOutSelfUserSelected'
                 @dutyUserSelected="selectDutyUserClosed">
    </user-select>

  </div>
</template>

<script>
import { Input, Button } from 'element-ui'
import { P8Drawer as CommonDrawer, P8EditTable as EditableTable, P8Form as FormList } from 'p8-components-ui'

import UserSelect from './dutyUserSelect/index'
export default {
  name: 'batchManagementOwner',
  components: {
    'el-input': Input,
    'el-button': Button,
    EditableTable,
    UserSelect,
    FormList,
    CommonDrawer
  },
  props: {
    row: { // menu: 锚点导航数组
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      dataSource: [
        {
          type: 'blank',
          labelText: '被替换人：',
          fieldName: 'dutyUserId',
          labelWidth: '90px',
          slotName: 'dutyUserId',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '必须选择责任人'
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '任务类型：',
          fieldName: 'taskType',
          colLayout: 'doubleCol',
          options: [ // 单选数据源 目前只支持自定义数据源
            {
              value: '1',
              label: '所有任务'
            },
            {
              value: '2',
              label: '未完成任务'
            }
          ],
          rules: [
            {
              required: true,
              message: '必须选择任务类型'
            }
          ]
        }
      ],
      comp: this,
      userId: '',
      tableDataIndex: 0,
      ruleOutSelf: false,
      selectDutyUserVisible: false,
      tableData: [],
      btnDisabled: true,
      changeTaskView: false,
      saveApi: 'JsjclProjectApply.replaceResponsible',
      comprehensivePlanId: '',
      queryParam: { taskId: '' },
      customHeight: document.documentElement.clientHeight - 200,
      selectedRow: {},
      formData: {
        // taskId: 'this.selectedRow.id',
        // taskName: 'this.selectedRow.name',
        // processDefinitionKey: 'comTaskChangeApprove',
        // businessName: '综合计划任务变更审批'
      },
      columns: [
        {
          title: '序号',
          type: 'index',
          minWidth: 50,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '角色',
          dataIndex: 'projectTeamRoleName',
          align: 'center',
          minWidth: 80
        },
        {
          title: '选择替换人',
          dataIndex: 'replaceMan',
          align: 'center',
          scopedSlots: { customRender: 'custom' },
          minWidth: 80
        }
      ],
      sqlParams: {},
      id: ''
    }
  },
  created () {
    if (this.row && this.row.length) {
      this.id = this.row[0].ID
    }
  },
  mounted () {

  },
  methods: {
    handleSave () {
      let params = {}
      this.$refs.form.validate().then(formData => {
        // let params = { ...formData, ...this.sqlParams }
        let replaceDetails = []

        this.sqlParams['meetingTodolistRequests'].forEach(el => {
          if (el.replaceMan) {
            replaceDetails.push({
              replaceManId: el.replaceManId,
              replaceMan: el.replaceMan,
              projectTeamRoleUserId: el.id
            })
          }
        })
        params = {
          wholeDescribeId: this.id,
          //  userId: formData.dutyUserId,
          replaceType: formData.taskType,
          replaceDetails: replaceDetails
        }
        this.$confirm('确定要替换责任人?', '提醒', {
          lockScroll: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
          .then(() => {
            let loading = this.$loading({
              lock: true,
              text: '正在提交,请稍候...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.3)'
            })
            this.$api['teamManager.replaceResponsible'](params).then(res => {
              if (res) {
                this.$message({
                  message: '替换成功！',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: '替换失败！',
                  type: 'warning'
                })
              }
              loading.close()
            }).catch(error => {
              loading.close()
              console.error(error, 'error')
            })
          })
          .catch(() => { })
      })
      // this.$refs.form.submitForm(params, this.saveApi)
    },
    saved (res) {
      this.$emit('saveSuccess', res)
    },
    saveParamData (data) {
      this.sqlParams['meetingTodolistRequests'] = data
    },
    ruleOutSelfUserSelected (obj) {
      if (obj) {
        this.tableData[this.tableDataIndex].replaceMan = obj.realName
        this.tableData[this.tableDataIndex].replaceManId = obj.id
      }
      this.selectDutyUserVisible = false
      if (this.tableData.some(i => i.replaceMan)) {
        this.btnDisabled = false
      }
    },
    selectDutyUserClosed (obj) {

      if (obj) {
        this.formData.dutyUserName = obj.realName
        this.formData.dutyUserId = obj.id
        this.formData = Object.assign({}, this.formData)
        this.tableData = obj.roleList.map(item => {
          return { ...item, replaceMan: '' }
        })
        this.btnDisabled = true
      }
      this.selectDutyUserVisible = false
    },
    selectDutyUser () {
      this.ruleOutSelf = false
      this.selectDutyUserVisible = true
    },
    selectRuleOutSelfUser (scope, data) {
      this.tableDataIndex = scope.$index
      this.userId = this.formData.dutyUserId
      this.ruleOutSelf = true
      this.selectDutyUserVisible = true
    },
    rendered () { },
    tableRefresh (param) {
      param.then(() => {

      }).catch(() => {
        console.error('异步失败的操作')
      })
    }
  },
  watch: {}
}
</script>

<style scoped>
/* ::v-deep .list-header {
  height: auto !important;
  background-color: white;
} */
::v-deep .formList.el-form > .el-row.formBtn {
  z-index: 9;
}
::v-deep .list-main.fullHeight {
  height: calc(100% - 50px) !important;
}
</style>
