<template>
  <common-dialog title="导航树设置" :visible="visible" :show-handle-btn="false" :dialog-config="dialogConfig" width="40%" @close="handleCancel" :dialog-height="dialogHeight">
    <template #dialog>
      <form-list ref="form" label-width="120px" :data-source="dataSource" :api="saveApi" :form="formData" :is-custom-validate="isCustomValidate" @custom-validate="customValidate">
        <template #reportSqlId>
          <el-select v-model="formData.reportSqlId" placeholder="请选择SQL数据视图" @change="onSqlIdChange">
            <el-option v-for="item in SqlViewData" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #optionLabelCol>
          <el-select v-model="formData.optionLabelCol" placeholder="请选择SQL数据列">
            <el-option v-for="item in sqlViewCols" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #optionValueCol>
          <el-select v-model="formData.optionValueCol" placeholder="请选择SQL数据列">
            <el-option v-for="item in sqlViewCols" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #optionPidCol>
          <el-select v-model="formData.optionPidCol" placeholder="请选择SQL数据列">
            <el-option v-for="item in sqlViewCols" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #optionUrl>
          <el-select v-model="formData.optionUrl" placeholder="请选择SQL数据列">
            <el-option v-for="item in sqlViewCols" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </template>
        <template #dataType>
          <div style="position: relative">
            <el-tooltip class="item" effect="dark" popper-class="testtooltip" placement="top">
              <div slot="content">
                <p>数据类型设置为静态数据后，在左侧导航树点击添加图标可新增静态数据。</p>
              </div>
              <i style="font-size: 20px" class="el-icon-question helpIcon"></i>
            </el-tooltip>
            <el-radio-group v-model="formData.dataType">
              <el-radio-button v-for="item in options" :key="item.value" :label="item.value" :value="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
          </div>
        </template>
      </form-list>
    </template>
  </common-dialog>
</template>

<script>
import { P8Form as FormList, P8Dialog as CommonDialog } from 'p8-components-ui'
import formConfig from './formConfig'
export default {
  name: 'TreeSettings',
  components: {
    FormList,
    CommonDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    treeSettingsParmars: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {
    'formData.navigationPattern': {
      handler(nVal) {
        if (nVal === '0') {
          this.onSqlIdChange(this.formData.reportSqlId)
        }
      }
    },
    'formData.reportSqlId': {
      handler(nVal) {
        if (nVal) {
          this.onSqlIdChange(nVal)
        }
      }
    }
  },
  computed: {
    dataSource() {
      let formDataSource
      if (this.formData.dataType) {
        switch (this.formData.dataType) {
          // 静态数据
          case '1': {
            formDataSource = this.dicForm
            break
          }
          // SQL数据视图
          case '0': {
            formDataSource = this.listSqlForm
            if (this.formData.navigationPattern === '0') {
              formDataSource = this.listSqlForm2
            }
            break
          }
        }
        return formDataSource
      } else {
        return this.dicForm
      }
    }
  },
  data() {
    return {
      saveApi: 'PersonalProcessApproval.setApproveUser',
      isCustomValidate: true,
      formData: {},
      dialogHeight: 350,
      dialogConfig: {
        modal: false
      },
      dicForm: formConfig.dicForm,
      listSqlForm: formConfig.listSqlForm,
      listSqlForm2: formConfig.listSqlForm2,
      SqlViewData: [],
      sqlViewCols: [],
      options: [
        {
          label: '静态数据',
          value: '1'
        },
        {
          label: '动态数据',
          value: '0'
        }
      ]
    }
  },
  mounted() {
    this.formData = { ...this.treeSettingsParmars }
    // 目录类或树形类
    let _this = this
    this.$api['selection.getAllSqlview']().then(function (res) {
      _this.SqlViewData = res
    })
  },
  methods: {
    customValidate(saveParams) {
      console.log(saveParams, '====saveParams')
      // if (saveParams.dataType == '1') {
      //   this.$message({type: 'warning', message: '数据类型设置为静态数据后，在左侧导航树点击添加图标可新增静态数据。'})
      // }
      this.$emit('handleOk', this.formData)
    },
    handleCancel() {
      this.$emit('close-modal')
    },
    onSqlIdChange(item) {
      let _this = this
      this.$api['selection.getSqlViewAllColumn']({ id: item }).then(function (res) {
        _this.sqlViewCols = res
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .formList.el-form > .el-row.existBtn:first-child {
  height: calc(100% - 67px);
}
.helpIcon {
  position: absolute;
  width: 20px;
  height: 20px;
  left: -92px;
  top: 7px;
}
</style>
