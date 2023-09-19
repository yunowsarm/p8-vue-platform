<!-- 该代码为平台代码，请不要随意修改，修改后会造成该代码无法从平台的升级中自动获取更新。 -->


<template>
  <common-dialog title="设置计算公式"
                 :visible="visible"
                 @handle-cancel="handleCancel"
                 @handle-ok="handleOk"
                 width="60%"
                 @close="handleCancel"
                 :dialog-height="dialogHeight">
    <template #dialog>
      <div id="formulaPage">
        <!-- 公式编辑区域 -->
        <div class="formulaView"
             id="formulaView"
             ref="formulaView"
             @click.stop="recordPosition()">
          <div class="content-item"
               v-for="(item, index) in formulaList"
               :key="index"
               @click.stop="recordPosition(index)">
            <div class="num"
                 v-if="item.type == 'num'">&zwj;{{ item.value }}</div>
            <div class="plain"
                 v-else-if="item.type == 'plain'">&zwj;{{ item.value }}</div>
            <div class="obj"
                 v-else-if="item.type == 'obj'">&zwj;{{ item.key }}</div>
            <!--光标-->
            <div class="cursor"
                 v-if="item.cursor"></div>
          </div>
        </div>
        <div class="tab mt_10 flex-lr">
          <div class="operation">
            <el-select @change="
                (e) => {
                  addItem(e, 'obj')
                }
              "
                       style="width: 140px"
                       v-model="dataId"
                       placeholder="选择指标">
              <el-option v-for="item in dataList"
                         :label="item.name"
                         :value="item.id"
                         :key="item.id"></el-option>
            </el-select>
            <el-select @change="
                (e) => {
                  addItem(e, 'plain')
                }
              "
                       v-model="operatorId"
                       placeholder="选择数学运算符"
                       style="width: 140px"
                       class="ml_20">
              <el-option v-for="item in operatorList"
                         :label="item.name"
                         :value="item.id"
                         :key="item.id"> </el-option>
            </el-select>
          </div>
          <div class="clear">
            <span class="mr_10 pointer theme-col"
                  @click="clearAll()"> 清除全部</span>
          </div>
        </div>
      </div>
    </template>
  </common-dialog>
</template>
<script>
/**
 * dataList 需要选择数据的集合
 * defaultList 初始值的集合
 * @change 比变更后回传的数据
 * **/
import { P8Dialog as CommonDialog } from 'p8-components-ui'
export default {
  components: {
    CommonDialog
  },
  name: '',
  props: {
    dataList: {
      type: Array,
      default () {
        return []
      }
    },
    defaultList: {
      type: Array,
      default () {
        return []
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      dialogHeight: 250,
      // 公式字符串
      formulaStr: '',
      dataId: '',
      operatorId: '',
      formulaList: this.defaultList,
      //运算符
      operatorList: [
        {
          name: '+',
          id: '+'
        },
        {
          name: '-',
          id: '-'
        },
        {
          name: '*',
          id: '*'
        },
        {
          name: '/',
          id: '/'
        },
        {
          name: '()',
          id: '()'
        }
      ]
    }
  },
  watch: {
    formulaList (val) {
      this.$emit('change', val)
    }
  },
  created () {
    //监听鼠标事件
    this.$nextTick(function () {
      document.addEventListener('keydown', this.keydown, false)
      document.addEventListener('click', this.formulaBlur)
    })
  },

  destroyed () {
    //移除监听事件
    document.removeEventListener('keydown', this.keydown, false)
    document.removeEventListener('click', this.formulaBlur)
  },
  methods: {
    handleOk () {
      this.$emit('handleOk', this.parsingFormula(), this.formulaList)
    },
    handleCancel () {
      this.$emit('close')
    },
    // 获取
    getFormula: function () { },
    // 点选时记录光标位置
    recordPosition (index) {
      if (this.formulaList && this.formulaList.length > 0) {
        this.formulaList = this.formulaList.map((item, itemIndex) => {
          item.cursor = false
          if (index > -1 && index == itemIndex) {
            item.cursor = true
          } else if (index !== 0 && !index && itemIndex == this.formulaList.length - 1) {
            item.cursor = true
          }
          return item
        })
      } else {
        this.formulaList = [
          {
            cursor: true,
            type: 'placeholder',
            value: ''
          }
        ]
      }
      // this.$forceUpdate();
    },
    //失去焦点
    formulaBlur (e) {
      this.formulaList = this.formulaList.map((item) => {
        item.cursor = false
        return item
      })
    },
    /**
     * @returns {addItem<*, void, *>}
     * 添加字段
     * type obj 字段  num 数字 plain符号
     * place 是否修改光标位置
     */
    addItem: function (val, type, place = true) {
      if (!val) return false
      let that = this
      //插入括号
      if (type == 'plain' && val == '()') {
        val = '('
        setTimeout(function () {
          that.addItem(')', type, false)
        }, 50)
      }
      let obj = {},
        data = {
          value: '',
          key: val,
          type: type
        }
      if (type == 'obj') {
        //获取数据 为 value 赋值
        obj = this.dataList.find((item) => item.id == val)
        data.value = obj.name
      } else {
        data.value = val
      }
      if (this.formulaList && this.formulaList.length > 0) {
        const length = this.formulaList.length
        for (let i = 0; i < length; i++) {
          //查找光标位置 如果光标位置为空 则在最后添加
          if (this.formulaList[i].cursor) {
            this.formulaList.splice(i + 1, 0, data)
            place && this.recordPosition(i + 1)
            break
          } else if (i === this.formulaList.length - 1) {
            this.formulaList.push(data)
            this.recordPosition(this.formulaList.length - 1)
          }
        }
      } else {
        if (!this.formulaList) {
          this.formulaList = []
        }
        this.formulaList.push(data)
        this.recordPosition(this.formulaList.length - 1)
      }
    },
    //清除全部
    clearAll () {
      this.formulaList = []
      let that = this
      setTimeout(function () {
        that.recordPosition()
      }, 100)
    },
    //删除
    deleteItem (type) {
      let arr = JSON.parse(JSON.stringify(this.formulaList)),
        index = null
      const length = arr.length
      for (let i = 0; i < length; i++) {
        if (arr[i].cursor && arr[i].key) {
          index = i
          if (type == 'del') {
            index = i + 1
          }
          if (index > -1) {
            this.formulaList.splice(index, 1)
            if (type === 'del') {
              console.log()
            } else {
              this.recordPosition(index - 1)
            }
          }
          break
        }
      }
    },
    // 键盘输入
    keydown (e) {
      //禁止输入
      // 检测光标是否存在
      let index,
        cursorData = this.formulaList.find((item, itemIndex) => {
          if (item.cursor) {
            index = itemIndex
          }
          return item.cursor
        })
      if (!cursorData) {
        return false
      }
      //左右移动键控制光标位置
      if (e && [37, 39].includes(e.keyCode)) {
        if (e.keyCode == 37) {
          index = index - 1
        } else {
          index = index + 1
        }
        if (index > -1 && index < this.formulaList.length) {
          this.recordPosition(index)
        }
      } else if (e && e.keyCode == 8) {
        //Backspace 键 删除前面的值
        this.deleteItem()
      } else if (e && [107, 109, 106, 111].includes(e.keyCode)) {
        //运算符列表
        this.addItem(e.key, 'plain')
      } else if (e && e.shiftKey && [48, 57].includes(e.keyCode)) {
        //括号
        if (e.keyCode == 48) e.key = ')'
        if (e.keyCode == 57) e.key = '('
        this.addItem(e.key, 'plain')
      } else if (e && e.keyCode == 46) {
        //delete键删除光标后面的值
        this.deleteItem('del')
      } else {
        document.returnValue = false
        var tt = /^([0-9]{1}[0-9]{0,7})$/ //能输入正数
        if (tt.test(e.key)) {
          //输入为数字 插入数字
          this.addItem(e.key, 'num')
        }
      }
    },
    /**
     * 公式转为字符串
     * 格式 [id]符号数字
     * **/
    parsingFormula: function (formulaStr) {
      let str = ''
      let arr = []
      arr = this.formulaList.map((item) => {
        let val = item.key
        if (val) {
          if (item.type == 'obj') {
            val = '[' + val + ']'
          }
          str = str + val
        }
        return val
      })
      console.log(arr)
      return str
    },
    /**
     * 格式效验
     * */
    formatValidation () {
      let objData = null
      let arr = this.formulaList.filter((item) => {
        if (item.type == 'obj') {
          objData = item
        }
        return item.key
      }),
        data = { type: true, mag: '' }
      if (!objData) {
        data.mag = '至少添加一个指标'
      } else {
        for (let i = 0; i < arr.length; i++) {
          if (i < arr.length - 1) {
            //判断当前类型
            if (arr[i].type == 'obj' && arr[i + 1].type == 'plain') {
              //类型为obj时 后一个 需以 符号结尾
              data.mag = '指标后缀'
            }
          }
        }
      }
      if (data.mag) {
        data.type = false
      }
      return data
    }
  }
}
</script>
<style lang="scss" scoped>
#formulaPage {
  .formulaView {
    width: 100%;
    height: 120px;
    border-top: 1px solid #c7c7c7;
    border-bottom: 1px solid #c7c7c7;
    line-height: 1.3;
    font-size: 12px;
    overflow-y: auto;
    .content-item {
      position: relative;
      height: 16px;
      cursor: text;
      user-select: none;
      display: flex;
      align-items: center;
      float: left;
      .cursor {
        height: 13px;
        width: 1px;
        background: #333;
        animation: defaultCursor 1s steps(2) infinite;
        position: absolute;
        right: 0;
      }
      .obj {
        padding: 0 5px;
        margin: 0 1px;
        background: #f1f1f1;
        border-radius: 3px;
      }
      .num {
        color: #000;
        background: #fff;
        padding: 0 1px 0 0;
      }
    }
  }
  .operation {
    float: left;
    height: 34px;
    padding: 4px;
  }
  .clear {
    color: #2c6ee5;
    float: right;
    padding: 10px;
  }
}

@keyframes defaultCursor {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
