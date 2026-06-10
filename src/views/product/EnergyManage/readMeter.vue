<template>
  <div class="table-main">
    <div class="normal-header">
			<div style="display: flex; align-items: center;">
				 <!-- <el-button type="primary" @click="ImportExcelFile" v-show="showUpload" class="el_button_daoru">导入</el-button> -->
				<!-- <el-button type="primary" @click="ExportExcel" class="el_button_daoru">导出模版</el-button> -->
				<!-- <el-button type="danger" @click="submitBatch" style="margin-left:8px;">批量提交</el-button> -->
				<el-button type="success" @click="createRead" style="margin-left:8px;">新建抄表</el-button>
				<el-upload :before-upload="beforeUpload" :http-request="uploadFile" :show-file-list="fileListShow" accept=".xls,.xlsx"
										action="fileUrl"
										ref="upload"
										v-show="!showUpload"
										class="upload-demo">
					<el-button type="warning">导入</el-button>
				</el-upload>
				<div style="margin-left: 10px;">抄表月度：<span style="font-size: 14px;color: red;font-weight: bold;">{{ this.searchMounth }}</span></div>
			</div>
			<div style="margin-left: 16px; display:flex; align-items:center;">
				<el-input size="small" placeholder="请输入电表编号" v-model="searchCode" clearable @keyup.enter.native="applySearch" style="width:200px;" @clear="resetSearch">
					<i slot="prefix" class="el-input__icon el-icon-search"></i>
				</el-input>
				<el-button size="small" type="primary" @click="applySearch" style="margin-left:8px;">查询</el-button>
			</div>
    </div>
    <div class="table-con">
      <div>
        <el-table :data="tableData" style="width: 100%" :stripe="true" :loading="loading" border row-key="meterCode" :height="tableHeight">
          <el-table-column prop="ROOMNAME" label="所属配电房" fixed="left" width="100"></el-table-column>
          <el-table-column prop="CODE" label="电表编号"></el-table-column>
          <el-table-column prop="LOCATION" label="安装位置"></el-table-column>
          <el-table-column prop="MAGNIFICATION" label="倍率"></el-table-column>
          <el-table-column prop="READINGTOTAL" label="总电量-本次示数">
            <template slot-scope="scope">
              <el-input v-model="scope.row.READINGTOTAL" size="small" @blur="handleBlur(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="readingSharp" label="尖-本次示数">
            <template slot-scope="scope">
              <el-input v-model="scope.row.READINGSHARP" size="small" @blur="handleBlur(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="readingPeak" label="峰-本次示数">
            <template slot-scope="scope">
              <el-input v-model="scope.row.READINGPEAK" size="small" @blur="handleBlur(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="readingFlat" label="平-本次示数">
            <template slot-scope="scope">
              <el-input v-model="scope.row.READINGFLAT" size="small" @blur="handleBlur(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="readingValley" label="谷-本次示数">
            <template slot-scope="scope">
              <el-input v-model="scope.row.READINGVALLEY" size="small" @blur="handleBlur(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="抄表备注">
            <template slot-scope="scope">
              <el-input v-model="scope.row.REMARK" size="small" @blur="handleBlur(scope.row)" />
            </template>
          </el-table-column>
          <!-- <el-table-column prop="address" label="操作" fixed="right" width="100">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">提交</el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import date from '@/assets/commonJS/originalComponents/utils/date';
import Vue from 'vue'
import axios from 'axios'

export default {
  name: 'readMeter',
  data () {
    return {
      showUpload: true,
      fileListShow: false,
      loading: false,
      searchMounth: '',
      tableData: [],
      listData: [],
      copyData: [],
      createType: '1',
      tableHeight: 400,
      searchCode: '',
      // 新增：用于记录原始值，避免不必要的提交
      originalValues: new Map(),
      // 新增：防止重复提交的标记
      isSubmittingRow: false
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.calcTableHeight();
      window.addEventListener('resize', this.calcTableHeight);
    })
    this.getListData()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcTableHeight);
  },
  computed: {},
  methods: {
    // 新增：处理失焦事件
    handleBlur(row) {
      // 防止重复提交
      if (this.isSubmittingRow) {
        return;
      }
      
      // 检查值是否发生变化
      const currentValues = {
        READINGTOTAL: row.READINGTOTAL || '',
        READINGSHARP: row.READINGSHARP || '',
        READINGPEAK: row.READINGPEAK || '',
        READINGFLAT: row.READINGFLAT || '',
        READINGVALLEY: row.READINGVALLEY || '',
        REMARK: row.REMARK || ''
      };
      
      const original = this.originalValues.get(row.ID);
      
      // 只有值发生变化时才提交[1](@ref)
      if (!original || 
          original.READINGTOTAL !== currentValues.READINGTOTAL || 
          original.READINGSHARP !== currentValues.READINGSHARP ||
          original.READINGPEAK !== currentValues.READINGPEAK ||
          original.READINGFLAT !== currentValues.READINGFLAT ||
          original.READINGVALLEY !== currentValues.READINGVALLEY ||
          original.REMARK !== currentValues.REMARK) {
        this.submitRow(row);
      }
      
      // 更新原始值记录
      this.originalValues.set(row.ID, { ...currentValues });
    },
    
    // 新增：提交单行数据
    submitRow(row) {
      // 设置提交状态，防止重复提交[6,7](@ref)
      this.isSubmittingRow = true;
      
      const submitData = [{
        "meterCode": row.meterCode,
        "readingTotal": row.READINGTOTAL ? row.READINGTOTAL : '',
        "readingSharp": row.READINGSHARP ? row.READINGSHARP : '',
        "readingPeak": row.READINGPEAK ? row.READINGPEAK : '',
        "readingFlat": row.READINGFLAT ? row.READINGFLAT : '',
        "readingValley": row.READINGVALLEY ? row.READINGVALLEY : '',
        "remark": row.REMARK ? row.REMARK : '',
      }];
      
      const editParams = {
        "date": this.searchMounth,
        "type": this.createType,
        "list": submitData
      };
      
      this.$api['baseData.editElectricity'](editParams).then(res => {
        this.$message.success('提交成功');
        // 可选：更新本地数据
        this.getListData();
      }).catch(err => {
        this.$message.error('提交失败');
        console.error('提交失败:', err);
      }).finally(() => {
        // 无论成功失败，都重置提交状态[6](@ref)
        this.isSubmittingRow = false;
      });
    },
    getListData() {
      var params = {
        "sqlParam": {},
        "reportId": "14ecb0c159b940448ecccdbd5719453a",
        "reportParam": {},
        "router": "dianbiao",
        "code": "ElectricityMeter",
        "permissionVo": {
          "router": "dianbiao",
          "resourceId": ""
        },
        "page": {
          "current": '1',
          "size": '1000',
          "orders": []
        }
      }
      this.$api['baseData.meterListSearch'](params).then(res => {
        this.listData = res.records
        if (this.listData && Array.isArray(this.listData)) {
          this.listData.forEach(item => {
            item.meterCode = item.CODE
            // 新增：初始化时记录原始值
            this.originalValues.set(item.ID, {
              READINGTOTAL: item.READINGTOTAL || '',
              READINGSHARP: item.READINGSHARP || '',
              READINGPEAK: item.READINGPEAK || '',
              READINGFLAT: item.READINGFLAT || '',
              READINGVALLEY: item.READINGVALLEY || '',
              REMARK: item.REMARK || ''
            });
          });
        }
				this.$nextTick(() => {
					this.getTableData();
				})

      }).catch(err => {
        
      }).finally(() => {
        this.loading = false;
      });
    },
    getTableData() {
      this.loading = true;
      this.$api['baseData.electricitysearch']({date: ''}).then(res => {
        if(res) {
          this.copyData = res
					if(this.copyData) {
						this.searchMounth = (this.copyData[0].month).slice(0, 7)
					} else {
						const now = new Date();
						this.searchMounth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0') }`
						console.log('当前月1:', this.searchMounth);
						this.intCreateRead()
					}
          if (!this.listData || !this.copyData) return;
          this.listData.forEach(listItem => {
            // 在 copyData 中查找相同 ID 的项
            const matchingItem = this.copyData.find(newItem => newItem.meterId === listItem.ID);
            if (matchingItem) {
              // 更新五个字段，只在 copyData 中有值时更新
              if (matchingItem.readingTotal !== undefined && matchingItem.readingTotal !== '') {
                listItem.READINGTOTAL = matchingItem.readingTotal;
              }
              if (matchingItem.readingSharp !== undefined && matchingItem.readingSharp !== '') {
                listItem.READINGSHARP = matchingItem.readingSharp;
              }
              if (matchingItem.readingPeak !== undefined && matchingItem.readingPeak !== '') {
                listItem.READINGPEAK = matchingItem.readingPeak;
              }
              if (matchingItem.readingFlat !== undefined && matchingItem.readingFlat !== '') {
                listItem.READINGFLAT = matchingItem.readingFlat;
              }
              if (matchingItem.readingValley !== undefined && matchingItem.readingValley !== '') {
                listItem.READINGVALLEY = matchingItem.readingValley;
              }
              if (matchingItem.remark !== undefined && matchingItem.remark !== '') {
                listItem.REMARK = matchingItem.remark;
              }
            }
          })
          this.tableData = this.listData
					this.createType = '1'
          this.applySearch()
        } else {
          this.tableData = this.listData
					if(this.searchMounth === '') {
						const now = new Date();
						this.searchMounth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0') }`
						this.intCreateRead()
					}
        }
      }).catch(err => {
        
      }).finally(() => {
        this.loading = false;
      });
    },
    // 计算 el-table 的 height（像素），保证表头固定、表体可滚动
    calcTableHeight() {
      this.$nextTick(() => {
        try {
          const main = this.$el;
          if (!main) return;
          const totalH = main.clientHeight || window.innerHeight;
          const header = main.querySelector('.normal-header');
          const headerH = header ? header.clientHeight : 60;
          // 留出一些间距（padding）约 40px
          const tableH = totalH - headerH - 40;
          this.tableHeight = tableH > 200 ? tableH : 400;
        } catch (e) {
          // ignore
        }
      });
    },
    // markEdited(row) {
    //   console.log(row,"row")
    // },
    ImportExcelFile() {
      this.showUpload = true;
      this.$refs['upload'].$refs['upload-inner'].handleClick()
    },
    beforeUpload(file) {
      let regExp = file.name.replace(/.+\./, '');
      let lower = regExp.toLowerCase(); //把大写字符串全部转为小写字符串
      let suffix = ['xls', 'xlsx'];
      if (suffix.indexOf(lower) === -1) {
        return this.$message.warning('请上传后缀名为 xls、xlsx 的附件 !');
      }
    },
    uploadFile(item) {
      let formData = new FormData();
      formData.append('excel', item.file);
      axios.post(CONFIG.devBaseUrl + '/jt/electricity/import',formData,{
      }).then((res) => {
        this.$message.success('导入成功')
        this.getTableData() 
      }).catch((error) => {
        this.$message.error('请求失败')
      })
    },
    ExportExcel() {
      let paramsData = {
        date: this.searchMounth
      }
      this.$api['baseData.electricityExport'](paramsData, { responseType: 'blob' })
      .then((data) => {
          const date = new Date()
          const fileName = '电表数据导出' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
          const fileType = 'xlsx'
          const blob = new Blob([data.data], { type: 'application/vnd.ms-excel' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = `${fileName}.${fileType}`
          document.body.appendChild(link)
          link.click()
        })
        .catch(() => {
          this.$message({
            message: 'excel下载失败！',
            type: 'error'
          })
        })
    },
		// 批量提交
		// submitBatch() {
    //   var newArr = []
    //   this.tableData.forEach(item => {
    //     newArr.push({
    //       "meterCode": item.meterCode,
    //       "readingTotal": item.READINGTOTAL ? item.READINGTOTAL : '',
    //       "readingSharp": item.READINGSHARP ? item.READINGSHARP : '',
    //       "readingPeak": item.READINGPEAK ? item.READINGPEAK : '',
    //       "readingFlat": item.READINGFLAT ? item.READINGFLAT : '',
    //       "readingValley": item.READINGVALLEY ? item.READINGVALLEY : '',
    //       "remark": item.REMARK ? item.REMARK : '',
    //     })
    //   })
		// 	this.$confirm('请确认提交抄表数据?', '提示', {
		// 		confirmButtonText: '确定',
		// 		cancelButtonText: '取消',
		// 		type: 'warning'
		// 	}).then(() => {
		// 		var editParams1 = {
		// 			"date": this.searchMounth,
		// 			"type": this.createType,
		// 			"list": newArr
		// 		}
		// 		this.$api['baseData.editElectricity'](editParams1).then(res => {
		// 			this.getListData()
		// 			this.$message.success('批量提交成功');
		// 		}).catch(err => {
		// 			this.$message.error('批量提交失败');
		// 		}).finally(() => {
		// 			this.loading = false;
		// 		});
		// 	}).catch(() => {
		// 		this.$message({
		// 			type: 'info',
		// 			message: '取消提交'
		// 		})       
		// 	})
      
    // },
		// 单行提交
    // handleEdit(index,row) { 
		// 	var newArr1 = []
		// 	if(this.createType == '0') {
		// 		this.tableData.forEach(item => {
		// 			newArr1.push({
		// 				"meterCode": item.meterCode,
		// 				"readingTotal": item.READINGTOTAL ? item.READINGTOTAL : '',
		// 				"readingSharp": item.READINGSHARP ? item.READINGSHARP : '',
		// 				"readingPeak": item.READINGPEAK ? item.READINGPEAK : '',
		// 				"readingFlat": item.READINGFLAT ? item.READINGFLAT : '',
		// 				"readingValley": item.READINGVALLEY ? item.READINGVALLEY : '',
		// 				"remark": item.REMARK ? item.REMARK : '',
		// 			})
		// 		});
		// 	} else {
		// 		newArr1.push({
		// 			"meterCode": row.meterCode,
		// 			"readingTotal": row.READINGTOTAL ? row.READINGTOTAL : '',
		// 			"readingSharp": row.READINGSHARP ? row.READINGSHARP : '',
		// 			"readingPeak": row.READINGPEAK ? row.READINGPEAK : '',
		// 			"readingFlat": row.READINGFLAT ? row.READINGFLAT : '',
		// 			"readingValley": row.READINGVALLEY ? row.READINGVALLEY : '',
		// 			"remark": row.REMARK ? row.REMARK : '',
		// 		})
		// 	}
		// 	this.$confirm('请确认提交抄表数据?', '提示', {
		// 		confirmButtonText: '确定',
		// 		cancelButtonText: '取消',
		// 		type: 'warning'
		// 	}).then(() => {
		// 		var editParams1 = {
		// 			"date": this.searchMounth,
		// 			"type": this.createType, // ?存疑
		// 			"list": newArr1
		// 		}
		// 		this.$api['baseData.editElectricity'](editParams1).then(res => {
		// 			this.getListData()
		// 			this.$message.success('提交成功');
		// 		}).catch(err => {
		// 			this.$message.error('提交失败');
		// 		}).finally(() => {
		// 			this.loading = false;
		// 		});
		// 	}).catch(() => {
		// 		this.$message({
		// 			type: 'info',
		// 			message: '取消提交'
		// 		})       
		// 	})
    // },
		addOneMonth(dateStr) {
			// 将字符串转换为Date对象
			const [year, month] = dateStr.split('-').map(Number);
			const date = new Date(year, month - 1, 1); // 月份从0开始
			
			// 增加一个月
			date.setMonth(date.getMonth() + 1);
			
			// 格式化回字符串
			const newYear = date.getFullYear();
			const newMonth = String(date.getMonth() + 1).padStart(2, '0');
			
			return `${newYear}-${newMonth}`;
		},
		intCreateRead() {
			this.createType = '0'
			const now = new Date();
      this.searchMounth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0') }`
			this.tableData.forEach(item => {
				item.READINGTOTAL = ''
				item.READINGSHARP = ''
				item.READINGPEAK = ''
				item.READINGFLAT = ''
				item.READINGVALLEY = ''
				item.REMARK = ''
			})
		},
    createRead() {
      this.createType = '0'
			this.searchMounth =  this.addOneMonth(this.searchMounth )
			this.tableData.forEach(item => {
				item.READINGTOTAL = ''
				item.READINGSHARP = ''
				item.READINGPEAK = ''
				item.READINGFLAT = ''
				item.READINGVALLEY = ''
				item.REMARK = ''
			})
    },

    // 根据 searchCode 过滤显示的数据（前端过滤）
    // 根据 searchCode 过滤显示的数据（前端过滤）
    applySearch() {
      try {
        const term = (this.searchCode || '').toString().trim();
        if (!term) {
          // 为空则显示全部（listData 已包含合并的读取字段）
          this.tableData = this.listData.slice();
          this.$nextTick(this.calcTableHeight);
          return;
        }
        const filtered = this.listData.filter(item => {
          const code = (item.CODE || item.meterCode || '').toString();
          return code.indexOf(term) !== -1;
        });
        this.tableData = filtered;
        this.$nextTick(this.calcTableHeight);
      } catch (e) {
        console.error('applySearch error', e);
      }
    },

    resetSearch() {
      this.searchCode = '';
      this.applySearch();
    },
  }
}
</script>
<style>
.table-main {
	margin: 14px;
	border-radius: 5px;
	height: 100%;
	/* overflow: hidden; */
}
.normal-header {
	padding: 10px 10px 0 0;
	width: 100%;
	min-width: 400px;
	min-height: 50px;
	height: auto;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	background: #ffffff;
	padding-left: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.table-con {
  width: 100%;
	height: 100%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background: #ffffff;
  padding: 0 10px;
	overflow: scroll;
  
}
  .table-main {
    margin: 14px;
    border-radius: 5px;
    height: calc(100vh - 28px);
    overflow: hidden; /* 隐藏页面滚动 */
  }
  .normal-header {
    padding: 10px 10px 0 0;
    width: 100%;
    min-width: 400px;
    min-height: 50px;
    height: auto;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background: #ffffff;
    padding-left: 10px;
  }
  .table-con {
    width: 100%;
    height: calc(100% - 60px);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background: #ffffff;
    padding: 0 10px;
    overflow: hidden; /* 表格使用内部滚动 */
  }
  /* 设置内部 wrapper 滚动，这样 el-table 的 body 会使用传入的 height */
  .table-con > div {
    height: 100%;
    overflow: auto;
  }
</style>

