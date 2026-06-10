<template>
  <list-layout :header-visible="false">
    <template #center>
      <div class="container">
				<!-- 拖拽元素 -->
        <div class="draggable-group">
          <div
            class="draggable"
            @dragstart="startDrag($event, 'text')"
            draggable="true"
            title="拖拽至文本中相应位置，生成新的行记录"
          >文本输入框</div>
					<el-button @click="saveTemplate" type="primary">保存合同</el-button>
        </div>
        <ul
          class="drop-list"
          @wheel="handleUlScroll"
          @drop.prevent="drop($event)"
          @dragover.prevent="onDragOver($event)"
          @dragleave="onDragLeave($event)"
        >
          <!-- 在每个项前渲染插入指示器（如果 dragInsertIndex === idx） -->
          <li v-for="(item, idx) in items" :key="item.id" class="drop-item" :class="{ 'insert-before': dragInsertIndex === idx }">
            <div class="pair">
              <span
                :ref="'input-' + item.id"
								:class="['generated-input', 'content-editable', { highlight: item.status === 1 }]"
                contenteditable="true"
                @input="onTextInput(item, $event)"
                @mousedown="onSpanMouseDown(item, idx, $event)"
              ></span>
            </div>
          </li>
          <!-- 如果插入位置在列表末尾，渲染末尾指示器 -->
          <li v-if="dragInsertIndex === items.length" class="insert-marker"></li>
        </ul>
        <!-- 属性面板 -->
        <div class="prop-panel" @wheel="handlePanelScroll">
					 <el-tabs v-model="activeName">
						<el-tab-pane label="文本属性" name="first">
							<div class="prop-row">
								<label style="width: 100px;">文本内容:</label>
								<el-input v-model="selected.content" @input="onPropContentChange" style="width: 100%;"/>
							</div>
							<div class="prop-row">
								<label style="width: 100px;">文本类型:</label>
                <el-select v-model="selected.type" 
                  placeholder="请选择文本类型" 
                  clearable
                  style="width: 100%;"
                  >
                    <el-option label="标题" :value="0"></el-option>
                    <el-option label="正文" :value="1"></el-option>
                  </el-select>
							</div>
							<!-- <div class="prop-row">
								<label style="width: 100px;">排序:</label>
								<el-input v-model="selected.index" style="width: 100%;"/>
							</div> -->
							<div class="prop-actions">
								<!-- <el-button @click="moveUp">上移</el-button>
								<el-button @click="moveDown">下移</el-button> -->
								<el-button @click="removeItem">文本删除</el-button>
							</div>
							
						</el-tab-pane>
						<el-tab-pane label="合同属性" name="second">
							<el-form ref="formCompany" :model="contractAttribute" label-width="100px">
								<el-form-item label="合同编号" required>
										<el-input
                      v-model="contractAttribute.code"
                      @blur="checkContractCode"
                      placeholder="请输入合同编号"
                      clearable
                      :disabled="isEditMode"
                      ></el-input>
									</el-form-item>
								<el-form-item label="乙方公司">
									<el-select 
                    v-model="contractAttribute.company" 
                    placeholder="请选择" 
                    style="width: 100%;"
                    clearable
                    filterable
                  >
									<el-option
										v-for="item in companyList"
										:key="item.value"
										:label="item.label"
										:value="item.value">
									</el-option>
								</el-select>
								</el-form-item>
							</el-form>
							<el-form ref="form" :model="contractyFormData" label-width="100px">
									<!-- <el-form-item label="所属楼栋">
										<el-input v-model="contractyFormData.building"></el-input>
									</el-form-item>
									<el-form-item label="所属区域">
										<el-input v-model="contractyFormData.region"></el-input>
									</el-form-item> -->
									<el-form-item label="租赁位置">
										<el-cascader
                      v-model="contractyFormData.floor"
                      :options="floorTreeData"
                      :props="cascaderProps"
                      placeholder="请按楼栋—区域—楼层进行选择"
                      clearable
                      style="width: 100%;"
                      @change="handleFloorChange"
                    >
                      <!-- 自定义显示格式：显示完整的楼栋-区域-楼层路径 -->
                      <template slot-scope="{ data }">
                        <span>{{ data.NAME }}{{ data.CODE ? `（${data.CODE}）` : '' }}</span>
                      </template>
                    </el-cascader>
									</el-form-item>
									<el-form-item label="租赁面积">
										<el-input
                    v-model="contractyFormData.rentalArea"
                    @input="handleFloatInput('rentalArea', $event)"
                    @blur="formatFloatValue('rentalArea')"
                    placeholder="请输入租赁面积"
                    >
											<template slot="append">平方米</template>
										</el-input>
									</el-form-item>
									<el-form-item label="租赁开始时间">
                    <el-date-picker
			            	v-model="contractyFormData.startDate"
			            	type="date"
			            	placeholder="选择租赁开始时间"
			            	value-format="yyyy-MM-dd"
			            	clearable
			            	style="width: 100%;"
                    :picker-options="leaseStartPickerOptions"
                    @change="calculateLeaseTerm"
			            	></el-date-picker>
									</el-form-item>
									<el-form-item label="租赁结束时间">
                    <el-date-picker
			            	v-model="contractyFormData.endDate"
			            	type="date"
			            	placeholder="选择租赁结束时间"
			            	value-format="yyyy-MM-dd"
			            	clearable
                    style="width: 100%;"
                    :picker-options="leaseEndPickerOptions"
                    @change="calculateLeaseTerm"
			            	></el-date-picker>
									</el-form-item>
									<el-form-item label="租期">
										<el-input v-model="contractyFormData.totalMonth" placeholder="不满一个月按一个月计算">
											<template slot="prepend">共计</template>
											<template slot="append">月</template>
										</el-input>
									</el-form-item>
									<el-form-item label="租赁保证金">
										<el-input 
                    v-model="contractyFormData.rentalDeposit"
                    @input="handleFloatInput('rentalDeposit', $event)"
                    @blur="formatFloatValue('rentalDeposit')"
                    placeholder="请输入租赁保证金"
                    >
											<template slot="append">元</template>
										</el-input>
									</el-form-item>
									<!-- <el-form-item label="保证金大写">
										<el-input v-model="contractyFormData.DepositCHN"></el-input>
									</el-form-item> -->
									<el-form-item label="租金单价">
										<el-input 
                    v-model="contractyFormData.rentPrice"
                    @input="handleFloatInput('rentPrice', $event)"
                    @blur="formatFloatValue('rentPrice')"
                    placeholder="请输入租金单价"
                    >
										<template slot="append">元/月/平方米</template>
										</el-input>
									</el-form-item>
									<el-form-item label="每月租金合计">
										<el-input 
                    v-model="contractyFormData.totalRent"
                    @input="handleFloatInput('totalRent', $event)"
                    @blur="formatFloatValue('totalRent')"
                    placeholder="请输入每月租金合计"
                    >
                      <template slot="append">元</template>
                    </el-input>
									</el-form-item>
									<!-- <el-form-item label="每月租金合计大写">
										<el-input v-model="contractyFormData.rentCHN"></el-input>
									</el-form-item> -->
									<el-form-item label="含增值税租金">
										<el-input
                    v-model="contractyFormData.includingVat"
                    @input="handleFloatInput('includingVat', $event)"
                    @blur="formatFloatValue('includingVat')"
                    placeholder="请输入含增值税租金"
                    >
                      <template slot="append">元</template>
                    </el-input>
									</el-form-item>
									<!-- <el-form-item label="含税租金大写">
										<el-input v-model="contractyFormData.VatCHN"></el-input>
									</el-form-item> -->
									<el-form-item label="装修开始时间">
                    <el-date-picker
			            	v-model="contractyFormData.rStartDate"
			            	type="date"
			            	placeholder="选择装修开始时间"
			            	value-format="yyyy-MM-dd"
			            	clearable
			            	style="width: 100%;"
                    :picker-options="renovationStartPickerOptions"
                    @change="calculateRenovationPeriod"
			            	></el-date-picker>
									</el-form-item>
									<el-form-item label="装修结束时间">
                    <el-date-picker
			            	v-model="contractyFormData.rEndDate"
			            	type="date"
			            	placeholder="选择装修结束时间"
			            	value-format="yyyy-MM-dd"
			            	clearable
			            	style="width: 100%;"
                    :picker-options="renovationEndPickerOptions"
                    @change="calculateRenovationPeriod"
			            	></el-date-picker>
									</el-form-item>
									<el-form-item label="装修期">
										<el-input v-model="contractyFormData.riod" placeholder="不满一个月按一个月计算">
                      <template slot="prepend">共计</template>
											<template slot="append">月</template>
										</el-input>
									</el-form-item>
									<el-form-item label="租金结算周期">
										<el-input
                    v-model="contractyFormData.termType"
                    @input="handleIntegerInput('termType', $event)"
                    @blur="validateSettlementPeriod"
                    placeholder="请输入租金结算周期"
                    >
											<template slot="append">个月</template>
										</el-input>
									</el-form-item>
									<el-form-item label="免费供电容量">
										<el-input
                    v-model="contractyFormData.capacity"
                    @input="handleFloatInput('capacity', $event)"
                    @blur="formatFloatValue('capacity')"
                    placeholder="请输入免费供电容量"
                    >
											<template slot="append">KVA/m²</template>
										</el-input>
									</el-form-item>
									<el-form-item label="电容量合计">
										<el-input
                    v-model="contractyFormData.electrical"
                    @input="handleFloatInput('electrical', $event)"
                    @blur="formatFloatValue('electrical')"
                    placeholder="请输入电容量合计"
                    >
											<template slot="append">KVA</template>
										</el-input>
									</el-form-item>
									<el-form-item label="超出供电量费">
										<el-input
                    v-model="contractyFormData.rentalFee"
                    @input="handleFloatInput('rentalFee', $event)"
                    @blur="formatFloatValue('rentalFee')"
                    placeholder="请输入超出供电量费"
                    >
											<template slot="append">元/KVA/年</template>
										</el-input>
									</el-form-item>
									<el-form-item label="停车标准">
										<el-input
                    v-model="contractyFormData.unitArea"
                    @input="handleFloatInput('unitArea', $event)"
                    @blur="formatFloatValue('unitArea')"
                    placeholder="请输入停车标准"
                    >
                      <template slot="append">平方米</template>
                    </el-input>
									</el-form-item>
									<el-form-item label="免费车位">
										<!--<el-input
                    v-model="contractyFormData.freeParking"
                    @input="handleFloatInput('freeParking', $event)"
                    @blur="formatFloatValue('freeParking')"
                    placeholder="请输入免费车位数量"
                    >
                      <template slot="append">辆</template>
                    </el-input>-->
                    <el-input
                      v-model="contractyFormData.freeParking"
                      placeholder="租赁面积 ÷ 停车标准（取整数）"
                      readonly
                    >
                      <template slot="append">辆</template>
                    </el-input>
									</el-form-item>
									<el-form-item label="永久设施搭建场地占用费标准">
										<el-input
                    v-model="contractyFormData.occupancyFee"
                    @input="handleFloatInput('occupancyFee', $event)"
                    @blur="formatFloatValue('occupancyFee')"
                    placeholder="请输入永久设施搭建场地占用费标准"
                    >
											<template slot="append">元/月/平方米</template>
										</el-input>
									</el-form-item>
									<el-form-item label="生产需要搭建场地占用费标准">
										<el-input
                    v-model="contractyFormData.pFee"
                    @input="handleFloatInput('pFee', $event)"
                    @blur="formatFloatValue('pFee')"
                    placeholder="请输入生产需要搭建场地占用费标准"
                    >
											<template slot="append">元/月/平方米</template>
										</el-input>
									</el-form-item>
								</el-form>
						</el-tab-pane>
					</el-tabs>
        </div>
      </div>
    </template>
  </list-layout>
</template>

<script>
import { P8ListLayout as ListLayout } from 'p8-components-ui'

export default {
  name: 'ContractManage',
  components: {
    ListLayout,
  },
  props:{
    row:{
      type:Array,
      default:()=>{
        return []
      }
    }
  },
  data() {
    return {
      items: [],// 存储可编辑项列表
      selected: {// 当前选中的项
        content: '',
        type: '',
        index: '',
        tableDataList: []
      },
      dragInsertIndex: null,// 拖拽插入位置索引
      selectedIndex: -1,// 当前选中项的索引
			valueList: [],
			activeName: 'first',// 当前激活的标签页
			contractAttribute: {// 合同属性
				code: '',
				company: ''// 这里将保存选中的企业id
			},
			contractyFormData: {// 合同详细信息
				building: '',
				region: '',
				floor: '',
				rentalArea: '',
				startDate: '',
				endDate: '',
				totalMonth: '',
				rentalDeposit: '',
				DepositCHN: '',
				rentPrice: '',
				totalRent: '',
				rentCHN: '',
				includingVat: '',
				VatCHN: '',
				rStartDate: '',
				rEndDate: '',
				riod: '',
				termType: '',
				capacity: '',
				electrical: '',
				rentalFee: '',
				unitArea: '',
				freeParking: '',
				occupancyFee: '',
				pFee: ''
			},
			companyList: [],
      floorTreeData: [], // 树形数据
      cascaderProps: {
        value: 'ID',
        label: 'NAME',
        children: 'children',
        checkStrictly: false, // 只能选择叶子节点（楼层）
        emitPath: false, // 只返回最后一级的值（楼层ID）
        expandTrigger: 'hover' // 鼠标悬停展开
      },
      // 新增修改模式相关变量
      isEditMode: false,
      editId: null
    }
  },
  mounted() {
    // this.$api['baseData.getTemplate']({}).then((res) => {
    //   this.items = res.map((item, index) => {
    //     return {
    //       id: item.id || this.generateId(),
		// 			// code: item.code || 0,
    //       content: item.content || '', 
		// 			index: item.index,
		// 			type: item.type,  
		// 			status: item.status || 0,
    //       // tableDataList: item.tableDataList || [],
    //     };
    //   });
      
      
    //   // 等待DOM完全渲染后再同步内容
    //   this.$nextTick(() => {
    //     setTimeout(() => {
    //       this.items.forEach((item, index) => {
    //         this.syncContentEditableFromModel(item);
    //       });
    //     }, 100);
    //   });
    // }).catch(error => {
    //   console.error("API请求失败:", error);
    // });

    console.log('传入的 row 数据：', this.row);
    // this.getBuildingData();
    // this.getRegionData();
    this.getFloorData();//获取楼层信息
    this.getEnterpriseData();// 获取企业名称
    
    // // 添加初始计算（如果已有日期值）
    // this.calculateLeaseTerm();
    // this.calculateRenovationPeriod();

    // 判断是新建还是修改
    if (this.row && this.row.length > 0) {
      this.isEditMode = true;
      this.loadEditData();
    } else {
      this.isEditMode = false;
      this.loadNewData();
    }

    
  },
  computed: {
    // 添加租期开始时间选择器配置
    leaseStartPickerOptions() {
      const that = this;
      return {
        disabledDate(time) {
          if (that.contractyFormData.endDate) {
            // 开始时间不能大于结束时间
            return time.getTime() > new Date(that.contractyFormData.endDate).getTime();
          }
          return false;
        }
      };
    },
    // 添加租期结束时间选择器配置
    leaseEndPickerOptions() {
      const that = this;
      return {
        disabledDate(time) {
          if (that.contractyFormData.startDate) {
            // 结束时间不能小于开始时间[2,5](@ref)
            return time.getTime() < new Date(that.contractyFormData.startDate).getTime() - 24 * 60 * 60 * 1000;
          }
          return false;
        }
      };
    },
    // 在computed中添加装修开始时间选择器配置
    renovationStartPickerOptions() {
      const that = this;
      return {
        disabledDate(time) {
          if (that.contractyFormData.rEndDate) {
            // 装修开始时间不能大于装修结束时间[2](@ref)
            return time.getTime() > new Date(that.contractyFormData.rEndDate).getTime();
          }
          return false;
        }
      };
    },
    // 在computed中添加装修结束时间选择器配置
    renovationEndPickerOptions() {
      const that = this;
      return {
        disabledDate(time) {
          if (that.contractyFormData.rStartDate) {
            // 装修结束时间不能小于装修开始时间[2,5](@ref)
            return time.getTime() < new Date(that.contractyFormData.rStartDate).getTime() - 24 * 60 * 60 * 1000;
          }
          return false;
        }
      };
    }
  },
  watch: {
    'selected.content'(val) {
      if (this.selected) {
        console.log("属性面板内容变化:", val);
        this.syncContentEditableFromModel(this.selected);
      }
    },

    // 监听租赁日期变化
    'contractyFormData.startDate': function(newVal, oldVal) {
      this.calculateLeaseTerm();
    },
    'contractyFormData.endDate': function(newVal, oldVal) {
      this.calculateLeaseTerm();
    },
    // 监听装修日期变化
    'contractyFormData.rStartDate': function(newVal, oldVal) {
      this.calculateRenovationPeriod();
    },
    'contractyFormData.rEndDate': function(newVal, oldVal) {
      this.calculateRenovationPeriod();
    },
    // 监听租金单价和租赁面积变化，计算每月租金
    'contractyFormData.rentPrice': function() {
      this.calculateMonthlyRent();
    },
    'contractyFormData.rentalArea': function() {
      this.recalculateAll(); // 租赁面积变化会影响所有三个计算
    },
    
    // 监听免费供电容量变化，计算电容量合计
    'contractyFormData.capacity': function() {
      this.calculateElectricalCapacity();
    },
    
    // 监听停车面积变化，计算免费车位
    'contractyFormData.unitArea': function() {
      this.calculateFreeParking();
    }
  },
  methods: {


    // ========== 模式切换与数据加载 ==========
    loadNewData() {
      this.$api['baseData.getTemplate']({}).then((res) => {
        this.items = res.map((item, index) => {
          return {
            id: item.id || this.generateId(),
            content: item.content || '',
            index: item.index,
            type: item.type,
            status: item.status || 0,
          };
        });
        this.$nextTick(() => {
          setTimeout(() => {
            this.items.forEach((item) => {
              this.syncContentEditableFromModel(item);
            });
          }, 100);
        });
      }).catch(error => {
        console.error("API请求失败:", error);
      });
    },

    loadEditData() {
      const rowData = this.row[0];
      const code = rowData.CODE;
      if (!code) {
        this.$message.error('合同编号不存在，无法加载编辑数据');
        return;
      }
      // 调用新接口获取合同文本内容
      this.$api['baseData.getTemplateNew']({ code: code }).then((res) => {
        this.items = res.map((item, index) => {
          return {
            id: item.id || this.generateId(),
            content: item.content || '',
            index: item.index,
            type: item.type,
            status: item.status || 0,
          };
        });
        this.$nextTick(() => {
          setTimeout(() => {
            this.items.forEach((item) => {
              this.syncContentEditableFromModel(item);
            });
          }, 100);
        });
      }).catch(error => {
        console.error("获取合同模板失败:", error);
        this.$message.error('加载合同模板失败');
      });

      // 填充合同属性
      this.fillFormData(rowData);
    },

    fillFormData(data) {
      // 合同属性
      this.contractAttribute.code = data.CODE || '';
      // 乙方公司
      this.contractAttribute.company = data.RELATIVE_PERSON || '';

      // 合同详细信息
      const formData = {
        floor: data.FLOOR || '',
        rentalArea: data.RENTAL_AREA ?? '',
        startDate: data.START_DATE ? data.START_DATE.split(' ')[0] : '',
        endDate: data.END_DATE ? data.END_DATE.split(' ')[0] : '',
        totalMonth: data.TOTAL_MONTH ?? '',
        rentalDeposit: data.RENTAL_DEPOSIT ?? '',
        rentPrice: data.RENTAL_PRICE ?? '',
        totalRent: data.TOTAL_RENT ?? '',
        includingVat: data.TOTAL_RENT_INCLUDING_VAT ?? '',
        rStartDate: data.RENOVATION_START_DATE ? data.RENOVATION_START_DATE.split(' ')[0] : '',
        rEndDate: data.RENOVATION_END_DATE ? data.RENOVATION_END_DATE.split(' ')[0] : '',
        riod: data.TOTAL_RENOVATION_PERIOD ?? '',
        termType: data.TERM_TYPE ?? '',
        capacity: data.POWER_SUPPLY_CAPACITY ?? '',
        electrical: data.TOTAL_ELECTRICAL_CAPACITY ?? '',
        rentalFee: data.RENTAL_FEE ?? '',
        unitArea: data.UNIT_PARKING_AREA ?? '',
        freeParking: data.FREE_PARKING ?? '',
        occupancyFee: data.ORDINARY_SITE_OCCUPANCY_FEE ?? '',
        pFee: data.PRODUCTION_SITE_OCCUPANCY_FEE ?? ''
      };

      // 批量合并，保持响应式
      Object.keys(formData).forEach(key => {
        this.$set(this.contractyFormData, key, formData[key]);
      });

      // 触发派生字段计算
      this.$nextTick(() => {
        this.recalculateAll();
      });
      
    },


    /**
     * 处理正整数输入，限制只能输入数字，不能带小数
     * @param {string} field 字段名
     * @param {string} value 输入值
     */
    handleIntegerInput(field, value) {
      if (value === '' || value === null || value === undefined) {
        this.contractyFormData[field] = '';
        return;
      }
      
      // 移除非数字的字符[1,2](@ref)
      let filtered = value.replace(/[^\d]/g, '');
      
      // 如果以0开头，且不是单个0，则去除开头的0[4,5](@ref)
      if (filtered.startsWith('0') && filtered.length > 1) {
        filtered = filtered.slice(1);
      }
      
      this.contractyFormData[field] = filtered;

      // 如果是租金结算周期字段，进行校验
      if (field === 'termType') {
        this.$nextTick(() => {
          this.validateSettlementPeriod();
        });
      }
    },
    /**
     * 处理浮点数输入，限制只能输入数字和一个小数点，且小数点后最多两位[2,5](@ref)
     * @param {string} field 字段名
     * @param {string} value 输入值
     */
    handleFloatInput(field, value) {
      if (value === '' || value === null || value === undefined) {
        this.contractyFormData[field] = '';
        return;
      }
      
      // 移除非数字和小数点的字符[5](@ref)
      let filtered = value.replace(/[^\d.]/g, '');
      
      // 确保第一个字符不是小数点[3](@ref)
      if (filtered.startsWith('.')) {
        filtered = '0' + filtered;
      }
      
      // 处理多个小数点的情况[3](@ref)
      const dotCount = (filtered.match(/\./g) || []).length;
      if (dotCount > 1) {
        const parts = filtered.split('.');
        filtered = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // 限制小数点后最多两位[2](@ref)
      if (filtered.includes('.')) {
        const parts = filtered.split('.');
        if (parts[1].length > 2) {
          filtered = parts[0] + '.' + parts[1].substring(0, 2);
        }
      }
      
      this.contractyFormData[field] = filtered;
    },
    
    /**
     * 格式化浮点数值，确保符合要求[2,5](@ref)
     * @param {string} field 字段名
     */
    formatFloatValue(field) {
      let value = this.contractyFormData[field];
      if (value === '' || value === null || value === undefined) {
        return;
      }
      
      // 转换为数字进行处理
      let numValue = parseFloat(value);
      
      // 如果转换失败或为负数，设为0[6](@ref)
      if (isNaN(numValue) || numValue < 0) {
        numValue = 0;
      }
      
      // 格式化为最多两位小数[2](@ref)
      this.contractyFormData[field] = numValue.toFixed(2);
    },

    //合同编号检查
    checkContractCode() {
      // 如果合同编号为空，则不检查
      if (!this.contractAttribute.code || this.contractAttribute.code.trim() === '') {
        return;
      }
      
      
      this.$api['baseData.CheckCode']({
        code: this.contractAttribute.code,
      }).then(res => {
        //如果res的值是200表示成功，500表示重复
        if (res == 200) {
          this.$message.success('合同编号可用');
        } else if (res == 500) {
          this.$message.error('合同编号已存在，请更换其他编号');
        } else {
          this.$message.error('合同编号检查失败，请稍后重试');
        }
        
      })
    },

    // 获取企业名称数据
    getEnterpriseData() {
      const params = {
        "sqlParam": {},
        "reportId": "70ea54fff5864756956d",
        "reportParam": {},
        "router": "EnterpriseDirectory",
        "code": "enterpriseDirectoryList",
        "permissionVo": {
          "router": "EnterpriseDirectory",
          "resourceId": ""
        },
        "page": {
          "current": 1,
          "size": 12,
          "orders": []
        }
      };
      
      this.$api['baseData.EnterpriseName'](params).then((res) => {
        
        // 修正判断逻辑：直接检查 res 和 res.records
        if (res && res.records && Array.isArray(res.records)) {
          // 映射数据格式：label显示ENTERPRISE_FULLNAME，value为ID
          console.log("获取企业列表成功，返回数据:", res);
          this.companyList = res.records.map(item => {
            return {
              value: item.ID, // 企业ID
              label: item.ENTERPRISE_FULLNAME // 企业全名作为显示文本
            };
          });
          // this.$message.success(`成功获取 ${this.companyList.length} 家企业信息`);
        } else {
          // 修正错误提示，如果接口有返回消息可以更具体地提示
          console.error("获取企业列表失败: 接口返回数据格式异常", res);
          this.$message.error('获取企业列表失败: 数据格式异常');
        }
      }).catch(error => {
        console.error("获取企业信息失败:", error);
        this.$message.error('获取企业信息失败: ' + (error.message || '网络错误'));
      });
    },

    // 将平面数据转换为树形结构（基于PARENTID）
    convertToTree(flatData) {
      if (!flatData || !Array.isArray(flatData)) {
        console.warn('无效的数据格式');
        return [];
      }
      
      const map = {};
      const tree = [];
      
      // 第一次遍历：创建所有节点的映射
      flatData.forEach(item => {
        if (item && item.ID) {
          map[item.ID] = { 
            ...item, 
            children: [] 
          };
        }
      });
      
      // 第二次遍历：构建树形结构
      flatData.forEach(item => {
        if (!item || !item.ID) return;
        
        const node = map[item.ID];
        
        // 如果有父节点且父节点存在
        if (item.PARENTID && map[item.PARENTID]) {
          if (!map[item.PARENTID].children) {
            map[item.PARENTID].children = [];
          }
          map[item.PARENTID].children.push(node);
        } else {
          // 根节点（楼栋）
          tree.push(node);
        }
      });
      
      // 处理空children数组问题（避免显示"暂无数据"）
      this.cleanEmptyChildren(tree);
      
      return tree;
    },
    
    // 递归处理空children数组[1,4,8](@ref)
    cleanEmptyChildren(nodes) {
      if (!nodes || !nodes.length) return;
      
      nodes.forEach(node => {
        if (node.children && node.children.length === 0) {
          node.children = undefined; // 将空数组设为undefined
        } else if (node.children && node.children.length > 0) {
          this.cleanEmptyChildren(node.children); // 递归处理子节点
        }
      });
    },
    
    // 处理楼层选择变化
    handleFloorChange(value) {
    },

    //获取楼栋信息
    // getBuildingData() {
    //   const params = {
    //     "id": "347b73f5fd4dcdf09d1ee6cdd172f088",
    //     "param": {},
    //     "sqlParam": {},
    //     "reportParam": {},
    //     "permissionVo": {
    //       "router": "quyuxinxiguanli",
    //       "resourceId": "daa762860f189a2f17216799e6046684"
    //     }
    //   };
    //   this.$api['baseData.BuildingData'](params).then((res) => {
    //     console.log("楼栋信息:", res);
    //     // 这里可以处理返回的楼栋数据，比如赋值给相应的数据变量
    //   }).catch(error => {
    //     console.error("获取楼栋信息失败:", error);
    //   });
    // },
    // //获取区域信息
    // getRegionData() {
    //   const params = {
    //     "id": "2169e8aed42261d7144a9cb7d9388c82",
    //     "param": {},
    //     "sqlParam": {},
    //     "reportParam": {},
    //     "permissionVo": {
    //       "router": "loucengxinxiguanli",
    //       "resourceId": "9f5d6e53e95f2fb332aecfa9b2d45eac"
    //     }
    //   };
    //   this.$api['baseData.BuildingData'](params).then((res) => {
    //     console.log("区域信息:", res);
    //     // 这里可以处理返回的区域数据
    //   }).catch(error => {
    //     console.error("获取区域信息失败:", error);
    //   });
    // },
    //获取楼层信息
    getFloorData() {
      const params = {
        "id": "3191c90fd08541d10307f6fbe8ba475f",
        "param": {},
        "sqlParam": {},
        "reportParam": {},
        "permissionVo": {
          "router": "zhuwangxinxiguanli",
          "resourceId": "31d581710253b3b0a403f120a71002eb"
        }
      };
      this.$api['baseData.BuildingData'](params).then((res) => {
        // console.log("楼层信息:", res);
        // 这里可以处理返回的楼层数据
        // 构建树形数据
        if (res && res.data) {
          // 保存扁平化数据用于后续查询
          this.flattenTreeData = res.data;
          // 转换数据为树形结构
          this.floorTreeData = this.convertToTree(res.data);
          console.log("树形结构数据:", this.floorTreeData);
        }
      }).catch(error => {
        console.error("获取楼层信息失败:", error);
      });
    },

    // 精确月数计算函数（向上取整到整月）
    calculateExactMonthDifference(startDateStr, endDateStr) {
      if (!startDateStr || !endDateStr) {
        return 0;
      }
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // 检查日期有效性
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('无效的日期格式');
        return 0;
      }

      // 如果结束日期早于开始日期，返回0
      if (endDate < startDate) {
        return 0;
      }

      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();

      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endDay = endDate.getDate();

      // 基础月数差
      let monthDiff = (endYear - startYear) * 12 + (endMonth - startMonth);

      // 向上取整到整月：只要结束日期大于开始日期对应的日，就加一个月
      // 或者，如果结束日期的天数小于开始日期的天数，但还有剩余天数，也要算一个月
      // 简单来说：只要有天数差异，就向上取整
      
      // 计算天数差
      const startDateCopy = new Date(startDate);
      startDateCopy.setMonth(startDateCopy.getMonth() + monthDiff);
      
      // 如果调整后的开始日期（加上monthDiff个月）仍然小于等于结束日期
      // 说明实际租期超过了monthDiff个月，需要向上取整
      if (startDateCopy < endDate) {
        monthDiff++;
      }
      
      // 特殊情况：如果开始日期和结束日期在同一天，应该是1个月
      if (startDateStr === endDateStr) {
        monthDiff = 1;
      }

      return monthDiff > 0 ? monthDiff : 0;
    },

    // 计算租期
    calculateLeaseTerm() {
      const { startDate, endDate } = this.contractyFormData;
      
      if (startDate && endDate) {
        try {
          const monthDiff = this.calculateExactMonthDifference(startDate, endDate);
          this.contractyFormData.totalMonth = monthDiff > 0 ? monthDiff : 0;
        } catch (error) {
          console.error('租期计算错误:', error);
          this.contractyFormData.totalMonth = '';
        }
      } else {
        this.contractyFormData.totalMonth = '';
      }
    },

    // 计算装修期
    calculateRenovationPeriod() {
      const { rStartDate, rEndDate } = this.contractyFormData;
      
      if (rStartDate && rEndDate) {
        try {
          const monthDiff = this.calculateExactMonthDifference(rStartDate, rEndDate);
          this.contractyFormData.riod = monthDiff > 0 ? monthDiff : 0;
        } catch (error) {
          console.error('装修期计算错误:', error);
          this.contractyFormData.riod = '';
        }
      } else {
        this.contractyFormData.riod = '';
      }
    },

    // 在methods中添加租金结算周期校验方法
    validateSettlementPeriod() {
      const termType = parseInt(this.contractyFormData.termType) || 0;
      const totalMonth = parseInt(this.contractyFormData.totalMonth) || 0;
      
      if (termType > 0 && totalMonth > 0 && termType > totalMonth) {
        this.$message.error('租金结算周期不能超过租期');
        // 自动修正为租期值
        this.contractyFormData.termType = totalMonth.toString();
        return false;
      }
      return true;
    },

    // 计算每月租金合计
    calculateMonthlyRent() {
      const rentPrice = parseFloat(this.contractyFormData.rentPrice) || 0;
      const rentalArea = parseFloat(this.contractyFormData.rentalArea) || 0;
      this.contractyFormData.totalRent = (rentPrice * rentalArea).toFixed(2);
    },
    
    // 计算电容量合计
    calculateElectricalCapacity() {
      const capacity = parseFloat(this.contractyFormData.capacity) || 0;
      const rentalArea = parseFloat(this.contractyFormData.rentalArea) || 0;
      this.contractyFormData.electrical = (capacity * rentalArea).toFixed(2);
    },
    
    // 计算免费车位（取正整数）
    calculateFreeParking() {
      const rentalArea = parseFloat(this.contractyFormData.rentalArea) || 0;
      const unitArea = parseFloat(this.contractyFormData.unitArea) || 1; // 避免除以0
      
      if (unitArea > 0) {
        const freeParking = Math.floor(rentalArea / unitArea);
        this.contractyFormData.freeParking = Math.max(0, freeParking); // 确保不为负数
      } else {
        this.contractyFormData.freeParking = 0;
      }
    },
    
    // 综合计算方法，在相关字段变化时调用
    recalculateAll() {
      this.calculateMonthlyRent();
      this.calculateElectricalCapacity();
      this.calculateFreeParking();
    },

    // 处理ul区域滚动
    handleUlScroll(event) {
      const ulElement = event.currentTarget;
      // 如果ul内容没有超出高度，不拦截滚动事件
      if (ulElement.scrollHeight <= ulElement.clientHeight) {
        return;
      }
      
      // 判断滚动方向和处理边界情况
      const isScrollingDown = event.deltaY > 0;
      const atTop = ulElement.scrollTop === 0;
      const atBottom = ulElement.scrollTop + ulElement.clientHeight >= ulElement.scrollHeight;
      
      // 只有在ul可滚动范围内才阻止事件冒泡
      if ((isScrollingDown && !atBottom) || (!isScrollingDown && !atTop)) {
        event.stopPropagation();
      }
    },
    
    // 处理属性面板滚动
    handlePanelScroll(event) {
      const panelElement = event.currentTarget;
      if (panelElement.scrollHeight <= panelElement.clientHeight) {
        return;
      }
      
      const isScrollingDown = event.deltaY > 0;
      const atTop = panelElement.scrollTop === 0;
      const atBottom = panelElement.scrollTop + panelElement.clientHeight >= panelElement.scrollHeight;
      
      if ((isScrollingDown && !atBottom) || (!isScrollingDown && !atTop)) {
        event.stopPropagation();
      }
    },

    // 生成唯一ID
    generateId() {
      return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // 开始拖拽
    startDrag(event, type) {
      event.dataTransfer.setData('text/plain', type);
      event.dataTransfer.effectAllowed = 'copy';
    },

    // 放置处理
    drop(event) {
      const type = event.dataTransfer.getData('text/plain');
      if (type === 'text') {
        const textItem = {
          id: this.generateId(),
          // 修改序号赋值逻辑：继承前一个项的序号
          index: this.getPreviousItemIndex(this.dragInsertIndex),
          type: '',
          content: '',
          tableDataList: []
        };
        // 根据 dragInsertIndex 插入到指定位置（支持中间插入）
        const insertAt = (this.dragInsertIndex !== null && this.dragInsertIndex !== undefined) ? this.dragInsertIndex : this.items.length;
        this.items.splice(insertAt, 0, textItem);
        this.$nextTick(() => {
          this.syncContentEditableFromModel(textItem);
          // 将光标置于创建项末尾（仅在新创建时需要）
          const ref = this.$refs['input-' + textItem.id];
          const el = Array.isArray(ref) ? ref[0] : ref;
          if (el && typeof el.focus === 'function') {
            this.focusAndMoveCaretToEnd(el);
          }
          // 设置选中并清理插入指示
          this.selected = textItem;
          this.selectedIndex = insertAt;
          this.dragInsertIndex = null;
        });
      }
    },

    // 获取前一个项的序号
    getPreviousItemIndex(insertIndex) {
      if (this.items.length === 0) {
        return 0; // 如果列表为空，返回0
      }
      
      if (insertIndex === 0) {
        // 插入在最前面，继承第一个项的序号
        return this.items[0].index;
      } else if (insertIndex > 0 && insertIndex <= this.items.length) {
        // 插入在中间或最后，继承前一个项的序号
        return this.items[insertIndex - 1].index;
      } else {
        // 默认情况，返回最后一个项的序号
        return this.items[this.items.length - 1].index;
      }
    },

    // 拖拽经过处理
    onDragOver(event) {
      // 计算鼠标位置相对于列表项的中点，决定插入到哪个索引
      event.preventDefault();
      const listEl = this.$el && this.$el.querySelector ? this.$el.querySelector('.drop-list') : null;
      if (!listEl) return;
      const itemEls = Array.from(listEl.querySelectorAll('.drop-item'));
      const y = event.clientY;
      let insertIndex = itemEls.length;
      for (let i = 0; i < itemEls.length; i++) {
        const rect = itemEls[i].getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (y < mid) { insertIndex = i; break; }
      }
      if (this.dragInsertIndex !== insertIndex) this.dragInsertIndex = insertIndex;
    },

    // 拖拽离开处理
    onDragLeave(event) {
      // 当完全离开列表时清理指示器
      const listEl = this.$el && this.$el.querySelector ? this.$el.querySelector('.drop-list') : null;
      const related = event.relatedTarget;
      if (!listEl) return;
      if (!related || !listEl.contains(related)) {
        this.dragInsertIndex = null;
      }
    },
    // 仅设置选中，不改变 DOM 或光标位置（避免干扰用户点击以设置光标）
    selectItem(item, idx) {
      this.selected = item
      this.selectedIndex = idx
    },

    // 当用户在 contenteditable 上 mousedown 时，仅选中，不移动光标
    onSpanMouseDown(item, idx, event) {
      // 保留默认行为以让浏览器设置光标位置，延迟设置 selected 避免与浏览器行为冲突
      setTimeout(() => {
        this.selected = item;
        this.selectedIndex = idx;
      }, 0);
    },
    // 把 focus 与将光标移动到末尾的操作封装，便于仅在需要时调用
    focusAndMoveCaretToEnd(el) {
      if (!el) return;
      try {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
        console.warn('focus 移动光标失败:', e);
      }
    },
    
    // 删除选中项
    removeItem() {
      if (this.selectedIndex >= 0) {
        this.$confirm('是否确认删除选中文本？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.items.splice(this.selectedIndex, 1);
          // 删除后清空选中状态
          this.selected = {
            content: '',
            type: '',
            index: '',
            tableDataList: []
          };
          this.selectedIndex = -1;
          this.$message.success('删除成功');
        }).catch(() => {
          // this.$message.info('已取消删除');
        });
      } else {
        this.$message.warning('请先选择要删除的文本');
      }
    },

    onTextInput(item, event) {
      const txt = event.target.innerText || event.target.textContent || '';
      item.content = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    },
    
    // 属性面板内容变化处理
    onPropContentChange() {
      if (this.selected) {
        this.extractDataFields(this.selected);
      }
    },
    
    setCaretToEnd(el) {
      if (!el) return;
      el.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
        console.warn("设置光标位置失败:", e);
      }
    },
    // 修复：移除重新生成ID的代码
    syncContentEditableFromModel(item) {
      
      // 提取数据字段
      this.extractDataFields(item);
      
      this.$nextTick(() => {
        const ref = this.$refs['input-' + item.id];
        if (!ref) {
          console.warn("未找到元素引用:", 'input-' + item.id);
          return;
        }
        
        const el = Array.isArray(ref) ? ref[0] : ref;
        if (!el) {
          console.warn("元素为空:", 'input-' + item.id);
          return;
        }
        
        const text = String(item.content || '');
        
        // 如果用户当前正在编辑该元素（有焦点），不要覆盖 DOM 内容，避免光标跳动
        if (document.activeElement === el) {
          console.log('元素正在编辑中，跳过 DOM 更新');
          return;
        }

        // 只在内容不同时更新
        if (el.innerText !== text) {
          el.innerText = text;
          console.log("内容已更新");
        } else {
          console.log("内容相同，无需更新");
        }
      });
    },
    
    // 提取数据字段
    extractDataFields(item) {
      if (!item || !item.content) {
        item.tableDataList = [];
        return;
      }
      const newList = this.extractEnglishWordsPrecise(item.content);
      
      // 保留原有的数据值
      if (item.tableDataList && item.tableDataList.length > 0) {
        newList.forEach(newItem => {
          const existingItem = item.tableDataList.find(
            oldItem => oldItem.name === newItem.name
          );
          if (existingItem) {
            newItem.value = existingItem.value;
          }
        });
      }
      item.tableDataList = newList
    },
    
    extractEnglishWordsPrecise(text) {
      if (!text) return [];
      const regex = /(?<=[\s\u4e00-\u9fa5])[a-zA-Z]+(?=[\s\u4e00-\u9fa5])/g;
      const matches = text.match(regex);
      return matches ? matches.map(word => ({
        name: word,
        value: ''
      })) : [];
    },
    

    // 合同属性必填校验
    // validateContractAttributes() {
    //   const requiredFields = [
    //     { field: this.contractAttribute.code, name: '合同编号', path: 'contractAttribute.code' },
    //     { field: this.contractAttribute.company, name: '乙方公司', path: 'contractAttribute.company' },
    //     { field: this.contractyFormData.floor, name: '所属位置', path: 'contractyFormData.floor' },
    //     { field: this.contractyFormData.rentalArea, name: '租赁面积', path: 'contractyFormData.rentalArea' },
    //     { field: this.contractyFormData.startDate, name: '租赁开始时间', path: 'contractyFormData.startDate' },
    //     { field: this.contractyFormData.endDate, name: '租赁结束时间', path: 'contractyFormData.endDate' },
    //     { field: this.contractyFormData.totalMonth, name: '租期', path: 'contractyFormData.totalMonth' },
    //     { field: this.contractyFormData.rentalDeposit, name: '租赁保证金', path: 'contractyFormData.rentalDeposit' },
    //     // { field: this.contractyFormData.DepositCHN, name: '保证金大写', path: 'contractyFormData.DepositCHN' },
    //     { field: this.contractyFormData.rentPrice, name: '租金单价', path: 'contractyFormData.rentPrice' },
    //     { field: this.contractyFormData.totalRent, name: '每月租金合计', path: 'contractyFormData.totalRent' },
    //     // { field: this.contractyFormData.rentCHN, name: '每月租金合计大写', path: 'contractyFormData.rentCHN' },
    //     { field: this.contractyFormData.includingVat, name: '含增值税租金', path: 'contractyFormData.includingVat' },
    //     // { field: this.contractyFormData.VatCHN, name: '含税租金大写', path: 'contractyFormData.VatCHN' },
    //     { field: this.contractyFormData.rStartDate, name: '装修开始时间', path: 'contractyFormData.rStartDate' },
    //     { field: this.contractyFormData.rEndDate, name: '装修结束时间', path: 'contractyFormData.rEndDate' },
    //     { field: this.contractyFormData.riod, name: '装修期', path: 'contractyFormData.riod' },
    //     { field: this.contractyFormData.termType, name: '租金结算周期', path: 'contractyFormData.termType' },
    //     { field: this.contractyFormData.capacity, name: '免费供电容量', path: 'contractyFormData.capacity' },
    //     { field: this.contractyFormData.electrical, name: '电容量合计', path: 'contractyFormData.electrical' },
    //     { field: this.contractyFormData.rentalFee, name: '超出供电量费', path: 'contractyFormData.rentalFee' },
    //     { field: this.contractyFormData.unitArea, name: '停车面积', path: 'contractyFormData.unitArea' },
    //     // 移除 freeParking，因为它是自动计算的
    //     // { field: this.contractyFormData.freeParking, name: '免费车位', path: 'contractyFormData.freeParking' },
    //     { field: this.contractyFormData.occupancyFee, name: '永久设施搭建场地占用费标准', path: 'contractyFormData.occupancyFee' },
    //     { field: this.contractyFormData.pFee, name: '生产需要搭建场地占用费标准', path: 'contractyFormData.pFee' }
    //   ];

    //   // 检查每个必填字段
    //   for (const item of requiredFields) {
    //     if (item.field === null || item.field === undefined || item.field === '') {
    //       return {
    //         isValid: false,
    //         message: `【${item.name}】为必填项，请填写后再保存`
    //       };
    //     }
    //   }

    //   return { isValid: true, message: '校验通过' };
    // },
    // 原方法中删除了所有其他字段的校验，仅保留合同编号非空判断
    validateContractAttributes() {
      if (!this.contractAttribute.code || this.contractAttribute.code.trim() === '') {
        return { isValid: false, message: '【合同编号】为必填项，请填写后再保存' };
      }
      return { isValid: true, message: '校验通过' };
    },

    // 清空表单数据
    resetForm() {
      // 清空合同属性
      this.contractAttribute = {
        code: '',
        company: ''
      };
      
      // 清空合同详细信息（保留初始结构）
      this.contractyFormData = {
        building: '',
        region: '',
        floor: '',
        rentalArea: '',
        startDate: '',
        endDate: '',
        totalMonth: '',
        rentalDeposit: '',
        DepositCHN: '',
        rentPrice: '',
        totalRent: '',
        rentCHN: '',
        includingVat: '',
        VatCHN: '',
        rStartDate: '',
        rEndDate: '',
        riod: '',
        termType: '',
        capacity: '',
        electrical: '',
        rentalFee: '',
        unitArea: '',
        freeParking: '',
        occupancyFee: '',
        pFee: ''
      };
      
      // this.$message.success('合同属性已重置');
    },

    // 保存模板
		saveTemplate() {
      // 合同属性必填校验
      const validationResult = this.validateContractAttributes();
      if (!validationResult.isValid) {
        this.$message.error(validationResult.message);
        return;
      }

			this.$api['baseData.buildTemplate']({
				code: this.contractAttribute.code,
        company: this.contractAttribute.company,
        list: this.items,
        valueList: this.contractyFormData
			}).then((res) => {
					this.$message.success('保存成功');
          // 保存成功后清空表单
          this.resetForm();
          this.$emit("save-success")
			}).catch((error) => {
				this.$message.error('保存失败: ' + error.message);
			});

		}
  }
}
</script>

<style lang="scss" scoped>
::v-deep .list-layout {
    margin: 0px !important;        
}
.container {
  display: flex;
  // height: calc(100vh - 120px);
  height: 100%;
  gap: 16px;
  align-items: flex-start;
  // padding: 12px;
  overflow-y: auto;
}
.draggable-group{
  display:flex;
  flex-direction:column;
  gap:8px;
  /* 在页面滚动时保持可见 */
  position: -webkit-sticky;
  position: sticky;
  top: 12px;
  align-self: flex-start;
  z-index: 30;
}
.draggable{
  cursor: grab;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px dashed #ccc;
  margin-right: 8px;
  user-select: none;
}
.drop-list{
  width: 60%;
  max-height: calc(100vh - 120px);
  min-height: 200px;
  border: 1px dashed #eee;
  padding: 8px;
  background: #fff;
  list-style: none;
  overflow-y: auto;
}
.drop-item{
  margin-bottom: 8px;
}
.drop-item.insert-before{
  position: relative;
}
.drop-item.insert-before::before{
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  top: 0;
  height: 2px;
  background: #409eff;
  border-radius: 2px;
}
.insert-marker{
  height: 8px;
  margin: 4px 0;
  display: block;
  border-top: 2px solid #409eff;
}
.pair{
  display: block;
  gap: 8px;
  align-items: flex-start;
}
.content-editable{
  display: inline-block;
  vertical-align: top;
  padding: 8px 10px;
  box-sizing: border-box;
  // border: 1px solid #ddd;
  // border-radius: 4px;
  min-height: 36px;
  max-height: 400px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  overflow: hidden;
  font-family: inherit;
  font-size: 14px;
  min-width: 120px;
}
.content-editable:focus{
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64,158,255,0.12);
  outline: none;
}

.prop-panel{
  // width: 25%;
  max-height: calc(100vh - 120px);
  border-left: 1px solid #eee;
  padding-left: 12px;
  overflow-y: auto;
  position: -webkit-sticky;
  position: sticky;
  top: 12px;
  align-self: flex-start;
}
.prop-panel h3{
  margin: 0 0 8px;
}
.prop-row{
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.prop-row label{
  width: 60px;
  font-size: 13px;
}
.prop-actions{
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.prop-actions button{
  padding: 6px 8px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}
.prop-actions button:hover{
  border-color: #409eff;
  color: #409eff;
}
/* 高亮状态（status === 1） */
.content-editable.highlight{
  background: #fff8e1; /* 柔和黄色背景 */
  border-color: #ffca28;
  font-weight: 600;
}
/* 自定义级联选择器样式 */
.el-cascader-menu {
  max-height: 300px;
  overflow-y: auto;
}

/* 确保下拉框宽度足够显示完整的楼栋-区域-楼层路径 */
.el-cascader .el-input {
  width: 100%;
}
</style>