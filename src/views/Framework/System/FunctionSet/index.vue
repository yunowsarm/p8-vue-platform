<template>
  <normal-layout :header-visible="false">
    <template #west>
      <common-tree :data="treeData"
                   @select="onSelect"
                   :tree-param="treeParam"></common-tree>
    </template>
    <template #center>
      <component v-if="roteName"
                 :is="componentLoader"
                 :rote-name="roteName"
                 v-bind="params"
                 class="component"></component>
      <span v-else
            class="span-bg"></span>
    </template>
  </normal-layout>
</template>
<style lang="scss" scoped>
::v-deep.list-layout {
  margin: 0 !important;
  height: 100% !important;
}
::v-deep.normal-layout .normal-main .normal-center {
  padding: 0 !important;
}
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background: url(../../../../assets/image/common/table_bg.png) no-repeat;
  background-size: 300px;
  background-position: center;
  margin-top: 25px;
}
.normal-layout.normal-layoutV1.grid-table-render.table_render.component {
  padding: 0 20px !important;
  ::v-deep .normal-header {
    padding-left: 0px !important;
  }
}
</style>

<script>
import { P8NormalLayoutV1 as NormalLayout, P8Tree as CommonTree } from 'p8-components-ui'

export default {
  name: 'FunctionSetIndex',

  data () {
    return {
      treeData: [],
      selectedKeys: [],
      customUrl: '',
      compoentParam: {},
      treeParam: { roteName: this.$route.name },
      roteName: '',
      componentLoader: null,
      thirdMenu: [],
      params: {},
      availableRouter: []
    }
  },
  watch: {
    customUrl (val, oldVal) {
      const result = val
      const resultMap = this.convertJson(result[1], '&')
      this.dicType = resultMap.dicType
      this.type = resultMap.type
    }
  },
  mounted () {
    const currentName = this.$route.name
    const menuId = '09'
    let rootRouter
    this.$store.state.routers.router.map(function (item) {
      if (item.meta && item.meta.id === menuId) {
        rootRouter = item
        return false
      }
    })
    if (!rootRouter) {
      console.error('路由中未找到id为' + menuId + '的三级菜单')
    }
    this.initThirMneu(rootRouter, currentName)
    this.treeData = this.toTree(this.thirdMenu)
  },
  // componentLoader() {
  //   return this.componentLoader
  // },
  methods: {
    initThirMneu (route, currentPath) {
      const that = this
      if (route.children && route.children.length > 0) {
        route.children.map(function (item, index) {
          if (item.name === currentPath) {
            that.thirdMenu = item
          } else {
            that.initThirMneu(item, currentPath)
          }
        })
      }
    },
    convertJson (paramStr, tag) {
      const paramStrArr = paramStr.split(tag)
      const resultMap = {}
      paramStrArr.map(function (v) {
        const me = v.split('=')
        const meKey = me[0]
        const meValue = me[1]
        resultMap[meKey] = meValue
      })
      return resultMap
    },
    onSelect (node) {
      if (node.id == '0901') {
        return false
      }
      // 点击树节点，触发父页面事件
      if (!node.path && !node.isLeaf) {
        return false
      }
      this.componentLoader = node.component
      this.params = node.props
      if (node.name) {
        this.roteName = node.name
      }
    },
    toTree (data) {
      data = {
        ...data,
        label: data.meta.title,
        pId: null,
        id: data.meta.id,
        title: data.meta.title,
        key: data.meta.id
      }
      if (data.children && data.children.length) {
        data = {
          ...data,
          isLeaf: false,
          scopedSlots: { icon: 'parent' }
        }
        this.cascadeTree(data.children, data.id)
      } else {
        data = {
          ...data,
          isLeaf: true,
          slots: { icon: 'isLeaf' },
          scopedSlots: { title: 'custom' }
        }
        this.availableRouter.push(data)
      }

      return [data]
    },
    cascadeTree (data, parentId) {
      if (data && data.length) {
        data.map((item) => {
          item.label = item.meta.title
          item.pId = parentId
          item.id = item.meta.id
          item.title = item.name
          item.key = item.meta.id

          if (item && item.children && item.children.length) {
            item.isLeaf = false
            item.scopedSlots = { icon: 'parent' }
            this.cascadeTree(item.children, item.meta.id)
          } else {
            item.isLeaf = true
            item.slots = { icon: 'isLeaf' }
            item.scopedSlots = { title: 'custom' }
            this.availableRouter.push(item)
          }
        })
      }
    }
  },
  components: {
    NormalLayout,
    CommonTree
  }
}
</script>
