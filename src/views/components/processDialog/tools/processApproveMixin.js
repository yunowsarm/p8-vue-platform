import { getAssigneeKey, getRoleIdFromAssigneeKey, findRoleById } from './map'

export default {
  props: {
    row: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: true
    },
    businessIds: {
      type: Array,
      default: () => []
    },
    approveInfoMap: {
      type: Array,
      default: () => []
    },
    approveInfoConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      loading: true,
      isReady: false,
      selectUserBeforehandDataSource: [],
      selectUserBeforehandFormData: {},
      taskFieldMeta: []
    }
  },
  computed: {
    resolvedBusinessIds() {
      if (this.businessIds.length) return this.businessIds
      return this.row.map((item) => item.ID).filter(Boolean)
    },
    resolvedApproveInfoMap() {
      if (this.approveInfoMap.length) return this.approveInfoMap
      return this.row.map((item) => {
        const row = { ...item }
        delete row._X_ROW_KEY
        return row
      })
    }
  },
  mounted() {
    this.fetchTaskDefinition()
  },
  methods: {
    parseAssigneeKey(expressionText) {
      if (!expressionText) return ''
      return expressionText.trim().replace(/^\$\{/, '').replace(/\}$/, '')
    },
    buildDataSource (res) {
      const candidateUserMap = res.candidateUserMap || {}
      const taskOtherParams = res.taskOtherParams || {}
      const dataSource = []
      const formData = {}
      const taskFieldMeta = []
      ;(res.userTasks || []).forEach(task => {
        const taskParams = taskOtherParams[task.key]
        const isMulti = taskParams?.isMultiInstance === true
        let fieldName
        let options = []

        if (isMulti) {
          fieldName = (taskParams.collectionExpressionText || '').trim()
            .replace(/^\$\{/, '').replace(/\}$/, '')
          options = candidateUserMap[fieldName] || []
        } else {
          const assigneeKey = this.parseAssigneeKey(task.assigneeExpression?.expressionText)
          const roleId = task.candidateGroupIdExpressions?.[0]?.expressionText
            || getRoleIdFromAssigneeKey(assigneeKey)
          const role = findRoleById(roleId)
          fieldName = role ? getAssigneeKey(role.id) : assigneeKey
          options = candidateUserMap[fieldName] || candidateUserMap[assigneeKey] || []
        }

        const labelText = task.nameExpression?.expressionText || ''
        dataSource.push({
          type: 'select',
          labelText,
          fieldName,
          placeholder: isMulti ? '选择会签审批人' : '选择节点审批人',
          colLayout: 'singleCol',
          fieldConfig: { multiple: isMulti, disabled: false },
          options,
          rules: [{ required: true, trigger: 'change', message: '必填' }]
        })
        taskFieldMeta.push({ fieldName, labelText, options, isMulti })

        if (isMulti) {
          formData[fieldName] = options.map(item => item.value)
        } else {
          formData[fieldName] = options[0]?.value || ''
        }
      })
      this.selectUserBeforehandDataSource = dataSource
      this.selectUserBeforehandFormData = formData
      this.taskFieldMeta = taskFieldMeta
    },
    getOptionLabel (options, value) {
      return options.find(item => item.value === value)?.label || value
    },
    buildLogData (formParams) {
      return (this.taskFieldMeta || []).map(field => {
        const value = formParams[field.fieldName]
        if (field.isMulti) {
          const ids = Array.isArray(value) ? value : []
          return {
            column: field.fieldName,
            columnName: field.labelText,
            before: ids,
            after: ids.map(id => this.getOptionLabel(field.options, id)).join(',')
          }
        }
        return {
          column: field.fieldName,
          columnName: field.labelText,
          before: value,
          after: this.getOptionLabel(field.options, value)
        }
      })
    },
    buildApproveInfoConfig() {
      if (Object.keys(this.approveInfoConfig).length) {
        return this.approveInfoConfig
      }
      if (typeof this.getDefaultApproveInfoConfig === 'function') {
        return this.getDefaultApproveInfoConfig()
      }
      return {}
    },
    fetchTaskDefinition () {
      this.loading = true
      this.isReady = false
      this.$api['PersonalProcessApproval.getTaskDefinition']({
        processDefinitionKey: this.processDefinitionKey,
        businessIds: []
      })
        .then((res) => {
          if (res?.result && res.beforehand && res.userTasks?.length) {
            this.buildDataSource(res)
            this.isReady = true
          } else if (res?.result && !res.beforehand) {
            this.$emit('no-beforehand')
            this.handleClose()
          } else {
            this.$message.warning('操作失败！' + (res?.resultMsg || ''))
            this.handleClose()
          }
        })
        .catch(() => {
          this.handleClose()
        })
        .finally(() => {
          this.loading = false
        })
    },
    buildBeforehandParams (formParams) {
      return {
        ...formParams,
        signCollection: [],
        logDetail: {
          createType: '1',
          objectId: '',
          objectName: '',
          objectSecretGrade: '',
          logData: this.buildLogData(formParams)
        },
        module: 'BPM流程',
        code: this.processDefinitionKey,
        approveInfoConfig: this.buildApproveInfoConfig()
      }
    },
    handleSubmit(formParams) {
      const payload = {
        beforehandParams: this.buildBeforehandParams(formParams),
        businessId: this.resolvedBusinessIds,
        processDefinitionKey: this.processDefinitionKey,
        approveInfoMap: this.resolvedApproveInfoMap
      }
      this.$api['baseData.commitApprove'](payload).then((res) => {
        if (res?.result === 'false' || res?.result === false) {
          this.$message.error(res.message || '提交失败')
        } else {
          this.$message.success('提交成功')
          this.$emit('success', res)
          this.handleClose()
        }
      })
    },
    handleClose() {
      this.$emit('close')
    }
  }
}
