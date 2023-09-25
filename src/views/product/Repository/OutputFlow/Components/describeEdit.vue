<template>
  <form-list ref="form"
             @rendered="rendered"
             form-layout="vertical"
             @saved="saved"
             :dataSource="dataSource"
             :api="saveApi"
             :form="formData"
             :is-custom-validate="isCustomValidate"
             @custom-validate="customValidate">
  </form-list>
</template>
<style scoped>
</style>
<script>
import { P8Form as FormList } from 'p8-components-ui'

export default {
  name: 'DescribeEdit',
  components: {
    FormList
  },
  props: {
    activityInfoId: {
      type: String,
      default: ''
    },
    teamId: {
      type: String,
      default: ''
    },
    rootId: {
      type: String,
      default: ''
    },
    colLayoutClassify: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      saveApi: 'OutputFlow.describeSave',
      isCustomValidate: true,
      userRoles: [],
      dataSource: [
        {
          type: 'hidden',
          fieldName: 'id',
          urlParam: true
        },
        {
          type: 'text',
          labelText: '活动名称',
          fieldName: 'name',
          placeholder: '请输入活动名称',
          colLayout: this.colLayoutClassify,
          rules: [
            {
              required: true,
              message: '必填'
            }
          ]
        },
        {
          type: 'text',
          labelText: '活动编号',
          fieldName: 'code',
          placeholder: '请输入活动编号',
          colLayout: this.colLayoutClassify,
          rules: [
            {
              // 当前只校验当前流程内唯一，若要全局唯一，flIsGlobal参数设置为：1
              validator: (rule, value, callback) => {
                let that = this
                that.$api['OutputFlow.OFrepeatedCodeCheck']({
                  activityInfoId: that.rootId,
                  id: that.activityInfoId,
                  code: value,
                  isGlobal: 0
                }).then(res => {
                  if (res === 'false') {
                    callback(new Error('活动编号已被使用！'))
                    return
                  }
                  callback()
                })
              },
              trigger: 'blur'
            }
          ]
        },
        {
          labelText: '时限（天）',
          type: 'number',
          fieldName: 'duration',
          placeholder: '请输入时限',
          colLayout: this.colLayoutClassify
        },
        {
          type: 'select',
          labelText: '活动类型',
          fieldName: 'type',
          placeholder: '请选择活动类型',
          colLayout: this.colLayoutClassify,
          optionUrl: {
            api: 'thirdPartInterface.getDic',
            params: { dicType: 'ACTIVITY_TYPE' },
            label: 'label',
            value: 'value'
          },
          options: []
        },
        {
          type: 'treeSelect',
          labelText: '前置',
          defaultValue: [],
          multiple: true,
          fieldName: 'predecessorsIds',
          placeholder: '请选择前置活动',
          colLayout: this.colLayoutClassify,
          optionUrl: {
            api: 'OutputFlow.predecessorsTree',
            params: { activityInfoId: this.rootId, id: this.activityInfoId }

          },
          clearable: true,
          defaultExpandAll: true,
          disabled: false,
          checkStrictly: false,
          treeData: [],
          treeProps: {
            value: 'value',
            children: 'children',
            label: 'label'
          },
          disabledValues: []
        },
        {
          type: 'treeSelect',
          labelText: '角色',
          defaultValue: [],
          fieldName: 'teamRoleId',
          placeholder: '请选择角色',
          multiple: false,
          defaultExpandedKeys: ['0'],
          colLayout: this.colLayoutClassify,
          optionUrl: {
            api: 'OutputFlow.roleClassifyTree',
            params: { kteamId: this.teamId }

          },
          clearable: true,
          // defaultExpandAll: true,
          disabled: false,
          // checkStrictly: false,
          treeData: [],
          treeProps: {
            value: 'value',
            children: 'children',
            label: 'label'
          }
        },
        {
          type: 'select',
          labelText: '是否里程碑',
          fieldName: 'isMilestone',
          placeholder: '请选择是否里程碑',
          colLayout: this.colLayoutClassify,
          options: [
            { 'value': 0, 'label': '否' },
            { 'value': 1, 'label': '是' }
          ]
        },
        {
          labelText: '活动描述',
          type: 'textarea',
          fieldName: 'describes',
          placeholder: '请输入活动描述',
          colLayout: 'singleCol'
        }
      ],
      formData: {},
      otherParam: {}
    }
  },
  watch: {
    activityInfoId: {
      handler (newValue, oldValue) {
        if (newValue && newValue !== '') {
          this.activityInfoId = newValue
          this.getDescribeData(newValue)
        } else {
          this.activityInfoId = null
          this.formData = Object.assign({}, {})
        }
      }
    }
  },
  mounted () {

  },
  methods: {
    rendered () {
      if (this.activityInfoId && this.activityInfoId !== '') {
        this.getDescribeData(this.activityInfoId)
      }
    },
    clickEvent () {

    },
    getDescribeData (activityInfoId) {
      let that = this
      if (activityInfoId) {
        that.$api['OutputFlow.activityInfo']({ id: activityInfoId }).then(function (res) {
          if (res) {
            that.formData.id = res.id
            that.formData.name = res.name
            that.formData.code = res.code
            if (res.duration) {
              that.formData.duration = res.duration
            }
            that.formData.type = res.type
            that.formData.predecessorsIds = res.predecessorsIds && res.predecessorsIds.length > 0 ? res.predecessorsIds : []
            that.formData.teamRoleId = res.teamRoleId ? res.teamRoleId : ''
            that.formData.isMilestone = res.isMilestone
            that.formData.describes = res.describes
            that.formData = Object.assign({}, that.formData)
          } else {
            that.formData = Object.assign({}, that.formData)
          }
        }).catch(function (error) {
          console.error('error' + error)
        })
      } else {
        that.formData = Object.assign({}, that.formData)
      }
    },
    saved (res) {
      this.$emit('saveSuccess', res)
    },
    customValidate (saveParams) {
      this.$emit('saveAll')
    }
  }

}

</script>
