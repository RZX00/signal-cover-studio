# 改造路线图

目标：把当前 `cover-edit` 升级为一个可交互、可编排、可批量生成、可被 OpenClaw 稳定调用的多平台内容包装系统。

---

# 阶段总览

## Phase 0 — 设计冻结

交付物：

- `docs/design/ARCHITECTURE.md`
- `docs/design/SCHEMA.md`
- `docs/design/ROADMAP.md`
- `docs/design/SKILL-DESIGN.md`

验收标准：

- 明确平台范围
- 明确模板范围
- 明确 CLI 边界
- 明确 skill 边界
- 明确 V1/V2/V3 切分

当前状态：**进行中 / 本轮完成**

---

## Phase 1 — 代码收口与基础设施

目标：把当前项目从“多入口 demo”整理成“可扩展内核”。

### 任务

1. 清理旧入口
   - 明确保留 `js/*.js` 模块化路径
   - 处理 `app.js` 与模块化逻辑重复问题
2. 统一代码结构
3. 引入基础 lint / format / type check
4. 引入本地字体目录
5. 去掉 Google Fonts 强依赖
6. 建立 `platforms/`、`templates/`、`schema/` 基础目录

### 输出

- 干净可维护的项目骨架
- 统一的模块边界
- 本地字体加载能力

### 验收

- 项目可本地运行
- 没有双入口核心逻辑冲突
- 至少 1 套本地字体成功加载

---

## Phase 2 — Spec 驱动渲染

目标：把渲染改成 spec 驱动。

### 任务

1. 定义 `ProjectSpec` / `TargetSpec` / `TemplateSpec`
2. 新增 spec loader
3. 新增 render tree 生成器
4. 让 editor 预览改为消费 render tree
5. 新增 `render.html`
6. 保持图片导出与预览共享渲染逻辑

### 输出

- 一份 spec 可生成一张标准封面
- 编辑器可导入/导出 spec

### 验收

- 给定 spec 可重复生成相同结果
- 编辑器预览与导出基本一致
- 不依赖 localStorage 才能渲染

---

## Phase 3 — 平台包与模板系统

目标：把“尺寸 preset”升级为“平台规则 + 模板规则”。

### 任务

1. 实现 platform packs
   - `wechat-cover`
   - `wechat-article`
   - `xhs-cover`
   - `x-post`
2. 实现模板系统
   - `editorial-minimal`
   - `editorial-cover`
   - `comic-explainer`
   - `wechat-article-clean`
3. 实现 typography profiles
4. 加入安全区 overlay

### 输出

- 可按平台自动匹配尺寸、安全区与默认模板
- 同一 source 可渲染多平台变体

### 验收

- 4 个平台输出尺寸正确
- 标题与关键元素不越安全区
- 模板切换能稳定工作

---

## Phase 4 — 文本 fitting 与排版质量引擎

目标：让结果“稳定好看”，不是碰运气。

### 任务

1. 标题最大行数约束
2. 副标题最大行数约束
3. 自动 shrink 字号
4. 最小字号保护
5. 文本溢出检测
6. 字体 fallback 检测
7. 中英文混排策略

### 输出

- layout validate
- 文字不再轻易炸版

### 验收

- 超长标题有可预期行为
- validate 能阻止明显坏结果进入导出
- 关键样例不出现裁切/重叠

---

## Phase 5 — 正文排版引擎

目标：不只做封面，也做正文输出。

### 任务

1. Markdown -> block schema
2. block -> 微信 HTML renderer
3. block -> 小红书文案 renderer
4. block -> X/英文文案 renderer
5. 摘要和标题提取策略

### 输出

- 公众号正文 HTML
- 小红书正文草稿
- X 英文文案草稿

### 验收

- 公众号 HTML 可读且样式统一
- 小红书文案符合口语化节奏
- X 文案长度与风格可控

---

## Phase 6 — CLI

目标：让 agent 与 CI 真正能用。

### 任务

实现以下命令：

```bash
cover-edit render
cover-edit render-spec
cover-edit bundle
cover-edit validate
cover-edit studio
cover-edit export-spec
```

### 输出

- 命令行入口
- 输出文件 manifest

### 验收

- CLI 可无交互运行
- bundle 一次输出多平台物料
- validate 可在 CI 中阻塞失败结果

---

## Phase 7 — OpenClaw Skill

目标：让主助手可以直接调用整个系统。

### 任务

1. 新建 `platform-cover-studio` skill
2. 封装 spec 生成脚本
3. 封装 bundle 渲染脚本
4. 封装 validate 逻辑
5. 封装输出目录规范
6. 写清触发场景与失败回退策略

### 输出

- 一个能被主助手直接用的完整 skill

### 验收

- 用户说“给这篇日记做公众号 + 小红书 + X 封面与文案”时可直接执行
- skill 可输出成套文件

---

## Phase 8 — CI / 流水线

目标：支持自动批量生产。

### 任务

1. GitHub Actions workflow
2. 字体安装步骤
3. Playwright 运行步骤
4. 产出 artifact
5. 生成 manifest
6. 可选：内容目录触发

### 输出

- push / dispatch 即可生成素材包

### 验收

- CI 运行稳定
- artifact 可下载
- 与本地输出一致性可接受

---

## Phase 9 — 质量系统 / 最终版打磨

目标：从“能跑”变成“长期可用”。

### 任务

1. 样例库 fixtures
2. 视觉回归截图
3. 模板基线图
4. 平台 pack 回归测试
5. 性能与失败重试策略
6. 编辑器 UX 完整化

### 输出

- 可长期维护的内容包装系统

### 验收

- 小改动不会大面积打碎既有样式
- 关键模板有稳定基线
- 生成结果具备可预测性

---

# V1 / V2 / V3 切分

## V1（必须先打通）

- 本地字体
- Spec 驱动
- 4 平台 pack
- 4 模板
- Playwright 渲染
- CLI `render/bundle/validate`
- 公众号 HTML 输出首版
- OpenClaw skill 首版

## V2（把体验做顺）

- 自动文本 fitting 增强
- 编辑器 spec round-trip
- 小红书多图卡片
- AB variant 输出
- 文案映射增强

## V3（最终版）

- 品牌主题包
- 视觉评分与 QA agent
- 更复杂图层系统
- 一篇内容全链路生产与发布联动

---

# 风险与应对

## 风险 1：编辑器预览与导出分叉

应对：
- render tree 作为唯一中间层
- preview/export 均消费 render tree

## 风险 2：字体导致结果不一致

应对：
- 本地打包字体
- CI 显式安装
- fallback 清单固定

## 风险 3：模板越来越多导致失控

应对：
- 模板元数据化
- 每个模板必须带兼容平台与 slot 规则
- 引入视觉回归

## 风险 4：正文支持太快过度膨胀

应对：
- 先支持 block 子集
- 先打通公众号 HTML，再扩其他平台

## 风险 5：skill 变成大杂烩

应对：
- skill 只做编排与调用，不重复实现引擎逻辑
- 复杂逻辑收敛在 repo 脚本和 CLI 里

---

# 建议的第一个编码里程碑

如果下一步直接开改，建议只瞄准这个里程碑：

## Milestone A

实现：

- `ProjectSpec` 首版
- `wechat-cover / xhs-cover / x-post / wechat-article` 四平台 pack
- `editorial-minimal / editorial-cover / comic-explainer / wechat-article-clean` 四模板
- `render.html` + Playwright 导出
- `cover-edit bundle` 首版

这是第一个真正“能直接用”的版本。
