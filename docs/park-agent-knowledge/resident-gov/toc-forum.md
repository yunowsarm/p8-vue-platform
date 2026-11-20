# 园区话题论坛发布、互动与审核

## 浏览、发帖和查询审核结果

进入个人端「园区交流 → 园区话题」论坛，按版块浏览最新、热门帖子，也可按关键词查找。发帖需登录。点击发帖，选择版块，填写标题和正文并发布。标题上限为 60 字，当前版块可作为默认发布位置。发布后为「未审核」，在「我的帖子」查看状态。「最新」「热门」列表查询审核通过的帖子。

帖子详情可回复主题或某条回复，也可点赞、收藏及取消操作。互动需登录；「我的帖子」中处于「未审核」或「审核不通过」的帖子限制互动。在「我的收藏」可查看已收藏的主题。发布人可通过帖子上的删除操作确认移除本人的帖子。

依据 `src/views/ToC/parkCommunication/forum.vue`、`src/views/ToC/parkCommunication/components/ForumNavigation.vue`、`src/service/api/modules/tocParkCommunication.js`。

## 运营端园区话题管理

在「园区话题管理」可按关键词、版块和审核状态筛选并查看帖子。对「未审核」帖子点「审核」，选择通过或不通过并确认，状态分别更新为「已审核」或「审核不通过」。获授权的管理人员也可删除帖子，确认弹窗提示会删除帖子及其全部回复。审核页处理帖子，前端业务入口未显示回复审核流程。

依据 `src/views/ToOManage/parkTopicManage.vue`、`src/service/api/modules/tocParkCommunication.js`。
