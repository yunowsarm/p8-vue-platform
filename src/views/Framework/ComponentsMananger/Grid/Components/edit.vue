<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <div>
    <form-list ref="form"
               :data-source="dataSource"
               :form="formData"
               :api="saveApi"
               @saved="saved"
               label-width="100px"
               :is-custom-validate="true"
               @custom-validate="customValidate"
               @rendered="rendered">
      <template #sqlid>
        <el-select v-model="formData.sqlid"
                   @change="changeSql"
                   style="width: 100%">
          <template v-for="(item, index) in sqlIdOption">
            <el-option :label="item.name"
                       :value="item.id"
                       :key="index"></el-option>
          </template>
        </el-select>
      </template>
      <template #styleRendering>
        <ace-edit :value.sync="formData.styleRendering"
                  width="400px"
                  height="150px"></ace-edit>
      </template>
      <template slot="btn">
        <el-button @click="cancel">取 消</el-button>
      </template>
    </form-list>
    <!-- <i v-show="iconShow" id="icon-style" class="el-icon-full-screen" @click="iconClick"></i>
    <i v-show="!iconShow" id="icon-style" class="el-icon-copy-document" @click="iconClick"></i> -->
    <common-tabs :tabs-data="tabsData"
                 :height="height"
                 style="z-index: 1000"
                 :active-tabs="activeTabs"
                 @tab-click="tabClick"
                 type="border-card"
                 class="el_tabs"
                 :has-full-screen="true">
      <template #tableConfigDetails>
        <editable-table ref="editTable"
                        class="editTable"
                        :columns="columns"
                        :add-row="true"
                        :height="eaitHeight"
                        :need-params="true"
                        :params="tableParams"
                        :change-table-data="changeTableData"
                        :is-merge="isMerge"
                        :api="tableConfigDetailsApi"
                        @save-param-data="saveTableData">
          <template #isParent="{ scope, data }">
            <el-checkbox v-model="scope.row.isParent"
                         :true-label="1"
                         :false-label="0"
                         @change="saveTableData(data)"></el-checkbox>
          </template>
          <template #treeNode="{ scope, data }">
            <el-checkbox v-model="scope.row.treeNode"
                         true-label="1"
                         false-label="0"
                         @change="saveTableData(data)"></el-checkbox>
          </template>
          <template #fieldName="{ scope, data }">
            <el-input v-model="scope.row.fieldName"
                      :disabled="!!scope.row.isCustomColumn"
                      @blur="saveTableData(data)"></el-input>
          </template>
          <template #fieldType="{ scope, data }">
            <el-input v-model="scope.row.fieldType"
                      :disabled="!!scope.row.isCustomColumn"
                      @blur="saveTableData(data)"></el-input>
          </template>
          <template #fieldTxt="{ scope, data }">
            <el-input v-model="scope.row.fieldTxt"
                      @blur="saveTableData(data)"></el-input>
          </template>
          <template #fieldWidth="{ scope, data }">
            <el-input-number v-model="scope.row.fieldWidth"
                             @blur="saveTableData(data)"></el-input-number>
          </template>
          <template #isListShow="{ scope, data }">
            <el-checkbox v-model="scope.row.isListShow"
                         :true-label="1"
                         :false-label="0"
                         @change="saveTableData(data)"></el-checkbox>
          </template>
          <template #isViewShow="{ scope, data }">
            <el-checkbox v-model="scope.row.isViewShow"
                         :true-label="1"
                         :false-label="0"
                         :disabled="!!scope.row.isCustomColumn"
                         @change="saveTableData(data)"></el-checkbox>
          </template>
          <template #isOrder="{ scope, data }">
            <el-checkbox v-model="scope.row.isOrder"
                         :true-label="1"
                         :false-label="0"
                         @change="saveTableData(data)"></el-checkbox>
          </template>
          <template #isSearch="{ scope, data }">
            <el-checkbox v-model="scope.row.isSearch"
                         :true-label="1"
                         :false-label="0"
                         :disabled="!!scope.row.isCustomColumn"
                         @change="saveTableData(data, 'isSearch', scope)"></el-checkbox>
          </template>
          <template #isCustomColumnHeader="{}">
            是否自定义列
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        placement="top">
              <div slot="content">
                <p>自定义列能够实现如序号列生成、预留插槽进行图标渲染等功能，可在自定义列配置选项页中管理。</p>
              </div>
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #isCustomColumn="{ scope, data }">
            <el-checkbox v-model="scope.row.isCustomColumn"
                         :true-label="1"
                         :false-label="0"
                         @change="saveTableData(data, 'isCustomColumn', scope)"></el-checkbox>
          </template>
          <template #searchMode="{ scope, data }">
            <!-- <el-select v-model="scope.row.searchMode" clearable @change="saveTableData(data)">
              <el-option label="单条件查询" value="singleSearch"></el-option>
              <el-option label="范围查询" value="rangeSearch"></el-option>
            </el-select> -->
            <el-select v-model="scope.row.searchMode"
                       clearable
                       :disabled="!!scope.row.isCustomColumn"
                       @change="saveTableData(data, null, scope)">
              <el-option label="文本框"
                         value="text"></el-option>
              <el-option label="目录组件"
                         value="select"></el-option>
              <el-option label="树组件"
                         value="treeSelect"></el-option>
              <el-option label="复选"
                         value="multiple"></el-option>
              <el-option label="数字"
                         value="number"></el-option>
              <el-option label="单选按钮"
                         value="radioButton"></el-option>
              <el-option label="弹出组件"
                         value="popUpSelect"></el-option>
              <el-option label="日期"
                         value="datetime"></el-option>
              <el-option label="时间范围"
                         value="datetimeRange"></el-option>
            </el-select>
          </template>
          <template #replaceValHeader="{}">
            查询目标字段
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        placement="top">
              <div slot="content">
                <p>通过该值对目标字段进行查询筛选，例如：显示名称的字段通过目录组件选择后对ID列进行查询。</p>
              </div>
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #replaceVal="{ scope, data }">
            <el-select v-model="scope.row.replaceVal"
                       style="width: 100%"
                       clearable
                       :disabled="!!scope.row.isCustomColumn"
                       @change="saveTableData(data)">
              <el-option v-for="item in replaceData"
                         :key="item.value"
                         :label="item.value"
                         :value="item.value"></el-option>
            </el-select>
          </template>
          <template #dictCodeHeader="{}">
            选项组件
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        placement="top">
              <div slot="content">
                <p>查询模式为目录组件、树组件、弹出组件时，可选择选项组件管理中创建的选项组件，在查询时约束取值范围。</p>
              </div>
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #dictCode="{ scope, data }">
            <!-- 文本框 -->
            <div v-if="scope.row.searchMode === 'text'">
              <el-input clearable
                        :disabled="!!scope.row.isCustomColumn"
                        v-model="scope.row.dictCode"></el-input>
            </div>
            <!-- 目录组件 复选组件-->
            <div v-if="scope.row.searchMode === 'select' || scope.row.searchMode === 'multiple' || scope.row.searchMode === 'radioButton'">
              <el-select v-model="scope.row.dictCode"
                         style="width: 100%"
                         clearable
                         :disabled="!!scope.row.isCustomColumn"
                         filterable
                         @change="saveTableData(data)">
                <el-option v-for="item in renderData"
                           :key="item.selectionCode"
                           :label="item.selectionName + '(' + item.selectionCode + ')'"
                           :value="item.selectionCode"> </el-option>
              </el-select>
            </div>
            <!-- 树组件 -->
            <div v-if="scope.row.searchMode === 'treeSelect'">
              <el-select v-model="scope.row.dictCode"
                         style="width: 100%"
                         clearable
                         :disabled="!!scope.row.isCustomColumn"
                         filterable
                         @change="saveTableData(data)">
                <el-option v-for="item in treeData"
                           :key="item.selectionCode"
                           :label="item.selectionName + '(' + item.selectionCode + ')'"
                           :value="item.selectionCode"> </el-option>
              </el-select>
              <!-- <tree-select :multiple="true"
                           :data="treeData"
                           clearable
                           :disabled="!!scope.row.isCustomColumn"
                           v-model="scope.row.dictCode"
                           size="medium"
                           style="width: 100%"></tree-select> -->
            </div>
            <!-- 弹出组件 -->
            <div v-if="scope.row.searchMode === 'popUpSelect'">
              <el-input v-model="scope.row.dictCode"
                        readonly
                        autosize
                        :disabled="!!scope.row.isCustomColumn"
                        @click.native="showDialog(scope, data)">
                <i class="el-icon-link"
                   slot="suffix"
                   type="link"
                   :style="{ cursor: 'pointer', fontSize: '16px', color: '#08c' }"></i>
              </el-input>
              <common-dialog title="表格组件"
                             :visible="moduleVisible"
                             @handle-cancel="handleCancel"
                             @handle-ok="componentsHandleOk"
                             @close="handleCancel"
                             width="60%">
                <template #dialog>
                  <common-table ref="table"
                                :comp="comp"
                                :columns="tableColumns"
                                :params="queryParam"
                                :api="tableApi"
                                @selection-change="handleSelectionChange"> </common-table>
                </template>
              </common-dialog>
            </div>
            <!-- 日期 -->
            <div v-if="scope.row.searchMode === 'datetime'">
              <el-date-picker v-model="scope.row.dictCode"
                              type="date"
                              clearable
                              :disabled="!!scope.row.isCustomColumn"
                              placeholder="选择日期"> </el-date-picker>
            </div>
            <!-- 时间范围 -->
            <div v-if="scope.row.searchMode === 'datetimeRange'">
              <el-date-picker v-model="scope.row.dictCode"
                              type="daterange"
                              style="width: 100%"
                              :disabled="!!scope.row.isCustomColumn"
                              range-separator="至"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期">
              </el-date-picker>
            </div>
            <!-- 数字 -->
            <div v-if="scope.row.searchMode === 'number'">
              <el-input clearable
                        :disabled="!!scope.row.isCustomColumn"
                        v-model="scope.row.dictCode"
                        type="number"
                        size="medium"></el-input>
            </div>
          </template>
          <template #fieldHrefHeader="{}">
            单击事件
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        placement="top">
              <div slot="content">
                <p>表格中该列数据点击后通过弹窗方式进入其他组件，可将该值数据作为参数传递给弹出组件中进行控制。</p>
              </div>
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #fieldHref="{ scope, data }">
            <el-input v-model="scope.row.tenantId"
                      clearable
                      autosize
                      :disabled="!!scope.row.isCustomColumn">
              <i class="el-icon-link"
                 slot="suffix"
                 type="link"
                 :style="{ cursor: 'pointer', fontSize: '16px', color: '#08c', marginTop: '8px' }"
                 @click="showModal(scope, data)"></i>
            </el-input>
            <select-module v-if="dialogVisible && selectModuleIndex == scope.$index"
                           :visible="dialogVisible"
                           @close="dialogVisible = false"
                           @handleOk="handleOk"></select-module>
          </template>
          <template #orderNum="{ scope, data }">
            <el-input-number v-model="scope.row.orderNum"
                             :disabled="!!scope.row.isCustomColumn"
                             @blur="saveTableData(data)"></el-input-number>
          </template>
        </editable-table>
      </template>
      <template #tableParam>
        <editable-table :columns="paramColumns"
                        :add-row="true"
                        :need-params="true"
                        :params="paramParams"
                        api="formGenerator.tableParam"
                        @save-param-data="saveParamData">
          <template #paramName="{ scope, data }">
            <el-input v-model="scope.row.paramName"
                      @blur="saveParamData(data)"></el-input>
          </template>
          <template #paramTxt="{ scope, data }">
            <el-input v-model="scope.row.paramTxt"
                      @blur="saveParamData(data)"></el-input>
          </template>
          <template #paramValueHeader="{}">
            参数默认值
            <i style="font-size: 20px; cursor: pointer"
               class="el-icon-question"
               @click="openHelp"></i>
          </template>
          <template #paramValue="{ scope, data }">
            <el-input v-model="scope.row.paramValue"
                      @blur="saveParamData(data)"></el-input>
          </template>
          <template #orderNum="{ scope, data }">
            <el-input-number v-model="scope.row.orderNum"
                             @blur="saveParamData(data)"></el-input-number>
          </template>
        </editable-table>
      </template>
      <template #tableButton>
        <editable-table :columns="buttonColumns"
                        :add-row="true"
                        :need-params="true"
                        :params="buttonParams"
                        api="formGenerator.tableButton"
                        @save-param-data="saveButtonData">
          <template #title="{ scope, data }">
            <el-input v-model="scope.row.title"
                      @blur="saveButtonData(data)"></el-input>
          </template>
          <!-- <template #id="{scope, data}">
            <el-input v-model="scope.row.id" @blur="saveButtonData(data)"></el-input>
          </template>
          <template #parentId="{scope, data}">
            <el-input v-model="scope.row.parentId" @blur="saveButtonData(data)"></el-input>
          </template> -->
          <template #image="{ scope }">
            <i v-if="!scope.row.image"
               class="p8 icon-tupian"
               slot="suffix"
               type="link"
               :style="{ cursor: 'pointer', fontSize: '40px', color: '#c0c4cc', marginTop: '8px' }"
               @click="iconClick(scope)"></i>
            <i v-else
               :class="scope.row.image"
               @click="iconClick(scope)"></i>
            <common-dialog title="图标选择"
                           width="50%"
                           v-if="iconPopover"
                           :visible="iconPopover"
                           :dialog-config="{ modal: false }"
                           :dialog-height="400"
                           @close="ionClose"
                           @handle-cancel="ionClose"
                           @handle-ok="doIconSelect">
              <template #dialog>
                <icon-selector @icon-select="iconSelect"
                               :color-picker="false"></icon-selector>
              </template>
            </common-dialog>
          </template>
          <!-- <template #enable="{scope, data}">
            <el-checkbox v-model="scope.row.enable" @change="saveButtonData(data)"></el-checkbox>
          </template> -->
          <!-- <template #isDisabled="{scope, data}">
            <el-checkbox v-model="scope.row.isDisabled" @change="saveButtonData(data)"></el-checkbox>
          </template> -->
          <template #location="{ scope, data }">
            <el-select v-model="scope.row.location"
                       @change="saveButtonData(data)">
              <el-option label="行内"
                         value="row"></el-option>
              <el-option label="顶部"
                         value="head"></el-option>
            </el-select>
          </template>
          <template #eventHandleHeader="{}">
            事件
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        placement="top">
              <div slot="content">
                <p>
                  按钮事件定义，可使用平台内置事件，也可使用输入名称使用自定义事件 ，自定义事件需嵌入渲染器二次开发实现。内置事件如下：<br />
                  表单新建操作：调用表单组件进行新建操作<br />
                  新建修改操作：调用表单组件进行修改操作<br />
                  表单删除操作：删除表格行内数据<br />
                  弹出窗口打开组件：弹出已设置的组件<br />
                  Api接口调用：调用方法向配置的接口发起请求<br />
                  发起流程：弹出弹框发起审批流程<br />
                  查看流程图：弹出流程图查看界面<br />
                  撤回流程：撤回已发起的流程<br />
                  导出Excel：导出Excel<br />
                  导入Excel：弹出弹框导入附件<br />
                </p>
              </div>
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #eventHandle="{ scope, data }">
            <el-autocomplete v-model="scope.row.eventHandle"
                             :fetch-suggestions="querySearch"
                             @blur="saveButtonData(data, scope)">
              <template slot-scope="{ item }">
                <div class="name">{{ item.value }}</div>
              </template>
            </el-autocomplete>
          </template>
          <template #belongTo="{ scope, data }">
            <el-input v-model="scope.row.belongTo"
                      @blur="saveButtonData(data)"></el-input>
          </template>
          <template #eventParamsHeader="{}">
            事件参数
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        content="事件参数主要由所选事件决定，自定义参数由开发者自行填写，行内按钮事件会接收该行记录对象。"
                        placement="top">
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #eventParams="{ scope, data }">
            <el-button v-if="!scope.row.eventParams"
                       type="primary"
                       style="padding: 10px"
                       @click="focusParams(scope, data)">单击设置事件参数</el-button>
            <el-input v-if="scope.row.eventParams"
                      type="textarea"
                      v-model="scope.row.eventParams"></el-input>
          </template>
          <template #permissionHeader="{}">
            禁用规则
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip testtooltipLoong"
                        placement="top">
              <div slot="content">
                <p>
                  以Json数据格式配置该按钮禁用规则。模板如下：<br />
                  {<br />
                  'min': 1, // 最少选择记录数<br />
                  'max': 3, // 最大选择记录数<br />
                  'mustSelect': 'true' //是否必选记录<br />
                  'disabled': [ //禁用或隐藏逻辑配置，隐藏使用'hidden'<br />
                  {<br />
                  'field': 'status', //参与逻辑判断的对象属性<br />
                  'status': [ //field对象属性在status数组中时将disabled<br />
                  '2100','2300','2400'<br />
                  ],<br />
                  'title': [ //禁用时提示信息的前部描述：[xxx]状态不可进行该操作等<br />
                  '发布审批中','已发布','已完成'<br />
                  ]<br />
                  },<br />
                  {<br />
                  ......,<br />
                  'link': 'AND' //禁用或隐藏逻辑为复合条件时，标注与前一个条件'AND'或'OR'关系<br />
                  }<br />
                  ],<br />
                  'function': 'testFunction' //自定义函数进行；禁用逻辑判断，返回对象为<br />
                  {disable:true或false,disableMsg:'xxxx不可进行该操作'}<br />
                  }<br />
                </p>
              </div>
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #permission="{ scope, data }">
            <el-input type="textarea"
                      v-model="scope.row.permission"
                      @change="saveButtonData(data)"></el-input>
          </template>
          <template #component="{ scope, data }">
            <el-input type="textarea"
                      v-model="scope.row.component"
                      @change="saveButtonData(data)"></el-input>
          </template>
          <template #remark="{ scope, data }">
            <el-input type="textarea"
                      v-model="scope.row.remark"
                      @change="saveButtonData(data)"></el-input>
          </template>
          <template #rdesc="{ scope, data }">
            <el-input type="textarea"
                      v-model="scope.row.rdesc"
                      @blur="saveButtonData(data)"></el-input>
          </template>
        </editable-table>
        <common-dialog title="设置事件参数"
                       :visible="paramsVisible"
                       @handle-cancel="handleClose"
                       @handle-ok="handleParamsOk"
                       width="30%"
                       @close="handleClose">
          <template #dialog>
            <form-list ref="formParams"
                       label-width="100px"
                       :data-source="paramsSource"
                       :form="paramsFormData"
                       :exist-default-btn="false">
              <div v-if="des"
                   style="margin-left: 100px"><i class="el-icon-info"></i> {{ des }}</div>
              <template #paramsText>
                <ace-edit :value.sync="paramsFormData.paramsText"
                          :config="aceConfig"
                          width="100%"
                          height="200px"></ace-edit>
              </template>
            </form-list>
          </template>
        </common-dialog>
      </template>
      <template #configColumnDetails>
        <editable-table :columns="configColumn"
                        :add-row="false"
                        :params="configParams"
                        :data="editableData"
                        @save-param-data="configParamData">
          <template #isCustomColumn="{ scope }">
            <span>{{ scope.row.isCustomColumn ? '是' : '否' }}</span>
          </template>
          <template #isTableTotal="{ scope, data }">
            <el-checkbox v-if="isCalculate(scope)"
                         v-model="scope.row.isTableTotal"
                         :true-label="'1'"
                         :false-label="'0'"
                         @change="configParamData(data)"></el-checkbox>
            <span v-else></span>
          </template>
          <template #isFatherTotal="{ scope, data }">
            <el-checkbox v-if="isCalculate(scope)"
                         v-model="scope.row.isFatherTotal"
                         :true-label="'1'"
                         :false-label="'0'"
                         @change="configParamData(data)"></el-checkbox>
            <span v-else></span>
          </template>
          <template #customColumnType="{ scope, data }">
            <el-select v-if="scope.row.isCustomColumn == '1'"
                       v-model="scope.row.customColumnType"
                       clearable
                       @change="configParamData(data, scope)">
              <el-option label="序号"
                         value="index"></el-option>
              <el-option label="计算"
                         value="count"></el-option>
              <el-option label="图标"
                         value="icon"></el-option>
              <el-option label="插槽"
                         value="slot"></el-option>
            </el-select>
            <span v-else></span>
          </template>
          <template #customColumnTypeHeader="{}">
            自定义列类型
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        content="自定义列类型能够实现生成序号、生成图标、公式计算等功能，可在列设置中配置图标和计算的生成规则"
                        placement="top">
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #columnConfigHeader="{}">
            列设置
            <el-tooltip class="item"
                        effect="dark"
                        popper-class="testtooltip"
                        content="自定义列类型设置为计算或图标时，可通过该列配置图标生成规则和计算规则"
                        placement="top">
              <i style="font-size: 20px"
                 class="el-icon-question"></i>
            </el-tooltip>
          </template>
          <template #columnConfig="{ scope, data }">
            <el-input v-if="scope.row.isCustomColumn == '1' && scope.row.customColumnType == 'count'"
                      type="textarea"
                      :rows="1"
                      v-model="scope.row.columnConfig.countStr"
                      @click.native="showComfigDialog(scope)"
                      @blur="configParamData(data)"></el-input>
            <div v-else-if="scope.row.isCustomColumn == '1' && scope.row.customColumnType == 'icon'"
                 style="text-align: left">
              <el-button type="text"
                         @click="showComfigDialog(scope)"
                         style="margin-right: 5px">添加</el-button>
              <span v-for="(item, index) in scope.row.columnConfig.iconConfig"
                    :key="index"
                    class="wrap"
                    @click="modify(item, index, scope)">
                <span v-if="item.isDataDic == '1'"> 数据字典：{{ item.dataDicDisplay }} </span>
                <span v-else>
                  <span :class="item.icon"
                        :style="{ color: item.color }"
                        style="margin-right: 3px"></span>
                  <span>{{ item.columnsName }}</span>
                  <span>[{{ item.condition }}]</span>
                </span>
                <span class="el-icon-circle-close iconClose"
                      @click.stop="delectIconList(index, scope)"></span>
              </span>
            </div>
            <el-input v-else-if="scope.row.isCustomColumn == '1' && scope.row.customColumnType == 'slot'"
                      placeholder="插槽名"
                      v-model="scope.row.columnConfig.slotName"
                      @blur="configParamData(data)"></el-input>
            <span v-else></span>
            <formula v-if="countVisible && scope.$index === index"
                     :visible="countVisible"
                     :data-list="dataList"
                     :default-list="scope.row.columnConfig.countArr"
                     @close="countVisible = false"
                     @handleOk="formulaHandleOk"></formula>
            <icon-custom v-if="iconVisible && scope.$index === index"
                         :visible="iconVisible"
                         @close="iconVisible = false"
                         @handleOk="iconConfigOk"
                         :data-list="dataList"
                         :modify-record="modifyRecord"></icon-custom>
          </template>
        </editable-table>
      </template>
      <template #editConfig>
        <form-list ref="editConfigForm"
                   :data-source="editDataSource"
                   :form="formData"
                   :exist-default-btn="false"
                   style="height: 110px"
                   label-width="120px">
          <template #tableId>
            <el-select v-model="formData.tableId"
                       placeholder="请选择数据源">
              <el-popover placement="left"
                          width="200"
                          trigger="hover"
                          v-for="item in dataBaseOption"
                          :key="item.value">
                <el-descriptions title="数据源信息"
                                 border
                                 direction="vertical"
                                 :column="1">
                  <el-descriptions-item label="表名称">{{ item.tableName }}</el-descriptions-item>
                  <el-descriptions-item label="表描述">{{ item.tableDesc }}</el-descriptions-item>
                </el-descriptions>
                <el-option slot="reference"
                           :label="item.tableName"
                           :value="item.id"></el-option>
              </el-popover>
            </el-select>
          </template>
        </form-list>
        <editable-table class="editConfig"
                        :columns="editColumn"
                        :add-row="false"
                        :change-table-data="editConfigData"
                        @save-param-data="editParamData">
          <template #isRequired="{ scope, data }">
            <el-checkbox :disabled="!!scope.row.isCustomColumn"
                         v-model="scope.row.isRequired"
                         :true-label="1"
                         :false-label="0"
                         @change="editParamData(data)"></el-checkbox>
          </template>
          <template #editDisplay="{ scope, data }">
            <el-checkbox :disabled="!!scope.row.isCustomColumn"
                         v-model="scope.row.editDisplay"
                         :true-label="'1'"
                         :false-label="'0'"
                         @change="editParamData(data)"></el-checkbox>
          </template>
          <template #defaultValue="{ scope, data }">
            <el-input v-model="scope.row.defaultValue"
                      @blur="editParamData(data)"></el-input>
          </template>
          <template #defaultValueHeader="{}">
            默认值
            <i style="font-size: 20px; cursor: pointer"
               class="el-icon-question"
               @click="openHelp"></i>
          </template>
          <template #editComponentType="{ scope, data }">
            <el-select :disabled="!!scope.row.isCustomColumn"
                       v-model="scope.row.editComponentType"
                       clearable
                       @change="editParamData(data)">
              <el-option label="文本框"
                         value="text"></el-option>
              <el-option label="数值"
                         value="number"></el-option>
              <el-option label="日期"
                         value="date"></el-option>
              <!-- <el-option label="日期范围" value="daterange"></el-option> -->
            </el-select>
          </template>
          <template #sourceTableFiled="{ scope, data }">
            <el-select :disabled="!!scope.row.isCustomColumn"
                       v-model="scope.row.sourceTableFiled"
                       clearable
                       @change="editParamData(data, scope)">
              <el-option v-for="item in childTableList"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
          </template>
          <template #tableFieldName="{ scope, data }">
            <el-select :disabled="!!scope.row.isCustomColumn"
                       v-if="scope.row.sourceTableFiled"
                       clearable
                       v-model="scope.row.tableFieldName"
                       @change="editParamData(data)">
              <el-option v-for="item in scope.row.FormFieldsList"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
            <el-select :disabled="!!scope.row.isCustomColumn"
                       v-else
                       v-model="scope.row.tableFieldName"
                       clearable
                       @change="editParamData(data)">
              <el-option v-for="item in FormFields"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
          </template>
        </editable-table>
        <common-dialog title="默认值"
                       v-if="helpVisible"
                       :visible="helpVisible"
                       :show-handle-btn="false"
                       @close="helpVisible = false">
          <template #dialog>
            <view-parameter></view-parameter>
          </template>
        </common-dialog>
      </template>
    </common-tabs>
  </div>
</template>

<script>
import {
  P8Table as CommonTable,
  Input,
  Checkbox,
  Select,
  Option,
  InputNumber,
  Autocomplete,
  P8Form as FormList,
  P8Tabs as CommonTabs,
  P8EditTable as EditableTable,
  P8Dialog as CommonDialog,
  P8IconSelector as IconSelector
} from 'p8-components-ui'
// import { generateTree } from '@/utils/generateTree'
import SelectModule from '@/views/Framework/ComponentsMananger/Components/selectComponents'
import moment from 'moment'
import formula from './components/formula.vue'
import iconCustom from './components/iconCustom.vue'
import aceEdit from '@/views/Framework/ComponentsMananger/Base/Components/ace'
import { eventHandleArr } from '@/views/Framework/ComponentsMananger/Grid/Components/eventHandleArr'
import ViewParameter from './components/ViewParameter.vue'
export default {
  name: 'TableEdit',
  components: {
    FormList,
    CommonTabs,
    EditableTable,
    // TreeSelect,
    'select-module': SelectModule,
    'el-input': Input,
    'el-checkbox': Checkbox,
    'el-select': Select,
    'el-option': Option,
    'el-input-number': InputNumber,
    'el-autocomplete': Autocomplete,
    CommonDialog,
    CommonTable,
    formula,
    iconCustom,
    aceEdit,
    IconSelector,
    ViewParameter
  },
  props: {
    record: {
      type: Object,
      default: () => { }
    }
  },
  watch: {
    'formData.tableId': {
      handler (val) {
        this.getChildTableData(val)
      }
    },
    'formData.tableType': {
      handler: function (val) {
        this.isTreeTable(val)
      }
    },
    'formData.enableEdit': {
      handler: function (val) {
        this.changeTabsData(val)
      }
    }
  },
  data () {
    const height = document.documentElement.clientHeight - 608
    return {
      selectModuleIndex: null,
      helpVisible: false,
      iconPopover: false,
      dataBaseOption: [], // 数据源
      saveApi: 'formGenerator.tableSave',
      comp: this,
      dataSourceCapy: [
        {
          type: 'text',
          labelText: '表格编码',
          fieldName: 'code',
          placeholder: '请输入表格编码',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'text',
          labelText: '表格名称',
          fieldName: 'name',
          placeholder: '请输入表格名称',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '表格类型',
          fieldName: 'tableType',
          colLayout: 'doubleCol',
          options: [
            {
              label: '列表',
              value: 0
            },
            {
              label: '树形',
              value: 1
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'blank',
          labelText: '数据视图',
          fieldName: 'sqlid',
          slotName: 'sqlid',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true,
              message: '该项为必填项'
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '启用编辑操作',
          fieldName: 'enableEdit',
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: false
          },
          options: [
            {
              label: '禁用',
              value: 0
            },
            {
              label: '启用',
              value: 1
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '查询条件位置',
          fieldName: 'searchPos',
          colLayout: 'doubleCol',
          options: [
            {
              label: '工具栏',
              value: 0
            },
            {
              label: '表头',
              value: 1
            },
            {
              label: '首行',
              value: 2
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '启用权限按钮',
          fieldName: 'useSystemConfigButton',
          colLayout: 'doubleCol',
          options: [
            {
              label: '禁用',
              value: 0
            },
            {
              label: '启用',
              value: 1
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '启用行单击',
          fieldName: 'enableClick',
          colLayout: 'doubleCol',
          options: [
            {
              label: '禁用',
              value: 0
            },
            {
              label: '启用',
              value: 1
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'radioButton',
          labelText: '显示复选框',
          fieldName: 'selectType',
          colLayout: 'doubleCol',
          options: [
            {
              label: '无',
              value: 0
            },
            {
              label: '单选',
              value: 1
            },
            {
              label: '复选',
              value: 2
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'hidden',
          labelText: '选择范围',
          fieldName: 'selectionRanges',
          colLayout: 'doubleCol',
          options: [
            { label: '根节点', value: '0' },
            { label: '父节点', value: '1' },
            { label: '子节点', value: '2' }
          ]
        },
        {
          type: 'select',
          labelText: '表头对齐方式',
          fieldName: 'title',
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: false
          },
          options: [
            {
              label: '左对齐',
              value: 'left'
            },
            {
              label: '居中对齐',
              value: 'center'
            },
            {
              label: '右对齐',
              value: 'right'
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'select',
          labelText: '内容对齐方式',
          fieldName: 'alignmentStyle',
          colLayout: 'doubleCol',
          fieldConfig: {
            disabled: false
          },
          options: [
            {
              label: '左对齐',
              value: 'left'
            },
            {
              label: '居中对齐',
              value: 'center'
            },
            {
              label: '右对齐',
              value: 'right'
            }
          ],
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'textarea',
          labelText: '描述',
          fieldName: 'content',
          placeholder: '请填写描述',
          colLayout: 'doubleCol',
          rules: [
            {
              required: true
            }
          ]
        },
        {
          type: 'blank',
          labelText: '自定义CSS',
          fieldName: 'styleRendering',
          slotName: 'styleRendering',
          colLayout: 'doubleCol'
        }
      ],
      dataSource: [],
      formData: {
        sqlid: '',
        tableType: 0,
        enableEdit: 0,
        styleRendering: '',
        selectionRanges: []
      },
      des: '',
      sqlIdOption: [],
      height: height + 'px',
      tabsData: [
        {
          label: '表格配置明细',
          name: 'tableConfigDetails',
          icon: 'icon-multi-project-manage'
        },
        {
          label: '自定义列配置',
          name: 'configColumnDetails',
          icon: 'icon-planning'
        },
        {
          label: '报表参数',
          name: 'tableParam',
          icon: 'icon-business-execution'
        },
        {
          label: '表格按钮',
          name: 'tableButton',
          icon: 'icon-process-template'
        }
      ],
      columns: [
        {
          title: '字段名称',
          dataIndex: 'fieldName',
          width: 160,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段类型',
          dataIndex: 'fieldType',
          width: 120,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段文本',
          dataIndex: 'fieldTxt',
          width: 180,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '字段宽度',
          dataIndex: 'fieldWidth',
          width: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '列表是否显示',
          dataIndex: 'isListShow',
          minWidth: 100,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查看是否显示',
          dataIndex: 'isViewShow',
          minWidth: 100,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否排序',
          dataIndex: 'isOrder',
          minWidth: 80,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否查询',
          dataIndex: 'isSearch',
          minWidth: 80,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否自定义列',
          dataIndex: 'isCustomColumn',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查询模式',
          dataIndex: 'searchMode',
          width: 140,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '查询目标字段',
          dataIndex: 'replaceVal',
          width: 180,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '选项组件',
          dataIndex: 'dictCode',
          width: 240,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '单击事件',
          dataIndex: 'fieldHref',
          width: 180,
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '排序',
          dataIndex: 'orderNum',
          width: 140,
          scopedSlots: { customRender: 'custom' }
        }
      ],
      paramColumns: [
        {
          title: '参数字段',
          dataIndex: 'paramName',
          minWidth: 140,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '参数文本',
          dataIndex: 'paramTxt',
          minWidth: 180,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '参数默认值',
          dataIndex: 'paramValue',
          minWidth: 180,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '排序',
          dataIndex: 'orderNum',
          width: 140,
          default: undefined,
          scopedSlots: { customRender: 'custom' }
        }
      ],
      buttonColumns: [
        {
          title: '按钮文本',
          dataIndex: 'title',
          minWidth: 120,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        // {
        //   title: 'ID',
        //   dataIndex: 'id',
        //   minWidth: 160,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
        // {
        //   title: 'parentId',
        //   dataIndex: 'parentId',
        //   minWidth: 160,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
        {
          title: '图标',
          dataIndex: 'image',
          align: 'center',
          width: 100,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        // {
        //   title: '是否可见',
        //   dataIndex: 'enable',
        //   width: 80,
        //   align: 'center',
        //   default: true,
        //   scopedSlots: { customRender: 'custom' }
        // },
        // {
        //   title: '是否禁用',
        //   dataIndex: 'isDisabled',
        //   width: 80,
        //   align: 'center',
        //   default: false,
        //   scopedSlots: { customRender: 'custom' }
        // },
        {
          title: '位置',
          dataIndex: 'location',
          width: 200,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '事件',
          dataIndex: 'eventHandle',
          width: 200,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '事件参数',
          dataIndex: 'eventParams',
          width: 300,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        // {
        //   title: '表单code',
        //   dataIndex: 'belongTo',
        //   width: 120,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
        {
          title: '禁用规则',
          dataIndex: 'permission',
          minWidth: 200,
          default: '',
          scopedSlots: { customRender: 'custom' }
        },
        // {
        //   title: '动态组件地址',
        //   dataIndex: 'component',
        //   width: 200,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
        // {
        //   title: '动态api',
        //   dataIndex: 'remark',
        //   width: 200,
        //   default: '',
        //   scopedSlots: { customRender: 'custom' }
        // },
        {
          title: '描述',
          dataIndex: 'rdesc',
          width: 300,
          default: '',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      configColumn: [
        {
          title: '字段名称',
          dataIndex: 'fieldName',
          width: 140,
          align: 'center'
        },
        {
          title: '字段类型',
          dataIndex: 'fieldType',
          width: 140,
          align: 'center'
        },
        {
          title: '字段文本',
          dataIndex: 'fieldTxt',
          width: 160,
          align: 'center'
        },
        {
          title: '字段宽度',
          dataIndex: 'fieldWidth',
          width: 120,
          align: 'center'
        },
        {
          title: '是否自定义列',
          dataIndex: 'isCustomColumn',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否表尾合计',
          dataIndex: 'isTableTotal',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '是否父节点合计',
          dataIndex: 'isFatherTotal',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '自定义列类型',
          dataIndex: 'customColumnType',
          width: 140,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '列设置',
          dataIndex: 'columnConfig',
          minWidth: 180,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      editColumn: [
        {
          title: '列名称',
          dataIndex: 'fieldTxt',
          minWidth: 140,
          align: 'center'
        },
        {
          title: '列数据类型',
          dataIndex: 'fieldType',
          minWidth: 140,
          align: 'center'
        },
        {
          title: '是否必填',
          dataIndex: 'isRequired',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '编辑是否隐藏',
          dataIndex: 'editDisplay',
          minWidth: 100,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '默认值',
          dataIndex: 'defaultValue',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '编辑组件类型',
          dataIndex: 'editComponentType',
          minWidth: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        // {
        //   title: '存储数据源子表',
        //   dataIndex: 'sourceTableFiled',
        //   minWidth: 120,
        //   align: 'center',
        //   scopedSlots: { customRender: 'custom' }
        // },
        {
          title: '字段名',
          dataIndex: 'tableFieldName',
          minWidth: 140,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        }
      ],
      editDataSource: [
        {
          type: 'radioButton',
          labelText: '编辑模式',
          fieldName: 'editMode',
          colLayout: 'doubleCol',
          defaultValue: 0,
          options: [
            {
              label: '行编辑',
              value: 0
            },
            {
              label: '弹出编辑',
              value: 1
            }
          ],
          rules: [{ required: true, message: '必填' }]
        },
        {
          type: 'radioButton',
          labelText: '保存模式',
          fieldName: 'saveMode',
          colLayout: 'doubleCol',
          defaultValue: 0,
          options: [
            {
              label: '自动',
              value: 0
            },
            {
              label: '手动',
              value: 1
            }
          ],
          rules: [{ required: true, message: '必填' }]
        },
        {
          type: 'blank',
          labelText: '存储数据源主表',
          fieldName: 'tableId',
          slotName: 'tableId',
          colLayout: 'doubleCol',
          placeholder: '请选择存储数据源',
          optionUrl: { api: 'formGenerator.getCgTableData', params: {} },
          options: [],
          fieldConfig: {
            disabled: false
          },
          rules: [{ required: true, message: '必填' }]
        }
      ],
      editConfigData: [],
      editFormData: {},
      childTableList: [],
      FormFields: [],
      tableParams: {},
      paramParams: {},
      buttonParams: {},
      activeTabs: 'tableConfigDetails',
      reportParams: {
        reportItem: [],
        reportParam: [],
        reportButton: [],
        reportConfig: []
      },
      tableConfigDetailsApi: '', // 报表配置列表的api，可切换
      oldSqlId: '',
      eventHandleArraly: eventHandleArr, // 报表内置事件名
      oldTableData: [], // sqlId没有改变前的报表配置明细
      changeTableData: [], // 合并的报表配置明细数据，传到editableTable改变table的数据
      isMerge: false, // 是否点击合并按钮，重新加载sql，获取新的报表配置明细数据
      moduleVisible: false,
      dialogVisible: false,
      replaceData: [],
      renderData: [],
      treeData: [],
      scopeValue: {},
      sqlParams: {},
      tableApi: 'selection.list',
      queryParam: { selectionType: 3 },
      tableColumns: [
        {
          type: 'selection',
          width: 40
        },
        {
          title: '序号',
          type: 'index',
          width: '50',
          align: 'center'
        },
        {
          title: '编码',
          dataIndex: 'selectionCode',
          align: 'center'
        },
        {
          title: '名称',
          dataIndex: 'selectionName',
          align: 'center'
        },
        {
          title: '类别',
          dataIndex: 'selectionType',
          align: 'center'
        },
        {
          title: '数据来源',
          dataIndex: 'dataSourceType',
          align: 'center'
        },
        {
          title: '创建人',
          dataIndex: 'createUser',
          align: 'center'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          formatter: function (row, column, cellValue, index) {
            let date = ''
            if (cellValue && cellValue !== '') {
              date = moment(cellValue).format('YYYY-MM-DD')
            }
            // console.log('date', date)
            return date
          },
          align: 'center'
        },
        {
          title: '修改人',
          dataIndex: 'updateUser',
          align: 'center'
        },
        {
          title: '修改时间',
          dataIndex: 'updateTime',
          formatter: function (row, column, cellValue, index) {
            let date = ''
            if (cellValue && cellValue !== '') {
              date = moment(cellValue).format('YYYY-MM-DD')
            }
            // console.log('date', date)
            return date
          },
          align: 'center'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '150',
          scopedSlots: {
            customRender: 'operation'
          },
          align: 'center'
        }
      ],
      selectRows: [],
      editableData: [],
      configParams: {},
      iconVisible: false,
      countVisible: false,
      dataList: [],
      index: null,
      aceConfig: {},
      iconShow: true,
      eaitHeight: '100%',
      paramsVisible: false,
      paramsFormData: {
        paramsChange: '',
        formCode: '',
        api: '',
        openDia: true,
        warningMsg: '',
        successMsg: '',
        errorMsg: '',
        paramsText: '',
        addressText: ''
      },
      paramsSource: [],
      formSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'select',
          labelText: '业务流程定义',
          fieldName: 'formCode',
          placeholder: '选择业务流程定义',
          colLayout: 'singleCol',
          options: []
        }
      ],
      apiSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '动态API',
          fieldName: 'api',
          colLayout: 'singleCol'
        },
        {
          type: 'switch',
          labelText: '开启确认对话框',
          fieldName: 'openDia',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '提示语',
          fieldName: 'warningMsg',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '成功提示',
          fieldName: 'successMsg',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '失败提示',
          fieldName: 'errorMsg',
          colLayout: 'singleCol'
        }
      ],
      defaultSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'blank',
          labelText: '自定义参数',
          fieldName: 'paramsText',
          slotName: 'paramsText',
          colLayout: 'singleCol'
        }
      ],
      textSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'textarea',
          labelText: '组件地址',
          fieldName: 'addressText',
          colLayout: 'singleCol'
        },
        {
          type: 'select',
          labelText: '类型',
          fieldName: 'type',
          options: [
            {
              label: '抽屉',
              value: 'drawer'
            },
            {
              label: '弹框',
              value: 'dialog'
            }
          ],
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '标题',
          fieldName: 'title',
          colLayout: 'singleCol'
        },
        {
          type: 'text',
          labelText: '宽度',
          fieldName: 'width',
          colLayout: 'singleCol'
        }
      ],
      editTableSource: [
        {
          type: 'view',
          labelText: '事件',
          fieldName: 'paramsChange',
          colLayout: 'singleCol'
        },
        {
          type: 'select',
          labelText: '编辑表格',
          fieldName: 'editTable',
          placeholder: '请选择编辑表格',
          colLayout: 'singleCol',
          optionUrl: {
            api: 'formGenerator.editList',
            params: {}
          }
        }
      ],
      funSource: [
        {
          type: 'blank',
          labelText: '自定义参数',
          fieldName: 'paramsText',
          slotName: 'paramsText',
          colLayout: 'singleCol'
        }
      ]
    }
  },
  mounted () {
    // this.treeData = generateTree(this.treeData)
    this.dataSource = this.dataSourceCapy
    window.addEventListener('resize', this._initTableSize)
    const param = {
      page: {
        current: -1,
        size: -1,
        orders: []
      }
    }
    this.$api['formGenerator.sqlList'](param).then((res) => {
      this.sqlIdOption = res.records
    })
    this.$api['selection.list']({ selectionType: 1, page: { current: 1, size: -1, orders: [] } }).then((res) => {
      this.renderData = res.records
    })
    this.$api['selection.list']({ selectionType: 2, page: { current: 1, size: -1, orders: [] } }).then((res) => {
      this.treeData = res.records
    })
    //  获取数据源
    this.getSource()
    // this.isTreeTable(this.formData.tableType)
  },
  methods: {
    changeTabsData (val) {
      if (val) {
        this.tabsData = [
          {
            label: '表格配置明细',
            name: 'tableConfigDetails',
            icon: 'icon-multi-project-manage'
          },
          {
            label: '自定义列配置',
            name: 'configColumnDetails',
            icon: 'icon-planning'
          },
          {
            label: '报表参数',
            name: 'tableParam',
            icon: 'icon-business-execution'
          },
          {
            label: '表格按钮',
            name: 'tableButton',
            icon: 'icon-process-template'
          },
          {
            label: '编辑配置',
            name: 'editConfig',
            icon: 'icon-my-task'
          }
        ]
      } else {
        this.tabsData = [
          {
            label: '表格配置明细',
            name: 'tableConfigDetails',
            icon: 'icon-multi-project-manage'
          },
          {
            label: '自定义列配置',
            name: 'configColumnDetails',
            icon: 'icon-planning'
          },
          {
            label: '报表参数',
            name: 'tableParam',
            icon: 'icon-business-execution'
          },
          {
            label: '表格按钮',
            name: 'tableButton',
            icon: 'icon-process-template'
          }
        ]
      }
    },
    paramsOptions (api) {
      this.$api[api]({ page: { current: 1, size: 999999, orders: [] } }).then((res) => {
        this.paramsSource[1].options = res.records.map((item) => {
          // 表单回填
          if (item.desformCode) {
            return {
              label: item.desformName,
              value: item.desformCode
            }
          }
          // 流程回填
          if (item.key) {
            return {
              label: item.name,
              value: item.key
            }
          }
          // 表格回填
          if (item.code) {
            return {
              label: item.name,
              value: item.code
            }
          }
        })
      })
    },
    focusParams (scope, data) {
      if (!scope.row.eventHandle) {
        return this.$message.warning('请先选择事件！')
      }
      let api = ''
      if (scope.row.eventHandle === 'dynamicAPI') {
        this.paramsSource = this.apiSource
      }
      switch (scope.row.eventHandle) {
        case 'createForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          this.des = '该事件为打开新建表单事件，需选择要弹出的表单'
          break
        case 'modifyForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          this.des = '该事件为修改表单事件，需选择要弹出的表单，与新建表单保持一致'
          break
        case 'viewForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          this.des = '该事件为查看表单事件，需选择要弹出的表单，与新建表单保持一致'
          break
        case 'deleteForm':
          this.paramsSource = this.formSource
          api = 'formGenerator.formList'
          this.des = '该事件为删除表单事件，需选择新建时选择的表单'
          break
        case 'startProcess':
        case 'cancelProcess':
        case 'viewProcess':
          this.paramsSource = this.formSource
          api = 'ProcessDefinition.listData'
          this.des = '该事件为流程事件，需选择已配置的流程模板'
          break
        case 'openComponent':
          // this.paramsSource = this.formSource
          // api = 'formGenerator.tableList'
          this.paramsSource = this.textSource
          this.des = '该事件为打开弹框事件，需输入要打开组件的地址'
          break
        case 'dynamicAPI':
          this.paramsSource = this.apiSource
          this.des = '该事件为动态API事件，需输入对应API以及提示语'
          break
        case 'openEditTable':
          this.paramsSource = this.editTableSource
          this.des = '该事件为打开编辑子表事件，需选择已配置的编辑表格'
          break
        case 'customerFun':
          this.paramsSource = this.funSource
          this.des = '该事件为用户自定义事件执行'
          this.aceConfig = {
            lang: 'javascript'
          }
          break
        default:
          this.paramsSource = this.defaultSource
          this.des = ''
          this.aceConfig = {
            lang: 'json'
          }
          break
      }
      if (api !== '') {
        this.paramsOptions(api)
      }
      this.scopeValue = scope
      this.paramsVisible = true
      this.paramsFormData.paramsChange = scope.row.eventHandle
      this.paramsFormData.formCode = ''
      this.paramsFormData.infoList = data
    },
    handleClose () {
      this.paramsVisible = false
    },
    handleParamsOk () {
      this.paramsVisible = false
      let obj
      switch (this.scopeValue.row.eventHandle) {
        case 'createForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'modifyForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'viewForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'deleteForm':
          obj = {
            module: '表单组件',
            code: this.paramsFormData.formCode
          }
          break
        case 'startProcess':
          obj = {
            module: 'BPM流程',
            code: this.paramsFormData.formCode
          }
          break
        case 'openComponent':
          obj = {
            module: '自定义抽屉组件',
            code: this.paramsFormData.addressText,
            type: this.paramsFormData.type,
            title: this.paramsFormData.title,
            width: this.paramsFormData.width
          }
          break
        case 'dynamicAPI':
          obj = {
            module: '动态API',
            code: this.paramsFormData.api,
            openDia: this.paramsFormData.openDia,
            warningMsg: this.paramsFormData.warningMsg,
            successMsg: this.paramsFormData.successMsg,
            errorMsg: this.paramsFormData.errorMsg
          }
          break
        case 'openEditTable':
          obj = {
            module: '编辑表格',
            code: this.paramsFormData.editTable
          }
          break
        case 'customerFun':
          obj = {
            module: '编辑表格',
            code: this.paramsFormData.paramsText
          }
          break
        default:
          obj = {
            module: '自定义',
            customJson: JSON.parse(this.paramsFormData.paramsText)
          }
          break
      }
      this.paramsFormData.infoList[this.scopeValue.$index].eventParams = JSON.stringify(obj)
    },
    getSource () {
      this.$api['formGenerator.getFormDataBase']().then((res) => {
        if (res && res.length) {
          this.dataBaseOption = res
        }
      })
    },
    iconClick (scope) {
      this.iconselectIndex = scope.$index
      this.iconPopover = true
    },
    isTreeTable (val) {
      if (val === 1) {
        // this.dataSource[4].fieldConfig.disabled = true
        // this.formData.enableEdit = 0
        this.dataSource[9].type = 'checkboxGroup'
        this.columns.splice(
          4,
          0,
          {
            title: '父ID',
            dataIndex: 'isParent',
            align: 'center',
            width: 60,
            scopedSlots: { customRender: 'custom' }
          },
          {
            title: '展开控制列',
            dataIndex: 'treeNode',
            align: 'center',
            width: 120,
            scopedSlots: { customRender: 'custom' }
          }
        )
      } else {
        this.dataSource[4].fieldConfig.disabled = false
        this.dataSource[9].type = 'hidden'
        this.columns.splice(4, 2)
      }
    },
    cancel () {
      this.$emit('cancel')
    },
    handleCancel () {
      this.moduleVisible = false
    },
    showDialog (scope, data) {
      this.moduleVisible = true
      this.scopeValue = scope
      this.reportParams.infoList = data
    },
    handleSelectionChange (val) {
      if (val.length >= 2) {
        // 删除索引为0的
        // console.log(val.splice(0,val.length-1),'被删除的')
        const arrays = val.splice(0, val.length - 1)
        arrays.forEach((row) => {
          this.$refs.table.$refs.table.toggleRowSelection(row) // 除了当前点击的，其他的全部取消选中
        })
      }
      this.selectRows = val
    },
    componentsHandleOk (val) {
      this.moduleVisible = false
      // this.reportParams.infoList[this.scopeValue.$index].dictName = this.selectRows[0].selectionName + '(' + this.selectRows[0].selectionCode + ')'
      this.reportParams.infoList[this.scopeValue.$index].dictCode = this.selectRows[0].selectionCode
    },
    showModal (scope, data) {
      this.dialogVisible = true
      this.scopeValue = scope
      this.selectModuleIndex = scope.$index
      this.reportParams.infoList = data
    },
    handleOk (val) {
      this.dialogVisible = false
      this.reportParams.infoList[this.scopeValue.$index].fieldHref = JSON.stringify(val)
      this.reportParams.infoList[this.scopeValue.$index].tenantId = val.name
    },
    _initTableSize () {
      // const vm = this
      // let timer = null
      // // 这里增加一个延迟保证不会触发频次不会太高,减少开销
      // if (timer) return
      // timer = setTimeout(() => {
      //   const mh = document.documentElement.clientHeight - 342
      //   vm.height = mh + 'px'
      //   timer = null
      // }, 300)
    },
    rendered () {
      // 所有表单元素渲染后调用rendered
      if (this.record.id) {
        this.oldSqlId = this.record.sqlid
        this.getFormData()
      }
    },
    getFormData () {
      this.formData = Object.assign({}, this.record)
      if (!this.record.styleRendering) {
        this.formData.styleRendering = ''
      }
      this.modifyTableData(this.formData.id)
      // 获取自定义列配置数据
      this.getConfigClomuns()
    },
    async getConfigClomuns () {
      this.$api['formGenerator.reportConfig']({ reportId: this.record.id }).then((res) => {
        this.editableData = res
      })
      const res = await this.$api['formGenerator.reportEditDispose']({ reportId: this.record.id })
      if (res && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].sourceTableFiled) {
            const data = await this.$api['formGenerator.getFormFields']({ id: res[i].sourceTableFiled })
            this.$set(res[i], 'FormFieldsList', data)
          }
        }
        this.editConfigData = res
      }
    },
    saved (res) {
      this.$emit('saveSuccess', res)
    },
    saveTableData (data, changeFlag, scope) {
      if (scope && scope.length > 0) {
        this.replaceData = scope.map((item) => {
          return {
            value: item.fieldName
          }
        })
        data[scope.$index].dictCode = ''
      }
      if (changeFlag === 'change') {
        this.reportParams.reportItem = this.mergeTableData(data)
        this.changeTableData = this.mergeTableData(data)
      } else {
        this.reportParams.reportItem = data
      }
      if (changeFlag === 'isSearch') {
        if (scope.row.isSearch && !scope.row.searchMode) {
          scope.row.searchMode = 'text'
        }
        if (!scope.row.isSearch) {
          scope.row.searchMode = ''
          scope.row.replaceVal = ''
          scope.row.dictCode = ''
        }
        // scope.row.replaceVal = data[scope.$index].fieldName
      }
      if (changeFlag == 'isCustomColumn') {
        if (!scope.row.isCustomColumn) {
          if (scope.row.fieldName && scope.row.fieldName.indexOf('_RANDOM_') !== -1) {
            scope.row.fieldName = ''
          }
        }
      }
    },
    saveParamData (data) {
      this.reportParams.reportParam = data
    },
    saveButtonData (data, scope) {
      if (scope) {
        data[scope.$index].eventParams = ''
      }
      this.reportParams.reportButton = data
    },
    // 合并报表配置明细数据
    mergeTableData (newData) {
      const _this = this
      const mergeData = []
      const mergeFieldName = []
      const changeData = []
      const newFieldNameArr = []
      if (newData.length) {
        newData.map((item) => {
          newFieldNameArr.push(item.fieldName)
        })
        if (_this.oldTableData.length) {
          _this.oldTableData.map((item) => {
            if (newFieldNameArr.indexOf(item.fieldName) !== -1) {
              mergeData.push(item)
              mergeFieldName.push(item.fieldName)
            }
          })
          newData.map((item) => {
            if (mergeFieldName.indexOf(item.fieldName) === -1) {
              changeData.push(item)
            }
          })
          return [...changeData, ...mergeData]
        }
      }
      return newData
    },
    // 重新加载sqlId
    reloadSqlId () {
      this.oldTableData = this.reportParams.reportItem
      this.isMerge = true
    },
    customValidate (saveParams) {
      const params = JSON.parse(JSON.stringify({ ...saveParams, ...this.reportParams }))
      if (params.reportConfig && params.reportConfig.length > 0) {
        params.reportConfig.forEach((el) => {
          // 保存时处理列设置json
          if (el.columnConfig) {
            el.columnConfig = JSON.stringify(el.columnConfig)
          }
        })
      }
      this.$refs.form.submitForm(params, this.saveApi)
    },
    async changeSql (val) {
      this.editableData = []
      if (this.record.id) {
        this.$confirm('切换表格SQLID会丢失表格配置信息，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.tableConfigDetailsApi = 'formGenerator.tableSqlParse'
            this.tableParams = { sqlId: val }
            this.paramParams = { reportId: '' }
            this.buttonParams = { reportId: '' }
            this.getReplaceData()
          })
          .catch((e) => {
            this.formData.sqlid = this.oldSqlId
          })
      } else {
        this.tableConfigDetailsApi = 'formGenerator.tableSqlParse'
        this.tableParams = { sqlId: val }
        this.paramParams = { reportId: '' }
        this.buttonParams = { reportId: '' }
      }
      this.getReplaceData()
    },
    // 获取查询目标字段数据
    getReplaceData () {
      this.$api[this.tableConfigDetailsApi](this.tableParams).then((res) => {
        if (res) {
          this.replaceData = res.map((item) => {
            return {
              value: item.fieldName
            }
          })
        }
      })
    },
    modifyTableData (val) {
      this.tableConfigDetailsApi = 'formGenerator.tableColumnsInfo'
      this.tableParams = { reportId: val }
      this.paramParams = { reportId: val }
      this.buttonParams = { reportId: val }
      this.getReplaceData()
    },
    // eventHandle输入框加建议下拉框
    querySearch (queryString, cb) {
      const eventHandleArr = this.eventHandleArraly
      const results = queryString
        ? eventHandleArr.filter(this.createFilter(queryString)).map((i) => {
          return { value: i }
        })
        : eventHandleArr.map((i) => {
          return { value: i }
        })
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (eventHandle) => {
        return eventHandle.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      }
    },
    configParamData (data, scope) {
      // 字段类型是否为number、float、long或自定义列类型为计算
      if (scope) {
        const typeList = ['NUMBER', 'FLOAT', 'LONG']
        if (!typeList.includes(scope.row.fieldType) && scope.row.customColumnType !== 'count') {
          scope.row.isTableTotal = '0'
          scope.row.isFatherTotal = '0'
          // scope.row.columnConfig.countArr = []
          // scope.row.columnConfig.countStr = ''
        }
        // if (scope.row.customColumnType !== 'icon') {
        //   scope.row.columnConfig.iconConfig = []
        // }
      }
      if (data && data.length > 0) {
        data.forEach((el) => {
          if (el.columnConfig) {
            if (typeof el.columnConfig === 'string') {
              el.columnConfig = JSON.parse(el.columnConfig)
            }
          } else {
            el.columnConfig = { iconConfig: [], countArr: [], countStr: '', slotName: '' }
          }
          if (el.isCustomColumn && typeof el.isCustomColumn === 'string') {
            el.isCustomColumn = el.isCustomColumn.trim()
          }
        })
      }
      this.reportParams.reportConfig = data
    },
    tabClick (target) {
      if (target.name === 'configColumnDetails') {
        this.reportParams.reportItem.map((val) => {
          if (!val.fieldName && val.isCustomColumn) {
            val.fieldName = '_RANDOM_' + String.fromCharCode(97 + Math.floor(Math.random() * 26)).toUpperCase() + Math.floor(Math.random() * 100 + 10)
          }
        })
        const arr = JSON.parse(JSON.stringify(this.reportParams.reportItem.filter((el) => el.isListShow || el.isCustomColumn)))
        this.editableData.forEach((el) => {
          if (el.columnConfig) {
            if (typeof el.columnConfig === 'string') {
              el.columnConfig = JSON.parse(el.columnConfig)
            }
          } else {
            el.columnConfig = { iconConfig: [], countArr: [], countStr: '', slotName: '' }
          }
        })
        const editableData = JSON.parse(JSON.stringify(this.editableData))
        const newArr = []
        arr.map((val) => {
          const find = editableData.find((el) => el.fieldName == val.fieldName)
          if (find && val.isCustomColumn && find.isCustomColumn) {
            newArr.push(find)
          } else {
            if (!val.columnConfig) {
              val.columnConfig = { iconConfig: [], countArr: [], countStr: '', slotName: '' }
            }
            newArr.push(val)
          }
        })
        this.editableData = newArr
      }
      if (target.name === 'editConfig') {
        // 当表格配置内无ID时
        this.alertMessage()
        const arr = JSON.parse(JSON.stringify(this.reportParams.reportItem.filter((el) => el.isListShow || el.isCustomColumn)))
        const editConfigData = JSON.parse(JSON.stringify(this.editConfigData))
        const newArr = []
        arr.map((val) => {
          const find = editConfigData.find((el) => el.fieldTxt == val.fieldTxt)
          if (find && !val.isCustomColumn) {
            newArr.push(find)
          } else {
            newArr.push(val)
          }
        })
        this.editConfigData = newArr
      }
    },
    // 判断报表配置明细配置内有无ID字段
    alertMessage () {
      let flag = true
      this.reportParams.reportItem.filter((el) => {
        if (el.fieldName === 'ID') {
          flag = false
        }
      })
      if (flag) {
        this.$message({ type: 'warning', message: '请在表格配置明细内配置ID字段' })
      }
      return false
    },
    // 判断字段类型是否为number、float、long或自定义列类型为计算
    isCalculate (scope) {
      // 是自定义列
      if (scope.row.isCustomColumn == '1') {
        const typeList = ['NUMBER', 'FLOAT', 'LONG']
        // 字段类型是否为number、float、long或自定义列类型为计算
        if (typeList.includes(scope.row.fieldType) || scope.row.customColumnType === 'count') {
          return true
        }
        return false
      } else {
        return false
      }
    },
    showComfigDialog (scope) {
      // 序号 index
      // 计算 count
      // 图标 icon
      const row = scope.row
      this.index = scope.$index
      if (row.customColumnType === 'count') {
        this.dataList = this.reportParams.reportItem.map((el) => {
          return { name: el.fieldTxt, id: el.fieldName }
        })
        this.countVisible = true
      } else if (row.customColumnType === 'icon') {
        this.modifyRecord = null
        this.dataList = this.reportParams.reportItem.map((el) => {
          return { label: el.fieldTxt, value: el.fieldName }
        })
        this.iconVisible = true
      }
    },
    formulaHandleOk (str, arr) {
      const obj = this.editableData[this.index].columnConfig ? this.editableData[this.index].columnConfig : {}
      obj.countStr = str
      obj.countArr = arr
      this.$set(this.editableData[this.index], 'columnConfig', obj)
      this.countVisible = false
    },
    iconConfigOk (data) {
      const arr = this.editableData[this.index].columnConfig && this.editableData[this.index].columnConfig.iconConfig ? this.editableData[this.index].columnConfig.iconConfig : []
      const obj = this.editableData[this.index].columnConfig ? this.editableData[this.index].columnConfig : {}
      if (this.modifyRecord) {
        arr.splice(this.modifyIndex, 1, data)
      } else {
        arr.push(data)
      }
      obj.iconConfig = arr
      this.$set(this.editableData[this.index], 'columnConfig', obj)
      this.iconVisible = false
    },
    delectIconList (index, scope) {
      this.index = scope.$index
      // if (typeof this.editableData[scope.$index].iconConfig === 'string') {
      //   this.editableData[scope.$index].iconConfig = JSON.parse(this.editableData[scope.$index].iconConfig)
      // }
      const arr = this.editableData[this.index].columnConfig.iconConfig
      arr.splice(index, 1)
      const obj = this.editableData[this.index].columnConfig ? this.editableData[this.index].columnConfig : {}
      obj.iconConfig = arr
      this.$set(this.editableData[this.index], 'columnConfig', obj)
    },
    modify (row, index, scope) {
      this.index = scope.$index
      this.modifyIndex = index
      this.dataList = this.reportParams.reportItem.map((el) => {
        return { label: el.fieldTxt, value: el.fieldName }
      })
      this.modifyRecord = row
      this.iconVisible = true
    },
    editParamData (data, scope) {
      if (scope) {
        if (scope.row.sourceTableFiled) {
          this.$api['formGenerator.getFormFields']({ id: scope.row.sourceTableFiled }).then((res) => {
            this.$set(scope.row, 'FormFieldsList', res)
          })
        }
      }
      this.reportParams.reportEditDispose = data
    },
    getChildTableData (val) {
      this.$api['formGenerator.getChildTable']({ id: val }).then((res) => {
        this.childTableList = res
      })
      this.$api['formGenerator.getFormFields']({ id: val }).then((res) => {
        this.FormFields = res
      })
    },
    iconSelect (select) {
      this.iconTempSel = select
    },
    ionClose () {
      this.iconTempSel = null
      this.iconPopover = false
    },
    doIconSelect () {
      if (this.iconTempSel) {
        this.reportParams.reportButton[this.iconselectIndex].image = this.iconTempSel.icon
        // this.reportParams.reportButton[this.iconselectIndex].color = this.iconTempSel.color
      }
      this.ionClose()
    },
    openHelp () {
      this.helpVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep.editTable {
  height: calc(100% - 20px) !important;
}
::v-deep .el-col-12 {
  height: 50px !important;
}
::v-deep .existBtn > :last-child {
  height: 100px !important;
}
.wrap {
  display: inline-block;
  position: relative;
  margin-right: 5px;
  padding: 3px 14px 3px 3px;
  border: 1px solid #9d9898;
  border-radius: 5px;
}
.iconClose {
  position: absolute;
  top: 0;
  right: 0;
  color: slategray;
}
.element_icon {
  font-size: 16px;
}
// #icon-style {
//   font-size: 25px;
//   position: relative;
//   top: 33px;
//   left: 98%;
//   z-index: 9999;
// }
.formList.el-form > .el-row.formBtn {
  z-index: 9999;
}
// .editTable ::v-deep .el-table__body-wrapper {
//   height: calc(100% - 50px) !important;
// }
.editConfig {
  height: calc(100% - 120px) !important;
}
.el_tabs {
  ::v-deep.el-tabs__content {
    padding: 0 !important;
  }
}
</style>
<style lang="scss">
.testtooltip {
  width: 240px;
  max-height: 280px;
}
.testtooltipLoong {
  overflow: auto;
}
</style>
