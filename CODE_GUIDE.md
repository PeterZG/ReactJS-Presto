# Presto 代码导览

## 前后端目录

| 路径 | 职责 |
| --- | --- |
| `frontend/src/App.js` | 路由组合 |
| `frontend/src/pages/` | 登录、注册、文稿库、编辑和预览 |
| `frontend/src/layout/` | 认证和工作区布局 |
| `frontend/src/editor/` | 幻灯片画布、元素、主题、排序和历史 |
| `frontend/src/services/presentationApi.js` | API 请求和错误类型 |
| `frontend/src/services/presentationStorage.js` | 文稿保存、会话数据和历史快照 |
| `frontend/src/state/` | 消息状态 |
| `frontend/src/ui/` | 通用字段、按钮和对话框 |
| `frontend/src/tests/` | 前端测试 |
| `backend/src/server.js` | Express 路由 |
| `backend/src/presentationService.js` | 账户、会话和 JSON 数据存储 |
| `backend/src/apiErrors.js` | 输入与权限错误 |

## 阅读入口

先看 `App.js` 的路由，再看 `PresentationLibraryPage.js` 和 `PresentationEditorPage.js`。

文稿的幻灯片及元素由编辑页面管理，HTTP 请求通过服务层发送。预览页面读取同一份文稿数据，不维护第二套编辑状态。

## 状态与交互

路由中的编号表示当前幻灯片。方向键只在表单外切页，避免影响文字编辑。

保存操作返回 Promise，成功后更新保存状态；错误通过消息组件反馈。历史记录保存独立快照，恢复后写回文稿。历史存在浏览器存储中，不是长期备份。

同一页面的写入按队列执行；读取与删除等待前面的修改，删除操作在队列内取得最新文稿列表。排队和读后写之间均检查登录令牌，避免旧账号的保存任务写入新账号。本地身份或历史损坏不会使页面崩溃，历史空间不足会提示，但不阻止 API 保存。

后端在同一账户锁下建立新的数据快照，原子落盘成功后才替换内存状态并返回成功。磁盘失败保留上一个版本；GET 不重写数据文件。此设计保护单个本地服务进程，不提供多实例或多浏览器的冲突合并。

## 维护约定

工具栏将幻灯片操作与文稿工具分组，只用强调色突出“添加幻灯片”。主题、排序、历史和预览采用次要按钮；窄屏按组换行，保留操作之间的留白和一致对齐。

历史弹窗每次打开时重新读取快照，关闭期间的新编辑不会遗漏在旧列表中。回归位于 `frontend/src/tests/presentationHistoryDialog.test.js`。`frontend/scripts/presentation-text-checks.cjs` 检查实际界面字号与对比度，画布内容由用户自行排版。

React 使用 ESLint Standard 规则。页面、布局、编辑器和通用控件分别放置；文件名使用明确角色，例如 `PresentationEditorPage` 和 `SlideCanvas`。

注释说明请求格式、异步时序和数据快照等行为。修改功能后运行 lint、单元测试、构建及浏览器检查。可编辑源码在 `frontend/src/`，构建输出在 `frontend/build/`。

[项目说明](README.md)
