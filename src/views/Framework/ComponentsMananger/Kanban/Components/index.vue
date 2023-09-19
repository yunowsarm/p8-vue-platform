<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-drawer title="图表绘制"
                 size="100%"
                 :visible="visibleDrawer"
                 :show-handle-btn="true"
                 @close="onEditPlanLogoClose">
    <!-- <template #titleHeader>
      <span>图表绘制</span>
      <el-button style="position: absolute; right: 50px; top: 10px"
                 @click="btnSaveClick">保存</el-button>
    </template> -->
    <template #drawer>
      <el-tabs tab-position="left"
               style="height: 100%"
               v-model="desformCode"
               @tab-click="tabClick">
        <template v-for="(item, index) in echartsTabs">
          <el-tab-pane :label="item.label"
                       :key="index">
            <el-row>
              <el-col :span="15">
                <el-card class="box-card"
                         :body-style="{ height: chartHeight }">
                  <echarts-bar v-if="item.value"
                               :key="dateKey"
                               :echarts-id="item.value"
                               :current-component-props="currentComponentProps"></echarts-bar>
                  <span v-else
                        class="span-bg"></span>
                </el-card>
              </el-col>
              <el-col :span="9">
                <!-- <echarts-setting ref="echarts"
                                 style="margin: 0px 10px; height: 837px; overflow: auto"
                                 :current-component-props="currentComponentProps"
                                 @onInput="onInput"></echarts-setting> -->
                <el-card class="box-card2"
                         :body-style="{ height: chartHeight }">
                  <form-data-edit @save-success="saveCallback"
                                  @save-form="saveCallback"
                                  :record="record"
                                  :key="record.id"
                                  type="001"
                                  is-save="new"
                                  @save-echarts="btnSaveClick"
                                  @save-reset="saveReset"
                                  :data-view-id="dataViewId"></form-data-edit>
                </el-card>
              </el-col>
            </el-row>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
  </common-drawer>
</template>
<style scoped>
.el-tabs__nav-scroll {
  width: 125px;
}
.span-bg {
  width: 100%;
  height: 85%;
  display: block;
  margin: 0 auto;
  background: url(../../../../../assets/image/common/table_bg.png) no-repeat;
  background-size: 300px;
  background-position: center;
  margin-top: 25px;
}
.box-card {
  margin: 16px;
}
.box-card2 {
  margin: 16px 16px 16px 0;
}
</style>
<script>
import echartsBar from './echarts.vue'
// import echartsSetting from './echartsSetting.vue'
import FormDataEdit from '../../Form/Components/Components/edit'
import { P8Drawer as CommonDrawer } from 'p8-components-ui'
export default {
  components: {
    echartsBar,
    // echartsSetting,
    CommonDrawer,
    FormDataEdit
  },
  props: ['visible', 'code', 'desformData'],
  data () {
    return {
      echartsTabs: [
        {
          label: '饼图',
          value: 'pie'
        },
        {
          label: '柱状图',
          value: 'bar'
        },
        {
          label: '折线图',
          value: 'line'
        }
      ],
      dateKey: new Date().getTime(),
      echartsType: '',
      currentComponentProps: {},
      chartHeight: document.documentElement.clientHeight - 130 + 'px',
      visibleDrawer: this.visible,
      record: {},
      desformCode: '0',
      echartsCode: '',
      dataViewId: ''
    }
  },
  mounted () {
    this.getEchartsData()
  },
  methods: {
    async getEchartsData () {
      // await this.$api['kanbanComponent.getDic']().then(res => {
      //   this.echartsTabs = res
      // })
      await this.$api['formGenerator.formList']({
        page: { current: 1, size: -1, orders: [] }
      }).then((res) => {
        if (res) {
          this.dataList = res
        }
      })
      this.tabClick()
    },
    saveCallback (res, data) {
      this.currentComponentProps = eval('(' + res + ')')
      this.dateTime()
    },
    onEditPlanLogoClose () {
      this.visibleDrawer = false
      this.$emit('onEditPlanLogoClose')
    },
    dateTime () {
      this.currentComponentProps.height = document.documentElement.clientHeight - 200 + 'px'
      this.dateKey = new Date().getTime()
    },
    tabClick (val) {
      this.record = []
      switch (this.desformCode) {
        case '0':
          this.echartsCode = 'pie'
          break
        case '1':
          this.echartsCode = 'bar'
          break
        case '2':
          this.echartsCode = 'line'
          break
      }
      let arr = this.dataList.records.filter((item) => {
        return item.desformCode === this.echartsCode
      })
      this.record = arr[0]
      let defaulValue = JSON.parse(arr[0].designJson).fields[0].__config__.defaultValue
      this.currentComponentProps = eval('(' + defaulValue + ')')
      this.dateTime()
    },
    onInput (obj) {
      this.currentComponentProps = obj
      this.dateTime()
    },
    btnSaveClick () {
      delete this.currentComponentProps.height
      delete this.currentComponentProps.width
      let obj = {
        chart: this.currentComponentProps
      }
      this.$emit('onEditPlanLogoClose', obj, this.echartsCode)
    },
    saveReset () {
      this.tabClick()
    }
  }
}
</script>
