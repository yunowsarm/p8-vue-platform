<template>
  <list-layout class="list-layout">
    <template #north>
      <el-button type="primary"
                 @click="open">上传</el-button>
      <el-button type="primary"
                 @click="isVisibleHistoryDrawer=true">历史记录</el-button>
      <search-form-list ref="search"
                        label-width="100px"
                        :data-source="searchData"
                        @search="search"
                        @re-set="reSet"></search-form-list>
    </template>
    <template #center>
      <common-table ref="table"
                    class="table"
                    :comp="comp"
                    :columns="columns"
                    :params="queryParam"
                    :api="tableApi"
                    :pagination="true">
        <template #fileSize="{ scope }">
          {{ kbToMb(scope.row.fileSize) }}MB
        </template>
        <template #operation="{ scope }">
          <el-button type="text"
                     @click="dowload(scope.row)">下载</el-button>
          <el-button type="text"
                     @click="deleteFile(scope.row)">删除</el-button>
        </template>
      </common-table>
    </template>
    <template #drawer-panel>
      <el-dialog v-if="isVisibleDocumentViewDrawer"
                 :title="documentViewDrawerTitle"
                 :visible.sync="isVisibleDocumentViewDrawer"
                 width="30%"
                 :modal="false"
                 :close-on-click-modal="false"
                 style="height: 400px;"
                 :before-close="documentViewDrawerClose">
        <div style="margin: 20px;">
          <div class="uploadFile">
            <input id="uploadBigFile"
                   class="all"
                   type="file"
                   name="uploadBigFile" />
          </div>
          <el-progress :percentage="percentage">{{ percentage }}</el-progress>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button type="primary"
                     @click="uploadBigFileBySocket">切片/继续上传</el-button>
        </span>
      </el-dialog>
      <common-drawer v-if="isVisibleHistoryDrawer"
                     title="下载历史记录"
                     :visible="isVisibleHistoryDrawer"
                     placement="top"
                     size="50%"
                     @close="historyClose">
        <template #drawer>
          <common-table class="table"
                        :comp="comp"
                        :columns="columnsHistory"
                        :params="{}"
                        :api="tableApiHistory"
                        :pagination="true">
            <template #fileSize="{ scope }">
              {{ kbToMb(scope.row.fileSize) }}MB
            </template>
          </common-table>
        </template>
      </common-drawer>
      <div v-if="showModal"
           class="modal-overlay">
        <div class="modal"
             :class="{'minimized': isMinimized}">
          <div class="modal-header">
            <div>
              <h3>下载列表</h3>
            </div>
            <div class="right-flex">
              <el-button type="text"
                         @click="toggleMinimize">{{ isMinimized ? '恢复' : '最小化' }}</el-button>
              <div style="margin-left: 10px;"
                   @click="showModal=false">X</div>
            </div>
          </div>
          <div class="modal-body"
               v-if="!isMinimized">
            <div v-for="item in fileData"
                 :key="item.id">
              <span>{{ item.fileName }}</span>
              <el-progress :percentage="item.percentage">{{ item.percentage }}</el-progress>
              <el-button v-if="item.percentage<100"
                         type="text"
                         @click="continueDowload(item)">继续下载</el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </list-layout>
</template>

<script>
import {
  P8ListLayout as ListLayout,
  P8Table as CommonTable,
  P8Drawer as CommonDrawer,
  P8Search as SearchFormList,
} from 'p8-components-ui'
import { mapGetters } from 'vuex'
export default {
  name: 'myNetworkDisk',
  components: {
    ListLayout,
    CommonTable,
    CommonDrawer,
    SearchFormList
  },
  props: {
  },
  data: function () {
    return {
      percentage: 0,
      showModal: false,  // 控制弹框的显示/隐藏
      isMinimized: false, // 控制弹框的最小化状态
      comp: this,
      queryParam: {},
      tableApi: 'documentManagement.listData',
      tableApiHistory: 'documentManagement.listDataHistory',
      isVisibleDocumentViewDrawer: false,
      isVisibleHistoryDrawer: false,
      documentViewDrawerTitle: '附件上传',
      drawerConfig: {
        modal: false
      },
      searchData: [
        {
          type: 'text',
          labelText: '文件名称',
          fieldName: 'fileName',
          placeholder: '请输入文件名称',
          colLayout: 'singleCol'
        }
      ],
      columns: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          headerAlign: 'center',
          width: 55,
        },
        {
          title: '文件名称',
          dataIndex: 'fileName',
          align: 'center'
        },
        {
          title: '附件大小',
          dataIndex: 'fileSize',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '上传人',
          dataIndex: 'realName',
          width: 120,
          align: 'center'
        },
        {
          title: '上传时间',
          dataIndex: 'itemCreateTime',
          width: 180,
          align: 'center'
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'custom' },
          width: 140,
          align: 'center'
        }
      ],
      columnsHistory: [
        {
          title: '序号',
          type: 'index',
          align: 'center',
          headerAlign: 'center',
          width: 55,
        },
        {
          title: '文件名称',
          dataIndex: 'fileName',
          align: 'center'
        },
        {
          title: '附件大小',
          dataIndex: 'fileSize',
          width: 120,
          align: 'center',
          scopedSlots: { customRender: 'custom' }
        },
        {
          title: '下载人',
          dataIndex: 'realName',
          width: 120,
          align: 'center'
        },
        {
          title: '下载时间',
          dataIndex: 'itemCreateTime',
          width: 180,
          align: 'center'
        }
      ],
      percentage: 0,
      socket: null, // WebSocket 实例
      fileChunks: [], // 存储接收到的文件块
      fileSize: 0, // 文件总大小
      downloadedSize: 0, // 已下载的字节数
      fileData: [],
      socketType: false,
      disabled: false,
      urlPrefix: ''
    }
  },
  computed: {
    ...mapGetters(['token', 'userId', 'userInfo'])
  },
  mounted () {
    const { devBaseUrl, prodBaseUrl, isDevMode } = this.$sysConfig.API_DEFAULT_CONFIG
    this.urlPrefix = isDevMode ? `${devBaseUrl}` : `${prodBaseUrl}`
  },
  methods: {
    open () {
      this.percentage = 0
      this.isVisibleDocumentViewDrawer = true
    },
    toggleMinimize () {
      this.isMinimized = !this.isMinimized; // 切换最小化状态
    },
    showModalClick () {
      this.showModal = false
    },
    historyClose () {
      this.isVisibleHistoryDrawer = false
    },
    kbToMb (kb) {
      return Math.ceil(kb / 1024 / 1024);
    },
    // 继续下载
    continueDowload (row) {
      // this.downloadedSize = row.downloadedSize
      if (!this.socketType) {
        return
      }
      this.dowload(row.row, row.id, row.downloadedSize)
    },
    async dowload (row, rowChunkId, downloadedSize) {
      this.showModal = true
      this.socket = new WebSocket(this.urlPrefix + "/file-download");

      // 3. 连接成功后发送请求（包括已下载的字节数）
      this.socket.onopen = () => {
        console.log("WebSocket connection established");
        this.socket.send(
          JSON.stringify({
            id: row.id,
            fileSize: downloadedSize ? downloadedSize : this.downloadedSize,
            userId: this.userId
          }));
      };

      // 4. 处理接收到的文件块
      this.socket.onmessage = (event) => {
        const message = event.data;
        let [base64Chunk, chunkNumber, chunkId] = message.split("|");
        // 判断是否是续传
        if (rowChunkId) {
          chunkId = rowChunkId
        }

        // 解码 Base64 编码的文件块并保存
        const chunk = atob(base64Chunk);
        // this.fileChunks[chunkNumber] = chunk;
        // this.downloadedSize += chunk.length; // 更新已下载字节数
        // 计算下载进度
        if (this.fileData.length > 0) {
          let exists = null
          // const exists = this.fileData.some(item => item.id === chunkId);
          this.fileData.forEach(item => {
            if (item.id === chunkId) {
              exists = true
            }
          })
          if (exists) {
            this.fileData.forEach(item => {
              if (item.id === chunkId) {
                item.fileChunks.push(chunk),
                  item.downloadedSize = item.downloadedSize + chunk.length
                item.percentage = Math.round((item.downloadedSize / row.fileSize) * 100)
                // 下载完成
                if (item.downloadedSize >= row.fileSize) {
                  let fileChunks = null
                  if (this.fileData.length > 0) {
                    this.fileData.forEach(item => {
                      if (item.id === chunkId) {
                        item.percentage = 100
                        fileChunks = item.fileChunks
                      }
                    })
                  }
                  this.mergeChunks(row, fileChunks);
                }
              }
            })
          } else {
            // 处理多条下载
            this.fileData.unshift({
              id: chunkId,
              fileName: row.fileName,
              row: row,
              fileChunks: [chunk],
              downloadedSize: chunk.length,
              percentage: Math.round((chunk.length / row.fileSize) * 100)
            })
          }
        } else {
          // 第一次下载
          this.fileData.unshift({
            id: chunkId,
            fileName: row.fileName,
            row: row,
            fileChunks: [chunk],
            downloadedSize: chunk.length,
            percentage: Math.round((chunk.length / row.fileSize) * 100)
          })
        }
        if (this.kbToMb(row.fileSize) === 1) {
          this.mergeChunks(row, [chunk]);
        }
      };

      // 5. 处理 WebSocket 错误
      this.socket.onerror = (error) => {
        console.error("WebSocket error", error);
        this.handleDownloadError(row);
      };

      // 6. 处理 WebSocket 关闭
      this.socket.onclose = () => {
        this.socketType = true
        console.log("WebSocket connection closed");
      };
    },
    handleDownloadError (row) {
      // 断网后重新发起下载
      console.log("下载过程中出现错误，正在重试...");
      this.socketType = true
      // setTimeout(() => {
      //   this.dowload(row);
      // }, 3000);
    },

    mergeChunks (row, fileChunks) {
      try {
        const chunksArray = fileChunks.map(chunk => {
          const byteArray = new Uint8Array(chunk.length);
          for (let i = 0; i < chunk.length; i++) {
            byteArray[i] = chunk.charCodeAt(i);
          }
          return byteArray;
        });

        const blob = new Blob(chunksArray);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = row.fileName;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
        this.downloadedSize = 0
        this.socket.close()
      } catch (error) {
        console.error("合并文件块时发生错误:", error);
      }
    },
    deleteFile (row) {
      this.$confirm('是否确定要删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$api['documentManagement.deleteFile']({ id: row.id })
            .then((res) => {
              if (res) {
                this.$message.success('删除成功')
                this.$refs.table.searchData()
              }
            })
        })
        .catch((e) => {
        })
    },
    uploadBigFileBySocket () {
      let file = document.getElementById("uploadBigFile").files[0];//IE10以下不支持
      if (!file) {
        this.$message.warning('请选择一个文件')
        return;
      }
      if (this.disabled) {
        return
      }
      document.getElementById("uploadBigFile").disabled = true;
      this.disabled = true
      this.socketUpload("file", file, "detail2");
    },
    socketUpload (type, file, dom) {
      let that = this
      let name = file.name,        //文件名
        size = file.size;        //总大小

      //socket数据针过大会导致发送断开
      let shardSize = 5 * 1024 * 1024,    //以1MB为一个分片
        shardCount = Math.ceil(size / shardSize);  //总片数
      let GUID = ''
      if (this.GUID) {
        GUID = this.GUID
      } else {
        GUID = this.guid();
        this.GUID = GUID
      }
      this.socket = new WebSocket(this.urlPrefix + '/file/' + GUID);

      let map = { code: null, type: type, name: null, chunks: null, userId: null };
      this.socket.onopen = () => {
        console.log('建立文件上传通道 ...');
        map.chunks = shardCount;
        map.name = name;
        map.code = 0;
        map.userId = this.$store.state.user.userInfo.id,
          map.guid = GUID
        //创建服务器存储目录
        this.socket.send(JSON.stringify(map));
      }
      this.socket.onmessage = (evt) => {
        let parse = JSON.parse(evt.data);
        console.log(parse, '通道已建立 ...');
        console.log(typeof parse.data);
        if (typeof parse.data === 'number') {
          for (let i = parse.data; i < shardCount; ++i) {
            //计算每一片的起始与结束位置
            let start = i * shardSize,
              end = Math.min(size, start + shardSize);
            let fileBlob = file.slice(start, end);
            this.socket.send(fileBlob);
          }
        } else {
          if (parse.data && parse.data.code && parse.data.code == 101) {
            for (let i = 0; i < shardCount; ++i) {
              //计算每一片的起始与结束位置
              let start = i * shardSize,
                end = Math.min(size, start + shardSize);
              let fileBlob = file.slice(start, end);
              this.socket.send(fileBlob);
            }
          } else {
            if (parse.data && parse.data.indexOf('.') === -1) {
              this.percentage = Number(parse.data)
            }
          }
        }

        if (this.percentage === 100) {
          setTimeout(() => {
            that.$message.success('上传成功')
            that.$refs.table.searchData()
            that.fileName = {}
            that.isVisibleDocumentViewDrawer = false
            that.percentage = 0
            that.GUID = ''
            that.disabled = false
          }, 1000)
        }
        return null;
      }
      this.socket.onerror = (error) => {
        that.disabled = false
        that.$message.error('websocket链接错误')
      };
      this.socket.onclose = function (e) {
        that.disabled = false
        // that.$message.error('websocket断开链接')
        // console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
      }
    },
    guid (prefix) {
      let counter = 0;
      let guid = (+new Date()).toString(32),
        i = 0;
      for (; i < 5; i++) {
        guid += Math.floor(Math.random() * 65535).toString(32);
      }
      return (prefix || 'sirthis.socketl_') + guid + (counter++).toString(32);
    },
    documentViewDrawerClose () {
      if (this.percentage > 0) {
        return this.$message.warning('正在上传中请勿关闭')
      }
      this.isVisibleDocumentViewDrawer = false
      this.percentage = 0
      this.GUID = ''
      this.disabled = false
      this.socket.close()
    },
    reSet () {
      const this_ = this
      Object.keys(this_.queryParam).forEach((key) => {
        this_.queryParam[key] = null
      })
      Vue.nextTick(function () {
        this_.$refs.table.searchData()
      })
    },
    search (searchData) {
      this.queryParam = searchData
    }
  }
}
</script>
<style lang="scss" scoped>
.list-main {
  position: relative;
}
.uploadFile {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
/* 遮罩层样式 */
.modal-overlay {
  position: sticky;
  top: 0;
  left: 0;
  right: 15px;
  bottom: 10px;
  /* background: rgba(0, 0, 0, 0.5); */
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  z-index: 1;
  width: 300px;
  height: 300px;
}

/* 弹框的基本样式 */
.modal {
  width: 300px;
  height: 300px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 最小化状态的样式 */
.modal.minimized {
  width: 200px;
  height: 40px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  // align-items: center;
}

/* 弹框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  // padding: 10px;
  background-color: #f1f1f1;
  border-bottom: 1px solid #ccc;
}

/* 弹框内容区域 */
.modal-body {
  padding: 20px;
  overflow-y: auto;
}
.right-flex {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100px;
}
</style>
