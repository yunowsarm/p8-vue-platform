<template>
  <div class="header">
    <div class="content"
         :key="dataTime">
      <div class="content-box"
           v-for="(item,index) in radioOptions"
           :key="index"
           @click="handleAdhibitionClick(item)">
        <div :class="{ active: item.isActive }">
          <div>
            <el-image style="width: 60px; height: 60px"
                      :src="imgUrl"
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
      imgUrl: require('@/assets/image/common/Group.png'),
      appIds: [],
      radioOptions: [
        {
          label: '高层拜访',
          id: '1',
          code: 'CALL_HIGH'
        },
        {
          label: '客户交流',
          id: '2',
          code: 'CUSTOMER_INTERACTION'
        },
        {
          label: '市场调研',
          id: '3',
          code: 'MARKET_SURVEY'
        },
        {
          label: '技术支持',
          id: '4',
          code: 'TECHNICAL_SUPPORT'
        },
        {
          label: '媒体信息',
          id: '5',
          code: 'MEDIUM_INFORMATION'
        },
        {
          label: '技术交流',
          id: '6',
          code: 'TECHNICAL_EXCHANGE'
        },
        {
          label: '参观展览',
          id: '7',
          code: 'VISITING_SHOW'
        },
        {
          label: '投标总结',
          id: '8',
          code: 'BID'
        },
        {
          label: '沟通例会',
          id: '9',
          code: 'COMMUNICATION_MEETING'
        },
        {
          label: '销售周报',
          id: '10',
          code: 'MARKET_WEEKLY'
        },
        {
          label: '外部会议',
          id: '11',
          code: 'EXTERNAL_MEETING'
        },
        {
          label: '外聘专家',
          id: '12',
          code: 'EXTERNAL_EXPERT'
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
          console.log("🚀 ~ mounted ~ row:", row)
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
      row.isActive = !row.isActive
      this.radioOptions.forEach(item => {
        if (row.id !== item.id) {
          item.isActive = false
        }
      })
      window.selsecRow = row
      this.codeForm = row.code
      this.propParam.DEMAND_CODE = row.code
      this.propParam.DEMAND_STATUS = '98cdd467570ee9187c65518e0010548d'
      this.formTitle = '新建' + row.label
      if (row.isActive) {
        this.appIds.push(row.id)
      } else {
        this.appIds = this.appIds.filter((id) => id !== row.id)
      }
      this.dataTime = new Date().getTime()
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
.active {
  border: 1px solid #1bbf9e;
  -webkit-box-shadow: #666 0px 0px 10px;
  -moz-box-shadow: #666 0px 0px 10px;
  box-shadow: #666 0px 0px 10px;
  position: relative;
  padding: 10px 25px;
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
