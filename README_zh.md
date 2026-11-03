# Presto — 演示文稿工作室

使用 React 创建、编辑和预览幻灯片，Express 后端负责账户与文稿保存。

维护者：**Weihou Zeng（PeterZG）**。

## 功能

- 注册、登录和退出。
- 文稿列表、搜索、创建、重命名、缩略图编辑与删除。
- 幻灯片添加、删除、排序和预览。
- 文字、图片、视频及代码元素。
- 元素定位与缩放、背景主题和近期历史记录。

## 目录

`frontend/src/pages/` 存放页面，`editor/` 存放幻灯片组件，`services/` 管理请求与存储。后端入口为 `backend/src/server.js`，业务服务为 `presentationService.js`。

## 启动

需要 Node.js 22+。在独立终端中启动前后端：

```sh
cd backend
npm ci
npm start
```

```sh
cd frontend
npm ci
npm start
```

打开 `http://localhost:3000`。API 默认监听 `127.0.0.1:5005`，接口说明位于 `http://localhost:5005/docs/`。

## 使用

注册并登录后创建文稿。打开文稿，从工具栏添加内容，使用缩略栏切页。双击元素可编辑；表单之外的左右方向键用于切页。Preview 在新标签打开预览。

近期历史保留最近24小时内最多100份独立快照，恢复后写回API。选中元素可拖动移动和缩放，也可按Enter打开编辑表单精确输入位置与尺寸。窄屏可放大画布并在画布内平移，Fit to screen恢复适应屏幕。历史用于编辑恢复，不是长期备份。

## 配置与测试

`REACT_APP_API_BASE_URL` 指定前端 API 地址。后端支持 `HOST`、`PORT`、`PRESTO_DATABASE_FILE` 和 `JWT_SECRET`。未设置签名密钥时，服务重启会使已有令牌失效。

后端在账户或文稿原子落盘后才返回成功；磁盘写入失败保留上一版本及原会话，读取不会重写数据库。编辑器保存队列会检查原账号令牌，本地历史损坏或空间不足不会阻止 API 保存。

前端运行 `npm run lint`、`npm test -- --watchAll=false`、`npm run build`。后端运行 `npm run lint` 和 `npm test -- --runInBand`。

浏览器验收使用独立API和忽略的`.qa/`数据库，自动启动与清理进程，不改动已有开发数据。先构建到同一个QA API地址：

```powershell
$env:REACT_APP_API_BASE_URL='http://127.0.0.1:5187'
npm run build
$env:BROWSER_CHANNEL='chrome'
npm run qa:browser
```

可用`QA_API_URL`和`QA_PORT`指定空闲端口。验收覆盖文稿/幻灯片/四类元素的真实保存与增删改查、标题/缩略图、主题、拖动移动缩放、排序取消、历史恢复、预览、退出后令牌失效、断网重试、长文本、320/390/768/1024/1440/1920宽度及200%放大。YouTube外部播放仍取决于服务商与网络；本地验收检查视频URL保存、修改和播放器框架。

`qa:browser`中的放大检查分别使用CSS页面放大、UI字体放大和画布缩放。另运行`npm run qa:native-zoom`，可在自动清理的临时Chrome配置中验收原生浏览器200%缩放，关闭视口模拟，不修改个人Chrome设置。该检查使用真实独立后端，覆盖注册、登录、文稿库、编辑器和预览，以及关键增删改查、元素拖动缩放、翻页和弹窗；需要已安装Google Chrome，前端默认使用4174端口。

## 限制

界面检查覆盖普通 UI 文字至少 16px、颜色对比度和六种宽度重排；幻灯片保留用户自选字号与颜色，图片上的文字另需截图检查。原生缩放可用 `BROWSER_CHANNEL=msedge` 选择 Edge。GitHub 流水线执行 lint、单元测试、构建和浏览器验收，并保存截图；不自动部署。本地通过与远程 CI 结果分别确认。

后端使用单进程 JSON 存储，不提供多实例数据库、托管账户恢复或生产限流。公开部署前需要完善安全和运行配置。

[English](README.md) · [代码导览](CODE_GUIDE.md) · [前端说明](frontend/README.md)
