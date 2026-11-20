# 园区交流的失物招领、拼车和地点查询

## 失物招领与寻物启事

进入个人端「园区交流 → 失物招领」。捡到物品选「失物招领」，丢失物品选「寻物启事」。点「新建失物招领」，填写类型、标题、内容、联系方式，发布人和发布时间由系统补录。可上传附件，每个不超过 10 MB，最多 9 个。发布后可按类型、状态搜索，也可切换只看自己的发布。

「失物招领」初始为「待认领」，实际交接后由发布人推进至「已认领」。「寻物启事」初始为「寻找中」，找回物品后由发布人推进至「已找到」。发布人可编辑未结束的记录，也可删除本人的记录。详情显示联系方式和可下载的附件，页面没有线上核验、认领申请或交付动作。运营端「园区交流管理 → 失物招领」提供全部记录查询、查看和删除。

依据 `src/views/ToC/parkCommunication/lostFound.vue`、`src/views/ToC/parkCommunication/components/LostFoundBoard.vue`、`src/views/ToOManage/parkCommunicationManage.vue`。

## 园区拼车

进入个人端「园区交流 → 园区拼车」，新建时选择「找车」或「找乘客」，填写起点、终点、出发时间和联系方式。「找车」需填拼车人数，「找乘客」需填可提供的座位数，人数或座位数至少为 1。发布人和发布时间由页面带入。可按类型、状态筛选和查看自己的发布，点击详情联系对方线下确认。

拼车记录默认为「待拼车」。发布人确认拼车后，可在编辑框点「标记为已拼车」。到达填写的出发时间后，页面按时间显示「已出发」，展示状态体现时间计算。发布人可编辑未完成的记录，已拼车或已出发后编辑按钮停用。页面没有抢座、配对确认和支付入口。运营端「园区交流管理 → 园区拼车」提供全部记录查询、查看和删除。

依据 `src/views/ToC/parkCommunication/carpoolService.vue`、`src/views/ToC/parkCommunication/components/CarpoolServiceBoard.vue`、`src/views/ToOManage/parkCommunicationManage.vue`。

## 园区导航与接口预留

进入个人端「园区交流 → 园区导航」，按关键词或地点类型查询，点击详情查看地点名称、坐标和描述。有权限维护的账号可以新建、编辑、删除地点。地点名称、类型、坐标和描述均必填。类型含办公服务、商业配套、公共设施、停车交通、休闲运动。页面提供地点台账和坐标，未显示地图路线规划或实时导航。

「园区圈子」「兴趣频道」在交流模块有接口声明，当前代码中未定位到对应用户页面或可办理流程。论坛实际由独立论坛接口承载；园区话题的通用记录接口声明也未见对应页面调用。

依据 `src/views/ToC/parkCommunication/parkNavigation.vue`、`src/views/ToC/parkCommunication/components/CommunicationBoard.vue`、`src/service/api/modules/tocParkCommunication.js`。
