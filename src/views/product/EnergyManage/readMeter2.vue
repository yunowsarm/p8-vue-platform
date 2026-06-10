<template>
  <div>
    <span class="show-type">抄表月度：2026-09</span>
    <P8TableRender ref="tableRender"
                   class="planLayout"
                   :code="tableCode"
                   :reportParam="reportParam"
                   :west-tree-param="provideParams.searchParams">
    </P8TableRender>
  </div>
</template>

<script>
export default {
  name: 'demandChart',
  props: {
    drillParam: {
      type: Object
    }
  },
  data () {
    return {
      tableCode: 'readElectricityMeter',
      reportParam: {},
      provideParams: {
        searchParams: {}
      }
    }
  },
  components: {
  },
  computed: {},
  beforeMount () { },
  mounted () {

  },
  destroyed () {
  },
  methods: {
  },
  watch: {

  }
}

</script>
<style lang='scss' scoped>
.show-type {
  position: absolute;
  top: 20px;
  z-index: 1;
  left: 13%;
}
</style>
