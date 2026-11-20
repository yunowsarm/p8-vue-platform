# 园区运营端 · 公告、资料与社区

## 通知公告：发布、调整可见范围及维护

运营人员从管理端「通知公告」进入，点击「发布公告」。填公告标题、公告场景、可见范围和公告内容。场景可选园区动态、企业动态、安全提醒或活动通知；可见范围可选对内或对外，初始选对内。可附加文件，单个不超过 10 MB，最多 9 个。点击发布，随后可在列表搜索并查看、编辑或删除。管理端同目录中的「内部公告」入口使用只读模式和对内列表范围。

依据：`src/views/ToOManage/publicNotice.vue`、`src/views/ToOManage/inside_publicNotice.vue`、`src/features/public-services/public-notice/PublicNoticePage.vue`、`src/features/public-services/public-notice/definition.js`。

## 资料下载：新增、编辑和删除园区资料

运营人员进入管理端「资料下载」，点击「新增资料」，填资料标题、分类、描述，可上传资料附件。分类有办事指南、表单模板、园区手册、宣传资料和其他。附件单个不超过 10 MB，最多 9 个；点击「保存资料」后可在列表按分类或关键词定位。管理员侧支持编辑和删除，已保存记录的详情提供附件下载。创建时间由页面生成，编辑表单中的创建时间为必填项。

依据：`src/views/ToOManage/documentDownload.vue`、`src/features/public-services/document-download/DocumentDownloadPage.vue`、`src/features/public-services/document-download/definition.js`。

## 在线咨询：回复企业咨询

运营人员进入管理端「在线咨询」，按咨询编号、咨询人或内容检索，也可按待回复、处理中、已回复、已关闭筛选。找到记录后点击「回复」，填写必填的回复人联系方式和回复内容，点击「提交回复」。页面自动填入当前回复人和回复时间，保存后状态为「已回复」。已回复记录关闭回复入口。管理侧提供删除操作。咨询回复属于「在线咨询」入口；企业的建议、投诉和服务需求在「服务大厅管理 → 诉求反馈」办理。

依据：`src/views/ToOManage/onlineConsultation.vue`、`src/features/public-services/online-consultation/OnlineConsultationPage.vue`、`src/features/_shared/record-management/recordManager.js`。

## 园区话题管理：审核和删除帖子

运营人员进入园区话题管理，可用关键词、版块和审核状态筛选帖子，按最新发布或互动最多排序。点击标题可查看帖子详情。只有「未审核」状态显示审核操作；点击「审核」后必选「通过」或「不通过」并提交。结果分别显示「已审核」和「审核不通过」；页面会更新列表，失败时提示重试。详情接口异常可暂时查看列表信息。帖子行也提供删除，确认后提交删除请求。

依据：`src/views/ToOManage/parkTopicManage.vue`、`src/service/api/modules/tocParkCommunication.js`。

## 园区交流管理：处理失物招领和园区拼车记录

运营人员进入「园区交流管理」，切换「失物招领」或「园区拼车」，可筛选、看详情和删除记录。失物招领显示待认领、已认领；寻物启事显示寻找中、已找到；园区拼车显示待拼车、已拼车、已出发。管理端提供的是查看和删除，记录发布及状态推进属于用户端操作。删除前核对目标并确认；接口失败时记录以列表重新加载结果为准。

依据：`src/views/ToOManage/parkCommunicationManage.vue`、`src/views/ToC/parkCommunication/components/LostFoundBoard.vue`、`src/views/ToC/parkCommunication/components/CarpoolServiceBoard.vue`。
