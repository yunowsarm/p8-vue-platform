import Vue from 'vue'
export function download (id, name, type) {
  if (window.plus) {
    const { API_DEFAULT_CONFIG } = Vue.prototype.$sysConfig
    const { downloadUrl,downloadTemplateUrl } = API_DEFAULT_CONFIG;
    let url
    if (type === 'template') {
      url = `${downloadTemplateUrl}?attachmentId=${id}`
    } else {
      url = `${downloadUrl}?attachmentId=${id}`
    }
    const savePath = `_downloads/${name}`
    const dtask = plus.downloader.createDownload(
      url,
      { filename: savePath },
      (download, status) => {
        if (status === 200) {
          plus.nativeUI.toast('文件下载完成')
          plus.runtime.openFile(download.filename, {}, (err) => {
            plus.nativeUI.alert('无法打开文件：' + err.message)
          })
        } else {
          plus.nativeUI.toast('下载失败，请稍后重试')
        }
      }
    )
    dtask.start()
  } else {
    const api = Vue.prototype.$api
    api['documentManagement.download']({ attachmentId: id }, { responseType: 'blob' })
      .then((backJson) => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(new Blob([backJson.data]))
        link.download = name
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
      })
      .finally(() => { })
  }
}