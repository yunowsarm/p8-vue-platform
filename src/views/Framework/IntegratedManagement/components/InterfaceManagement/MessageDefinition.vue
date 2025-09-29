<script>
import aceEdit from 'packages/Base/Components/ace.vue'

export default {
  name: 'MessageDefinition',
  components: { aceEdit },
  props:{
    data:{
      type: Object,
      default: () => {}
    },
  },
  data(){
    return {
      formData:{
        format:'none',
        schema:''
      }
    }
  },
  mounted () {
    this.formData = this.data || {format:'',schema:''}
  },
  methods:{
    onSchemaModify(v){
      this.formData.schema = v
      this.saveFormData()
    },
    saveFormData(){
      this.$emit('saveTabParam','messageDefinitionParam',this.formData)
    }
  }
}
</script>

<template>
  <div id="MessageDefinition">
    <el-form label-width="100px">
      <el-form-item label="报文格式">
        <el-radio-group v-model="formData.format">
          <el-radio-button label="none">None</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.format === 'custom'" label="报文模板">
        <!-- <MonacoEditor :value="formData.schema" @update:value="onSchemaModify"></MonacoEditor> -->
        <ace-edit :value="formData.schema"
                  width="100%"
                  height="500px"
                  theme="vs"
                  @update:value="onSchemaModify"></ace-edit>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
#MessageDefinition{
  padding: 32px;
}
</style>
