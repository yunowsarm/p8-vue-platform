<template>
  <div class="edit-input-cell">
    <div v-if="visibility"
         class="text">
      <el-tooltip :content="modelText"
                  placement="bottom">
        <div class="input-text">{{modelText}}</div>
      </el-tooltip>
      <div>{{getProjectTeamRoleUsersNum(record)}}</div>
      <div style="color: red"
           v-if="isShowRole(record)">*</div>
    </div>
    <el-input v-model="modelText"
              v-if="!visibility"
              size="mini"
              @change="onchangeHandle">
      <template #suffix>
        <i class="el-icon-check"
           @click.stop="onchangeHandle"></i>
      </template>
    </el-input>
    <div class="icon-con"
         v-if="iconShow">
      <i class="el-icon-edit"
         @click="onEditCell"></i>
      <i class="el-icon-delete"
         :class="{'is-disabled': disableDeleteIcon()}"
         @click.stop="onDeleteCell"></i>
      <!-- <template v-if="!disableDeleteIcon()">
        <el-popconfirm title="确认要删除当前角色吗?"
                     confirmButtonText="确认"
                     cancelButtonText="取消"
                     disabled
                     @onConfirm="onDeleteCell">
          <i class="el-icon-delete"
            slot="reference"></i>
        </el-popconfirm>
      </template>
      <template v-else>
          <i class="is-disabled el-icon-delete"></i>
      </template> -->
    </div>
  </div>
</template>
<script>
import { Input } from 'p8-components-ui' // Popconfirm
export default {
  name: 'EditInputView',
  props: {
    textValue: {
      type: String
    },
    record: {
      type: Object
    },
    iconShow: {
      type: Boolean,
      default: false
    },
    rolesData: {
      type: Array
    }
  },
  data () {
    return {
      visibility: true,
      modelText: ''
    }
  },
  watch: {
    textValue: {
      handler (newValue) {
        this.modelText = newValue
      },
      // 代表在wacth里声明了firstName这个方法之后立即先去执行handler方法
      immediate: true
    }
  },
  methods: {
    isShowRole (row) {
      return row.isRequired === '1'
    },
    getProjectTeamRoleUsersNum (rolesItem) {
      return '(' + rolesItem.projectTeamRoleUsers.length + ')'
    },
    onEditCell () {
      if (!this.visibility) {
        const find = this.rolesData.find((el) => el.name == this.modelText)
        if (find) {
          this.$message({ type: 'warning', message: '角色名称不可重复' })
          return
        }
      }
      this.visibility = !this.visibility
    },
    onDeleteCell () {
      if (this.disableDeleteIcon()) {
        return
      }
      this.$emit('delete')
    },
    onchangeHandle () {
      const find = this.rolesData.find((el) => el.name == this.modelText)
      if (find) {
        this.$message({ type: 'warning', message: '角色名称不可重复' })
        return
      }
      this.visibility = !this.visibility
      this.$emit('onChange', this.modelText, this.record)
    },
    disableDeleteIcon () {
      return false
      // return this.record.projectTeamRoleUsers && this.record.projectTeamRoleUsers.length && this.record.projectTeamRoleUsers[0].id.length === 32
    }
  },
  components: {
    'el-input': Input
    // 'el-popconfirm': Popconfirm
  }
}
</script>
<style lang="scss">
.edit-input-cell {
  width: 90%;
  padding: 0 2px;
  display: flex;
  align-items: center;
  div.text {
    flex: 1;
    display: flex;
  }
  .el-input {
    flex: 1;
    input {
      height: 28px;
      line-height: 28px;
    }
    .el-input__suffix {
      line-height: 28px;
    }
    i {
      cursor: pointer;
      color: #46a6ff !important;
    }
  }
  .icon-con {
    i {
      font-size: 18px;
    }
    i {
      cursor: pointer;
      color: #46a6ff !important;
      padding: 0 4px;
    }
    i.is-disabled {
      color: #999 !important;
      cursor: not-allowed;
    }
  }
}
.input-text {
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 显示最多3行文本 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  // width: 100%; /* 设置最大宽度 */
}
</style>
