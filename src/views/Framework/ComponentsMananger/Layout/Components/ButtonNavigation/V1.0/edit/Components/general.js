// 树形下拉数据根据对应关系进行处理
export const selectGenerateTree = (data, config) => {
  const configParams = JSON.parse(config)
  const pidName = configParams.pidCol
  const labelName = configParams.labelCol
  const valueName = configParams.valueCol
  /**
   * 1. 平行数组
   * 2. 树形数组
   */
  const pidNameStr = pidName != null && pidName !== '' ? pidName : 'pId'
  // 把跟节点首先放进数组
  const tmpTree = data.filter((node) => !node[pidNameStr])
  if (!tmpTree.length) {
    console.log('tree-select:', 'not found 父节点')
  }
  // 递归生成节点及子节点数据
  const findChildren = (tree) => {
    tree.forEach((node) => {
      node.label = node[labelName]
      node.value = node[valueName]
      node.id = node[valueName]
      node.children = data.filter((cNode) => cNode[pidNameStr] === node[valueName])
      if (node.children.length) {
        findChildren(node.children)
      }
    })
  }

  findChildren(tmpTree)
  return tmpTree
}
