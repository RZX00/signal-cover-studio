# 架构设计

## 1. 产品定位

`cover-edit` 最终不再只是浏览器里的封面编辑器，而是一个 **多平台内容包装系统**：

- 输入一篇内容（观点、日记、文章、脚本、标题草稿）
- 输出多平台资产：
  - 公众号封面图
  - 小红书首图/组图
  - X 配图
  - 公众号正文 HTML
  - 小红书文案
  - X 英文文案

核心目标：

1. **交互可调**：编辑器继续存在
2. **程序可调**：所有结果可由 spec 驱动
3. **批量稳定**：CLI / CI / agent 都可复用
4. **质量可控**：尺寸、排版、字体、导出一致可测试

---

## 2. 总体架构

建议重构为以下层次：

```text
apps/
  editor-web/        # 人工交互编辑器
  render-worker/     # 无头渲染入口（Playwright）
packages/
  schema/            # JSON schema / TS types
  engine/            # 布局引擎（计算位置、字号、安全区）
  renderer/          # render tree -> HTML/SVG/PNG
  templates/         # 模板系统
  platforms/         # 平台尺寸、安全区、输出规则
  typography/        # 字体、字号、行高、中英文混排规则
  content/           # 正文 block 模型、摘要、平台文案映射
  cli/               # cover-edit 命令行
  qa/                # 溢出检测、视觉回归、字体检查
skills/
  platform-cover-studio/
```

---

## 3. 四个核心对象

### 3.1 Content Spec
内容的标准输入。

内容不直接等于页面状态，而是统一表达为：

- 标题 / 副标题 / 摘要
- 正文 blocks
- 图像资产
- 语种
- 品牌/风格偏好
- 渠道目标

### 3.2 Layout Recipe
布局方案，描述：

- 标题区在哪
- 副标题区在哪
- 主视觉区在哪
- badge / note / meta 区在哪
- 最大行数 / 最小字号 / 对齐方式

### 3.3 Platform Pack
平台规则，描述：

- 输出尺寸
- 安全区
- 推荐导出格式
- 文案长度建议
- 平台视觉偏好（如 X 更简洁，XHS 更抓眼）

### 3.4 Style Template
视觉风格，描述：

- 颜色系统
- 字体组合
- 场景氛围
- 装饰元素
- 间距、留白与密度策略

---

## 4. 数据流

### 4.1 Agent/CLI 路径

```text
Markdown / JSON / Prompt
  -> content parser
  -> normalized content spec
  -> target expansion (wechat/xhs/x)
  -> template resolution
  -> layout engine
  -> render tree
  -> renderer
  -> PNG/JPG/SVG/HTML/TXT
```

### 4.2 编辑器路径

```text
editor interactions
  -> local draft state
  -> normalized spec
  -> shared render tree
  -> preview
  -> export
```

关键要求：

> 编辑器最终也必须能导出标准 spec，而不是只存 localStorage 状态。

---

## 5. 为什么要“Spec First”

当前项目的问题是 UI 状态过重：

- localStorage 保存编辑状态
- UI 输入框驱动布局
- 导出依赖当前 DOM

这种结构会带来 3 个问题：

1. CLI 很难直接调用
2. CI 没法稳定复现
3. 编辑器与导出容易分叉

最终版必须改成：

> **任何结果都能从一份 spec 完整复现。**

也就是说，一个最终导出的封面都应该对应一份可保存、可回放、可 diff 的 spec 文件。

---

## 6. 推荐渲染路线

## 6.1 第一阶段：浏览器渲染 + Playwright 截图

这是首选路线。

### 原因

- 能最大化复用当前 HTML/CSS/JS 视觉能力
- 文本排版更成熟
- 中英文混排效果更好调
- 正文 HTML 输出更自然
- 改造成本最低

### 实现

- 新增 `render.html`
- 支持通过 query / JSON file / injected spec 加载
- Playwright 打开页面
- 等待 `window.__renderReady = true`
- 输出 PNG/JPG/SVG

### 优势

- 快速进入可用阶段
- 输出效果与浏览器预览一致性高
- 更容易做视觉调试

## 6.2 第二阶段：保留 SVG 纯导出能力

对于矢量场景：

- 纯文本海报
- 报告封面
- 轻图层

可保留 SVG 直出能力，用于：

- 精修
- Figma/Illustrator 二次处理
- 高分辨率资产

---

## 7. 渲染内核职责

布局引擎与渲染层必须分开。

### 布局引擎做什么

- 根据平台 pack 计算画布尺寸和安全区
- 根据模板计算每个 block 的目标区域
- 计算字号、行数、换行、缩放
- 做文本 fitting
- 在超限时抛错误/告警

### Renderer 做什么

- 把 layout result 变成 render tree
- 输出 HTML/SVG
- 输出预览和最终导出视图

### 禁止发生的事

- 在 renderer 里临时决定字号
- 在 UI 里偷偷改 layout 规则
- 页面预览一套，导出重算另一套

---

## 8. 模块边界

## 8.1 packages/platforms
负责：

- 尺寸
- 安全区
- 允许的导出格式
- 平台文案长度基线
- 平台默认模板推荐

示例：

- `wechat-cover`
- `wechat-article`
- `wechat-video-horizontal`
- `wechat-video-vertical`
- `xhs-cover`
- `xhs-carousel`
- `x-post`
- `x-card`

## 8.2 packages/templates
负责：

- 模板元数据
- block slot 定义
- 默认颜色/字体/样式
- 可编辑参数

第一批模板建议：

- `editorial-minimal`
- `editorial-cover`
- `comic-explainer`
- `quote-poster`
- `wechat-article-clean`
- `thread-card`

## 8.3 packages/typography
负责：

- 本地字体清单
- 中文/英文 fallback
- 标题字号区间
- 行高、字重、间距
- 中英文混排策略

必须去掉对 Google Fonts 的强依赖，改为：

- 本地内置字体
- 系统 fallback
- CI 环境统一安装字体

## 8.4 packages/content
负责：

- Markdown -> block schema
- 摘要提取
- 标题候选
- 平台文案映射
- 英文化 / 小红书短句化 / 公众号长文规范化

## 8.5 packages/qa
负责：

- 尺寸检查
- 安全区检查
- 文本溢出检查
- 字体缺失检查
- 视觉回归快照
- 导出存在性检查

---

## 9. 编辑器的最终角色

编辑器不应该消失，但应该降级为：

> **spec 可视化编辑器**

也就是：

- 能加载 spec
- 能编辑布局和样式
- 能导出 spec
- 能输出最终图

而不是再把编辑器当唯一真相来源。

### 编辑器必须新增

1. `Import Spec`
2. `Export Spec`
3. `Template Switch`
4. `Platform Preview`
5. `Overflow Warning`
6. `Safe Area Overlay`
7. `Font Availability Status`

---

## 10. 正文排版架构

正文不能直接从 Markdown 粗暴转 HTML。

应采用：

```text
markdown
  -> normalized blocks
  -> article layout policy
  -> output html
```

公众号正文建议支持 block：

- title
- subtitle
- lead
- paragraph
- quote
- list
- divider
- image
- callout
- code (可选)

这样同一份正文也可映射为：

- 微信 HTML
- 小红书口语文案
- X 短文案 / thread 草稿

---

## 11. 高可用要求

这是最终版本必须强制做到的：

### 11.1 输出尺寸强约束
输出图片尺寸来自 platform pack，不可被模板任意覆盖。

### 11.2 文本 fitting 强约束
支持：

- 最大行数
- 最小字号
- 自动 shrink
- 超限报错

### 11.3 字体可复现
本地、CI、agent 三处使用同一字体策略。

### 11.4 可回归测试
对样例 spec 保持固定快照，避免“今天改一个按钮，明天全部图歪了”。

### 11.5 渲染一致性
编辑器预览与无头导出尽可能共用同一 render tree。

---

## 12. 目录建议（最终版）

```text
cover-edit/
  apps/
    editor-web/
      index.html
      render.html
      src/
  packages/
    schema/
    engine/
    renderer/
    templates/
    platforms/
    typography/
    content/
    qa/
    cli/
  assets/
    fonts/
    textures/
    stickers/
    templates/
  examples/
    specs/
    content/
  docs/
    design/
  .github/workflows/
```

---

## 13. 最终推荐路线总结

### 先做
- Spec
- Platform packs
- Templates
- Playwright 渲染
- CLI
- QA
- Skill

### 后做
- 更复杂的拖拽交互
- 更多小 preset 按钮
- 更 fancy 的编辑器面板

因为最终值钱的不是 UI 热闹，而是：

> **同一份内容，稳定产出多个平台的高级视觉与正文结果。**
