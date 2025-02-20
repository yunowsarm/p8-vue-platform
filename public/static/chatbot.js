// 定义变量
const chatbotConfig = {
  token: 'jwmBZOefK3nP77f0',
  baseUrl: 'http://192.168.0.222'
};

let isChatbotLoaded = false;
let scriptConfig, scriptEmbed, styleElement;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// 加载聊天机器人
function loadChatbot() {
  if (isChatbotLoaded) return; // 避免重复加载

  // 动态创建配置脚本
  scriptConfig = document.createElement('script');
  scriptConfig.textContent = `window.difyChatbotConfig = ${JSON.stringify(chatbotConfig)};`;
  document.head.appendChild(scriptConfig);

  // 动态创建嵌入脚本
  scriptEmbed = document.createElement('script');
  scriptEmbed.src = `${chatbotConfig.baseUrl}/embed.min.js`;
  scriptEmbed.id = chatbotConfig.token;
  scriptEmbed.defer = true;
  scriptEmbed.onerror = function () {
    console.error('加载聊天机器人脚本失败。');
  };

  // 在脚本加载完成后初始化拖动功能
  scriptEmbed.onload = function () {
    const observer = new MutationObserver(function (mutationsList, observer) {
      const chatbotButton = document.getElementById('dify-chatbot-bubble-button');
      if (chatbotButton) {
        chatbotButton.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', stopDrag);
        observer.disconnect(); // 停止观察
      }
    });

    // 开始观察整个文档的 DOM 变化
    observer.observe(document.body, { childList: true, subtree: true });
  };

  document.head.appendChild(scriptEmbed);

  // 动态创建样式
  styleElement = document.createElement('style');
  styleElement.textContent = `
    #dify-chatbot-bubble-button {
      background-color: #1C64F2 !important;
      cursor: pointer; /* 添加鼠标指针样式 */
    }
    #dify-chatbot-bubble-window {
      width: 30rem !important;
      height: 40rem !important;
    }
    .disable-pointer-events {
      pointer-events: none;
    }
  `;
  document.head.appendChild(styleElement);

  isChatbotLoaded = true;
}

// 移除聊天机器人
function removeChatbot() {
  if (scriptConfig) document.head.removeChild(scriptConfig);
  if (scriptEmbed) document.head.removeChild(scriptEmbed);
  if (styleElement) document.head.removeChild(styleElement);

  isChatbotLoaded = false;
}

// 启动拖动
function startDrag(event) {
  isDragging = true;
  // 阻止默认的单击事件
  offsetX = event.clientX - document.getElementById('dify-chatbot-bubble-button').offsetLeft;
  offsetY = event.clientY - document.getElementById('dify-chatbot-bubble-button').offsetTop;
}

// 拖动过程中
function drag(event) {
  if (!isDragging) return;

  const chatbotButton = document.getElementById('dify-chatbot-bubble-button');
  chatbotButton.style.left = `${event.clientX - offsetX}px`;
  chatbotButton.style.top = `${event.clientY - offsetY}px`;
  // 禁用点击事件
  document.getElementById('dify-chatbot-bubble-button').classList.add('disable-pointer-events');
}

// 停止拖动
function stopDrag() {
  isDragging = false;
  // 启用点击事件
  document.getElementById('dify-chatbot-bubble-button').classList.remove('disable-pointer-events');
}

// 条件逻辑
if (!aiAssistant) {
  removeChatbot();
  console.log('聊天机器人已移除');
} else {
  loadChatbot();
  console.log('聊天机器人已加载');
}

// 页面卸载时清理
window.addEventListener('beforeunload', function () {
  removeChatbot();
});
