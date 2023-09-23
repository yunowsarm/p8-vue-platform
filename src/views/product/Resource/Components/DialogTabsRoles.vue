<template>
  <common-dialog v-if="visibleDialogRoles"
                 :visible.sync="visibleDialogRoles"
                 width="50%"
                 title="选择团队"
                 :dialogConfig="dialogConfig"
                 @handle-cancel="dialogRolesCancel"
                 @handle-ok="dialogRolesOk"
                 :dialogHeight="dialogHeight"
                 @close="dialogRolesCancel"
                 @isfullscreen="isfullscreen">
    <template #dialog>
      <div class="dialog-con">
        <!-- <div class="btn-con" v-if="activeName==='standard'">
          <el-button type="primary" @click="loadRolesHandle">载入</el-button>
          <el-button type="primary" @click="emptyTeamHandle">清空团队结构</el-button>
        </div> -->
        <el-tabs v-model="activeNameRender"
                 type="card"
                 @tab-click="handleTabsClick">
          <el-tab-pane label="我的经验团队"
                       name="experience">
            <experience-team id="normal-layout"
                             v-bind="$attrs"
                             @experience-table-select="experienceSelect"
                             :fullscreen="fullscreen"></experience-team>
          </el-tab-pane>
          <el-tab-pane label="标准团队"
                       name="standard">
            <standard-team :tableRefresh="tableRefresh"
                           :fullscreen="fullscreen"></standard-team>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
  </common-dialog>
</template>
<script>
import { P8Dialog as CommonDialog, Tabs, TabPane } from 'p8-components-ui'
import ExperienceTeam from './ExperienceTeam'
import StandardTeam from './StandardTeam'

export default {
  name: 'DialogTabsRoles',
  props: {
    visibleDialogRoles: {
      type: Boolean,
      default: false
    },
    activeName: {
      type: String,
      detault: 'experience' // 'experience'-经验团队;standard-标准团队
    }
  },
  data () {
    return {
      dialogConfig: {
        modal: true,
        'append-to-body': true
        // 'modal-append-to-body': false
      },
      experienceTeamSelect: [],
      standardTeamInfo: {},
      dialogHeight: 300,
      fullscreen: false,
      activeNameRender: 'experience'
    }
  },
  mounted () {
    const ch = document.documentElement.clientHeight
    this.dialogHeight = ch * 0.6
  },
  methods: {
    isfullscreen (fullscreen) {
      this.fullscreen = fullscreen
    },
    dialogRolesCancel () {
      this.fullscreen = false
      if (this.activeNameRender === 'experience') {
        this.$emit('exp-roles-close', [])
      } else {
        this.$emit('standard-roles-close', {})
      }
    },
    dialogRolesOk () {
      this.fullscreen = false
      if (this.activeNameRender === 'experience') {
        console.log(this.experienceTeamSelect,'----this.experienceTeamSelect经验团队');
        this.$emit('exp-roles-close', this.experienceTeamSelect)
      } else {
        // 载入
        let teamList = this.standardTeamInfo.data
        let arr = []
        teamList.forEach(el => {
          arr = arr.concat(el.roles)
        })
        let emitInfo = {
          data: arr,
          kTeamId: this.standardTeamInfo.kTeamId
        }
        this.$emit('standard-roles-close', emitInfo)
      }
    },
    handleTabsClick (tab, event) {
      // tab.paneName
    },
    experienceSelect (value) {
      this.experienceTeamSelect = value
    },
    tableRefresh (param) {
      param.then((data) => {
        console.log('异步成功后端做的操作 标准团队库', data)
        this.standardTeamInfo = data
      }).catch(() => {
        console.error('异步失败的操作')
      })
    },
    loadRolesHandle () {

    },
    emptyTeamHandle () {
      // 清空团队结构
    }
  },
  components: {
    CommonDialog,
    ExperienceTeam,
    StandardTeam,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane
  }
}
</script>
<style lang="scss">
.dialog-con {
  padding: 0 6px;
  .btn-con {
    text-align: right;
  }
}
</style>
