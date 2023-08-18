<template>
  <tree class="customTree" :data="treeData" :node-slot="true" @select="selectNode" :tree-config="treeCfg">
    <template #tree="{ node }">
      <span class="node-span" :class="{'node-left': !node.childNodes.length }">
        <span style="display:inline-block;width:20px;"><i class="p8 " :class="node.data.icon ? node.data.icon : 'icon-fenzu'"></i></span>
        <span class="node-label">{{ node.data.cmeaning }}</span>
        <span class="node-number">({{ catalogCount(node.data.id).noread }})</span>
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
  name: 'MessageCatalog',
  props: {
    searchParams: {
      type: Object,
      default: () => {}
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
  data() {
    return {
      messageCatalogApi: 'userMessage.catalog',
      catalogData: [],
      treeCfg: {
        // 'icon-class': 'noIcon',+
        indent: 48,
        'highlight-current': true,
        'current-node-key': this.selectNodeId
      }
    }
  },
  watch: {
    changedMsg: {
      deep: true,
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          newVal.forEach((item, index, arr) => {
            let catalog = this.catalogData.find((value) => value.id === item.id)
            console.log('catalog', catalog)
            // catalog.
          })
        }
      }
    },
    selectNodeId(val, oldVal) {
      let _this = this
      setTimeout(() => {
        _this.selectNode({ id: val })
      }, 300)
    }
  },
  computed: {
    treeData() {
      if (this.selectNodeId !== '18') {
        let messageData = []
        let catalogData = deepClone(this.catalogData)
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
        this.catalogData.map(el => {el.icon ? el.icon : 'icon-fenzu'})
        let resultData = generateTree(this.catalogData, 'cparentid')
        if (resultData && resultData.length > 0) {
          resultData[0].cmeaning = '所有消息'
          resultData[0].icon = 'icon-zong'
        }
        return resultData
      }
    },
    catalogCount() {
      return function (catalogId) {
        let countObj
        if (catalogId === '') {
          countObj = { noread: this.unReadTotal }
        } else {
          countObj = this.msgCount.find((value) => value.id === catalogId)
        }
        let o = { ...{ read: 0, noread: 0 }, ...countObj }
        return o
      }
    }
  },
  mounted() {
    this.loadCatalog()
  },
  methods: {
    loadCatalog(queryParam) {
      let _this = this
      this.$api[this.messageCatalogApi](queryParam).then((res) => {
        _this.catalogData = res
      })
    },

    selectNode(nodeData) {
      this.treeCfg['current-node-key'] = nodeData.id
      this.$emit('selectNode', nodeData)
    }
  }
}
</script>

<style scoped lang="scss">
.node-left{
  padding-left: 20px;
}
.node-label {
  display: inline-block;
  width: 70px;
}
.customTree /deep/{
  .commonTree.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content{
    color: #1890FF;
    font-weight: unset;
  }
  .commonTree .el-tree-node__content:hover{
    color: #1890FF;
    font-weight: unset;
  }
}
</style>
