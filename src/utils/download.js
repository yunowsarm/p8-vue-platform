import Vue from 'vue'
import { getToken } from '@/service/expands/auth'

export function download(id, name, type) {
  if (window.plus) {
    const { API_DEFAULT_CONFIG } = Vue.prototype.$sysConfig
    const { exportUrl, downloadUrl, downloadTemplateUrl } = API_DEFAULT_CONFIG
    let url
    if (type === 'template') {
      url = `${downloadTemplateUrl}?attachmentId=${id}`
    } else if ('export') {
      url = `${exportUrl}?isMobile=true&key=${id}&Authorization=${getToken()}`
    } else {
      url = `${downloadUrl}?attachmentId=${id}`
    }
    const savePath = `_downloads/${name}`

    function getFriendlyPath(fullPath) {
      if (!fullPath) return ''
      const index = fullPath.indexOf('Android/data/')
      if (index >= 0) {
        return fullPath.substring(index)
      }
      return fullPath.substring(fullPath.lastIndexOf('/') + 1)
    }

    plus.nativeUI.showWaiting('正在下载...')
    const dtask = plus.downloader.createDownload(url, { filename: savePath }, (download, status) => {
      plus.nativeUI.closeWaiting()
      if (status === 200) {
        plus.io.resolveLocalFileSystemURL(download.filename, (entry) => {
          const friendlyPath = getFriendlyPath(entry.fullPath)
          plus.nativeUI.alert(
            `文件已下载成功：\n保存位置：${friendlyPath}。`,
            () => {
              plus.runtime.openFile(entry.fullPath, {}, (err) => {
                plus.nativeUI.toast('无法打开,请手动到下载目录查看')
              })
            },
            '下载完成'
          )
        })
      } else {
        plus.nativeUI.toast('下载失败，请检查网络或地址')
      }
    })
    dtask.start()
  } else {
    const api = Vue.prototype.$api
    let apiUrl
    if(type === 'template'){
      apiUrl = 'SystemSettings.getTemplateFileUrl'
    }else{
      apiUrl = 'documentManagement.download'
    }
    api[apiUrl]({ attachmentId: id }, { responseType: 'blob' })
      .then((backJson) => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(new Blob([backJson.data]))
        link.download = name
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
      })
      .finally(() => {})
  }
}
