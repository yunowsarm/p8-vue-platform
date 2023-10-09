<template>
  <list-layout :header-visible="false">
    <template #center>
      <tabs-navigation-preview ref="tabsNavigation" :layout-config="layoutConfig" :data-view-id="dataViewId" @tabClick="tabClick" :prop-param="propParam" v-on="$listeners"></tabs-navigation-preview>
    </template>
  </list-layout>
</template>
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
