<template>
  <div class="formula-editor">
    <!-- 左侧计算公式区域 -->
    <div class="formula-area">
      <div class="area-title">
        计算公式
        <el-button size="mini" type="danger" icon="el-icon-delete" @click="clearFormula" :disabled="formulaTags.length === 0" style="float: right; padding: 4px 8px"> 清空 </el-button>
      </div>
      <div class="formula-container">
        <div class="tag-list" @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">
          <draggable v-model="formulaTags" group="formula" @change="handleDragChange" class="draggable-container">
            <div v-for="(tag, index) in formulaTags" :key="tag.id" class="formula-tag" :data-type="tag.type">
              <span class="tag-content">{{ tag.label }}</span>
              <div class="tag-actions">
                <el-button icon="el-icon-copy-document" circle @click.stop="copyTag(index)" />
                <el-button icon="el-icon-delete" circle @click.stop="removeTag(index)" />
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </div>

    <!-- 右侧公式元素区域 -->
    <div class="elements-area">
      <div class="area-title">公式元素</div>

      <!-- 运算符区域 -->
      <div class="operators-section">
        <div class="section-title">运算符</div>
        <div class="operators-grid">
          <div v-for="item in operators" :key="item.value" class="operator-btn" draggable @click="handleOperatorClick(item)" @dragstart="handleDragStart($event, item, 'operator')">
            {{ item.label }}
          </div>
        </div>
      </div>
      <div class="manual-section">
        <div class="section-title">手动输入固定数值</div>
        <el-input v-model="manualValue" placeholder="请输入数值" type="number" @keyup.enter.native="handleManualInput" style="padding-left: 10px; width: 80%"></el-input>
      </div>
      <!-- 属性区域 -->
      <div class="attributes-section">
        <div class="section-title">属性</div>
        <div class="attributes-grid">
          <el-tooltip :content="item.label" v-for="item in elements" :key="item.value" placement="top">
            <div class="attribute-btn" draggable @click="handleAttributeClick(item)" @dragstart="handleDragStart($event, item, 'attribute')">
              {{ item.label }}
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { validateFormula } from './utils'
import draggable from 'vuedraggable'

export default {
  name: 'FormulaEditor',
  components: {
    draggable
  },
  props: {
    value: { type: String, default: '' },
    elements: {
      type: Array,
      default: () => [
        { label: '销售额', value: 'sales' },
        { label: '成本', value: 'cost' },
        { label: '利润', value: 'profit' }
      ]
    },
    // 添加运算符配置项
    operators: {
      type: Array,
      default: () => [
        { label: '+', value: '+' },
        { label: '-', value: '-' },
        { label: '×', value: '*' },
        { label: '÷', value: '/' },
        { label: '(', value: '(' },
        { label: ')', value: ')' }
      ]
    }
  },
  data() {
    return {
      manualValue: '',
      formulaTags: [] // 存储公式标签
    }
  },
  watch: {
    value(val) {
      if (val && val !== this.generateFormulaText()) {
        this.parseFormulaText(val)
      }
    }
  },
  mounted() {
    if (this.value) {
      this.parseFormulaText(this.value)
    }
  },
  methods: {
    clearFormula() {
      this.$confirm('确定要清空所有公式吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.formulaTags = []
          this.updateFormulaText()
          this.$message.success('公式已清空')
        })
        .catch(() => {
          // 取消操作
        })
    },
    // 克隆运算符
    cloneOperator(original) {
      return {
        id: this.generateId(),
        type: 'operator',
        label: original.label,
        value: original.value
      }
    },

    // 克隆属性
    cloneAttribute(original) {
      return {
        id: this.generateId(),
        type: 'attribute',
        label: original.label,
        value: original.value
      }
    },
    handleOperatorClick(operator) {
      const newTag = this.cloneOperator(operator)
      this.formulaTags.push(newTag)
      this.updateFormulaText()
    },

    // 处理属性点击
    handleAttributeClick(attribute) {
      const newTag = this.cloneAttribute(attribute)
      this.formulaTags.push(newTag)
      this.updateFormulaText()
    },
    handleManualInput() {
      if (this.manualValue.trim() === '') return
      const newTag = {
        id: this.generateId(),
        type: 'number',
        label: this.manualValue,
        value: this.manualValue
      }
      this.formulaTags.push(newTag)
      this.manualValue = ''
      this.updateFormulaText()
    },
    // 生成唯一ID
    generateId() {
      return Date.now() + Math.floor(Math.random() * 1000)
    },

    // 移除标签
    removeTag(index) {
      this.formulaTags.splice(index, 1)
      this.updateFormulaText()
    },

    // 复制标签
    copyTag(index) {
      const tag = this.formulaTags[index]
      const newTag = {
        ...tag,
        id: this.generateId()
      }
      this.formulaTags.splice(index + 1, 0, newTag)
      this.updateFormulaText()
    },

    // 更新公式文本
    updateFormulaText() {
      const formulaText = this.generateFormulaText()
      const formulaLabelText = this.generateFormulaLabelText()
      this.$emit('input', formulaText)
      this.$emit('getFormulaLabel', formulaLabelText)
    },

    // 生成公式文本
    generateFormulaText() {
      return this.formulaTags.map((tag) => tag.value).join(' ')
    },
    generateFormulaLabelText() {
      return this.formulaTags.map((tag) => tag.label).join(' ')
    },

    // 解析公式文本为标签
    parseFormulaText(text) {
      // 简单解析示例，实际应用可能需要更复杂的解析逻辑
      if (!text) return
      const values = text.split(' ')
      this.formulaTags = values.map((value) => {
        const operator = this.operators.find((op) => op.value === value)
        if (operator) {
          return {
            id: this.generateId(),
            type: 'operator',
            label: operator.label,
            value: operator.value
          }
        }
        const element = this.elements.find((el) => el.value === value)
        if (element) {
          return {
            id: this.generateId(),
            type: 'attribute',
            label: element.label,
            value: element.value
          }
        }
        return {
          id: this.generateId(),
          type: 'text',
          label: value,
          value: value
        }
      })
    },

    validate() {
      const formulaText = this.generateFormulaText()
      const result = validateFormula(formulaText)
      this.$emit('validate', result.isValid)
      if (!result.isValid) {
        this.$message[result.isValid ? 'success' : 'error'](result.message)
      }
      // this.$message[result.isValid ? 'success' : 'error'](result.message)
      return result.isValid
    },

    // 处理拖拽开始
    handleDragStart(event, item, type) {
      // 设置拖拽数据
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          item,
          type
        })
      )
    },

    // 添加新的方法处理拖拽变化
    handleDragChange() {
      this.updateFormulaText()
    },

    // 处理拖拽离开
    handleDragLeave(event) {
      console.log(event)

      // 防止冒泡
      event.preventDefault()
      // 可以添加一些视觉反馈
      event.target.classList.remove('dragover')
    },

    // 添加新的拖拽结束处理方法
    handleDrop(event) {
      try {
        const data = JSON.parse(event.dataTransfer.getData('application/json'))
        const { item, type } = data

        // 根据类型创建新标签
        const newTag = type === 'operator' ? this.cloneOperator(item) : this.cloneAttribute(item)

        // 添加到 formulaTags
        this.formulaTags.push(newTag)
        this.updateFormulaText()
      } catch (err) {
        console.error('Drop handling failed:', err)
      }
    },

    // 允许放置
    handleDragOver(event) {
      event.preventDefault()
    }
  }
}
</script>

<style lang="scss" scoped>
.formula-editor {
  display: flex;
  height: 100%;
  border-radius: 4px;
  background: #fff;

  .area-title {
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    font-size: 14px;
    color: #606266;
  }

  .formula-area {
    border: 1px solid #dcdfe6;
    margin-right: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .formula-container {
      flex: 1;
      padding: 16px;
      min-height: 200px;
      display: flex; // 添加这行
      flex-direction: column; // 添加这行

      .tag-list {
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        height: 100%;
        max-height: 100%;
        flex: 1;
        align-content: flex-start;
        padding: 10px;
        border: 1px dashed #dcdfe6;
        border-radius: 4px;
        overflow: auto;
        // 添加拖拽反馈样式
        &.dragover {
          border: 2px dashed #409eff;
          background: rgba(64, 158, 255, 0.1);
        }

        .draggable-container {
          max-height: 100%;
          // overflow: hidden;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }
      }

      .formula-tag {
        height: 14px;
        display: flex;
        align-items: center;
        padding: 8px 14px;
        background: #f5f7fa;
        border-radius: 6px;
        cursor: move;
        position: relative;
        transition: all 0.3s ease;
        border: 1px solid #e4e7ed;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        // 悬浮效果
        &:hover {
          background: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-color: #c0c4cc;

          .tag-actions {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tag-content {
          font-size: 12px;
          color: #303133;
          font-weight: 500;
          user-select: none;
        }

        .tag-actions {
          position: absolute;
          top: -10px;
          right: -10px;
          display: flex;
          // gap: 4px;
          opacity: 0;
          transform: translateY(2px);
          transition: all 0.2s ease;

          .el-button {
            width: 16px;
            height: 16px;
            padding: 0;
            background: #ffffff;
            // border: 1px solid #dcdfe6;
            // border-radius: 4px;
            // box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

            //   &:hover {
            //     background: #f5f7fa;
            //     border-color: #409eff;
            //     color: #409eff;
            //     transform: scale(1.05);
            //   }

            //   &:active {
            //     transform: scale(0.95);
            //   }

            [class^='el-icon-'] {
              font-size: 12px !important;
            }
          }
        }

        // 根据类型设置不同的样式
        &[data-type='operator'] {
          background: #ecf5ff;
          border-color: #d9ecff;

          .tag-content {
            color: #409eff;
          }
        }

        &[data-type='attribute'] {
          background: #f0f9eb;
          border-color: #e1f3d8;

          .tag-content {
            color: #67c23a;
          }
        }
      }
    }
  }

  .elements-area {
    width: 40%;
    border: 1px solid #dcdfe6;

    .section-title {
      padding: 8px 12px;
      font-size: 14px;
      color: #606266;
    }

    .operators-section,
    .manual-section,
    .attributes-section {
      // border-bottom: 1px solid #dcdfe6;
      height: calc((100% - 36px) * 0.2);

      &.manual-section {
        height: calc((100% - 36px) * 0.15);
      }

      &.attributes-section {
        height: calc((100% - 36px) * 0.65);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .operators-grid,
    .attributes-grid {
      height: calc(100% - 60px);
      display: grid;
      grid-auto-rows: min-content;
      grid-template-columns: repeat(12, 1fr);
      gap: 8px;
      padding: 12px;
      overflow: auto;

      &.attributes-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .operator-btn,
    .attribute-btn {
      height: 20px;
      padding: 6px 12px;
      border: 1px solid #dcdfe6;
      background: #fff;
      border-radius: 4px;
      cursor: grab;
      transition: all 0.3s;
      color: #606266;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &:active {
        cursor: grabbing;
      }

      &:hover {
        border-color: #409eff;
        color: #409eff;
        cursor: pointer;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

::v-deep(.el-icon-delete) {
  font-size: 12px;
}

::v-deep(.el-button + .el-button) {
  margin-left: 2px;
}
</style>
