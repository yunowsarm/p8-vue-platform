// ToC 园区交流 API 模块：声明话题、圈子、导航、拼车及论坛接口路径。
import createModule from './_shared/createCrudModule'

const forumModule = {
  forum: [
    { name: 'categories', method: 'GET', path: '/forum/categories/list', mockPath: '/forum/categories/list', desc: '论坛版块列表' },
    { name: 'topicsPage', method: 'GET', path: '/forum/topics/page', mockPath: '/forum/topics/page', desc: '论坛帖子分页查询' },
    { name: 'topicCreate', method: 'POST', path: '/forum/topics', mockPath: '/forum/topics', desc: '发布论坛帖子' },
    { name: 'topicEdit', method: 'POST', path: '/forum/topics/edit', mockPath: '/forum/topics/edit', desc: '编辑论坛帖子审核状态' },
    { name: 'topicDetail', method: 'GET', path: '/forum/topics/{id}', mockPath: '/forum/topics/{id}', desc: '论坛帖子详情' },
    { name: 'topicDelete', method: 'POST', path: '/forum/topics/delete/{id}', mockPath: '/forum/topics/delete/{id}', desc: '删除论坛帖子' },
    { name: 'repliesPage', method: 'GET', path: '/forum/replies/topic/{topicId}', mockPath: '/forum/replies/topic/{topicId}', desc: '帖子回复分页查询' },
    { name: 'replyCreate', method: 'POST', path: '/forum/replies', mockPath: '/forum/replies', desc: '发布帖子回复' },
    { name: 'replyDelete', method: 'POST', path: '/forum/replies/delete/{id}', mockPath: '/forum/replies/delete/{id}', desc: '删除帖子回复' },
    { name: 'actionToggle', method: 'POST', path: '/forum/user-actions/toggle', mockPath: '/forum/user-actions/toggle', desc: '切换帖子互动状态' },
    { name: 'myFavorites', method: 'GET', path: '/forum/user-actions/my-favorites', mockPath: '/forum/user-actions/my-favorites', desc: '查询我的收藏帖子' },
    { name: 'myPosts', method: 'GET', path: '/forum/user-actions/my-posts', mockPath: '/forum/user-actions/my-posts', desc: '查询我的发布帖子' }
  ]
}

export const tocParkCommunicationApi = Object.assign(
  {},
  createModule('tocTopicDiscussion', '/czwj/toc/topicDiscussion', '园区话题'),
  createModule('tocInterestGroup', '/czwj/toc/interestGroup', '园区圈子'),
  createModule('tocLostFound', '/czwj/toc/lostFound', '失物招领'),
  createModule('tocParkNavigation', '/czwj/toc/parkNavigation', '园区导航'),
  createModule('tocHobbyChannel', '/czwj/toc/hobbyChannel', '兴趣频道'),
  createModule('tocCarpoolService', '/czwj/toc/carpoolService', '园区拼车'),
  forumModule
)
