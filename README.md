# nocturne.vue.platform

<img alt="" src="https://img.shields.io/badge/version-1.0.0-blue.svg" /> <img alt="" src="https://img.shields.io/badge/build-passing-brightgreen.svg" /> <img alt="" src="https://img.shields.io/badge/license-MIT-blue.svg" />

##  文档
这里提供了一份详细的文档说明，[点此查看](https://nocturne-doc.vicco.wang/)

<font color="red">建议node环境版本大于等于14</font>

##  使用指南

### 启动项目

我们一般习惯在第一次获取项目后首先执行以下代码来获取项目相关依赖

npm install
```

在获取完毕依赖后,我们即可启动项目了:

```
// start mockserver
npm run mockServer

// start project
npm run serve
```

启动完毕后,如果一切正常,你应该能看到控制台打印如下代码:

```
DONE Compiled successfully in 23713ms

  App running at:
  - Local:   http://localhost:8080/
  - Network: http://192.168.0.1:8080/

  Note that the development build is not optimized.
  To create a production build, run npm run build.



OK! 大功告成, 我们可以通过以上地址访问项目了.


#### 生产环境打包

我们通过以下指令即可完成生产环境的打包
```
npm run build

打包报FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```
cnpm install -g increase-memory-limit

进入项目文件夹，运行：increase-memory-limit

npm run build


#### Git 提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范 ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))

  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中

### commit

```
```

#### type

代表某次提交的类型，比如是修复一个 bug 还是增加一个新的 feature。所有的 type 类型如下：

- feat[特性]: 新增 feature
- fix[修复]: 修复 bug
- docs[文档]: 仅仅修改了文档，比如 README, CHANGELOG, CONTRIBUTE 等等
- style[格式]: 仅仅修改了空格、格式缩进、都好等等，不改变代码逻辑
- refactor[重构]: 代码重构，没有加新功能或者修复 bug
- perf[优化]: 优化相关，比如提升性能、体验
- test[测试]: 测试用例，包括单元测试、集成测试等
- chore[工具]: 改变构建流程、或者增加依赖库、工具等
- revert[回滚]: 回滚到上一个版本

#### scope

scope 说明 commit 影响的范围。scope 依据项目而定，例如在业务项目中可以依据菜单或者功能模块划分， 如果是组件库开发，则可以依据组件划分。

#### subject

是 commit 的简短描述

#### body

提交代码的详细描述

#### footer

如果代码的提交是不兼容变更或关闭缺陷，则 Footer 必需，否则可以省略。
