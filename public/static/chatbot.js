// 定义变量
const chatbotConfig = {
  token: 'vNRLj5VlioSNM7Ar',
  baseUrl: CONFIG.aiUrl
}

let isChatbotLoaded = false
let scriptConfig, scriptEmbed, styleElement
let isDragging = false
let offsetX = 0
let offsetY = 0

// 加载聊天机器人
function loadChatbot() {
  if (isChatbotLoaded) return // 避免重复加载

  // 动态创建配置脚本
  scriptConfig = document.createElement('script')
  scriptConfig.textContent = `window.difyChatbotConfig = ${JSON.stringify(chatbotConfig)};`
  document.head.appendChild(scriptConfig)

  // 动态创建嵌入脚本
  scriptEmbed = document.createElement('script')
  scriptEmbed.src = `${chatbotConfig.baseUrl}/embed.min.js`
  scriptEmbed.id = chatbotConfig.token
  scriptEmbed.defer = true
  scriptEmbed.onerror = function () {
    console.error('加载聊天机器人脚本失败。')
  }

  // 在脚本加载完成后初始化拖动功能
  scriptEmbed.onload = function () {
    const observer = new MutationObserver(function (mutationsList, observer) {
      const chatbotButton = document.getElementById('dify-chatbot-bubble-button')
      if (chatbotButton) {
        chatbotButton.addEventListener('mousedown', startDrag)
        window.addEventListener('mousemove', drag)
        window.addEventListener('mouseup', stopDrag)
        observer.disconnect() // 停止观察
      }
    })

    // 开始观察整个文档的 DOM 变化
    observer.observe(document.body, { childList: true, subtree: true })
  }

  document.head.appendChild(scriptEmbed)

  // 动态创建样式
  styleElement = document.createElement('style')
  styleElement.textContent = `
  /* 新增全局选择禁用 */
  .no-selection {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
    #dify-chatbot-bubble-button {
      background-color: #1C64F2 !important;
      cursor: pointer; /* 添加鼠标指针样式 */
      bottom: 60px !important;
    }
    #dify-chatbot-bubble-window {
      width: 50rem !important;
      height: 60rem !important;
    }
    .disable-pointer-events {
      pointer-events: none;
    }
  `
  document.head.appendChild(styleElement)

  isChatbotLoaded = true
}

// 移除聊天机器人
function removeChatbot() {
  if (scriptConfig) document.head.removeChild(scriptConfig)
  if (scriptEmbed) document.head.removeChild(scriptEmbed)
  if (styleElement) document.head.removeChild(styleElement)

  isChatbotLoaded = false
}

// 启动拖动
function startDrag(event) {
  isDragging = true
  event.preventDefault() // 阻止默认行为
  document.body.classList.add('no-selection') // 添加禁用选择样式
  // 阻止默认的单击事件
  offsetX = event.clientX - document.getElementById('dify-chatbot-bubble-button').offsetLeft
  offsetY = event.clientY - document.getElementById('dify-chatbot-bubble-button').offsetTop
}

// 拖动过程中
// 在drag函数中添加边界检查
function drag(event) {
  if (!isDragging) return

  const chatbotButton = document.getElementById('dify-chatbot-bubble-button')
  const buttonWidth = chatbotButton.offsetWidth
  const buttonHeight = chatbotButton.offsetHeight

  // 获取视口尺寸
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

  // 计算边界限制位置
  let newX = event.clientX - offsetX
  let newY = event.clientY - offsetY

  // X轴边界检查
  newX = Math.max(0, Math.min(newX, viewportWidth - buttonWidth))
  // Y轴边界检查
  newY = Math.max(0, Math.min(newY, viewportHeight - buttonHeight))

  chatbotButton.style.left = `${newX}px`
  chatbotButton.style.top = `${newY}px`
  document.getElementById('dify-chatbot-bubble-button').classList.add('disable-pointer-events')
}

// 添加窗口resize监听器（在loadChatbot函数最后添加）
window.addEventListener('resize', function () {
  const button = document.getElementById('dify-chatbot-bubble-button')
  if (button) {
    const rect = button.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight

    // 如果按钮在可视区域外，重置到右下角
    if (rect.right > viewportWidth || rect.bottom > viewportHeight) {
      button.style.left = 'auto'
      button.style.right = '20px'
      button.style.top = 'auto'
      button.style.bottom = '60px'
    }
  }
})

// 停止拖动
function stopDrag() {
  isDragging = false
  document.body.classList.remove('no-selection')
  // 启用点击事件
  document.getElementById('dify-chatbot-bubble-button').classList.remove('disable-pointer-events')
}

// 条件逻辑
if (!aiAssistant) {
  removeChatbot()
} else {
  loadChatbot()
}

// 页面卸载时清理
window.addEventListener('beforeunload', function () {
  removeChatbot()
})
