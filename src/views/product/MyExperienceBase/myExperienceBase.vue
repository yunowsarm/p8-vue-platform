<template>
  <common-dialog title="我的经验库"
                 :visible="visible"
                 width="80%"
                 class="experience_dialog"
                 @close="handleCancel"
                 :show-handle-btn="false"
                 :dialog-height="450">
    <template #dialog>
      <normal-layout :header-visible='false'
                     :splitDefaultLeftWidth='26'>
        <template #north>
        </template>
        <template #west>
          <tree class="customTree"
                :data="treeData"
                :node-slot="true"
                ref="tree"
                @select="selectNode"
                :tree-config="treeCfg">
            <template #tree="{ node }">
              <div class="node-span"
                   :class="{ 'node-left': !node.childNodes.length}">
                <div>
                  <span style="display: inline-block; width: 20px">
                    <i class="p8"
                       :class="node.data.icon ? node.data.icon : 'icon-fenzu'"></i>
                  </span>
                  <span class="node-label"
                        :title="node.data.cmeaning">{{ node.data.cmeaning }}</span>
                </div>
                <div>
                  <el-button type="text"
                             icon="el-icon-plus"
                             :disabled='!node.childNodes.length'
                             @click="addClass"></el-button>
                  <el-button type="text"
                             icon="el-icon-minus"
                             @click="deleteClass"></el-button>
                </div>
              </div>
            </template>
          </tree>
        </template>
        <template #center>
          <div style='padding: 10px'>
            <el-button type="primary"
                       :disabled='isManage'
                       @click="exportExperience">导入</el-button>
            <el-button type="primary"
                       @click="copyExperience">复制到粘贴板</el-button>
          </div>
          <common-table ref="table"
                        :comp="comp"
                        :columns="columns"
                        :params="tableParam"
                        api="formGenerator.tableApply"
                        :table-refresh="tableRefresh"
                        @selection-change="handleSelectionChange"></common-table>
        </template>
        <template #drawer-panel>
        </template>
      </normal-layout>
    </template>
  </common-dialog>
</template>
<style lang="scss" scoped>
.experience_dialog ::v-deep {
  .el-dialog {
    .el-dialog__body {
      padding: 0px !important;
      .dialogBody {
        .normal-layout {
          padding-left: 0px !important;
          margin: 6px;
        }
      }
    }
  }
}
.common-table ::v-deep {
  height: calc(100% - 60px) !important;
  padding: 10px;
}
.node-span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 10px;
  // .node-label {
  //   display: inline-block;
  //   width: 120px;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  // }
}
.node-left {
  padding-left: 26px;
}
</style>
<script>
import { P8NormalLayoutV1 as NormalLayout, P8Table as CommonTable, P8Tree as commonTree, P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
import { generateTree } from '@/utils/generateTree'
import { deepClone } from '@/utils/common'
export default {
  name: 'MyExperienceBase',
  components: {
    tree: commonTree,
    NormalLayout,
    FormList,
    CommonTable,
    CommonDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    selectedTask: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isManage: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data () {
    return {
      messageCatalogApi: 'userMessage.catalog',
      catalogData: [],
      columns: [
        {
          title: '',
          width: 35,
          type: 'selection'
        },
        {
          title: '标识',
          dataIndex: 'monitors',
          align: 'left'
        },
        {
          title: '大纲',
          type: 'index',
          width: '60',
          align: 'center'
        },
        {
          title: '任务名称',
          dataIndex: 'taskName',
          align: 'left'
        },
        {
          title: '前后置',
          dataIndex: 'backAndForth',
          align: 'left'
        },
        {
          title: '工期',
          dataIndex: 'durations',
          align: 'center'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '150',
          scopedSlots: {
            customRender: 'operation'
          },
          align: 'center'
        }
      ],
      tableParam: {},
      comp: this,
      treeCfg: {
        'indent': 48,
        'highlight-current': true
      }
    }
  },
  created () {
    this.loadCatalog()
  },
  computed: {
    treeData () {
      // if (this.selectNodeId !== '18') {
      //   const messageData = []
      //   const catalogData = deepClone(this.catalogData)
      //   catalogData.map((item) => {
      //     if (item.id === this.selectNodeId) {
      //       item.cparentid = null
      //       messageData.push(item)
      //     } else if (item.cparentid === this.selectNodeId) {
      //       messageData.push(item)
      //     }
      //   })
      //   return generateTree(messageData, 'cparentid')
      // } else {
      this.catalogData.map((el) => {
        el.icon ? el.icon : 'icon-fenzu'
      })
      const resultData = generateTree(this.catalogData, 'cparentid')
      if (resultData && resultData.length > 0) {
        resultData[0].cmeaning = '所有消息所有消息'
        resultData[0].icon = 'icon-zong'
      }
      console.log(resultData, 'resultData');
      return resultData
      // }
    },
  },
  methods: {
    exportExperience () {
      this.$emit('exportExperienceBase')
    },
    copyExperience () {
      console.log("This is copy")
    },
    addClass () {
      console.log("This is add")
    },
    deleteClass () {
      console.log("This is delete")
    },
    loadCatalog (queryParam) {
      const _this = this
      this.$api[this.messageCatalogApi](queryParam).then((res) => {
        _this.catalogData = res
      })
    },
    selectNode (nodeData) {
      this.treeCfg['current-node-key'] = nodeData.id
    },
    tableRefresh (param) {
      param
        .then(() => {
          console.log('异步成功后端做的操作')
        })
        .catch(() => {
          console.log('异步失败的操作')
        })
    },
    handleSelectionChange (val) {
      if (this.selectType === 'single') {
        if (val.length >= 2) {
          // 删除索引为0的
          // console.log(val.splice(0,val.length-1),'被删除的')
          let arrays = val.splice(0, val.length - 1)
          arrays.forEach((row) => {
            this.$refs.table.$refs.table.toggleRowSelection(row) // 除了当前点击的，其他的全部取消选中
          })
        }
      }
      this.$emit('selection-change', val)
    },
    handleCancel () {
      this.$emit('handleCancel')
    },
    customValidate (saveParams) {
      this.$emit('handleOk', saveParams.name)
    }
  }
}
</script>
