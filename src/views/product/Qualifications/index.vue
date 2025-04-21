<template>
  <list-layout :header-visible="false">
    <template #center>
      <table-render
        ref="tableRender"
        code="RequirementTable"
        :headerVisible="false"
        :report-param="reportParam"
      >
      </table-render>
    </template>
  </list-layout>
</template>
<script>
import TableRender from '@/views/Framework/ComponentsMananger/Grid/Components/tableRender'
import { P8ListLayout as ListLayout } from 'p8-components-ui'
export default {
  name: 'NormalLayoutAndTree',
  components: {
    TableRender,
    ListLayout,
  },
  data () {
    return {
      reportParam: {},
    }
  },
  methods: {
  }
}
</script>
