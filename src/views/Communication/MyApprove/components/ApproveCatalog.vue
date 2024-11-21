<template>
  <tree class="customTree"
        :data="treeData"
        :node-slot="true"
        ref="tree"
        @select="selectNode"
        :tree-config="treeCfg">
    <template #tree="{ node }">
      <span class="node-span"
            :class="{ 'node-left': !node.childNodes.length }">
        <span v-if="node.data.id === 'APPROVE_TYPE01' || node.data.id === 'APPROVE_TYPE_01' || node.data.id === 'APPROVE_TYPE_02'"
              style="display: inline-block;"><i class="p8"
             :class="'p8 icon-zong'"></i></span>
        <span v-else
              style="display: inline-block;"><i class="p8"
             :class="'icon-fenzu'"></i></span>
        <span class="node-label">{{ node.data.cmeaning }}</span>
        <span class="node-number">({{ catalogCount(node.data.id).num }})</span>
      </span>
    </template>
  </tree>
</template>

<script>
import { P8Tree as commonTree } from 'p8-components-ui'
import { generateTree } from '@/utils/generateTree'
import { deepClone } from '@/utils/common'
// let rootCatalog = {
//   id: '',
//   cmeaning: '所有消息',
//   icon: 'icon-plan-type-completion'
// }
export default {
  name: 'ApproveCatalog',
  props: {
    searchParams: {
      type: Object,
      default: () => { }
    },
    msgCount: {
      type: Array,
      default: () => []
    },
    unReadTotal: {
      type: Number,
      default: 0
    },
    selectNodeId: {
      type: String,
      default: ''
    }
  },
  components: {
    tree: commonTree
  },
  data () {
    return {
      messageCatalogApi: 'processApproval.getCatalog',
      catalogData: [],
      treeCfg: {
        indent: 48,
        'highlight-current': true,
        'current-node-key': this.searchParams.msgCatalog
      }
    }
  },
  watch: {
    changedMsg: {
      deep: true,
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          newVal.forEach((item, index, arr) => {
            const catalog = this.catalogData.find((value) => value.id === item.id)
          })
        }
      }
    }
    // selectNodeId (val, oldVal) {
    //   const _this = this
    //   setTimeout(() => {
    //     _this.selectNode({ id: val })
    //   }, 300)
    // }
  },
  computed: {
    treeData () {
      if (this.selectNodeId !== 'APPROVE_TYPE01') {
        const messageData = []
        const catalogData = deepClone(this.catalogData)
        catalogData.map((item) => {
          if (item.id === this.selectNodeId) {
            item.cparentid = null
            messageData.push(item)
          } else if (item.cparentid === this.selectNodeId) {
            messageData.push(item)
          }
        })
        return generateTree(messageData, 'cparentid')
      } else {
        const resultData = generateTree(this.catalogData, 'cparentid')
        if (resultData && resultData.length > 0) {
          resultData[0].cmeaning = '我的审批'
        }
        return resultData
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.$refs.tree.$refs.tree.setCurrentKey(this.searchParams.msgCatalog);
    });
    this.loadCatalog()
  },
  methods: {
    loadCatalog (queryParam) {
      const _this = this
      this.$api[this.messageCatalogApi]({ dicType: 'APPROVE_TYPE' }).then((res) => {
        _this.catalogData = res
      })
    },

    selectNode (nodeData) {
      let ids = ['APPROVE_TYPE_01_01', 'APPROVE_TYPE_01_02', 'APPROVE_TYPE_02_01', 'APPROVE_TYPE_02_02']
      if (ids.includes(nodeData.id)) {
        this.treeCfg['current-node-key'] = nodeData.id
        this.$emit('selectNode', nodeData)
      } else {
        this.$message.warning('请选择子节点')
      }
    },
    catalogCount (catalogId) {
      let countObj
      if (catalogId === '') {
        countObj = { noread: this.unReadTotal }
      } else {
        countObj = this.msgCount.find((value) => value.value === catalogId)
      }
      const o = { ...{ read: 0, noread: 0, num: 0 }, ...countObj }
      return o
    }
  }
}
</script>

<style scoped lang="scss">
.node-label {
  display: inline-block;
  width: 70px;
}
.customTree ::v-deep {
  height: 100%;
  .commonTree {
    height: 100%;
  }
  .commonTree.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    color: #1890ff;
    font-weight: unset;
  }
  .commonTree .el-tree-node__content:hover {
    color: #1890ff;
    font-weight: unset;
  }
}
</style>
