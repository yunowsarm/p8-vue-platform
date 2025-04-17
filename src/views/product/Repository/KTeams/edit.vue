<template>
  <form-list ref="form"
             @rendered="rendered"
             :form="formData"
             @saved="saved"
             :dataSource="dataSource"
             :api="saveApi"
             :is-custom-validate="true"
             @custom-validate="customValidate">
    <template v-if="aiAssistant" #btn>
      <el-popover
        ref="popover"
        placement="top"
        popper-class="ai-popover"
        width="300"
        trigger="click">
        <AIForm form-code="standardTeam" :descText="descText" :formJson="formJson" @hidePopover="hidePopover"
                @updatePopper="updatePopper" @handleAIFill="handleAIFill"></AIForm>
        <el-button type="primary" slot="reference" style="margin-right:10px">AI帮你填</el-button>
      </el-popover>
    </template>
  </form-list>
</template>

<script>

import {P8Dialog as CommonDialog, P8Form as FormList} from 'p8-components-ui'
import {generateTree} from '@/utils/generateTree'
import AIForm from '@/components/AIForm/index'
import _cloneDeep  from "lodash/cloneDeep";
import {parseFormConfig} from "@/components/AIForm/configParser.js"

let dataSource = [
  {
    type: 'text',
    labelText: '团队名称',
    fieldName: 'name',
    placeholder: '请输入团队名称',
    colLayout: 'singleCol',
    rules: [
      {
        required: true,
        message: '必填'
      }
    ],
    fieldConfig: {
      maxlength: 64
    }
  },
  {
    type: 'treeSelect',
    labelText: '项目类型',
    fieldName: 'projectClassifyId',
    placeholder: '请选择项目类型',
    colLayout: 'singleCol',
    defaultExpandAll: true,
    treeData: [],
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  },
  {
    type: 'number',
    labelText: '排序号',
    fieldName: 'indexNo',
    placeholder: '请输入排序号',
    colLayout: 'singleCol',
    rules: [
      {
        required: true,
        message: '必填'
      }
    ]
  },
  {
    type: 'radioButton',
    labelText: '默认团队',
    fieldName: 'isDefault',
    placeholder: '请输入团队描述',
    colLayout: 'singleCol',
    options: [
      {
        value: '1',
        label: '是'
      },
      {
        value: '0',
        label: '否'
      }
    ]
  },
  {
    type: 'textarea',
    labelText: '团队描述',
    fieldName: 'describes',
    placeholder: '请输入团队描述',
    colLayout: 'singleCol',
    fieldConfig: {
      maxlength: 2000,
      rows: 4
    }
  }
]

export default {
  name: 'KteamsEdit',
  components: {
    FormList,
    CommonDialog,
    AIForm
  },
  props: {
    row: {
      type: Array
    }
  },
  data() {
    return {
      aiAssistant: aiAssistant,
      descText:'',
      formJson:{},
      saveApi: 'knowledgeManagement.save',
      dataSource: [],
      formData: {},
    }
  },
  created() {
    this.dataSource = Object.assign([], dataSource)
  },
  methods: {
    hidePopover() {
      this.$nextTick(() => {
        this.$refs.popover.doClose()
      })
    },
    updatePopper() {
      this.$nextTick(() => {
        this.$refs.popover.updatePopper()
      })
    },
    handleAIFill(formData) {
      this.formData = formData
      // this.$emit('handleAIFill',formData)
    },
    rendered() {
      if (this.row && this.row.length) {
        let that = this
        this.$api['knowledgeManagement.get']({id: this.row[0].ID}).then(function (data) {
          that.formData = Object.assign({}, data)
        }).catch(function (error) {
          console.error(error)
        })
      }
      this.$api['formGenerator.getSelectionData']({selectCode: 'pmKlTeamsProjTypeTree'}).then(res => {
        let treeData = []
        let disableValues = []
        res.data.forEach(el => {
          treeData.push({id: el.ID, value: el.ID, label: el.C_MEANING, pId: el.C_PARENTID})
          if (el.C_PARENTID === '0') {
            disableValues.push(el.ID)
          }
        })
        treeData = generateTree(treeData, 'pId', '0')
        this.dataSource[1].treeData = treeData
        this.dataSource[1].disabledValues = disableValues
        // this.descText = generateDescription(description)
        this.descText = _cloneDeep(this.dataSource)
      })
    },
    saved(res) {
      this.$emit('close', res)
    },
    customValidate(saveParams) {
      this.$api['knowledgeManagement.saveCheck'](saveParams).then(res => {
        if (res.result) {
          this.$refs.form.submitForm(saveParams, this.saveApi)
        } else {
          this.$message({type: 'warning', message: res.resultMsg})
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-popover.ai-popover {
  padding: 12px;
}
</style>
