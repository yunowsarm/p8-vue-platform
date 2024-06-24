<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <el-row style="height: 100%; overflow: hidden">
    <el-col style="height: 100%"
            :xs="globalLayout.left.xs"
            :sm="globalLayout.left.sm"
            :md="globalLayout.left.md"
            :lg="globalLayout.left.lg"
            :xl="globalLayout.left.xl">
      <div style="position: relative; height: 100%">
        <component :is="componentUrl"
                   :record-id="recordId"
                   ref="components"
                   v-bind="paramsConfig"></component>
        <div class="splitBtn"
             @click="splitClick">
          <i class="p8 icon-right"
             :class="{ rotate: !expand }"></i>
        </div>
      </div>
    </el-col>
    <el-col class="right-panel"
            :xs="globalLayout.right.xs"
            :sm="globalLayout.right.sm"
            :md="globalLayout.right.md"
            :lg="globalLayout.right.lg"
            :xl="globalLayout.right.xl">
      <div class="tabs">
        <right-panel :save-api="saveApi"
                     ref="rightForm"
                     :edit-form-data="formData"
                     :record-id="recordId"
                     @saveSuccess="saveSuccess"
                     @changeType="changeType"></right-panel>
      </div>
      <div class="form-btn">
        <!-- <el-button type="info" class="el-btn" @click="showHelp">帮助</el-button> -->
        <el-button type="primary"
                   class="el-btn"
                   @click="handleViews">预览</el-button>
        <el-button type="primary"
                   class="el-btn"
                   @click="handleSubmit">保存</el-button>
      </div>
      <!-- <preview v-if="kanbanViewVisible"
               :visible="kanbanViewVisible"
               :preview-parmars="previewParmars"
               @close="kanbanViewVisible = false"></preview> -->
      <component v-if="kanbanViewVisible"
                 :is="previewUrl"
                 :visible="kanbanViewVisible"
                 :preview-parmars="previewParmars"
                 @close="kanbanViewVisible = false"></component>
    </el-col>
  </el-row>
</template>

<script>
import RightPanel from './right-panel'
import ButtonNavigation from './ButtonNavigation/V1.0/edit/index.vue'
import TabsNavigation from './TabsNavigation/V1.0/edit/index'
import preview from './ButtonNavigation/V1.0/edit/Components/preview.vue'
export default {
  name: 'KanbanEidt',
  components: {
    RightPanel,
    ButtonNavigation,
    TabsNavigation,
    preview
  },
  props: {
    recordId: {
      type: String,
      default: ''
    }
  },
  computed: {
    componentUrl () {
      if (this.asyncComponents) {
        return () => import(`@/views/${this.asyncComponents}.vue`)
      } else {
        return ''
      }
    },
    previewUrl () {
      if (this.previewComponents) {
        return () => import(`@/views/${this.previewComponents}.vue`)
      } else {
        return ''
      }
    }
  },
  data () {
    return {
      globalLayout: {
        left: {
          xs: 14,
          sm: 16,
          md: 18,
          lg: 19,
          xl: 20
        },
        right: {
          xs: 10,
          sm: 8,
          md: 6,
          lg: 5,
          xl: 4
        }
      },
      saveApi: 'desLayout.save',
      formData: {},
      expand: true,
      paramsConfig: {},
      asyncComponents: 'Framework/ComponentsMananger/Layout/Components/ButtonNavigation/V1.0/edit/index',
      previewComponents: '',
      kanbanViewVisible: false,
      previewParmars: null
    }
  },
  methods: {
    splitClick () {
      if (this.expand) {
        this.globalLayout = {
          left: {
            xs: 24,
            sm: 24,
            md: 24,
            lg: 24,
            xl: 24
          },
          right: {
            xs: 0,
            sm: 0,
            md: 0,
            lg: 0,
            xl: 0
          }
        }
      } else {
        this.globalLayout = {
          left: {
            xs: 14,
            sm: 16,
            md: 18,
            lg: 19,
            xl: 20
          },
          right: {
            xs: 10,
            sm: 8,
            md: 6,
            lg: 5,
            xl: 4
          }
        }
      }

      this.expand = !this.expand
    },
    rendered () { },
    handleSubmit () {
      const _this = this
      this.$refs.rightForm.getSubmitData().then((submitData) => {
        const obj = this.$refs.components.getJSONdata()
        obj.formData = this.$refs.rightForm.getFormData()
        submitData.layoutJson = JSON.stringify(obj)
        this.$refs.rightForm.doSubmit(submitData, _this.saveApi)
      })
    },
    handleViews () {
      const obj = this.$refs.components.getJSONdata()
      obj.formData = this.$refs.rightForm.getFormData()
      console.log(obj, '---obj')
      this.previewParmars = obj
      this.previewComponents = obj.previewUrl
      this.kanbanViewVisible = true
    },
    showHelp () {
      this.helpVisible = true
    },
    changeType (data) {
      if (data) {
        this.asyncComponents = data.designer
      }
    },
    saveSuccess () {
      this.$emit('saveSuccess')
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-area {
  position: relative;
}
.splitBtn {
  width: 0px;
  height: 100%;
  float: right;
  cursor: pointer;

  > i {
    background: $base-light-color;
    color: $base-white-color;
    font-size: 10px;
    position: absolute;
    top: 40%;
    width: 10px;
    height: 60px;
    line-height: 60px;
    border-radius: 0px 10px 10px 0px;
    z-index: 99;
    right: 0;
  }
}

.rotate {
  transform: rotate(180deg);
  -ms-transform: rotate(180deg); /* Internet Explorer */
  -moz-transform: rotate(180deg); /* Firefox */
  -webkit-transform: rotate(180deg); /* Safari 和 Chrome */
  -o-transform: rotate(180deg); /* Opera */
}

.right-panel {
  position: relative;
  height: 100%;
}

.tabs {
  height: calc(100% - 42px);
  position: relative;
  // overflow: auto;
}

.form-btn {
  height: 40px;
  width: 100%;
  border-top: 1px solid $base-line-color;
  position: absolute;
  text-align: right;
  bottom: 0;

  .el-btn {
    margin: 5px 5px;
  }
}
::v-deep.normal-layout .normal-header {
  background: #fff;
}
</style>
