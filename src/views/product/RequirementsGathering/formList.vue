<template>
  <div class="header">
    <div class="content"
         :key="dataTime">
      <div class="content-box"
           v-for="(item, index) in radioOptions"
           :key="index"
           @click="handleAdhibitionClick(item)">
        <div :class="{ active: item.isActive }"
             class="activeStyle">
          <div>
            <el-image style="width: 60px; height: 60px"
                      :src="item.imgUrl"
                      fit="cover"></el-image>
          </div>
          <span class="nav-text"
                v-text="item.label"></span>
        </div>
      </div>
    </div>
    <div class="btn">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary"
                 @click="handleSubmit">确定</el-button>
    </div>
    <common-drawer v-if="formVisible"
                   :title="formTitle"
                   :visible="formVisible"
                   size="50%"
                   @close="formClose">
      <template #drawer>
        <form-render :data-view-id="dataViewId"
                     :record="{ desformCode: codeForm }"
                     :prop-param="propParam"
                     v-bind="$attrs"
                     @close="formClose"
                     @save-success="formCloseRefresh"></form-render>
      </template>
    </common-drawer>
  </div>
</template>

<script>
import {
  P8Drawer as CommonDrawer
} from 'p8-components-ui'
import FormRender from '@/views/Framework/ComponentsMananger/Form/Components/Components/edit.vue'
export default {
  components: {
    CommonDrawer,
    FormRender
  },
  props: {
    row: {
      type: Array
    }
  },
  data () {
    return {
      appIds: [],
      radioOptions: [
        {
          label: '高层拜访',
          id: '1',
          code: 'CALL_HIGH',
          imgUrl: require('@/assets/image/common/高层拜访.png')
        },
        {
          label: '客户交流',
          id: '2',
          code: 'CUSTOMER_INTERACTION',
          imgUrl: require('@/assets/image/common/客户交流.png')
        },
        {
          label: '市场调研',
          id: '3',
          code: 'MARKET_SURVEY',
          imgUrl: require('@/assets/image/common/市场调研.png')
        },
        {
          label: '技术支持',
          id: '4',
          code: 'TECHNICAL_SUPPORT',
          imgUrl: require('@/assets/image/common/技术支持.png')
        },
        {
          label: '媒体信息',
          id: '5',
          code: 'MEDIUM_INFORMATION',
          imgUrl: require('@/assets/image/common/媒体信息.png')
        },
        {
          label: '技术交流',
          id: '6',
          code: 'TECHNICAL_EXCHANGE',
          imgUrl: require('@/assets/image/common/技术交流.png')
        },
        {
          label: '参观展览',
          id: '7',
          code: 'VISITING_SHOW',
          imgUrl: require('@/assets/image/common/参观展览.png')
        },
        {
          label: '投标总结',
          id: '8',
          code: 'BID',
          imgUrl: require('@/assets/image/common/投标总结.png')
        },
        {
          label: '沟通例会',
          id: '9',
          code: 'COMMUNICATION_MEETING',
          imgUrl: require('@/assets/image/common/沟通例会.png')
        },
        {
          label: '销售周报',
          id: '10',
          code: 'MARKET_WEEKLY',
          imgUrl: require('@/assets/image/common/销售周报.png')
        },
        {
          label: '外部会议',
          id: '11',
          code: 'EXTERNAL_MEETING',
          imgUrl: require('@/assets/image/common/外部会议.png')
        },
        {
          label: '外聘专家',
          id: '12',
          code: 'EXTERNAL_EXPERT',
          imgUrl: require('@/assets/image/common/外聘专家.png')
        }
      ],
      codeForm: '', // 新建/修改表单code
      dataViewId: '', // 修改页面id
      propParam: {}, // 将参数传至表单
      formTitle: '',
      formVisible: false,
      dataTime: new Date().getTime()
    }
  },
  mounted () {
    if (window.selsecRow && window.selsecRow.id) {
      this.radioOptions.forEach(row => {
        if (row.id === window.selsecRow.id) {
          row.isActive = true

          this.codeForm = row.code
          this.formTitle = '新建' + row.label
          this.dataTime = new Date().getTime()
        }
      })
    }
  },
  methods: {
    handleSubmit () {
      if (this.codeForm !== '') {
        window.selsecRow = undefined
        this.formVisible = true
      }
    },
    handleClose () {
      window.selsecRow = undefined
      this.$emit('close')
    },
    handleAdhibitionClick (row) {
      // 切换当前行激活状态
      row.isActive = !row.isActive;

      // 处理单选逻辑：只允许一个项处于激活状态
      this.radioOptions.forEach(item => {
        if (row.id !== item.id) {
          item.isActive = false; // 其他项取消激活
        }
      });

      // 更新表单数据和参数
      this.updateFormData(row);

      // 更新选中行的 ID 列表
      this.updateAppIds(row);

      // 更新时间戳
      this.dataTime = Date.now();
    },

    updateFormData (row) {
      if (row.isActive) {
        // 如果当前行是激活状态，更新相关表单数据
        window.selsecRow = row;
        this.codeForm = row.code;
        this.propParam.DEMAND_CODE = row.code;
        this.propParam.DEMAND_STATUS = '98cdd467570ee9187c65518e0010548d';
        this.formTitle = '新建' + row.label;
      } else {
        // 如果当前行取消激活，重置相关表单数据
        window.selsecRow = null;
        this.codeForm = '';
        this.propParam.DEMAND_CODE = '';
        this.propParam.DEMAND_STATUS = '';
        this.formTitle = '';
      }
    },

    updateAppIds (row) {
      if (row.isActive) {
        // 如果当前行被激活，添加到选中 ID 列表
        if (!this.appIds.includes(row.id)) {
          this.appIds.push(row.id);
        }
      } else {
        // 如果当前行被取消激活，移除 ID 列表中的该项
        this.appIds = this.appIds.filter(id => id !== row.id);
      }
    },

    // 表单新建/修改关闭抽屉
    formClose () {
      this.formVisible = false
      // this.$emit('close')
    },
    formCloseRefresh () {
      this.formVisible = false
      this.$emit('close')
    },
  }
}
</script>

<style lang="scss" scoped>
.header {
  height: 100%;
  position: relative;
}

.btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.content {
  height: calc(100% - 40px);
  display: flex;
  flex-wrap: wrap;
}

.content-box {
  width: 25%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.activeStyle {
  border: 1px solid #ebe6e6;
  padding: 10px 25px;
  border-radius: 10px;
}

.active {
  border: 1px solid #1bbf9e;
  -webkit-box-shadow: #666 0px 0px 10px;
  -moz-box-shadow: #666 0px 0px 10px;
  box-shadow: #666 0px 0px 10px;
  position: relative;
  padding: 10px 25px;
  border-radius: 10px;
}

.active:after {
  content: ' ';
  border-width: 15px;
  border-style: solid;
  border-top-color: #1bbf9e;
  border-right-color: #1bbf9e;
  border-left-color: transparent;
  border-bottom-color: transparent;
  position: absolute;
  top: 0px;
  right: 0px;
  border-top-right-radius: 8px;
}
</style>
