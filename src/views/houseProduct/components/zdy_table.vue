<template>
  <section class="public-table">
    <div v-if="$slots.toolbar || searchable" class="public-table__toolbar">
      <slot name="toolbar">
        <el-input
          v-if="searchable"
          v-model.trim="searchValue"
          class="public-table__search"
          clearable
          :placeholder="searchPlaceholder"
          prefix-icon="el-icon-search"
          @input="handleSearch"
          @clear="handleSearch" />
      </slot>
    </div>
    <div class="public-table__body">
      <el-table v-loading="loading" :data="data" border stripe height="100%" class="public-table__table" @row-click="$emit('row-click', $event)">
        <el-table-column
          v-for="column in columns"
          :key="column.prop || column.label"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'center'"
          :show-overflow-tooltip="column.showOverflowTooltip !== false">
          <template slot-scope="scope">
            <slot :name="`cell-${column.prop}`" :row="scope.row" :index="scope.$index">
              {{ scope.row[column.prop] || '-' }}
            </slot>
          </template>
        </el-table-column>
        <el-table-column v-if="$scopedSlots.actions" :label="actionLabel" :width="actionWidth" fixed="right" align="center">
          <template slot-scope="scope">
            <slot name="actions" :row="scope.row" :index="scope.$index" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <footer v-if="showPagination" class="public-table__pagination">
      <el-pagination
        background
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="prev, pager, next, sizes, total, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange" />
    </footer>
  </section>
</template>

<script>
export default {
  name: 'PublicTable',
  props: {
    columns: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
    pageSizes: { type: Array, default: () => [10, 20, 50] },
    showPagination: { type: Boolean, default: true },
    searchable: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: '请输入关键词搜索' },
    actionLabel: { type: String, default: '操作' },
    actionWidth: { type: [Number, String], default: 160 }
  },
  data() {
    return { searchValue: '' }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchValue)
    },
    handlePageChange(page) {
      this.$emit('update:currentPage', page)
      this.$emit('page-change', page)
    },
    handleSizeChange(size) {
      this.$emit('update:pageSize', size)
      this.$emit('size-change', size)
    }
  }
}
</script>

<style lang="scss" scoped>
.public-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
  min-width: 0;
  background: #fff;
  border: 1px solid #e8eef2;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 0;


  &__toolbar {
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    padding: 10px 20px;
    background: #ffffff;
    border-radius: 5px 5px 0 0;
    box-sizing: border-box;
  }

  &__search {
    width: 300px;
    margin-left: auto;
  }

  &__body {
    width: 100%;
    height: calc(100% - 50px);
    position: relative;
    padding: 0 20px;
    box-sizing: border-box;
  }

  &__table {
    width: 100%;
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 46px;
    padding: 10px 20px;
    gap: 12px;
    color: #687983;
    font-size: 12px;
  }

  &__total {
    margin-right: 4px;
  }
}
</style>
