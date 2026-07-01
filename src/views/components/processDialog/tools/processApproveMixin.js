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
      selectUserBeforehandFormData: {}
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
    buildDataSource(res) {
      const candidateUserMap = res.candidateUserMap || {}
      const dataSource = []
      const formData = {}
      ;(res.userTasks || []).forEach((task) => {
        const assigneeKey = this.parseAssigneeKey(task.assigneeExpression?.expressionText)
        const roleId = task.candidateGroupIdExpressions?.[0]?.expressionText || getRoleIdFromAssigneeKey(assigneeKey)
        const role = findRoleById(roleId)
        const mapKey = role ? getAssigneeKey(role.id) : assigneeKey
        const options = candidateUserMap[mapKey] || candidateUserMap[assigneeKey] || []
        dataSource.push({
          type: 'select',
          labelText: task.nameExpression?.expressionText || role?.name || '',
          fieldName: mapKey,
          placeholder: '选择节点审批人',
          colLayout: 'singleCol',
          fieldConfig: { multiple: false, disabled: false },
          options,
          rules: [{ required: true, trigger: 'change', message: '必填' }]
        })
        formData[mapKey] = options[0]?.value || ''
      })
      this.selectUserBeforehandDataSource = dataSource
      this.selectUserBeforehandFormData = formData
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
    buildBeforehandParams(formParams) {
      return {
        ...formParams,
        signCollection: [],
        logDetail: {
          createType: '1',
          objectId: '',
          objectName: '',
          objectSecretGrade: '',
          logData: []
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
