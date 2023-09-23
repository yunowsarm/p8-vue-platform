<template>
  <div style="height: 100%">
    <el-button type="primary"
               @click="createExperienceBank">新建</el-button>
    <el-button type="primary"
               @click="exportBrother">导入同级</el-button>
    <el-button type="primary"
               @click="exportChild">导入下级</el-button>
    <el-button type="primary"
               @click="manageExperienceBank">管理</el-button>
    <Edit v-if="createVisible"
          :visible='createVisible'
          :selectedTask='selectedTask'
          :title='experienceBankTitle'
          @openExperienceBase='openExperienceBase'
          @handleCancel='closeCreate' />
    <my-experience-base v-if="experienceBaseVisible"
                        :visible='experienceBaseVisible'
                        :isManage='isManage'
                        :selectedTask='selectedTask'
                        @handleCancel='closExperienceBase'
                        @exportExperienceBase='exportExperienceBase'></my-experience-base>
  </div>
</template>

<script>
import Edit from './edit.vue'
import MyExperienceBase from './myExperienceBase.vue'
export default {
  name: 'MyExperienceBase',
  data () {
    return {
      createVisible: false,
      experienceBaseVisible: false,
      isManage: false,
      selectedTask: [],
      experienceBankTitle: '我的经验库'
    }
  },
  components: {
    Edit,
    'my-experience-base': MyExperienceBase,
  },
  methods: {
    createExperienceBank () {
      this.createVisible = true
    },
    closExperienceBase () {
      this.isManage = false
      this.experienceBaseVisible = false
    },
    exportExperienceBase () {
      console.log("This is export")
    },
    closeCreate () {
      this.createVisible = false
    },
    exportBrother () {
      this.experienceBaseVisible = true
    },
    exportChild () {
      this.experienceBaseVisible = true
    },
    openExperienceBase () {
      this.createVisible = false
      this.experienceBaseVisible = true
    },
    manageExperienceBank () {
      this.experienceBaseVisible = true
      this.isManage = true
    },
  }
}
</script>

<style lang="scss" scoped></style>
