# OpenClaw Skill 设计

目标：设计一个配套的 OpenClaw skill，让主助手能直接调用 `cover-edit` 最终版能力，自动完成多平台封面、正文、平台文案和素材包输出。

建议 skill 名：`signal-cover-studio`

---

# 1. Skill 定位

该 skill 不直接重复实现渲染引擎，而是作为：

> **内容理解 + spec 生成 + CLI 调用 + 输出编排**

的总控层。

也就是说：

- 复杂视觉渲染归 `cover-edit` 本体
- skill 负责把用户意图变成结构化输入
- skill 负责调用 CLI 并把结果整理给用户

---

# 2. 适用场景

以下请求应该触发该 skill：

- 给这篇文章做公众号封面
- 给这篇日记做小红书首图
- 给这条观点做 X 配图
- 同一篇内容输出公众号 / 小红书 / X 多平台物料
- 生成公众号正文 HTML
- 根据内容自动产出标题、副标题、封面和文案
- 做一套高级优雅的多平台视觉资产

不适合该 skill 的情况：

- 纯图片生成、无明确内容结构（交给图像生成流程）
- 只要一个简单截图/裁剪（不值得启用整套系统）
- 纯手工编辑需求、无自动化诉求

---

# 3. Skill 职责边界

## Skill 负责

1. 读取用户内容源
   - Markdown
   - Obsidian 日记
   - 纯文本观点
   - JSON spec
2. 推断目标平台
3. 选择合适模板
4. 生成 `ProjectSpec`
5. 调用 CLI 生成封面/正文/文案
6. 读取输出 manifest
7. 把结果回传给用户

## Skill 不负责

1. 自己实现渲染逻辑
2. 在 prompt 里硬编码复杂排版规则
3. 重复维护模板细节
4. 把整个 repo 逻辑搬进 SKILL.md

---

# 4. 目录建议

```text
skills/signal-cover-studio/
  SKILL.md
  scripts/
    generate_spec.py
    render_bundle.py
    validate_bundle.py
    article_to_blocks.py
    collect_outputs.py
  references/
    platforms.md
    templates.md
    content-mapping.md
    troubleshooting.md
```

## 说明

### SKILL.md
只写：
- 触发条件
- 典型工作流
- 什么时候读哪个 reference
- 什么时候调用哪个脚本

### scripts/
放确定性逻辑：
- 生成 spec
- 调用 CLI
- 校验输出
- 汇总 manifest

### references/
放非必须常驻上下文的信息：
- 平台差异
- 模板清单
- 故障排查

---

# 5. Skill 工作流

## 5.1 单平台封面

用户：
> 给这篇内容做公众号封面

流程：
1. 读取内容
2. 生成 title/subtitle/summary
3. 生成 `ProjectSpec`
4. target=`wechat-cover`
5. 调用 `cover-edit render-spec`
6. 返回图片路径/图片本体

## 5.2 多平台素材包

用户：
> 这篇内容给我做公众号、小红书、X 三个平台的封面和文案

流程：
1. 解析 source
2. 生成 blocks
3. 生成三个 target
4. 调用 `cover-edit bundle`
5. 输出：
   - 公众号封面
   - 小红书封面
   - X 配图
   - 公众号 HTML
   - 小红书文案
   - X 英文文案

## 5.3 人工微调模式

用户：
> 这版方向对，帮我把标题再克制一点

流程：
1. 读取上一轮 spec/manifest
2. 修改 style 或 template override
3. 重新渲染目标 target
4. 返回新版本

---

# 6. 推荐脚本接口

## 6.1 generate_spec.py

输入：
- 源内容路径或纯文本
- 平台列表
- 模板偏好
- 风格偏好

输出：
- `project.spec.json`

示例：

```bash
python3 scripts/generate_spec.py \
  --input article.md \
  --targets wechat-cover,xhs-cover,x-post,wechat-article \
  --theme dark-green-editorial \
  --out project.spec.json
```

## 6.2 render_bundle.py

输入：
- spec 文件

输出：
- 多平台文件 + manifest

```bash
python3 scripts/render_bundle.py \
  --spec project.spec.json \
  --out-dir dist/
```

## 6.3 validate_bundle.py

在正式返回前做验证：

```bash
python3 scripts/validate_bundle.py --spec project.spec.json
```

如果发现：
- 标题溢出
- 缺字/缺字体
- 导出失败
- 安全区冲突

应显式返回失败，而不是把烂结果发给用户。

---

# 7. Skill 的输出策略

## 对用户返回

- 图片本体或路径
- HTML 文件或摘要
- 文案文本
- 必要时给出“用了什么模板/风格”的一句解释

## 对系统保留

- `project.spec.json`
- `manifest.json`
- `validation.json`

这样后续可以：
- 重试
- 微调
- 做 A/B 版
- 做 CI 回归

---

# 8. Skill 需要读取的 references

## `references/platforms.md`
何时读：
- 需要判断平台差异时
- 用户指定多个平台时

内容：
- 平台尺寸
- 安全区
- 内容密度建议
- 默认模板

## `references/templates.md`
何时读：
- 需要选择模板时
- 用户要求某种视觉风格时

内容：
- 模板列表
- 模板适用平台
- 模板视觉气质

## `references/content-mapping.md`
何时读：
- 需要把同一内容映射为公众号/XHS/X 文案时

内容：
- 不同平台的句式和密度差异
- 标题压缩策略
- 中英文化策略

## `references/troubleshooting.md`
何时读：
- 渲染或导出失败时

内容：
- 字体缺失
- Playwright 失败
- 文本溢出
- 资源缺失
- fallback 策略

---

# 9. 技术边界：Skill 与 Repo 的关系

最重要的一条：

> **模板、平台规则、排版规则，应维护在 repo 中；skill 只做 orchestration。**

这样有几个好处：

- 规则唯一来源明确
- CLI / 编辑器 / CI / skill 共用一套逻辑
- 后期维护不会分叉

---

# 10. 最终用户体验

最终希望用户能这样说：

> 这篇日记帮我做公众号、小红书、X 三平台素材包。

主助手就能自动完成：

1. 读内容
2. 出标题和摘要
3. 选模板
4. 渲染三平台封面
5. 生成公众号 HTML
6. 生成小红书文案
7. 生成 X 英文文案
8. 回传结果

这就是 skill 的最终价值。

---

# 11. 推荐的第一版 skill 能力范围

V1 先做这些：

- 输入 Markdown/纯文本
- 输出：
  - wechat-cover
  - xhs-cover
  - x-post
  - wechat-article html
- 调用 CLI 的 `bundle`
- 返回 manifest 与核心结果

V2 再增加：

- 多图卡片
- AB variants
- 模板推荐器
- 风格自动推断

---

# 12. SKILL.md 应写什么

最终的 `SKILL.md` 只需要包含：

1. skill 做什么
2. 何时触发
3. 基本工作流
4. 什么时候读哪个 reference
5. 调用哪些脚本
6. 输出结果如何组织

不要把整个架构、所有模板细节塞进 SKILL.md；那是 repo 和 reference 文件的职责。
