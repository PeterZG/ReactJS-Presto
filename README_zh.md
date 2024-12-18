
# 幻灯片制作工具 - ReactJS: Presto


## 0. 更新日志

- 01/04 修复了可移动元素的规格、视频元素的 URL 选项，并修正了后端 Swagger 文档
- 06/04 根据第8周讲座内容，重新调整了特性集2/3/4的权重，使其更加均衡


## 1. 开始之前

### 1.1. 背景

# 模拟场景

2024年3月，我和我的朋友们提出了一个初创项目的创意，目标是打造 *一个轻量、简洁且有趣的替代品，挑战 [slides.com](https://slides.com)，我们希望它能彻底革新演示文稿行业*。我们把这个项目命名为 **Presto** 🪄🪄🪄。

一周后，我们成功吸引了一位 [天使投资人](https://en.wikipedia.org/wiki/Angel_investor) 的关注，获得了50,000美元的投资承诺，前提是我们能够完成该项目的最小可行产品（MVP）。

接着，我们团队讨论了项目的功能和特性，并一起制定了一个RESTful API接口规范，以便大家可以分别承担前后端的开发工作。我决定负责前端开发，后端则由其他队友处理。为了加快进度，后端最初会保持极简，以减少前后端交互的复杂度。

在我（和我的另一个朋友）负责前端开发的同时，我列出了前端需要遵循的功能和要求（详见第2节）。最终，我决定使用 `ReactJS` 来实现前端，它是一个用于构建单页应用的声明式框架。前端会与我团队开发的RESTful API接口进行交互。

由于我们只会展示一次MVP版本，因此团队一致认为前端的测试非常重要。

为了迎合现代用户的期望，我还决定将 UI/UX 和可访问性标准提升到很高的水平。

**本项目就是为该MVP开发前端的过程，符合上述的各项标准**。本项目的设计灵感来自流行的 [slides.com](https://slides.com/)。如果你还不熟悉这个网站，建议你花点时间了解它，这对你理解这个应用的运作方式会有帮助。

### 1.2. 学习资料

在开始之前，我观看了以下几门讲座（这些帮助我快速入门）：
- [Javascript 生态系统](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-ecosystem)
- [Node 包管理器](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-npm)
- [ReactJS 入门](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-intro)
- [ReactJS 全局 CSS 使用](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-css-basic)
- [ReactJS 生命周期](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-lifecycle)
- [ReactJS useState 钩子](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-state)
- [ReactJS useEffect 钩子](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-effect)
- [如何处理多个文件](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/multi-file-import)
- [组件与 Props](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-components-props)
- [Linting](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/javascript-linting)

在完成项目时，我观看了以下几门课程：
- [路由与单页应用（SPA）](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-routing-spas)
- [CSS 框架](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-css-frameworks)
- [useContext 钩子](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/react-hooks-context)
- [测试入门](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-intro)
- [组件测试](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-components)
- [UI 测试](https://cgi.cse.unsw.edu.au/~cs6080/NOW/content/lectures/testing-ui)

**注意：** 你可能需要用 UNSW 学生账号登录，并注册了 Web Development 课程才能访问这些资料。不过，你也可以在 YouTube 或 Bilibili 等平台找到相关的内容来补充学习。


## 2. 前端部分

我正在为现有的后端开发前端。这个前端应该是一个单页应用，并且 **不需要刷新** 即可更新状态。如果应用不能作为完整的单页应用运行，将会有显著的扣分。

要求文档中列出了多个 **页面**，这些页面可以是弹出框、模态框或完整页面。*页面* 指的是 Web 应用的某个特定状态或展示方式。根据需求，我可以灵活地用模态框、独立页面或其他合适的UI组件来实现它们。

任何标记为 🙉🙉🙉 的内容只需要通过配对任务来完成，不需要单独完成。

### 2.1. 特性集 1：登录与演示文稿创建

这个特性集只关注于用户注册、登录和注销功能，登录后的其他功能不在本集讨论范围内——如果登录后页面只是一个空白的界面，只有一个注销按钮，那么这个特性集就算完成了。

#### 2.1.1. 登录页面
 * 必须为这个页面提供一个唯一的路由
 * 用户可以在表单中输入 `邮箱` 和 `密码`
 * 页面必须有一个按钮用于提交表单
 * 如果登录失败，用户应该看到一个合理的错误提示
 * 表单提交也应该支持按回车键

#### 2.1.2. 注册页面
 * 必须为这个页面提供一个唯一的路由
 * 用户可以在表单中输入 `邮箱`、`密码` 和 `用户名`
 * 应该有一个确认密码的字段，用户需要重新输入密码
 * 如果两次密码不一致，应该在提交前弹出错误提示
 * 如果注册失败，用户应该看到合理的错误信息
 * 页面必须有一个提交按钮
 * 表单提交也应该支持按回车键

#### 2.1.3. 注销按钮
 * 在所有需要用户登录的页面上，必须有一个注销按钮
 * 点击注销按钮后，用户应被带回到登录页面

### 2.2. 特性集 2：演示文稿设置

#### 2.2.1. 仪表板上的新建演示文稿

* 登录后，用户会看到一个仪表板，仪表板上有一个名为“新建演示文稿”的按钮，只有在仪表板页面上显示。
* 点击该按钮后，弹出一个 [模态框](https://www.w3schools.com/w3css/w3css_modal.asp)，用户可以在框内输入新演示文稿的名称。
* 模态框中应该有一个“创建”按钮，点击该按钮时，模态框消失，新的演示文稿被创建并显示在仪表板上。默认情况下，新建的演示文稿会有一个空白幻灯片（稍后会详细说明）。

#### 2.2.2. 仪表板上显示演示文稿列表

* 仪表板页面必须有一个唯一的路由
* 在仪表板上，每个演示文稿应该用 [卡片](https://m1.material.io/components/cards.html#) 的形式呈现，卡片的宽高比为 2:1。
* 每个卡片上应显示演示文稿的名称、缩略图（如果为空则显示灰色方块）、描述（如果为空则不显示文字）以及幻灯片数量。
* 卡片应该均匀排列成多行多列，若有必要，每个卡片的宽度应在 `100px` 至 `300px` 之间。

#### 2.2.3. 演示文稿控制基础

* 当点击仪表板上的特定演示文稿时，用户应被带到一个新的唯一路由，该路由由演示文稿ID参数化，并始终加载幻灯片演示文稿的第一张幻灯片。该路由用于编辑特定的演示文稿。
* 在此编辑演示文稿页面中，无论用户处于哪个幻灯片，都应始终可见且可用两个关键控件：
  * "返回"按钮，带用户返回到仪表板。
  * "删除演示文稿"按钮，弹出“确定删除？”的提示框，若点击“是”，则演示文稿将被删除，用户将被带回仪表板；若点击“否”，则提示框消失，页面保持不变。

#### 2.2.4. 标题编辑

* 在查看某个演示文稿时，演示文稿的标题应始终在幻灯片展示区域上方或附近可见，无论用户处于哪个幻灯片。
  * 标题旁应有文本/图标/图形/按钮，用户点击后可弹出一个模态框，允许编辑演示文稿的标题。

#### 2.2.5. 创建幻灯片及切换

* 在访问某一特定幻灯片时，幻灯片区域外应显示一个按钮，允许用户创建新幻灯片。
* 创建新幻灯片会将该幻灯片添加到幻灯片演示文稿的末尾。
* 一旦幻灯片演示文稿至少包含两张幻灯片，右下角应显示控制按钮：
  * 控制按钮应包括左右箭头。
  * 用户点击这些箭头时，应切换到下一张或上一张幻灯片。
  * 用户按下对应的键盘按键（此处为**左键**和**右键**）时，应发生相同的切换操作。
  * 如果用户查看的是第一张幻灯片，则应隐藏“上一张”箭头。
  * 如果用户查看的是最后一张幻灯片，则应隐藏“下一张”箭头。

#### 2.2.6. 删除幻灯片

* 在访问某一特定幻灯片时，幻灯片区域外应显示一个按钮，允许用户删除该幻灯片。
* 如果用户尝试删除幻灯片演示文稿中的唯一一张幻灯片，应弹出错误提示，要求删除整个演示文稿。

#### 2.2.7. 幻灯片编号

* 在查看某一特定幻灯片时，幻灯片编号应显示在幻灯片的左下角。字体大小应为 `1em`，颜色可以自由选择，且该编号应仅在一个 `50px` x `50px` 的区域内可见。当只剩下最后一张幻灯片时，编号为“1”。

### 2.3. 特性集 3：在幻灯片上放置元素

* 每当用户被提示输入元素的“大小”时，大小总是以百分比（%）的形式表示，取值范围为0到100，其中：
  * 对于宽度，100表示占满整个演示文稿的宽度，50表示占一半宽度，依此类推。
  * 对于高度，100表示占满整个演示文稿的高度，50表示占一半高度，依此类推。
* 每当向幻灯片添加元素时，元素总是默认放置在幻灯片的左上角。
* 双击（0.5秒内）幻灯片中的任何元素，允许编辑该元素的初始属性（将在后续范围中讨论），以及一个额外的属性——*位置*，它描述了元素左上角在幻灯片上的位置。该属性以 `x` 和 `y` 坐标的形式表示，取值范围在 `0` 到 `100` 之间（类似于上面所述）。
* 你可以通过层级属性（layer）对每个元素进行排序，最新创建的元素会被放置在前一个元素之上。这在元素重叠时很有帮助。
* 每个幻灯片中的元素可以通过右键点击其块来删除。

#### 2.3.1. 在幻灯片上放置文本

* 在幻灯片编辑页面的某个地方，针对每张幻灯片，应该有一个明确描述的操作，允许用户向当前幻灯片添加文本框。此操作可以直接显示在工具列表中，或者通过某种折叠面板隐藏。
  * 点击此操作后，应该弹出一个模态框，接受用户输入：
    1) 文本区域的大小
    2) 文本框中的内容
    3) 文本的字体大小（以 `em` 为单位的小数）
    4) 文本的颜色（使用 [HEX 颜色代码](https://www.w3schools.com/css/css_colors_hex.asp)）
  * 文本总是从上到下、左对齐。
  * 如果文本溢出，则会被裁剪。
* 每个文本框应有一个柔和的灰色边框。

#### 2.3.2. 在幻灯片上放置图片

* 在幻灯片编辑页面的某个地方，针对每张幻灯片，应该有一个明确描述的操作，允许用户向当前幻灯片添加图片。此操作可以直接显示在工具列表中，或者通过某种折叠面板隐藏。
  * 点击此操作后，应该弹出一个模态框，接受用户输入：
    1) 图片区域的大小
    2) 图片的 URL 或者 Base64 编码的图像数据
    3) 图片的描述（用于 `alt` 标签）

#### 2.3.3. 在幻灯片上放置视频

* 在幻灯片编辑页面的某个地方，针对每张幻灯片，应该有一个明确描述的操作，允许用户向当前幻灯片添加视频。此操作可以直接显示在工具列表中，或者通过某种折叠面板隐藏。
  * 点击此操作后，应该弹出一个模态框，接受用户输入：
    1) 视频区域的大小
    2) 要显示的 YouTube 视频 URL
    3) 是否自动播放该视频

#### 2.3.4. 在幻灯片上放置代码

* 在幻灯片编辑页面的某个地方，针对每张幻灯片，应该有一个明确描述的操作，允许用户向当前幻灯片添加代码块。代码块以 `textarea` 的形式呈现。此操作可以直接显示在工具列表中，或者通过某种折叠面板隐藏。
  * 点击此操作后，应该弹出一个模态框，接受用户输入：
    1) `textarea` 的大小
    2) 代码内容
    3) 代码的字体大小（以 `em` 为单位的小数）
* 输入的代码应在显示时保留空格格式
* 输入的代码应根据所选择的编程语言进行语法高亮：
  * 支持的语言包括 C、Python 和 Javascript
  * 系统应能根据输入自动识别编程语言

#### 2.3.4. 在幻灯片上放置代码

* 在幻灯片编辑页面的某个地方，针对每张幻灯片，应该有一个明确描述的操作，允许用户向当前幻灯片添加代码块。代码块以 `textarea` 的形式呈现。此操作可以直接显示在工具列表中，或者通过某种折叠面板隐藏。
  * 点击此操作后，应该弹出一个模态框，接受用户输入：
    1) `textarea` 的大小
    2) 代码内容
    3) 代码的字体大小（以 `em` 为单位的小数）
* 输入的代码应在显示时保留空格格式
* 输入的代码应根据所选择的编程语言进行语法高亮：
  * 支持的语言包括 C、Python 和 Javascript
  * 系统应能根据输入自动识别编程语言

#### 2.3.5. 🙉🙉🙉 使元素可移动

* 对于所有 `2.3.1`、`2.3.2`、`2.3.3`、`2.3.4` 和 `2.3.5` 中的元素，修改为：
  * 双击某个元素时，不再显示位置选项来编辑元素的位置。
  * 单击某个元素时，四个角应显示一个小的 `5px` x `5px` 固体方框，用户可以点击并拖动该方框来改变元素的位置（保持宽高比）。
  * 元素的任何角都不能超出幻灯片的边界。

#### 2.3.6. 🙉🙉🙉 使元素可调整大小

* 对于所有 `2.3.1`、`2.3.2`、`2.3.3`、`2.3.4` 和 `2.3.5` 中的元素，修改为：
  * 双击某个元素时，不再显示大小选项来调整元素的大小。
  * 单击某个元素时，四个角应显示一个小的 `5px` x `5px` 固体方框，用户可以点击并拖动该方框来调整元素的大小（保持宽高比）。
  * 元素的最小尺寸为宽度或高度的 `1%`。
  * 元素的任何角都不能超出幻灯片的边界。

### 2.4. 特性集 4：其他功能

#### 2.4.1. 字体调整

* 对于幻灯片上的每个文本框，用户应能够更改其 `font-family`。

#### 2.4.2. 主题和背景选择器

* 应该有一个按钮，始终显示在所有幻灯片上，用户点击该按钮后，会弹出一个模态框。
* 在这个模态框中，用户可以指定：
  * 当前幻灯片的背景颜色，可以是纯色或渐变色；
  * 所有幻灯片的默认背景颜色或默认渐变色；
    * 这是幻灯片的默认背景色，而非白色。

  注意：用户可以自由选择不同的渐变方向（例如：从上到下/从左到右）。你可以自由设计一个 UI，允许用户选择不同的背景选项和颜色。

#### 2.4.3. 预览查看

* 每个幻灯片演示文稿应该在某个地方有一个按钮（可以是直接可见或隐藏在面板中），用户点击此按钮可以预览演示文稿。
* 预览演示文稿时，应该打开一个新的标签页/窗口，在该窗口中：
  * 幻灯片演示文稿将以浏览器全屏展示。
  * 箭头控制和幻灯片编号仍然可见且可操作，点击箭头应能显示上一张或下一张幻灯片。
  * 每个元素周围不应有边框。

#### 2.4.4. URL 更新

* 无论是在编辑幻灯片演示文稿还是预览演示文稿时，当用户查看某一张幻灯片时，URL 应该反映该幻灯片的编号，这样如果页面被刷新或URL被共享，其他用户将直接跳转到同一张幻灯片。

#### 2.4.5. 🙉🙉🙉幻灯片过渡动画

* 在幻灯片过渡时，添加至少一种动画效果。以下是一些示例：
  * 左右滑动
  * 渐变显示或交叉淡入淡出

#### 2.4.6. 🙉🙉🙉幻灯片重新排序

* 每个幻灯片演示文稿中都应该有一个按钮（可以是直接显示或隐藏在控制面板中），点击该按钮会打开幻灯片重新排序页面。
* 幻灯片重新排序页面应以矩形的形式显示每张幻灯片，每张幻灯片内显示一个数字，表示该幻灯片在所有幻灯片中的索引。
* 矩形应该被调整为适应视口的大小（假设幻灯片数量少于 10 张）。
* 用户可以点击并拖动某个幻灯片，将其拖放到其他幻灯片之间，以重新排序。
* 页面上应有一个关闭按钮，用于退出此页面。

#### 2.4.7. 🙉🙉🙉版本历史

* 每个幻灯片演示文稿中都应该有一个按钮（可以是直接显示或隐藏在控制面板中），点击该按钮会打开版本历史页面。
* 该页面应显示历史中的各个时刻，用户可以选择“恢复”，将所有幻灯片恢复到某个之前的状态。
* 每个修改幻灯片演示文稿的操作（至少每 1 分钟一次）都应该自动捕获并记录为一个历史版本。

### 2.6. 代码检查（Linting）

* 必须在 `frontend` 文件夹中运行 `npm run lint` 来进行代码检查。

如果你希望在热重载期间禁用代码检查（并只在命令行中进行检查），则可以在 `frontend/package.json` 文件中将 `react-scripts start` 替换为 `ESLINT_NO_DEV_ERRORS='true'; react-scripts start`。注意：此方法在 Windows 系统上无法使用。

### 2.7. 测试

作为此项目的一部分，你需要编写一些针对项目组件的测试（组件测试）以及针对应用程序整体的测试（UI 测试）。

#### **组件测试**：
* 编写不同组件的测试。
* 对每个组件，必须确保它们的相似度不超过 50%（例如，不能对 "Card" 组件和 "BigCard" 组件进行测试，因为它们几乎是相同的）。
* 确保你的测试具有良好的 **覆盖率**（涵盖所有不同的用例和边界情况）。
* 确保你的测试具有良好的 **清晰性**（注释充分，代码不过于复杂）。
* 确保你的测试设计 **合理**（测试的逻辑顺序清晰，避免不必要的测试或无意义的测试）。
* （仅使用浅渲染方法进行组件测试）

可以使用讲座中讨论的方法进行组件测试，或使用 `cypress`。

#### **UI 测试**：
* 编写一个针对管理员“愉快路径”的测试，测试内容包括：
   1. 注册成功。
   2. 成功创建新演示文稿。
   3. 成功更新演示文稿的缩略图和名称。
   4. 成功删除演示文稿。
   5. 成功添加一些幻灯片。
   6. 成功切换幻灯片。
   7. 成功退出应用程序。
   8. 成功重新登录应用程序。

#### 组件测试建议
 * 找到你编写的一个简单组件，如果没有的话，就自己编写一个。可以是你使用的常见按钮、弹出框、框架或输入框等。通常这些都是你可能稍微包装过的 MUI 或其他库的组件，其中包含你传入的某些 props。
 * 编写单元测试，检查给定的 prop 输入时，组件的行为（如动作或视觉显示）是否符合预期等。
 * 例如，创建一个 `MyButton` 组件，封装 MUI 的 `Button` 组件。
 * 例如，简单的例子是回答列表。它接受一个定义好的答案列表并渲染多个 MUI `ListItem`、`Checkbox`、`TextField` 和 `IconButton`。
 * 你的应用将由一系列页面组成，每个页面由多个基础组件构成。但如果你没有多层次的组件，这意味着你的代码没有很好地模块化。另一个例子是，如果你要求每个组件不超过 50 行代码，可能会让你重构代码，将常见的基础组件集合成新的组件。

#### UI 测试建议
 * 对于 Cypress，如果发现页面渲染速度慢于 Cypress 尝试测试的速度，可以考虑添加 `cy.wait(1000)` 来在测试中加入轻微的暂停。
 * 如果在 WSL2 上使用 Cypress 时遇到问题，可以尝试按照 [此指南](https://shouv.medi) 进行操作。

#### 其他建议 / 帮助
* 如果你更喜欢使用 `enzyme` 进行测试，完全可以使用——只要通过运行 `npm run test` 可以正常工作。
* 有一个有用的话题是 [用 jest 模拟 fetch 调用](https://medium.com/fernandodof/how-to-mock-fetch-calls-with-jest-a666ae1e7752)。
* 系统在运行 `npm run test` 时会使用重置后的后端。
* 如果遇到 `enzyme adapter` 兼容性问题，你可以选择：
  * 使用这个非官方的 React 17 适配器：[https://www.npmjs.com/package/@wojtekmaj/enzyme-adapter-react-17](https://www.npmjs.com/package/@wojtekmaj/enzyme-adapter-react-17)；或
  * 降级 `react` 和 `react-dom` 到版本 16，但这可能会破坏其他依赖项。

#### 运行测试

测试必须在 `frontend` 文件夹中通过运行 `npm run test` 来执行。然后，可能需要按下 `a` 键来运行所有测试。

你可以通过更新 `frontend/package.json` 中的 `test` 脚本来修改 `npm run test` 命令。例如，如果你希望在标准的 React 测试和 Cypress UI 测试之间一起运行，可以使用 `react-scripts test --watchAll=false && npm run cypress open`，如果你已使用 Cypress 进行组件和 UI 测试，则可以将该行替换为 `cypress open`。

### 2.8. 其他说明
* 用于从后端 `fetch` 数据的端口在 `frontend/src/config.json` 中定义。
* [这篇文章可能对一些学生有帮助](https://stackoverflow.com/questions/66284286/react-jest-mock-usenavigate)。
* 对于使用 TypeScript 的同学，[可以参考此指南](https://gitlab.cse.unsw.edu.au/COMP6080/NOW/react-typescript)。
* 对于某些请求，你可能需要对后端进行“轮询”，即让前端每秒重复进行一次 API 调用来检查更新。

**注意：** 你可能需要使用 UNSW 学生账户登录，并确保已注册 Web 开发课程，才能访问这些材料。不过，你也可以在 YouTube 或 Bilibili 等平台找到相关的学习资源来补充学习。


### 3.1. 前端

请导航至 `frontend` 文件夹并运行 `npm install`，以安装运行 ReactJS 应用所需的所有依赖项。然后运行 `npm start` 启动 ReactJS 应用。

<!-- 一些后端接受的属性被定义为空对象。这些对象可以由你来定义，因为后端仅仅在某些路由上存储你的对象，并在其他路由返回这些对象（即，后端不需要理解你传给它的一些对象的 schema）。其中一个关键属性是 `questions` 组件，它会以空对象的形式出现在后端 API 中，但你需要定义它。 -->

### 3.2. 后端

后端服务器位于你的个人仓库中。克隆此仓库后，必须在 `backend` 目录中运行 `npm install` 来安装依赖项。

要运行后端服务器，只需在 `backend` 目录中运行 `npm start`。这将启动后端。

要查看后端 API 接口，请访问后端的基础 URL（例如 `http://localhost:5005`）。这将列出你可以与之交互的所有 HTTP 路由。

后端在数据存储方面是持久化的，这意味着即使 Express 服务器停止运行，数据也会保留。如果你想将数据重置为原始状态，可以在后端目录中运行 `npm run reset`。如果你想备份后端数据，只需复制 `database.json` 文件。如果你想从一个空的数据库开始，可以在后端目录中运行 `npm run clear`。

后端启动后，你可以在浏览器中访问 `http://localhost:[端口号]` 查看 API 文档。

后端运行的端口（前端可以使用的端口）在 `frontend/src/config.js` 中指定。你可以在此文件中更改端口。这个文件的存在是为了让前端知道在与后端通信时使用哪个端口。


## 4. 约束与假设

### 4.1. 编程语言

 * 本项目必须使用 ReactJS 实现，不能使用 Angular 或 Vue 等其他声明式框架。
 * 应尽可能使用 ReactJS 解决方案，除非绝对必要，否则应避免直接操作 DOM。
 * 可以使用任何 CSS 和 UI 库，如 react-bootstrap 或 material-ui。
 * 可以使用通过 `npm install` 安装的任何库，且对 `package.json` 文件的更改必须提交。

### 4.2. 浏览器兼容性

 * 程序必须在以下两种浏览器之一上进行测试：
   * 本地使用 Google Chrome（跨各种操作系统）——确保使用最新版本。

### 4.3. 其他要求

 * 项目规范有意设置得较为宽泛，允许开发者根据自己的需要构建前端组件的视觉效果。组件的大小、位置、颜色和布局几乎完全由开发者决定。我们要求一些基本的标准，主要涉及元素和行为。
 * 可以使用除上述描述外的其他 npm 库。
 * 不要使用通用的 CSS；必须使用 CSS 库（例如 material-ui）或 [styled components](https://styled-components.com/docs/basics)。


### 5. 鸣谢

我衷心感谢在我本科阶段参加的 Web 开发课程。该课程中提供的材料和知识对我开发本项目起到了至关重要的作用。我通过这门课程获得的基础技能和最佳实践在整个开发过程中都给我提供了指导，我对课程内容、讲座和资源的支持表示深深的感谢。