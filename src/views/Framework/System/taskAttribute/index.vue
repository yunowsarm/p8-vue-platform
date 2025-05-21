<template>
  <list-layout>
    <template #north>
      <el-button type="primary"
                 v-if="toolbarWritingDisplay === '0'"
                 @click="createThird">新建</el-button>
      <el-tooltip v-if="toolbarWritingDisplay === '1'"
                  placement="top"
                  content="新建">
        <el-button type="primary"
                   icon="p8 icon-add"
                   @click="createThird"></el-button>
      </el-tooltip>
      <el-button type="primary"
                 v-if="toolbarWritingDisplay === '2'"
                 icon="p8 icon-add"
                 @click="createThird">新建</el-button>
      <!-- <common-button :comp="comp"
                     buttonType="primary"
                     :customButtonData="customButtonData"></common-button> -->
      <search-form-list ref="search"
                        :data-source="searchDatasource"
                        :addFuzzySearch="true"
                        @search="search"
                        @re-set="reset"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    :comp="comp"
                    :columns="columns"
                    :params="queryParam"
                    :api="tableApi"
                    :pagination="true">
        <template #operation="{scope}">
          <div v-if="toolbarWritingDisplay === '0'">
            <el-button-group v-if="toolbarCompactLayout === 'true'">
              <el-button type="text"
                         style="margin-right: 2px;"
                         @click="updateThird(scope.row)">修改</el-button>
              <el-button type="text"
                         @click="deleteThird(scope.row)"
                         :disabled="scope.row.type == '0'">删除</el-button>
            </el-button-group>
            <div v-else>
              <el-button type="text"
                         round
                         @click="updateThird(scope.row)">修改</el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button type="text"
                         round
                         @click="deleteThird(scope.row)"
                         :disabled="scope.row.type == '0'">删除</el-button>
            </div>
          </div>
          <div v-if="toolbarWritingDisplay === '1'">
            <el-button-group v-if="toolbarCompactLayout === 'true'">
              <el-tooltip placement="top"
                          content="修改">
                <el-button style="margin-right: 2px;"
                           icon="p8 icon-xiugai"
                           @click="updateThird(scope.row)"
                           type="text"></el-button>
              </el-tooltip>
              <el-tooltip placement="top"
                          content="删除">
                <el-button icon="p8 icon-shanchu"
                           @click="deleteThird(scope.row)"
                           type="text"></el-button>
              </el-tooltip>
            </el-button-group>
            <div v-else>
              <el-tooltip placement="top"
                          content="修改">
                <el-button icon="p8 icon-xiugai"
                           @click="updateThird(scope.row)"
                           type="text"></el-button>
              </el-tooltip>
              <el-divider direction="vertical"></el-divider>
              <el-tooltip placement="top"
                          content="删除">
                <el-button icon="p8 icon-shanchu"
                           @click="deleteThird(scope.row)"
                           type="text"></el-button>
              </el-tooltip>
            </div>
          </div>
          <div v-if="toolbarWritingDisplay === '2'">
            <el-button-group v-if="toolbarCompactLayout === 'true'">
              <el-button type="text"
                         style="margin-right: 2px;"
                         icon="p8 icon-xiugai"
                         @click="updateThird(scope.row)">修改</el-button>
              <el-button type="text"
                         icon="p8 icon-shanchu"
                         @click="deleteThird(scope.row)"
                         :disabled="scope.row.type == '0'">删除</el-button>
            </el-button-group>
            <div v-else>
              <el-button type="text"
                         icon="p8 icon-xiugai"
                         @click="updateThird(scope.row)">修改</el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button type="text"
                         icon="p8 icon-shanchu"
                         @click="deleteThird(scope.row)"
                         :disabled="scope.row.type == '0'">删除</el-button>
            </div>
          </div>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <common-drawer v-if="visibleThirdDrawer"
                     :title="drawerTitle"
                     :visible="visibleThirdDrawer"
                     size="60%"
                     @close="visibleThirdDrawer = false">
        <template #drawer>
          <edit :id="id"
                :type="type"
                @saveSuccess="onEditThird"></edit>
        </template>
      </common-drawer>
    </template>
  </list-layout>
</template>
<style></style>
<script>
import { P8ListLayout as ListLayout, P8Table as CommonTable, P8Button as CommonButton, P8Drawer as CommonDrawer, P8Search as SearchFormList } from 'p8-components-ui'
import edit from './Components/edit.vue'
const columns = [
  {
    title: '序号',
    type: 'index',
    align: 'center',
    width: '50',
    headerAlign: 'center'
  },
  {
    title: '项目类型',
    dataIndex: 'projectTypeDisplay',
    minWidth: 150,
    align: 'center'
  },
  {
    title: '描述',
    dataIndex: 'describe',
    minWidth: 200,
    align: 'center'
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'operation',
    width: 180,
    scopedSlots: { customRender: 'custom' },
    align: 'center'
  }
]
export default {
  name: 'RetryList',
  components: {
    ListLayout,
    CommonTable,
    CommonButton,
    CommonDrawer,
    edit,
    SearchFormList
  },
  data () {
    return {
      comp: this,
      drawerTitle: '',
      visibleThirdDrawer: false,
      queryParam: {},
      tableApi: 'taskAttribute.listData',
      columns: columns,
      id: '',
      type: '',
      searchDatasource: [
        {
          type: 'text',
          labelText: '项目类型',
          fieldName: 'projectTypeDisplay',
          placeholder: '请输入项目类型'
        }
      ],
      customButtonData: [
        {
          "id": "re-001",
          "title": "新建",
          "indexNumber": 1,
          "eventHandle": "createThird",
          "location": "head"
        },
      ],
      toolbarWritingDisplay: '0',
      toolbarCompactLayout: 'false'
    }
  },
  mounted () {
    if (this.$store.getters.baseConfig.toolbarWritingDisplay) {
      this.toolbarWritingDisplay = this.$store.getters.baseConfig.toolbarWritingDisplay
    } else {
      this.toolbarWritingDisplay = '0'
    }
    if (this.$store.getters.baseConfig.toolbarCompactLayout) {
      this.toolbarCompactLayout = this.$store.getters.baseConfig.toolbarCompactLayout
    } else {
      this.toolbarCompactLayout = 'false'
    }
  },
  methods: {
    createThird () {
      this.id = ''
      this.type = ''
      this.drawerTitle = '新建任务属性设置'
      this.visibleThirdDrawer = true
    },
    updateThird (record) {
      this.id = record.id
      this.type = record.type
      this.drawerTitle = '修改任务属性设置'
      this.visibleThirdDrawer = true
    },
    onEditThird () {
      this.visibleThirdDrawer = false
      this.$refs.table.searchData()
    },
    deleteThird (record) {
      this.$confirm('是否要删除该记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$api['taskAttribute.delete']({ id: record.id }).then(res => {
          if (res) {
            this.$refs.table.searchData()
          }
        })
      })
    },
    search (param) {
      this.queryParam = param
    },
    reset () {
      this.queryParam = {}
    },
  }
}
</script>
