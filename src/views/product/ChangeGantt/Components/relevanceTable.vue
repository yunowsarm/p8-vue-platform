<template>
  <div style="height: 100%;">
    <vxe-table ref="xTableData"
               style="height: 48%;"
               :comp="comp"
               :columns="columns"
               :params="tableParam"
               :table-config="tableConfig"
               :tree-config="treeConfig"
               :pagination="false"
               :refreshShow="false"
               :bubblingType="false"
               :noApiTableData="noApiTableData"
               @row-click="handleSelectionChange">
      <template #monitorPoints="{scope}">
        <span v-if="scope.row.monitorPoints">
          <i v-for="item in handleRowMointor(scope.row)"
             :key="item.id"
             :class="`${item.icon}`"></i>
        </span>
      </template>
    </vxe-table>
    <div style="height: 4%;">
      <el-button style="margin-left: 20px;"
                 type="primary"
                 :disabled="!selectRecord.parent || selectRecord.isLeaf===1 ||selectRecord.managerStatus === '6406' || selectRecord.managerStatus === '6405'||selectRecord.managerStatus === '6409'"
                 @click="relevanceClick">关联/取消</el-button>
    </div>
    <vxe-table ref="xDemandTable"
               :comp="comp"
               style="height: 48%;"
               :columns="columnsDemand"
               :params="tableParamDemand"
               :table-config="tableConfig"
               :checkboxConfig="checkboxConfig"
               :is-smart-form="true"
               :pagination="false"
               :refreshShow="false"
               api="demandManagement.getRequirementList"
               @selection-change="handleSelectionChangeDemand">
      <template #relationProject="{scope}">
        <i v-if="scope.row.relationProject === 1"
           class='p8 icon-a-xuqiu1'
           style="font-size: 30px;"
           title="已关联项目"></i>
      </template>
    </vxe-table>
  </div>
</template>

<script>
import { P8VxeTable as VxeTable } from 'p8-components-ui'
export default {
  name: 'Index',
  components: {
    'vxe-table': VxeTable
  },
  props: {
    planInfoId: {
      type: String
    },
    mainGanttName: {
      type: String
    },
    temporaryDatas: {
      type: Array
    },
    taskList: {
      type: Array
    },
    monitorPointDatas: {
      type: Array
    },
    resourcesData: {
      type: Array
    },
    selectTaskId: {
      type: String
    }
  },
  data () {
    return {
      comp: this,
      columns: [
        {
          title: '大纲号',
          type: 'seq',
          headeralign: 'center',
          dataIndex: 'taskLevel',
          width: '100px'
        },
        {
          title: '进度',
          dataIndex: 'statusDisplay',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '状态',
          dataIndex: 'managerStatusDisplay',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '关联标识',
          dataIndex: 'monitorPoints',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px',
          scopedSlots: {
            customRender: 'custom'
          }
        },
        {
          title: '任务类型',
          dataIndex: 'taskTypeDisplay',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '任务名称',
          dataIndex: 'name',
          sortable: false,
          align: 'left',
          treeNode: true,
          headerAlign: 'center'
        },
        {
          title: '责任人',
          dataIndex: 'userName',
          sortable: false,
          align: 'center',
          headeralign: 'center',
          width: '100px'
        },
        {
          title: '部门',
          dataIndex: 'deptName',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '计划开始时间',
          dataIndex: 'start_date',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '计划结束时间',
          dataIndex: 'end_date',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        }
      ],
      columnsDemand: [
        {
          title: '',
          width: 60,
          align: 'center',
          type: 'checkbox'
        },
        {
          title: '序号',
          type: 'index',
          headeralign: 'center',
          width: '60px'
        }, {
          title: '是否已关联项目',
          dataIndex: 'relationProject',
          sortable: false,
          align: 'center',
          headerAlign: 'center',
          scopedSlots: {
            customRender: 'custom'
          }
        },
        {
          title: '状态',
          dataIndex: 'demandStatusDisplay',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '标题',
          dataIndex: 'title',
          sortable: false,
          align: 'left',
          headerAlign: 'center'
        },
        {
          title: '来源渠道',
          dataIndex: 'source',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
        {
          title: '录入时间',
          dataIndex: 'createTime',
          sortable: false,
          align: 'center',
          treeNode: true,
          headerAlign: 'center'
        },
        {
          title: '收集人',
          dataIndex: 'createBy',
          sortable: false,
          align: 'center',
          headerAlign: 'center'
        },
      ],
      tableParam: {
        planInfoId: this.planInfoId
      },
      tableParamDemand: {},
      tableConfig: {
        'highlight-current-row': true
      },
      treeConfig: {
        transform: true,
        expandAll: true,
        trigger: 'default',
        rowField: 'id',
        parentField: 'parent',
        indent: 40,
      },
      checkboxConfig: {
        showHeader: false
      },
      selectRecord: {},
      selectRecords: [],
      noApiTableData: [],
      taskDatas: [],
      taskId: ''
    }
  },
  mounted () {
    if (this.temporaryDatas.length > 0) {
      this.taskDatas = this.temporaryDatas
    }
    this.getList()
  },
  methods: {
    getList () {
      console.log(this.taskList, '====================this.taskList');
      this.taskList.forEach(item => {
        item.children = undefined
        // if (item.requirementIds.length > 0) {
        //           if (item.monitorPoints.indexOf('1017') === -1) {
        //             if (item.monitorPoints.indexOf(',') === -1) {
        //               item.monitorPoints = '1017'
        //             item.monitorpointIconArray = item.monitorpointIconArray + ',p8 icon-a-xuqiu1'
        //           // task.monitorPointDisplayArray = task.monitorPointDisplayArray + ',需求'
        //             } else {

        //             }
        //           }
        //         }
        if (item.monitorPoints) {
          if (item.monitorPoints.indexOf(',') !== -1) {
            // 分割字符串成数组
            const parts = item.monitorPoints.split(',');
            this.monitorPointDatas.forEach(el => {
              parts.forEach(row => {
                if (row === el.id) {
                  if (item.monitorpointIconArray) {
                    if (item.monitorpointIconArray.indexOf('p8 icon-a-xuqiu1') === -1) {
                      item.monitorpointIconArray = item.monitorpointIconArray + ',' + el.icon
                    }
                    // 分割字符串成数组
                    const parts = item.monitorpointIconArray.split(',');
                    // 选择需要的部分
                    const uniqueArray = [...new Set(parts)];
                    // 转换为字符串，并用逗号分隔
                    item.monitorpointIconArray = uniqueArray.join(',');
                  } else {
                    item.monitorpointIconArray = el.icon
                  }
                }
              })
            })
          } else {
            this.monitorPointDatas.forEach(el => {
              if (item.monitorPoints === el.id) {
                item.monitorpointIconArray = el.icon
              }
            })
          }
        }
        if (item.owner_id) {
          this.resourcesData.forEach(el => {
            if (item.owner_id === el.id) {
              item.userName = el.name
              item.deptName = el.deptName
            }
          })
        }
      })
      this.noApiTableData = this.taskList
      let row = {}
      this.taskList.forEach(item => {
        if (item.id === this.selectTaskId) {
          row = item
        }
      })
      let that = this
      setTimeout(() => {
        that.$refs.xTableData.$refs.table.setCheckboxRow(row, true);
        that.$refs.xTableData.$refs.table.setCurrentRow(row)
        that.$refs.xTableData.$refs.table.scrollToRow(row)
      }, 1000)
    },
    handleRowMointor (row) {
      if (row && row.monitorPoints) {
        let monitorPoints = row.monitorPoints.split(',')
        // let monitorPointDisplayArray = row.monitorPointDisplayArray.split(',')
        let monitorpointIconArray = row.monitorpointIconArray.split(',')
        let mointIcon = []
        monitorPoints.forEach((item, index) => {
          mointIcon.push({
            id: item,
            icon: monitorpointIconArray[index],
            // name: monitorPointDisplayArray[index]
          })
        })
        return mointIcon
      }
    },
    handleSelectionChange (val) {
      console.log(this.selectRecords, '================= this.selectRecords');
      console.log(val, '================= this.val');
      this.selectRecords = []
      this.selectRecord = val
      let selectData = this.$refs.xDemandTable.$refs.table.data
      this.$refs.xDemandTable.$refs.table.clearCheckboxRow()
      let falg = true
      // 修改过需求从存储里获取
      if (this.taskDatas.length > 0) {
        this.taskDatas.forEach(item => {
          // 判断当前行是否修改过
          if (val.id === item.taskId) {
            falg = false
            item.requirementIds.forEach(el => {
              selectData.forEach((item, index) => {
                if (el === item.id) {
                  this.selectRecords.push(item.id)
                  this.$refs.xDemandTable.$refs.table.setCheckboxRow(selectData[index], true)
                }
              })
            })
          }
        })
      }
      if (falg) {
        // 未修改过从列表获取
        this.$api['demandManagement.getRequirementByTask']({
          taskId: val.id
        }).then(res => {
          if (res) {
            res.forEach(row => {
              selectData.forEach((item, index) => {
                if (row === item.id) {
                  this.selectRecords.push(item.id)
                  this.$refs.xDemandTable.$refs.table.setCheckboxRow(selectData[index], true)
                }
              })
            })
          }
        })
      }
    },
    handleSelectionChangeDemand (rows, row, checked) {
      let that = this
      if (this.selectRecord.isLeaf === 1) {
        this.$message.warning('请选择子节点进行关联')
        that.$refs.xDemandTable.$refs.table.toggleCheckboxRow(row)
        return false
      }
      if (checked) {
        if (row.relationProject === 0) {
          that.$confirm('该条需求未被项目关联，继续操作将会追加与项目的关联，请确认！', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.selectRecords = []
              rows.forEach(item => {
                this.selectRecords.push(item.id)
              })
            }).catch((e) => {
              that.$refs.xDemandTable.$refs.table.toggleCheckboxRow(row)
            })
        } else {
          this.selectRecords = []
          rows.forEach(item => {
            this.selectRecords.push(item.id)
          })
        }
      } else {
        this.selectRecords = []
        if (rows.length > 0) {
          rows.forEach(item => {
            this.selectRecords.push(item.id)
          })
        }
      }
    },
    async relevanceClick () {
      let monitorManagerRequests = []
      let result = null
      let that = this
      let falg = true
      this.taskId = JSON.parse(JSON.stringify(this.selectRecord.id))
      await this.$api['planGanttManager.getTaskMonitorByTaskId']({ taskId: this.selectRecord.id }).then((res) => {
        if (res && res.monitorManagerResponses) {
          monitorManagerRequests = res.monitorManagerResponses
        }
        // 给父级表格打标识
        let tableData = that.$refs.xTableData.$refs.table.data[0]
        // 递归生成节点及子节点数据
        const findChildren = (tree) => {
          tree.forEach((task) => {
            if (task.id === that.selectRecord.id) {
              // 判断列表是否有标识
              if (task.monitorPoints) {
                // 判断是否存在需求标识
                if (task.monitorPoints.indexOf('1017') === -1) {
                  // 判断是新增需求
                  if (this.selectRecords.length > 0) {
                    task.monitorPoints = task.monitorPoints + ',1017'
                    task.monitorpointIconArray = task.monitorpointIconArray + ',p8 icon-a-xuqiu1'
                    // task.monitorPointDisplayArray = task.monitorPointDisplayArray + ',需求'
                    task.requirementIds = this.selectRecords
                    task.monitors.push({
                      issubmit: true,
                      logBeginTime: "",
                      logEndTime: "",
                      monitorId: '1017',
                      taskId: task.id
                    })
                  }
                } else {
                  // 判断是新增需求
                  if (this.selectRecords.length === 0) {
                    // 截取需求标识
                    if (task.monitorPoints.startsWith('1017')) {
                      if (task.monitorPoints.indexOf(',') !== -1) {
                        task.monitorPoints = task.monitorPoints.slice(5, task.monitorPoints.length)
                        // task.monitorPointDisplayArray = task.monitorPointDisplayArray.slice(3, task.monitorPointDisplayArray.length)
                        task.monitorpointIconArray = task.monitorpointIconArray.slice(17, task.monitorpointIconArray.length)
                        task.requirementIds = this.selectRecords
                      } else {
                        task.monitorPoints = ''
                        task.monitorpointIconArray = ''
                        // task.monitorPointDisplayArray = ''
                        task.requirementIds = this.selectRecords
                      }
                    } else if (task.monitorPoints.endsWith('1017')) {
                      if (task.monitorPoints.indexOf(',') !== -1) {
                        task.monitorPoints = task.monitorPoints.slice(0, task.monitorPoints.length - 5)
                        // task.monitorPointDisplayArray = task.monitorPointDisplayArray.slice(0, task.monitorPointDisplayArray.length - 3)
                        task.monitorpointIconArray = task.monitorpointIconArray.slice(0, task.monitorpointIconArray.length - 17)
                        task.requirementIds = this.selectRecords
                      } else {
                        task.monitorPoints = ''
                        task.monitorpointIconArray = ''
                        // task.monitorPointDisplayArray = ''
                        task.requirementIds = this.selectRecords
                      }
                    } else {
                      // 分割字符串成数组
                      const parts = task.monitorPoints.split(',');
                      // 选择需要的部分
                      const result = parts.filter(item => item !== '1017')
                      // 转换为字符串，并用逗号分隔
                      task.monitorPoints = result.join(',');
                      task.requirementIds = this.selectRecords
                    }
                  }
                }
                // 没有标识
              } else {
                if (this.selectRecords.length > 0) {
                  task.monitorPoints = '1017'
                  task.monitorpointIconArray = 'p8 icon-a-xuqiu1'
                  // task.monitorPointDisplayArray = '需求'
                  task.requirementIds = this.selectRecords
                  task.monitors = [{
                    issubmit: true,
                    logBeginTime: "",
                    logEndTime: "",
                    monitorId: '1017',
                    taskId: task.id
                  }]
                } else {
                  falg = false
                }
              }
              result = task
            }
            if (task.children) {
              findChildren(task.children)
            }
          })
        }
        findChildren(tableData.children)
      })


      if (falg) {
        let taskObj = {
          taskId: this.selectRecord.id,
          requirementIds: this.selectRecords,
          taskRow: result,
          monitorManagerRequests: monitorManagerRequests
        }
        // 处理关联数据
        // 将每条任务关联的需求存储起来
        if (this.taskDatas.length === 0) {
          this.taskDatas.push(taskObj)
        } else {
          let falg = false
          // 存在则替换
          this.taskDatas.forEach((el, index) => {
            if (el.taskId === taskObj.taskId) {
              falg = true
              this.taskDatas[index] = taskObj
            }
          })
          // 不存在则添加
          if (!falg) {
            this.taskDatas.push(taskObj)
          }
        }
        // 传递给父页面
        this.$emit('closeRelevance', this.taskDatas, this.taskId)
        this.$message.success('操作成功')
      }
    }
  }
}
</script>

<style>
</style>