/**
 *
 * generateTree Function
 * Author: Vicco Wang
 * Date: 2018/05/18
 *
 * 根据一个1维结构数组生成符合ElementUI规则的树形结构化数据.
 * PS: 该方法目前只适用于当前公司项目环境, 树型数据中通过
 * id/pid来确定层级关系.
 * pid 为空的为根节点/custompId为根节点
 * @param treeData {Array} 原始1维树结构数据对象
 *
 */
export const generateTree = (treeData, pidName, custompId) => {
  if (!custompId) custompId = '' //
  const pidNameStr = pidName != null && pidName !== '' ? pidName : 'pId'

  // // 把跟节点首先放进数组
  const tmpTree = treeData.filter((node) => !node[pidNameStr] || node[pidNameStr] === custompId)

  // 递归生成节点及子节点数据
  const findChildren = (tree) => {
    tree.forEach((node) => {
      node.children = treeData.filter((cNode) => cNode[pidNameStr] === node.id)
      if (node.children.length) {
        findChildren(node.children)
      }
    })
  }

  findChildren(tmpTree)

  return tmpTree
}
/**
 *
 * generateTree Function
 * Author: Vicco Wang
 * Date: 2018/05/18
 *
 * 根据一个1维结构数组生成符合ElementUI规则的树形结构化数据.
 * PS: 该方法目前只适用于当前公司项目环境, 树型数据中通过
 * id/pid来确定层级关系.
 * pid 为空的为根节点/custompId为根节点
 * 使用于多根节点或者无法确定根节点pid的数据结构
 * @param treeData {Array} 原始1维树结构数据对象
 *
 */
export const generateTreeTwo = (treeData, pidName) => {
  const pidNameStr = pidName != null && pidName !== '' ? pidName : 'pId'
  // // 把跟节点首先放进数组
  const tmpTree = treeData.filter((node) => {
    return treeData.filter((cNode) => node[pidNameStr] === cNode.id).length === 0
  })

  // 递归生成节点及子节点数据
  const findChildren = (tree) => {
    tree.forEach((node) => {
      node.children = treeData.filter((cNode) => cNode[pidNameStr] === node.id)
      if (node.children.length) {
        findChildren(node.children)
      }
    })
  }

  findChildren(tmpTree)
  return tmpTree
}
