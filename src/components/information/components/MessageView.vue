<template>
  <div class="listContainer">
    <infinite-list :key="timeKey"
                   ref="infList"
                   class="finiteList"
                   :list-api="messageListApi"
                   :active-item="currentIndex"
                   :search-params="mergeParams"
                   :removed-item="removedMsg"
                   @load="messageLoad"
                   @onSelect="triggerSelect">
      <template #list="{ item }">
        <span>
          <el-row type="flex"
                  style="text-align: left"
                  class="overHiding">
            <el-col :span="16">
              <span style="margin-right: 20px;">{{ item.sendUserName }}</span>
              <span class="msg-time">{{ item.itemCreateTime }}</span>
            </el-col>
          </el-row>
          <el-row type="flex"
                  style="text-align: left">
            <el-col :span="24">
              <span class="msg-content">{{ item.content }}</span>
            </el-col>
          </el-row>
        </span>
      </template>
    </infinite-list>
  </div>
</template>

<script>
import { P8InfiniteScroll as InfiniteList } from 'p8-components-ui'

export default {
  name: 'MessageList',
  props: {
    searchParams: {
      type: Object,
      default: () => { }
    },
    removedMsg: {
      type: String,
      default: null
    }
  },
  components: {
    'infinite-list': InfiniteList
  },
  data () {
    return {
      messageListApi: 'documentManagement.getWebsocketById',
      currentIndex: null,
      mergeParams: {
        ...this.searchParams,
        page: {
          size: 10,
          total: 0,
          orders: [{ column: 'createTime', asc: false }],
          pages: 0
        }
      },
      timeKey: new Date().getTime()
    }
  },
  mounted () {
  },
  methods: {
    triggerSelect (item, index) {
      if (index && index == this.currentIndex) {
        return
      }
      this.currentIndex = index
    },
    messageLoad (data, current) {
      if (data && current && current === 1) {
        this.currentIndex = 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$icon-span-width: 20px;

.listContainer {
  border-left: 1px #e1e1e1 solid;
  width: 80%;
  .el-row {
    margin-bottom: 5px;
    .el-col {
      color: #606266;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  .msg-content {
    padding-left: $icon-span-width;
    display: inline-block;
    width: calc(100% - 20px);
  }
  .msg-user {
    padding-right: 10px;
  }

  .left-span {
    display: inline-block;
    width: $icon-span-width;
  }
}
.finiteList {
  overflow-x: hidden !important;
}
</style>
