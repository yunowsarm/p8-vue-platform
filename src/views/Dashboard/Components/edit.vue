<template>
  <el-row style="height: 100%">
    <el-col style="height: 100%" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <div style="position: relative; height: 100%">
        <widget-grid :widget.sync="widget" :row-height="50" :margin="[5, 5]" :padding="[5, 5]" :style-object="{ height: 'calc(100% - 32px)' }" :is-static="isStatic" @saveTemplate="saveTemplate"> </widget-grid>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import widgetGrid from './widget-grid.vue'
import _cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'KanbanEidt',
  components: {
    widgetGrid
  },
  props: {
    record: {
      type: Object,
      default: () => {
        return { id: '' }
      }
    }
  },
  computed: {
    deepCopyFormData() {
      return _cloneDeep(this.formData)
    },
    deepCopyWidget() {
      return _cloneDeep(this.widget)
    }
  },
  data() {
    return {
      isStatic: false,
      widget: [],
      formData: {
        name: '',
        code: '',
        describe: '',
        indexNo: 0,
        style: '',
        queryConfig: '',
        widgets: []
      }
    }
  },
  mounted() {
    this.$nextTick(this.rendered())
  },
  methods: {
    rendered() {
      this.getFormData()
    },
    getFormData() {
      !this.record.widgets && (this.record.widgets = [])
      !this.record.style && (this.record.style = '')
      !this.record.queryConfig && (this.record.queryConfig = '')
      this.formData = _cloneDeep({ ...this.formData, ...this.record })
      if (this.formData.widgets && this.formData.widgets.length > 0) {
        this.widget = this.formData.widgets
      }
    },
    getData() {
      return this.deepCopyWidget
    },
    saveTemplate (addArr) {
      this.$emit('saveTemplate', addArr)
    }
  }
}
</script>
<style lang="scss" scoped>
.tabs {
  height: calc(100% - 42px);
  position: relative;
}
</style>
