<template>
  <div class="project-con">
    <div class="title">
      项目信息
    </div>
    <div class="form-con">
      <form-list ref="form"
                 :dataSource="dataSource"
                 :form="formData"
                 :existDefaultBtn="false"></form-list>
    </div>
  </div>
</template>
<script>
import { P8Form as FormList } from 'p8-components-ui'
export default {
  name: 'ProjectFormView',
  props: {
    id: {
      type: String
    }
  },
  data () {
    const dataSource = [
      {
        type: 'view', // 控件类型
        labelText: '项目名称', // 控件显示的文本
        fieldName: 'name',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '项目代号',
        fieldName: 'pjCode',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '型号代号',
        fieldName: 'modelCode',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '项目类型',
        fieldName: 'projectTypeDisplay',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '阶段',
        fieldName: 'stageDisplay',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '项目来源',
        fieldName: 'sourceDisplay',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '项目周期',
        fieldName: 'projectScyle',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '项目主管部门',
        fieldName: 'mainDeptName',
        colLayout: ''
      },
      {
        type: 'view',
        labelText: '项目概况',
        fieldName: 'projectOverview',
        colLayout: ''
      },
      {
        type: 'uploadView',
        labelText: '项目文档',
        filesLayout: 'row',
        fieldName: 'uploadFiles',
        colLayout: ''
      }
    ]
    return {
      dataSource,
      formData: {}
    }
  },
  watch: {
    id (val) {
      this.getProjectInfo()
    }
  },
  created () {
    this.getProjectInfo()
  },
  methods: {
    getProjectInfo () {
      let _this = this
      if (this.id) {
        this.$api['teamManager.wholeDescribeInfo']({ wholeDescribeId: this.id }).then(res => {
          _this.formData = res
        })
      }
    }
  },
  components: {
    FormList
  }
}
</script>
<style lang="scss" scoped>
.project-con {
  height: 100%;
  .title {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    padding-left: 6px;
    border-bottom: 2px solid #f2f2f2;
    box-sizing: border-box;
    font-weight: bold;
  }
  box-sizing: border-box;
  overflow-y: auto;
  padding: 0;
  .form-con {
    height: calc(100% - 50px);
    ::v-deep .el-form-item__label {
      text-align: right;
    }
  }
}
</style>
