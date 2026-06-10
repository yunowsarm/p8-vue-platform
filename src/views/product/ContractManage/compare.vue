<!--合同对比-->
<template>
    <div class="container">
      <div>
        <P8FormDataEdit class="formRender"
                    ref="formRender"
                    :data-view-id="dataViewId"
                    :record="{ desformCode: codeForm }"
                    :prop-param="propParam"
                    page-type="create"
                    v-bind="$attrs">
        </P8FormDataEdit>
      </div>
      <div>
        <span style="font-weight: bold;font-size: 14px;">合同详情：</span>
        <ul class="drop-list">
          <li v-for="(item, idx) in items" :key="item.id" class="drop-item" :class="{ 'insert-before': dragInsertIndex === idx }">
            <div class="pair">
              <span
                :ref="'input-' + item.id"
                :class="['generated-input', 'content-editable', { highlight: item.status === 1 }]"
                contenteditable="false"
              ></span>
            </div>
          </li>
          <!-- 如果插入位置在列表末尾，渲染末尾指示器 -->
          <li v-if="dragInsertIndex === items.length" class="insert-marker"></li>
        </ul>
      </div>
    </div>
</template>

<script>


export default {
  name: 'ContractManage',
  components: {
    // P8FormDataEdit,
  },
  props: {
    businessKey: {
      type: String
    },
  },
  data() {
    return {
      items: [],
      selected: {
        content: '',
        type: '',
        index: '',
        tableDataList: []
      },
      dragInsertIndex: null,
      selectedIndex: -1,
      valueList: [],
      codeForm: 'LeaseContractTwo',
      dataViewId: this.businessKey, // 修改页面id
      propParam: {}, // 将参数传至表单
      formModel: {}//存放表单数据
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        // 确保子组件完全渲染
        if (this.$refs.formRender && this.$refs.formRender.$refs.modifyParser) {

          let contractCode = this.$refs.formRender.$refs.modifyParser.formModel.CODE;
          this.$api['baseData.compareTemplate']({code: contractCode}).then((res) => {
            this.items = res.map((item, index) => {
              return {
                id: item.id || this.generateId(),
                // code: item.code || 0,
                content: item.content || '', 
                index: item.index,
                type: item.type,  
                status: item.status || 0,
                // tableDataList: item.tableDataList || [],
              };
            });
             // 等待DOM完全渲染后再同步内容
              this.$nextTick(() => {
                setTimeout(() => {
                  this.items.forEach((item, index) => {
                    this.syncContentEditableFromModel(item);
                  });
                }, 100);
              });
            }).catch(error => {
              console.error("API请求失败:", error);
            });
        } else {
          console.warn('formRender 未找到');
        }
      }, 2000);
    })
    
      
     
  },
  watch: {
    'selected.content'(val) {
      if (this.selected) {
        this.syncContentEditableFromModel(this.selected);
      }
    }
  },
  methods: {
    generateId() {
      return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    drop(event) {
      const type = event.dataTransfer.getData('text/plain');
      if (type === 'text') {
        const textItem = {
          id: this.generateId(),
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
    onTextInput(item, event) {
      const txt = event.target.innerText || event.target.textContent || '';
      item.content = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
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
      // console.log("提取的数据字段:", newList);
      
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

      // console.log("valueList",this.valueList)
    },
    
    extractEnglishWordsPrecise(text) {
      if (!text) return [];
      // console.log("提取文本内容", text);
      const regex = /(?<=[\s\u4e00-\u9fa5])[a-zA-Z]+(?=[\s\u4e00-\u9fa5])/g;
      const matches = text.match(regex);
      return matches ? matches.map(word => ({
        name: word,
        value: ''
      })) : [];
    },

    
  }
}
</script>

<style lang="scss" scoped>
::v-deep .list-layout {
    margin: 0px !important;        
}
.container {
  display: flex;
  height: 100%;
  gap: 16px;
  // align-items: flex-start;
  padding: 12px;
  overflow: auto;
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
  // width: 60%;
  min-height: 160px;
  border: 1px dashed #eee;
  padding: 8px;
  background: #fff;
  list-style: none;
  margin-top: 10px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
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
/* 高亮状态（status === 1） */
.content-editable.highlight{
  background: #fff8e1; /* 柔和黄色背景 */
  border-color: #ffca28;
  font-weight: 600;
}

</style>
