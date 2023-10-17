<template>
  <list-layout :header-visible="false" class="projectPage">
    <template #center>
      <tabs-navigation-preview ref="tabsNavigation" :layout-config="layoutConfig" :data-view-id="dataViewId" @tabClick="tabClick" :prop-param="propParam" v-on="$listeners" :row="row"></tabs-navigation-preview>
    </template>
  </list-layout>
</template>
<style lang="scss" scoped>
  .projectPage {
    height: 100%;
    margin: 0;
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
</style>
<script>
import TabsNavigationPreview from '@/views/Framework/ComponentsMananger/Layout/Components/TabsNavigation/V1.0/view/index'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'ProjectInitiation',
  props: {
    row: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data() {
    return {
      propParam: {
        ID: this.row.length ? this.row[0].ID : ''
      },
      dataViewId: this.row.length ? this.row[0].ID : '',
      layoutConfig: {
        layoutCode: 'creatProject',
        layoutVersion: 'latest'
      }
    }
  },
  components: {
    TabsNavigationPreview,
    ListLayout
  },
  created() {},
  methods: {
    tabClick(tabs) {
      if (this.row.length === 0) {
        this.dataViewId = this.$refs.tabsNavigation.configParmars.id
      } else {
        this.dataViewId = this.row[0].ID
        this.$refs.tabsNavigation.configParmars.id = this.dataViewId
      }
    }
  }
}
</script>
