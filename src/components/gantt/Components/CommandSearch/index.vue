<template>
  <el-form id="ganttSearch" ref="searchForm" :inline="true" :model="searchForm" class="demo-form-inline" size="mini" label-position="top">
    <el-row :gutter="10">
      <el-col :span="6">
        <el-form-item label="大纲层级" prop="deep" class="item">
          <el-select v-model="searchForm.deep" class="field" style="width: 100%">
            <el-option v-for="(item, index) in vueThis.deep" :key="index + 1" :label="index + 1" :value="index + 1"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="角色" v-if="isInput" prop="roleName" class="item">
          <el-select v-model="searchForm.roleIds" filterable multiple collapse-tags class="field" style="width: 100%">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" v-else prop="name" class="item">
          <el-input v-model="searchForm.roleIds" placeholder="请输入" class="field"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="责任人" v-if="isInput" prop="ownerName" class="item">
          <el-select v-model="searchForm.ownerIds" filterable multiple collapse-tags class="field" style="width: 100%">
            <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="责任人" v-else prop="name" class="item">
          <el-input v-model="searchForm.ownerIds" placeholder="请输入" class="field"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="部门" v-if="isInput" prop="deptName" class="item">
          <el-select v-model="searchForm.deptIds" filterable multiple collapse-tags class="field" style="width: 100%">
            <el-option v-for="item in deptOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门" v-else prop="name" class="item">
          <el-input v-model="searchForm.deptIds" placeholder="请输入" class="field"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="任务名称" prop="name" class="item">
          <el-input v-model="searchForm.name" placeholder="请输入" class="field"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="任务类型" prop="planType" class="item">
          <el-select v-model="searchForm.planTypes" multiple collapse-tags class="field" style="width: 100%">
            <el-option v-for="item in vueThis.taskClassifyDatas" :key="item.id" :label="item.title" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="进度" prop="status" class="item">
          <el-select v-model="searchForm.status" multiple collapse-tags class="field" style="width: 100%">
            <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="标识" prop="monitors" class="item">
          <el-select v-model="searchForm.monitors" multiple collapse-tags class="field" style="width: 100%">
            <el-option v-for="item in vueThis.monitorPointDatas" :key="item.id" :label="item.title" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="任务完成时间" prop="startEndDate" class="block">
          <el-date-picker v-model="searchForm.startEndDate" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item>
      <el-button type="primary" @click="onSearch">查询</el-button>
      <el-button @click="resetForm('searchForm')">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { Form, FormItem, Row, Col, Input, Select, Option, DatePicker, Button } from 'p8-components-ui'
import { GanttObject, taskStatusArr } from '@/assets/commonJS/ganttJS/ganttObject'
import { mapGetters } from 'vuex'
export default {
  name: 'CommandSearch',
  components: {
    'el-form': Form,
    'el-form-item': FormItem,
    'el-row': Row,
    'el-col': Col,
    'el-select': Select,
    'el-option': Option,
    'el-input': Input,
    'el-date-picker': DatePicker,
    'el-button': Button
  },
  props: {
    planInfoId: String,
    ganttName: String,
    rowNum: {
      type: Number,
      default: 2
    },
    isInput: {
      // 为了兼容别的弹框对类型输入框的要求而增加的
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      status: [],
      userOptions: [],
      deptOptions: [],
      roleOptions: [],
      searchCheck: false,
      searchForm: {
        deep: '',
        name: '',
        roleIds: this.isInput ? [] : '',
        ownerIds: this.isInput ? [] : '',
        deptIds: this.isInput ? [] : '',
        startEndDate: '',
        status: [],
        monitors: [],
        planTypes: []
      }
    }
  },
  watch: {
    searchForm: {
      handler(newVal, oldVal) {
        this.searchCheck = true
      },
      deep: true
    },
    planInfoId: function (newVal, oldVal) {
      this.loadSelectOptionData(newVal)
    }
  },
  computed: {
    ...mapGetters(['vueThis'])
  },
  mounted() {
    this.status = taskStatusArr
  },
  methods: {
    loadSelectOptionData(planInfoId) {
      const that = this
      this.$api['planGanttManager.loadSelectOptionData']({ planInfoId: planInfoId })
        .then(function (res) {
          if (res) {
            that.userOptions = res.userOptions
            that.deptOptions = res.deptOptions
            that.roleOptions = res.roleOptions
          }
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    onSearch() {
      if (this.searchCheck) {
        this.vueThis.searchForm = { ...this.searchForm, isInput: this.isInput }
        console.log(this.searchForm, this.vueThis.searchForm, this.ganttName, 'ikkkkkkkkkk')
        const ganttObject = GanttObject.getGanttObject(this.ganttName)
        ganttObject.refreshData()
        this.searchCheck = false
      }
    },
    // 重置
    resetForm(formName) {
      if (JSON.stringify(this.vueThis.searchForm) !== '{}') {
        this.$refs[formName].resetFields()
        this.vueThis.searchForm = this.searchForm = {}
        const ganttObject = GanttObject.getGanttObject(this.ganttName)
        ganttObject.refreshData()
      }
    }
  }
}
</script>
<style lang="scss" scope>
// .item {
//   margin-left: 20px;
// }
// .field {
//   margin-left: 10px;
// }
.group-search {
  .el-form-item__label {
    font-size: 12px;
  }
  .el-input--small .el-input__inner {
    font-size: 12px;
  }
}
#ganttSearch {
  padding: 2px 10px;
  .el-form-item--mini.el-form-item {
    width: 100%;
  }
}
</style>
