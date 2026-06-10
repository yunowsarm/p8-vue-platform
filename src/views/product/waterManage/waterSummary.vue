<template>
	<div class="table-main">
		<div class="normal-header">
			<div>
				<el-button type="primary" @click="ExportExcel" class="el_button_daoru">导出明细</el-button>
				<el-date-picker v-model="searchMounth" type="month" placeholder="选择查询月份" @change="changeMounth" style="margin-left: 10px;"></el-date-picker>
				<el-input 
					v-model="searchCode" 
					placeholder="请输入水表编号" 
					style="width: 200px; margin-left: 10px;"
					clearable
					@input="handleSearchInput"
					@clear="handleSearchClear"
					@keyup.enter="handleSearch">
					<template #append>
						<el-button icon="el-icon-search" @click="handleSearch" />
					</template>
				</el-input>
			</div>
		</div>
		<div class="table-con">
			<div class="table-wrapper">
				<el-table :data="tableData" style="width: 100%" :stripe="true" :loading="loading" border :height="tableHeight">
					<el-table-column prop="meterCode" label="水表编号"></el-table-column>
					<el-table-column prop="meterLocation" label="安装位置"></el-table-column>
					<el-table-column prop="enterpriseName" label="使用单位"></el-table-column>
					<el-table-column prop="type" label="水表性质"></el-table-column>
					<el-table-column prop="readingTotal1" label="上月示数"></el-table-column>
					<el-table-column prop="readingTotal" label="本月示数" ></el-table-column>
					<el-table-column prop="readingTotal2" label="本月用水"></el-table-column>
					<el-table-column prop="remark" label="备注"></el-table-column>
				</el-table>
				<div class="pagination-wrap">
					<el-pagination
						:current-page="currentPage"
						:page-size="pageSize"
						:total="total"
						@current-change="handleCurrentChange"
						@size-change="handleSizeChange"
						:page-sizes="[10,20,50]"
						layout="total, sizes, prev, pager, next, jumper">
					</el-pagination>
				</div>
			</div>
		</div>
	</div>
		
</template>

<style scoped></style>
<script>
import date from '@/assets/commonJS/originalComponents/utils/date';
import Vue from 'vue'
import axios from 'axios'

export default {
  name: 'UserList',
  data () {
    return {
			tableData: [],
			tableDataAll: [],
			showUpload: true,
			fileListShow: false,
			currentPage: 1,
			pageSize: 10,
			total: 0,
			loading: false,
			isSubmitting: false,
			searchMounth: '',
			searchCode: '', // 搜索框绑定的水表编号
			tableHeight: 500,
			_prevHtmlOverflow: null,
			_prevBodyOverflow: null,
			searchTimer: null, // 防抖计时器
    }
  },
  mounted () {
		const now = new Date();
		this.searchMounth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0') }`
		this.getTableData()
		this.$nextTick(() => {
			this.calcTableHeight();
			window.addEventListener('resize', this.calcTableHeight)
			// 把页面滚动隐藏，避免整个页面滚动，表格内部滚动显示数据
			this._prevHtmlOverflow = document.documentElement.style.overflow;
			this._prevBodyOverflow = document.body.style.overflow;
			document.documentElement.style.overflow = 'hidden';
			document.body.style.overflow = 'hidden';
		});
			
  },
  beforeDestroy() {
		window.removeEventListener('resize', this.calcTableHeight);
    if (this._prevHtmlOverflow !== null) document.documentElement.style.overflow = this._prevHtmlOverflow;
    if (this._prevBodyOverflow !== null) document.body.style.overflow = this._prevBodyOverflow;
	// 清除计时器
		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
		}
  },
	computed: {},
  methods: {
		calcTableHeight() {
			this.$nextTick(() => {
				try {
					const top = this.$el.getBoundingClientRect().top || 0;
					const headerEl = this.$el.querySelector('.normal-header');
					const paginationEl = this.$el.querySelector('.pagination-wrap');
					const headerH = (headerEl && headerEl.offsetHeight) ? headerEl.offsetHeight : 60;
					const paginationH = (paginationEl && paginationEl.offsetHeight) ? paginationEl.offsetHeight : 72;
					const extra = 20; // 内边距/间距留白
					// const h = Math.max(360, Math.floor(window.innerHeight - top - headerH - paginationH - extra));
					// this.tableHeight = h;
				} catch (e) {
					console.error('calcTableHeight error', e);
				}
			});
		},
		getTableData() {
			this.loading = true;

			// 构建请求参数
			const params = { date: this.searchMounth };
			
			// 只有当searchCode不为空时才添加code参数
			if (this.searchCode && this.searchCode.trim() !== '') {
				params.code = this.searchCode.trim();
			}
			
			console.log("请求参数:", params);
			this.$api['baseData.readWaterSearch'](params).then(res => {
				let all = [];
				if (Array.isArray(res)) {
					all = res;
				} else if (res && res.records) {
					all = res.records;
				} else if (res && res.data && Array.isArray(res.data)) {
					all = res.data;
				}
				this.tableDataAll = all || [];
				this.total = this.tableDataAll.length;
				this.updatePageData();
			}).catch(err => {
				console.error('获取表格数据失败', err);
				this.$message.error('获取表格数据失败');
			}).finally(() => {
				this.loading = false;
			});
		},
		updatePageData() {
			const start = (this.currentPage - 1) * this.pageSize;
			const end = start + this.pageSize;
			this.tableData = this.tableDataAll.slice(start, end);
		},
		ExportExcel() {
			let paramsData = {
				date: this.searchMounth
			}
			this.$api['baseData.waterImport'](paramsData, { responseType: 'blob' })
      .then((data) => {
				const date = new Date()
				const fileName = '水表数据导出' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
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
		handleCurrentChange(page) {
			this.currentPage = page;
			this.updatePageData();
		},
		handleSizeChange(size) {
			this.pageSize = size;
			this.currentPage = 1;
			this.updatePageData();
		},
		changeMounth(value) {
			const date = new Date(value)
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11
			const result1 = `${year}-${month}`;
			this.searchMounth = result1
			console.log(this.searchMounth,"this.searchMounth")
			this.getTableData()
		},
		// 搜索输入处理（带防抖）
		handleSearchInput() {
			// 防抖处理，避免频繁请求接口
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
			}
			
			this.searchTimer = setTimeout(() => {
				this.handleSearch();
			}, 500); // 500ms防抖
		},
		// 搜索按钮点击处理
		handleSearch() {
			this.currentPage = 1; // 搜索时重置到第一页
			this.getTableData();
		},
		// 清空搜索框处理
		handleSearchClear() {
			this.currentPage = 1;
			this.getTableData();
		},
	}
}
</script>
<style>
	.table-main {
		margin: 14px;
		border-radius: 5px;
		height: calc(100vh - 28px);
		overflow: hidden;
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
		height: calc(100% - 100px); /* 留出 header 区高度 (normal-header) */
		display: flex;
		flex-direction: column;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		background: #ffffff;
		padding: 0 10px;
	}

	.table-con > .table-wrapper {
		flex: 1 1 auto;
		overflow: hidden;
		display: flex;
    flex-direction: column;
    align-items: flex-end;
	}


	/* 分页区域保持在底部可见 */
	.pagination-wrap {
		padding: 12px 10px 0 0;
		text-align: right;
	}

	/* removed forced heights to allow el-table to expand; do not set fixed heights on .table-con > div */
</style>
