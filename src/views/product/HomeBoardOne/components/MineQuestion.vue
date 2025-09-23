<script>
export default {
  name: 'MineQuestion'
}
</script>

<template>
  <P8TableRender
    ref="tableRender"
    code="problemManagement"
    specialRoteName="My_ProblemList"
    :reportParam="{
      showView: {
        mode: '=',
        relation: 'and',
        value: 'showView002'
      }
    }"
  ></P8TableRender>
</template>

<style scoped lang="scss"></style>
