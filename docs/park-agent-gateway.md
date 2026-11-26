# P8 园区 AI 助理接入

浮窗由 `src/App.vue` 加载。P8 页面通过现有的 `$api` 和 P8 登录态调用同源 `/api/park-agent/v1/sessions`。

## 本机联调

智能体独立运行在 `127.0.0.1:8000`。在 P8 项目的 `.env.development.local` 中填入 `PARK_AGENT_LOCAL_ENV_FILE=D:/wujie/agent/.env`，重启 `npm run dev`。P8 页面可以通过 `http://127.0.0.1:3001` 或局域网 IP 打开。园区 AI 助手的开发代理只接受回环地址的请求，并在服务端读取智能体调用 Token。使用助手时请通过 `http://127.0.0.1:3001` 打开 P8。

联调企业关怀时，再设置 `PARK_AGENT_P8_USER_INFO_URL` 为当前 P8 开发环境后端的完整 `/user/info` 地址。代理用 P8 登录 Token 请求这个地址，只有通过验证的账号才能领取关怀消息。请使用和 P8 `devBaseUrl` 对应的可信后端。启用此项后，当前聊天和历史也使用验证后的 P8 用户 ID。从前使用共享测试账号创建的历史归属共享测试账号。

本机代理使用测试园区 `local-dev-park` 和网关占位企业 `local-dev-enterprise`。在独立智能体管理页的「企业关怀」配置里，把园区设为 `local-dev-park`，填入业务企业的真实 ID 和名称，再填入接收人的 P8 `userInfo.id`。收件匹配使用计划上的指定联系人，企业 ID 用于标识实际回访对象。未配置身份核验时，共享测试身份仅供原有聊天功能联调。

## 企业关怀设置

在智能体管理页打开「企业关怀」，新增计划并核对接收人。新建计划默认停用，启用后可使用「发起一次关怀」验证送达。由指定联系人登录 P8，点击浮窗中的「企业关怀」查看消息。

按北京时间安排。每周一次的计划在周二上午 10 点起安排本周关怀。每周两次的计划可在周五下午 2 点起发起第二次跟进，条件是联系人已回复本周首次关怀且仍有未解决事项。手动发起计入当周次数。联系人可以在浮窗暂停关怀，计划和跟进事项由管理员在后台维护。

## 正式部署

P8 和智能体可以各自部署，以下路由可配在现有网关或独立网关中。

网关需接通这组路由，将路径中的 `/api/park-agent` 前缀移除，再转发到独立 FastAPI 服务。

| P8 请求 | 用途 |
| --- | --- |
| `POST /api/park-agent/v1/sessions` | 新建会话，可选 `profile.realName` 和 `profile.departmentName` 提供回复上下文 |
| `GET /api/park-agent/v1/sessions?limit=20&offset=0` | 查询当前账号已结束的会话 |
| `GET /api/park-agent/v1/sessions/{id}` | 读取会话和结束结果 |
| `POST /api/park-agent/v1/sessions/{id}/turns` | 字段 `text` 的 JSON 请求 |
| `POST /api/park-agent/v1/sessions/{id}/voice-turns` | 字段 `audio` 的 multipart 录音请求，保留 multipart boundary |
| `POST /api/park-agent/v1/sessions/{id}/finish` | 结束会话，`mode` 为 `notify` 时转达负责人，为 `archive` 时仅保存记录，省略时按原有规则分流 |
| `POST /api/park-agent/v1/sessions/{id}/forward` | 转达当前账号已关闭且未转达的历史会话 |
| `GET /api/park-agent/v1/care/messages` | 获取当前账号的企业关怀消息 |
| `POST /api/park-agent/v1/care/messages/{id}/open` | 打开或恢复该条关怀消息对应的会话 |
| `POST /api/park-agent/v1/care/messages/{id}/dismiss` | 忽略一条关怀消息 |
| `POST /api/park-agent/v1/care/plans/{id}/pause` | 暂停本人收到的该企业定期关怀 |

网关校验浏览器请求携带的 P8 `Authorization`，根据真实账号查出园区、企业和用户 ID。转发时设置服务端 `Authorization: Bearer <AGENT_SERVICE_TOKEN>`、`X-Park-Id`、`X-Enterprise-Id` 和 `X-User-Id`。这些身份字段取自网关自己的权限查询。网关应保留查询参数、FastAPI 的状态码和 JSON 响应（新建会话返回 `201`），只开放上表的会话接口。供应商管理、供应商 Key 和服务 Token 由后端管理。

当前 P8 没有企业到账号目录时，由有权限的园区管理员在独立智能体后台维护指定联系人。网关校验 P8 账号和所属园区，并使用服务端设置的企业占位值 `unassigned-enterprise`。关怀会话及后续聊天请求使用同一个网关身份。真实业务企业以关怀计划上登记的企业为准。管理员在建立绑定前核对联系人的代表资格，联系人账号发生变化时更新计划。

文字和语音轮次会发送 `Accept: application/x-ndjson`。网关需保留该请求头和响应的 `Content-Type`，并关闭响应缓冲，才能在模型生成时逐段显示。

P8 从登录态 `userInfo` 读取姓名和部门。智能体在会话中保存这两个字段，并用于文字和语音回复的上下文。`profile` 仅供回复参考，会话归属和权限依然以网关认证后的请求头为准。

同一请求还携带 `X-Park-Reply-Audio`，网关需原样转发。P8 开启语音播报时使用 `final`，由智能体在完整回复生成后合成一次，并在 `done` 事件返回整段 MP3。P8 按播放进度逐步显示文字。关闭语音时使用 `off`，直接显示 `delta` 文本流。兼容客户端仍可请求 `on` 的分段 MP3 或 `pcm` 的音频分块。

浏览器在 HTTPS 或 localhost 环境请求麦克风授权。文字消息始终可用。历史记录显示「已转达」表示会话已提交给通知流程。真实通知的投递状态由接收端跟踪。
