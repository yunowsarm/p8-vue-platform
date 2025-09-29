<script>
import aceEdit from 'packages/Base/Components/ace.vue'

export default {
  name: 'BodyParams',
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
        format:'',
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
      this.$emit('saveTabParam','bodyParams',this.formData)
    }
  }
}
</script>

<template>
  <div id="bodyParams">
    <el-form label-width="100px">
      <el-form-item label="格式">
        <el-radio-group v-model="formData.format">
          <el-radio-button label="None"></el-radio-button>
          <el-radio-button label="Json"></el-radio-button>
          <el-radio-button label="XML"></el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Schema">
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
#bodyParams{
padding: 32px;
}
</style>
