<template>
  <list-layout :header-visible="false">
    <template #center>
      <tabs-navigation-preview :layout-config="layoutConfig" :data-view-id="dataViewId" @tabClick="tabClick" :prop-param="propParam"></tabs-navigation-preview>
    </template>
  </list-layout>
</template>
<script>
import TabsNavigationPreview from '@/views/Framework/ComponentsMananger/Layout/Components/TabsNavigation/V1.0/view/index'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'PlanWarning',
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
        ID: this.row[0].ID,
        PROJECTID: this.row[0].PROJECTID
      },
      dataViewId: this.row[0].PROJECTID,
      layoutConfig: {
        layoutCode: 'PM_PLANNING_LAYOUT',
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
      if (tabs.index === '0') {
        this.dataViewId = this.row[0].PROJECTID
      } else {
        this.dataViewId = this.row[0].ID
      }
    }
  }
}
</script>
