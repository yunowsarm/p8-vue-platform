<template>
  <list-layout :header-visible="false" v-if="isMounted">
    <template #center>
      <div class="dispatch-container">
        <div class="dispatch-scroll-body">
          <div class="apply-table-section">
            <h3 class="section-title">申请用车信息</h3>
            <el-table :data="filteredRow" border :max-height="tableMaxHeight" style="width: 100%">
              <el-table-column prop="APPLICANTNAME" label="申请人" />
              <el-table-column prop="APPLICANT_DEPT" label="申请部门" />
              <el-table-column prop="APPLICANT_DATE" label="申请日期" />
              <el-table-column prop="DATE" label="用车开始时间" />
              <el-table-column prop="RETURN_TIME" label="用车结束时间" />
              <el-table-column prop="DEPART" label="出发地" />
              <el-table-column prop="DESTINATION" label="目的地" />
              <el-table-column prop="REASON" label="用车事由" show-overflow-tooltip />
              <el-table-column prop="METHOD" label="用车方式">
                <template slot-scope="scope">
                  {{ scope.row.METHOD === '1' ? '往返' : '单程' }}
                </template>
              </el-table-column>
              <el-table-column prop="APPROVE_STATUS" label="用车状态" width="100" fixed="right">
                <template slot-scope="scope">
                  <span :style="{ color: getStatusColor(scope.row.APPROVE_STATUS) }">
                    {{ getStatusText(scope.row.APPROVE_STATUS) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="dispatch-form-section">
            <h3 class="section-title">派车表单</h3>
            <el-form :model="dispatchForm" :rules="rules" ref="dispatchForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="司机" prop="driver">
                    <el-select v-model="dispatchForm.driver" placeholder="请选择司机" filterable style="width: 100%">
                      <el-option v-for="item in driverOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="车牌号" prop="plateNumber">
                    <el-select v-model="dispatchForm.plateNumber" placeholder="请选择车辆" filterable style="width: 100%">
                      <el-option v-for="item in carOptions" :key="item.ID" :label="item.CARD" :value="item.ID" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="car-user-section" v-if="dispatchForm.carUsers.length">
                <h4 class="car-user-title">用车人信息（与申请单一对一对应）</h4>
                <el-row :gutter="20" v-for="(item, index) in pendingDispatchList" :key="item.ID || index">
                  <el-col :span="12">
                    <el-form-item :label="'用车人（' + (index + 1) + '）'" :prop="'carUsers.' + index + '.value'" :rules="carUserRules">
                      <el-select
                        ref="carUserSelect"
                        class="car-user-select"
                        v-model="dispatchForm.carUsers[index].value"
                        multiple
                        collapse-tags
                        placeholder="请选择用车人"
                        popper-class="tree-select-popper"
                        @remove-tag="(tag) => handleRemoveTag(tag, index)"
                        @visible-change="(visible) => handleSelectVisibleChange(visible, index)"
                      >
                        <el-option v-for="user in dispatchForm.carUsers[index].selectedUsers" :key="user.id" :value="user.id" :label="user.name" style="display: none" />
                        <el-option value="" label="" style="height: auto; padding: 0; overflow: auto">
                          <el-tree
                            ref="carUserTree"
                            :data="treeData"
                            :props="defaultTreeProps"
                            node-key="ID"
                            show-checkbox
                            default-expand-all
                            :expand-on-click-node="false"
                            @check="(_, checkedState) => handleTreeCheck(checkedState, index)"
                          />
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-form>
          </div>
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="submitDispatch">提交批量派车</el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </div>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout } from 'p8-components-ui'
import { getSession } from '@/service/expands/session'

export default {
  name: 'batchDispatchDetailPage',
  components: {
    ListLayout
  },
  props: {
    row: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    pendingDispatchList() {
      if (!Array.isArray(this.row) || this.row.length === 0) {
        return []
      }
      return this.row.filter((item) => item.APPROVE_STATUS === '3')
    },
    filteredRow() {
      if (!Array.isArray(this.row) || this.row.length === 0) {
        return []
      }
      return this.row.map((item) => {
        const applicantName = item.APPLICANTNAMECHINESE || item.APPLICANTNAME || item.USECARNAME || ''
        const carDate = item.DATE || item.DATEFORMAT || ''
        return {
          ID: item.ID,
          DATA_ID: item.DATA_ID,
          APPLICANTNAME: applicantName,
          APPLICANT_DEPT: item.APPLICANT_DEPT || '',
          APPLICANT_DATE: item.APPLICANT_DATE || '',
          DATE: carDate,
          RETURN_TIME: item.RETURN_TIME || '',
          DEPART: item.DEPART || '',
          DESTINATION: item.DESTINATION || '',
          REASON: item.REASON || '',
          METHOD: item.METHOD || '1',
          APPROVE_STATUS: item.APPROVE_STATUS || '',
          APPLICANT: item.APPLICANT || '',
          CREATE_BY: item.CREATE_BY || '',
          ITEM_CREATE_TIME: item.ITEM_CREATE_TIME || ''
        }
      })
    }
  },
  data() {
    return {
      isMounted: false,
      tableMaxHeight: 200,
      driverOptions: [],
      treeData: [],
      carOptions: [],
      defaultTreeProps: {
        children: 'children',
        label: 'NAME'
      },
      dispatchForm: {
        carUsers: [],
        driver: '',
        plateNumber: ''
      },
      rules: {
        driver: [{ required: true, message: '请选择司机', trigger: 'change' }],
        plateNumber: [{ required: true, message: '请选择车牌号', trigger: 'change' }]
      },
      carUserRules: [
        {
          validator: (rule, value, callback) => {
            if (!value || !value.length) {
              callback(new Error('请选择用车人'))
              return
            }
            callback()
          },
          trigger: 'change'
        }
      ]
    }
  },
  mounted() {
    this.isMounted = true
    this.initCarUsers()
    this.getDriverList()
    this.getCarList()
    this.getUseCarUser()
  },
  methods: {
    getDriverList() {
      const params = { role: '司机' }
      this.$api['baseData.searchByName'](params).then((res) => {
        if (res && res.length) {
          this.driverOptions = res.map((item) => ({
            label: item.name || item.NAME || item.userName || '',
            value: item.id || item.ID || item.userId || ''
          }))
        }
      })
    },

    getCarList() {
      const params = {
        reportId: 'a402ac13e9d0b0c0d625f8ee2722f3ed'
      }
      this.$api['carRequest.platformApi'](params).then((res) => {
        this.carOptions = res.records || []
      })
    },

    getUseCarUser() {
      const params = {
        id: '55791dba230e63aa8ce8af4a49a178f6',
        param: {},
        sqlParam: {},
        reportParam: {},
        permissionVo: {
          router: 'sendCarMenu',
          resourceId: '227c23baf09103154e850542c12d7304'
        }
      }

      this.$api['carRequest.platSelectApi'](params).then((res) => {
        const list = Array.isArray(res) ? res : (res && res.data) || []
        this.treeData = this.buildTree(list)
      })
    },

    buildTree(list, idKey = 'ID', parentKey = 'PARENTID', childrenKey = 'children') {
      const map = {}
      const tree = []

      list.forEach((item) => {
        map[item[idKey]] = { ...item }
      })

      list.forEach((item) => {
        const node = map[item[idKey]]
        const parentId = item[parentKey]

        if (parentId === null || parentId === undefined || parentId === '' || parentId === 0 || parentId === '0') {
          tree.push(node)
        } else if (map[parentId]) {
          if (!map[parentId][childrenKey]) {
            map[parentId][childrenKey] = []
          }
          map[parentId][childrenKey].push(node)
        } else {
          tree.push(node)
        }
      })

      const cleanChildren = (nodes) => {
        nodes.forEach((node) => {
          if (node[childrenKey] && node[childrenKey].length > 0) {
            cleanChildren(node[childrenKey])
          } else {
            delete node[childrenKey]
          }
        })
      }
      cleanChildren(tree)

      return tree
    },

    handleTreeCheck(checkedState, index) {
      const checkedNodes = (checkedState.checkedNodes || []).filter((node) => !node.children || !node.children.length)
      const value = checkedNodes.map((node) => node.ID)
      const selectedUsers = checkedNodes.map((node) => ({
        id: node.ID,
        name: node.NAME
      }))

      this.$set(this.dispatchForm.carUsers, index, {
        ...this.dispatchForm.carUsers[index],
        value,
        userName: selectedUsers.map((item) => item.name).join('、'),
        selectedUsers
      })
      this.$refs.dispatchForm.validateField(`carUsers.${index}.value`)
    },

    handleRemoveTag(removedId, index) {
      const carUser = this.dispatchForm.carUsers[index]
      const value = carUser.value.filter((id) => id !== removedId)
      const selectedUsers = carUser.selectedUsers.filter((item) => item.id !== removedId)

      this.$set(this.dispatchForm.carUsers, index, {
        ...carUser,
        value,
        selectedUsers,
        userName: selectedUsers.map((item) => item.name).join('、')
      })

      const tree = this.getCarUserTree(index)
      if (tree) {
        tree.setCheckedKeys(value)
      }
    },

    handleSelectVisibleChange(visible, index) {
      if (!visible) {
        return
      }
      this.$nextTick(() => {
        const tree = this.getCarUserTree(index)
        if (tree) {
          tree.setCheckedKeys(this.dispatchForm.carUsers[index].value || [])
        }
      })
    },

    getCarUserTree(index) {
      const treeRef = this.$refs.carUserTree
      if (!treeRef) {
        return null
      }
      return Array.isArray(treeRef) ? treeRef[index] : treeRef
    },

    initCarUsers() {
      const pendingDispatch = this.pendingDispatchList
      if (pendingDispatch.length === 0) {
        return
      }
      this.dispatchForm.carUsers = pendingDispatch.map((item) => ({
        dataId: item.DATA_ID || item.ID,
        applicantName: item.APPLICANTNAME || item.APPLICANTNAMECHINESE || '',
        value: [],
        userName: '',
        selectedUsers: []
      }))
    },

    getStatusText(status) {
      const statusMap = {
        0: '未审批',
        1: '审批中',
        2: '未通过',
        3: '待派车',
        4: '已派车',
        5: '用车完成'
      }
      return statusMap[status] || '未知'
    },

    getStatusColor(status) {
      const colorMap = {
        0: '#909399',
        1: '#e6a23c',
        2: '#f56c6c',
        3: '#67c23a',
        4: '#67c23a',
        5: '#909399'
      }
      return colorMap[status] || '#909399'
    },

    getCurrentUserId() {
      const info = getSession('info') || getSession('userInfo') || this.$store.getters.userInfo || {}
      return info.id || this.$store.getters.userId || ''
    },

    getCurrentDate() {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },

    submitDispatch() {
      this.$refs.dispatchForm.validate((valid) => {
        if (!valid) {
          this.$message.error('请完善必填信息')
          return false
        }

        const allSelected = this.dispatchForm.carUsers.every((item) => item.value && item.value.length)
        if (!allSelected) {
          this.$message.warning('请为所有申请单选择用车人')
          return
        }

        const pendingDispatch = this.pendingDispatchList
        if (!pendingDispatch.length) {
          this.$message.warning('没有可派车的申请单')
          return
        }

        const list = pendingDispatch.map((item, index) => ({
          id: item.ID,
          passenger: this.dispatchForm.carUsers[index].value || []
        }))

        const params = {
          list,
          carId: this.dispatchForm.plateNumber,
          driver: this.dispatchForm.driver,
          dispatch: this.getCurrentUserId(),
          date: this.getCurrentDate(),
          mergeId: list[0].id
        }

        this.$api['carRequest.dispatch'](params).then(() => {
          this.$message.success(`批量派车成功，共处理${list.length}笔申请`)
          this.$emit('close')
          this.$emit('saved')
        })
      })
    },

    resetForm() {
      this.$refs.dispatchForm.resetFields()
      this.initCarUsers()
      this.$nextTick(() => {
        const treeRef = this.$refs.carUserTree
        if (!treeRef) {
          return
        }
        const trees = Array.isArray(treeRef) ? treeRef : [treeRef]
        trees.forEach((tree) => {
          tree.setCheckedKeys([])
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .list-layout {
  height: 100%;

  .list-main.fullHeight {
    height: 100%;
    overflow: hidden;
  }
}

.dispatch-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 68vh;
  padding: 12px 16px 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.dispatch-scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
}

.apply-table-section {
  margin-bottom: 16px;
  background: #fff;
  padding: 12px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dispatch-form-section {
  background: #fff;
  padding: 12px 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.car-user-section {
  margin-bottom: 6px;
  padding: 10px 12px;
  background: #fafbfc;
  border-radius: 4px;
  border: 1px solid #e8eaed;

  .car-user-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 10px 0;
    padding-left: 8px;
    border-left: 3px solid #1890ff;
  }
}

.form-actions {
  flex-shrink: 0;
  text-align: center;
  margin-top: 12px;
  padding-bottom: 4px;

  .el-button {
    margin: 0 10px;
    min-width: 120px;
  }
}

::v-deep .el-table {
  .el-table__header th {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
}

::v-deep .dispatch-scroll-body .el-form-item {
  margin-bottom: 16px;
}

::v-deep .el-date-picker,
::v-deep .el-input {
  width: 100%;
}

::v-deep .car-user-select {
  width: 360px;
  max-width: 100%;
}

::v-deep .tree-select-popper {
  min-width: 360px !important;

  .el-select-dropdown__wrap {
    max-height: 350px !important;
  }

  .el-select-dropdown__item {
    padding: 0;
    height: auto;
    line-height: normal;
    background-color: #fff;

    &.selected {
      font-weight: normal;
      color: inherit;
    }

    &:hover {
      background-color: #fff;
    }

    .el-tree {
      padding: 8px 0;

      .el-tree-node__content {
        height: 34px;
        line-height: 34px;
      }

      .is-current > .el-tree-node__content {
        background-color: #ecf5ff;

        .el-tree-node__label {
          color: #409eff;
        }
      }
    }
  }
}
</style>
