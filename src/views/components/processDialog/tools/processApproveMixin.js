/**
 * 流程审批人预选弹窗公共逻辑
 *
 * 流程：
 * 1. 预先拉取部门领导 / 资产管理员候选人
 * 2. 调用 getTaskDefinition 获取审批节点与候选用户
 * 3. 替换特殊角色候选人后渲染下拉表单
 * 4. 提交时组装 beforehandParams 走 commitApprove
 */
import { getSession } from '@/service/expands/session'
import {
  getAssigneeKey,
  getRoleIdFromAssigneeKey,
  findRoleById,
  DEPT_LEADER_ASSIGNEE_KEY,
  ASSET_ADMIN_ASSIGNEE_KEY,
  STOREHOUSE_PROCESS_KEYS,
  TRANSFER_PROCESS_KEYS
} from './map'

export default {
  props: {
    /** 业务行数据（平台传入） */
    row: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: true
    },
    /** 业务主键，优先于从 row 中取 ID */
    businessIds: {
      type: Array,
      default: () => []
    },
    /** 提交时的 approveInfoMap，优先于 row */
    approveInfoMap: {
      type: Array,
      default: () => []
    },
    /** 审批页展示字段配置，不传则走各组件的 getDefaultApproveInfoConfig */
    approveInfoConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      loading: true,
      isReady: false,
      selectUserBeforehandDataSource: [], // form-list 表单项
      selectUserBeforehandFormData: {}, // 表单默认值
      taskFieldMeta: [] // 构建 logData 用的字段元信息
    }
  },
  computed: {
    /** 业务 ID 列表 */
    resolvedBusinessIds () {
      if (this.businessIds.length) return this.businessIds
      return this.row.map((item) => item.ID).filter(Boolean)
    },
    /** 提交用的行数据（去掉 vxe 内部字段） */
    resolvedApproveInfoMap () {
      if (this.approveInfoMap.length) return this.approveInfoMap
      return this.row.map((item) => {
        const row = { ...item }
        delete row._X_ROW_KEY
        return row
      })
    }
  },
  mounted () {
    this.fetchTaskDefinition()
  },
  methods: {
    /** 解析 ${a_xxx} → a_xxx */
    parseAssigneeKey (expressionText) {
      if (!expressionText) return ''
      return expressionText.trim().replace(/^\$\{/, '').replace(/\}$/, '')
    },

    /**
     * 根据 getTaskDefinition 响应构建审批人下拉
     * - 会签节点（isMultiInstance）：多选，默认全选
     * - 普通节点：单选，默认选第一项
     */
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
          // 会签：字段名取 collectionExpressionText（如 collection）
          fieldName = (taskParams.collectionExpressionText || '').trim()
            .replace(/^\$\{/, '').replace(/\}$/, '')
          options = candidateUserMap[fieldName] || []
        } else {
          // 普通节点：字段名 a_{角色id}
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

        // 默认值：会签全选，普通选第一项
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

    /** 生成 beforehandParams.logDetail.logData */
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

    /** 审批页展示字段：props 优先，否则用组件内 getDefaultApproveInfoConfig */
    buildApproveInfoConfig () {
      if (Object.keys(this.approveInfoConfig).length) {
        return this.approveInfoConfig
      }
      if (typeof this.getDefaultApproveInfoConfig === 'function') {
        return this.getDefaultApproveInfoConfig()
      }
      return {}
    },

    /** 部门领导查询参数：来自会话用户信息 */
    getDeptLeaderQueryParams () {
      const info = getSession('info') || getSession('userInfo') || this.$store?.getters?.userInfo || {}
      return {
        name: info.departmentName,
        departmentId: info.departmentId
      }
    },

    /** 统一解析候选人接口响应为数组（兼容数组 / 单条 { label, value }） */
    extractCandidateList (roleRes) {
      if (Array.isArray(roleRes)) return roleRes
      if (Array.isArray(roleRes?.data)) return roleRes.data
      if (Array.isArray(roleRes?.records)) return roleRes.records
      // getByStoreName 返回单条 { label, value }
      if (roleRes?.label != null && roleRes?.value != null) return [roleRes]
      if (roleRes?.data?.label != null && roleRes?.data?.value != null) return [roleRes.data]
      return []
    },

    /** 标准化为下拉选项 { label, value } */
    normalizeCandidateUsers (list) {
      if (!Array.isArray(list)) return []
      return list.map(item => {
        if (item?.label != null && item?.value != null) {
          return { label: item.label, value: item.value }
        }
        return {
          label: item.realName || item.name || item.userName || '',
          value: item.id || item.userId || item.value || ''
        }
      }).filter(item => item.value)
    },

    /** /jt/role/getByName — 按部门查部门领导 */
    fetchDeptLeaderCandidates () {
      const params = this.getDeptLeaderQueryParams()
      return this.$api['process.getByName'](params)
        .then((roleRes) => this.normalizeCandidateUsers(this.extractCandidateList(roleRes)))
        .catch(() => [])
    },

    /** 若 candidateUserMap 含部门领导 key，用 getByName 结果替换 */
    applyDeptLeaderCandidates (res, users) {
      const candidateUserMap = res?.candidateUserMap
      if (!candidateUserMap || !Object.prototype.hasOwnProperty.call(candidateUserMap, DEPT_LEADER_ASSIGNEE_KEY)) {
        return res
      }
      res.candidateUserMap[DEPT_LEADER_ASSIGNEE_KEY] = users
      return res
    },

    /** 是否为需要按仓库查资产管理员的资产类流程 */
    isStorehouseProcess () {
      return STOREHOUSE_PROCESS_KEYS.includes(this.processDefinitionKey)
    },

    /**
     * 从行数据取仓库 id
     * - 调拨：BEFORE_STOREHOUSE
     * - 其他资产流程：STOREHOUSE_ID
     */
    getStorehouseIdFromRow () {
      const rows = this.resolvedApproveInfoMap
      if (!rows.length) return ''
      const field = TRANSFER_PROCESS_KEYS.includes(this.processDefinitionKey)
        ? 'BEFORE_STOREHOUSE'
        : 'STOREHOUSE_ID'
      return rows.map(item => item[field]).find(Boolean) || ''
    },

    /** /jt/role/getByStoreName — 按仓库 id 查资产管理员 */
    fetchStorehouseCandidates () {
      if (!this.isStorehouseProcess()) return Promise.resolve([])
      const id = this.getStorehouseIdFromRow()
      if (!id) return Promise.resolve([])
      return this.$api['process.getByStoreName']({ id })
        .then((roleRes) => this.normalizeCandidateUsers(this.extractCandidateList(roleRes)))
        .catch(() => [])
    },

    /** 若 candidateUserMap 含资产管理员 key，用 getByStoreName 结果替换 */
    applyAssetAdminCandidates (res, users) {
      const candidateUserMap = res?.candidateUserMap
      if (!candidateUserMap || !Object.prototype.hasOwnProperty.call(candidateUserMap, ASSET_ADMIN_ASSIGNEE_KEY)) {
        return res
      }
      res.candidateUserMap[ASSET_ADMIN_ASSIGNEE_KEY] = users
      return res
    },

    /**
     * 主入口：先并行拉特殊候选人，再拉任务定义并替换后渲染
     * beforehand=false 时关闭弹窗并通知父级走默认流程
     */
    fetchTaskDefinition () {
      this.loading = true
      this.isReady = false
      Promise.all([
        this.fetchDeptLeaderCandidates(),
        this.fetchStorehouseCandidates()
      ])
        .then(([deptLeaderUsers, storehouseUsers]) => {
          return this.$api['PersonalProcessApproval.getTaskDefinition']({
            processDefinitionKey: this.processDefinitionKey,
            businessIds: []
          }).then((res) => ({ res, deptLeaderUsers, storehouseUsers }))
        })
        .then(({ res, deptLeaderUsers, storehouseUsers }) => {
          if (res?.result && res.beforehand && res.userTasks?.length) {
            this.applyDeptLeaderCandidates(res, deptLeaderUsers)
            this.applyAssetAdminCandidates(res, storehouseUsers)
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

    /** 组装 commitApprove 的 beforehandParams */
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

    /** 提交发起审批 */
    handleSubmit (formParams) {
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

    handleClose () {
      this.$emit('close')
    }
  }
}
