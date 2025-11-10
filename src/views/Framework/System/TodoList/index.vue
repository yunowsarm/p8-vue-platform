<template>
  <normal-layout class="todoLayout"
                 layoutCode='TODO_LIST'
                 :splitDefaultLeftWidth="30"
                 :headerVisible="false">
    <template #west>
      <form-list ref="form"
                 :dataSource="dataSource"
                 @rendered="rendered"
                 labelWidth="90px"
                 :existDefaultBtn="false"
                 :form="formData">
        <template #source>
          <span v-if="formData.backlogUrl"
                style="text-decoration: underline;cursor: pointer;"
                @click="sourceRecord">{{formData.typeDisplay}}记录
            <i class="el-icon-paperclip"></i></span>
          <span v-else
                style="cursor: pointer;">{{formData.typeDisplay}}记录</span>
        </template>
      </form-list>
    </template>
    <template #center>
      <form-list ref="formRight"
                 class="formRight"
                 :dataSource="dataSourceRight"
                 :existDefaultBtn="false"
                 labelWidth="100px"
                 :existCustomBtn="true"
                 :form="formDataRight">
        <template #customBtn>
          <el-button size="mini"
                     @click="$emit('close')">取消</el-button>
          <el-button type="primary"
                     size="mini"
                     a
                     @click="save">保存</el-button>
          <el-button type="primary"
                     size="mini"
                     @click="handleSubmit">保存并提交</el-button>
        </template>
      </form-list>
    </template>
  </normal-layout>
</template>
<script>
import { P8NormalLayoutV1 as NormalLayout, P8Search as SearchFormList, P8Form as FormList } from 'p8-components-ui'
import moment from 'moment'
export default {
  name: 'TodoList',
  props: {
    row: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      formDataRight: {
        realBeginDate: '',
        realEndDate: '',
        execution: ''
      },
      formData: {},
      dataSource: [
        {
          type: 'view',
          labelText: '标题',
          colLayout: 'singleCol',
          fieldName: 'title'
        },
        {
          type: 'view',
          labelText: '类型',
          colLayout: 'singleCol',
          fieldName: 'typeDisplay'
        },
        {
          type: 'view',
          labelText: '待办事项内容',
          colLayout: 'singleCol',
          fieldName: 'content'
        },
        {
          type: 'view',
          labelText: '责任人',
          colLayout: 'singleCol',
          fieldName: 'dutyUserName'
        },
        {
          type: 'view',
          labelText: '计划开始时间',
          colLayout: 'singleCol',
          fieldName: 'planBeginDate'
        },
        {
          type: 'view',
          labelText: '计划完成时间',
          colLayout: 'singleCol',
          fieldName: 'planEndDate'
        },
        {
          type: 'view',
          labelText: '确认人',
          colLayout: 'singleCol',
          fieldName: 'affirmUserName'
        },
        {
          type: 'blank',
          labelText: '来源',
          colLayout: 'singleCol',
          fieldName: 'source',
          slotName: 'source'
        },
        {
          type: 'view',
          labelText: '状态',
          colLayout: 'singleCol',
          fieldName: 'statusDisplay'
        },
        {
          type: 'view',
          labelText: '实际开始时间',
          colLayout: 'singleCol',
          fieldName: 'realBeginDate'
        },
        {
          type: 'view',
          labelText: '实际完成时间',
          colLayout: 'singleCol',
          fieldName: 'realEndDate'
        }
      ],
      dataSourceRight: [
        {
          type: 'datetime',
          labelText: '实际开始日期',
          fieldName: 'realBeginDate',
          placeholder: '请输入',
          colLayout: 'doubleCol',
          fieldConfig: {
            'value-format': 'yyyy-MM-dd',
            clearable: false,
            'picker-options': this.startDateOptions()
          },
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'datetime',
          labelText: '实际完成日期',
          fieldName: 'realEndDate',
          placeholder: '请输入',
          colLayout: 'doubleCol',
          fieldConfig: {
            clearable: false,
            'picker-options': this.endDateOptions(),
            'value-format': 'yyyy-MM-dd'
          },
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '完成情况',
          fieldName: 'execution',
          placeholder: '请输入',
          colLayout: 'singleCol',
          fieldConfig: {
            rows: 4
          }
        },
      ]
    }
  },
  methods: {
    rendered () {
      if (this.row && this.row.length) {
        let id = this.row[0].ID
        this.$api['TodoList.list']({ id: id }).then(res => {
          this.formData = res
          this.formDataRight = { ...res }
          this.formDataRight.realBeginDate = res.realBeginDate ? res.realBeginDate : ''
          this.formDataRight.realEndDate = res.realEndDate ? res.realEndDate : ''
        })
      }
    },
    save () {
      let that = this
      let id = this.row[0].ID
      let parmars = { id: id, ...this.formDataRight }
      this.$refs.formRight.validate().then(() => {
        that.$api['TodoList.save'](parmars).then(res => {
          if (res) {
            that.$message({ type: 'success', message: '保存成功' })
            that.$emit('close')
          }
        })
      })
    },
    handleSubmit () {
      let that = this
      let id = this.row[0].ID
      let parmars = { id: id, ...this.formDataRight }
      let approveInfoConfig = {
        filed1: { label: '标题', value: parmars.title },
        filed2: { label: '类型', value: parmars.typeDisplay },
        filed3: { label: '内容', value: parmars.content }
      }

      this.$refs.formRight.validate().then(() => {
        this.$confirm('是否确认保存并提交该项?', '提醒', {
          lockScroll: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
          .then(() => {
            that.$api['TodoList.save'](parmars).then(res => {
              if (res) {
                that.$api['TodoList.submit']({ businessId: [id], approveUser: that.formData.affirmUserId, approveInfoConfig: approveInfoConfig }).then(res => {
                  if (res) {
                    that.$message({ type: 'success', message: '提交成功' })
                    that.$emit('close')
                  }
                })
              }
            })
          })
          .catch(() => { })
      })

    },
    startDateOptions () {
      return {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') > moment(this.formDataRight.realEndDate).format('YYYY-MM-DD')
          return timeSpace
        }
      }
    },
    endDateOptions () {
      return {
        disabledDate: (time) => {
          let timeSpace = moment(time).format('YYYY-MM-DD') < moment(this.formDataRight.realBeginDate).format('YYYY-MM-DD')
          return timeSpace
        }
      }
    },
    sourceRecord () {
      // 跳转逻辑
    }
  },
  components: {
    SearchFormList,
    NormalLayout,
    FormList
  }
}
</script>
<style lang="scss" scpoed>
.todoLayout {
  margin: 0;
  padding: 0;
  height: 100%;
}
.formRight ::v-deep .formBtn {
  left: 3px;
}
@media screen and (max-width: 1100px) {
  .todoLayout {
    .splitter-paneL,
    .splitter-pane-resizer,
    .splitBtn {
      display: none;
    }
  }
}
</style>
