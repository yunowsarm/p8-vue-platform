<template>
  <list-layout :header-visible="false"
               class="projectPage">
    <template #center>
      <tabs-navigation-preview ref="tabsNavigation"
                               class="tabsNavigation"
                               :layout-config="layoutConfig"
                               :data-view-id="dataViewId"
                               @tabClick="tabClick"
                               :prop-param="propParam"
                               v-on="$listeners"
                               :row="row"></tabs-navigation-preview>
    </template>
  </list-layout>
</template>
<style lang="scss" scoped>
.projectPage {
  height: 100%;
  margin: 0;
  ::v-deep .formElement {
    padding-top: 25px;
  }
  .list-main {
    padding: 0;
  }
  ::v-deep .list-main {
    padding: 0 10px;
  }
  .list-layout {
    margin: 0;
    height: 100%;
  }
}
// .tabsNavigation ::v-deep .list-main {
//   height: calc(100% - 75px) !important;
// }
</style>
<script>
import TabsNavigationPreview from '@/views/Framework/ComponentsMananger/Layout/Components/TabsNavigation/V1.0/view/index'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'ProjectInitiation',
  props: {
    thirdMenuParam: {
      type: Object,
      default: function () {
        return {}
      }
    },
    customParams: {
      type: Object,
      default: function () {
        return {}
      }
    },
    row: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    const shouldUseEmptyLogic = this.customParams && this.customParams.isEdit === false
    return {
      propParam: {
        ID: shouldUseEmptyLogic ? '' : (this.row.length ? this.row[0].ID : '')
      },
      dataViewId: shouldUseEmptyLogic ? '' : (this.row.length ? this.row[0].ID : ''),
      layoutConfig: {
        layoutCode: 'myProjectManageView',
        layoutVersion: 'latest'
      }
    }
  },
  components: {
    TabsNavigationPreview,
    ListLayout
  },
  created () {
  },
  methods: {
    tabClick (tabs) {
      if (this.row.length === 0 || (this.customParams && this.customParams.isEdit === false)) {
        this.dataViewId = this.$refs.tabsNavigation.$children && this.$refs.tabsNavigation.$children.length ? this.$refs.tabsNavigation.$children[0].configParmars.id : ''
      } else {
        this.dataViewId = this.row[0].ID
        this.$refs.tabsNavigation.$children[0].configParmars.id = this.dataViewId
      }
    }
  }
}
</script>
