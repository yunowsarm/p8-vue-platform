<script>
export default {
  name: 'Server',
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      formData: {}
    }
  },
  mounted() {
    this.formData = this.data || {}
  },
  methods: {
    saveTableData() {
      this.$emit('saveTabParam', 'serviceParam', this.formData)
    }
  }
}
</script>

<template>
  <div style="padding: 30px">
    <el-form :model="formData" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Endpoint URL">
            <el-input v-model="formData.endpointUrl" @input="saveTableData" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Namespace">
            <el-input v-model="formData.Namespace" @input="saveTableData" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="serviceName">
            <el-input v-model="formData.serviceName" @input="saveTableData" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="portName">
            <el-input v-model="formData.portName" @input="saveTableData" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="OperationName">
            <el-input v-model="formData.operationName" @input="saveTableData" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Prefix">
            <el-input v-model="formData.prefix" @input="saveTableData" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="inputName">
            <el-input v-model="formData.inputName" @input="saveTableData" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="inputType">
            <el-select v-model="formData.inputType" placeholder="请选择" @change="saveTableData" style="width: 100%;">
              <el-option label="string" value="string"></el-option>
              <el-option label="document" value="document"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped lang="scss"></style>
