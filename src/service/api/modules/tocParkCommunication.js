const createModule = (namespace, path, desc) => ({
  [namespace]: [
    { name: 'list', method: 'GET', path: `${path}/list`, mockPath: `${path}/list`, desc: `${desc}分页查询` },
    { name: 'add', method: 'POST', path: `${path}/add`, mockPath: `${path}/add`, desc: `新增${desc}` },
    { name: 'edit', method: 'POST', path: `${path}/edit`, mockPath: `${path}/edit`, desc: `编辑${desc}` },
    { name: 'delete', method: 'POST', path: `${path}/delete`, mockPath: `${path}/delete`, desc: `删除${desc}` },
    { name: 'queryById', method: 'GET', path: `${path}/queryById`, mockPath: `${path}/queryById`, desc: `${desc}详情` }
  ]
})

export const tocParkCommunicationApi = Object.assign(
  {},
  createModule('tocTopicDiscussion', '/czwj/toc/topicDiscussion', '园区话题'),
  createModule('tocInterestGroup', '/czwj/toc/interestGroup', '园区圈子'),
  createModule('tocLostFound', '/czwj/toc/lostFound', '失物招领'),
  createModule('tocParkNavigation', '/czwj/toc/parkNavigation', '园区导航'),
  createModule('tocHobbyChannel', '/czwj/toc/hobbyChannel', '兴趣频道'),
  createModule('tocCarpoolService', '/czwj/toc/carpoolService', '园区拼车')
)
