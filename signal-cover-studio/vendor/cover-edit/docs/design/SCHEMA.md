# Schema 设计

本文件定义最终版 `cover-edit` 的统一输入/输出模型。

目标：

1. 所有平台输出都来源于统一 schema
2. 编辑器、CLI、CI、skill 使用同一份 spec
3. 封面图、正文、平台文案都可复现

---

# 1. 顶层对象：Project Spec

```json
{
  "version": "1.0",
  "projectId": "fundraising-2026-03-19",
  "locale": "zh-CN",
  "source": { ... },
  "assets": { ... },
  "style": { ... },
  "targets": [ ... ]
}
```

## 字段说明

- `version`：schema 版本
- `projectId`：项目唯一标识
- `locale`：主语言
- `source`：内容源
- `assets`：图像/品牌/引用素材
- `style`：全局视觉偏好
- `targets`：要输出的平台目标列表

---

# 2. Source Spec

用于表达“原始内容”。

```json
{
  "title": "找投资人，本质上是在招聘",
  "subtitle": "先定义你要找谁，再去找那个人",
  "summary": "融资不是碰运气，而是精准匹配。",
  "body": [ ... ],
  "keywords": ["融资", "投资人", "创业"],
  "language": "zh-CN"
}
```

## 2.1 Body Blocks

正文必须先转成 block schema。

### 支持的 block 类型

```json
{ "type": "title", "text": "..." }
{ "type": "subtitle", "text": "..." }
{ "type": "lead", "text": "..." }
{ "type": "paragraph", "text": "..." }
{ "type": "quote", "text": "..." }
{ "type": "list", "items": ["...", "..."] }
{ "type": "divider" }
{ "type": "image", "assetId": "hero-1", "caption": "..." }
{ "type": "callout", "tone": "info", "text": "..." }
{ "type": "code", "language": "python", "text": "print('hi')" }
```

## 为什么这样设计

- 公众号 HTML 可控
- 小红书文案可短句化
- X 文案可抽摘要
- 后续可给不同 block 设计不同排版规则

---

# 3. Assets Spec

```json
{
  "images": [
    {
      "id": "hero-1",
      "path": "assets/fundraising-rick.png",
      "role": "hero",
      "alt": "Rick and Morty style fundraising explainer"
    }
  ],
  "logos": [
    {
      "id": "brand-main",
      "path": "assets/logo.png"
    }
  ],
  "fonts": [
    {
      "id": "source-han-serif",
      "family": "Source Han Serif SC",
      "path": "assets/fonts/SourceHanSerifSC-Regular.otf"
    }
  ]
}
```

资源统一注册，便于：

- CLI 传入
- 编辑器读取
- CI 校验缺失

---

# 4. Style Spec

表达全局审美偏好，不直接等于模板。

```json
{
  "theme": "dark-green-editorial",
  "mood": "elegant",
  "density": "medium",
  "contrast": "high",
  "fontProfile": "editorial-cn-en",
  "allowIllustration": true,
  "allowSpeechBubble": false
}
```

## 作用

- 给模板选择器提供 bias
- 给文案映射器提供风格线索
- 允许后续用 agent 自动选择最合适模板

---

# 5. Target Spec

一个项目可同时定义多个 target。

```json
{
  "platform": "xhs-cover",
  "template": "comic-explainer",
  "variant": "v1",
  "overrides": {
    "title": "找投资人\n本质上是在招聘",
    "subtitle": "先定义你要找谁，再去找他"
  },
  "output": {
    "format": "png",
    "path": "dist/xhs-cover.png"
  }
}
```

## 关键字段

- `platform`：目标平台 pack
- `template`：视觉模板
- `variant`：A/B 版
- `overrides`：覆盖源内容的局部字段
- `output`：目标输出格式与路径

---

# 6. Platform Pack Schema

每个平台 pack 应该是单独文件，类似：

```json
{
  "id": "wechat-cover",
  "label": "微信公众号封面",
  "canvas": {
    "width": 900,
    "height": 383,
    "safeArea": { "top": 24, "right": 36, "bottom": 24, "left": 36 }
  },
  "exports": ["png", "jpg", "svg"],
  "contentPolicy": {
    "titleMaxLines": 2,
    "subtitleMaxLines": 1,
    "summaryMaxChars": 120
  },
  "defaultTemplates": ["editorial-minimal", "wechat-article-clean"]
}
```

## 建议首批 pack

- `wechat-cover`
- `wechat-article`
- `wechat-video-horizontal`
- `wechat-video-vertical`
- `xhs-cover`
- `xhs-carousel-card`
- `x-post`
- `x-card`

---

# 7. Template Schema

模板必须是结构化对象，不是散落在代码里的 preset。

```json
{
  "id": "editorial-cover",
  "label": "高级杂志封面",
  "compatiblePlatforms": ["wechat-cover", "x-post", "x-card"],
  "slots": [
    {
      "id": "title",
      "kind": "text",
      "area": { "x": 72, "y": 80, "w": 520, "h": 180 },
      "rules": {
        "maxLines": 3,
        "minFontSize": 40,
        "maxFontSize": 96,
        "align": "left"
      }
    },
    {
      "id": "hero",
      "kind": "image",
      "area": { "x": 620, "y": 30, "w": 220, "h": 300 },
      "rules": {
        "fit": "cover",
        "focalPoint": "center"
      }
    }
  ],
  "style": {
    "palette": "dark-green-editorial",
    "fontProfile": "editorial-cn-en"
  }
}
```

### 模板的职责

- 定义 slot
- 定义约束
- 定义默认风格
- 不负责平台尺寸本体

---

# 8. Typography Profile Schema

```json
{
  "id": "editorial-cn-en",
  "title": {
    "fontFamily": ["Source Han Serif SC", "PingFang SC", "sans-serif"],
    "fontWeight": 700,
    "lineHeight": 1.08,
    "letterSpacing": 0
  },
  "subtitle": {
    "fontFamily": ["Inter", "system-ui", "sans-serif"],
    "fontWeight": 500,
    "lineHeight": 1.2,
    "letterSpacing": 0.2
  },
  "body": {
    "fontFamily": ["Source Han Sans SC", "PingFang SC", "sans-serif"],
    "fontWeight": 400,
    "lineHeight": 1.8,
    "letterSpacing": 0
  }
}
```

字体 profile 是高质量输出的核心之一，必须独立建模。

---

# 9. Render Tree Schema

layout engine 产出 render tree，renderer 再消费。

```json
{
  "canvas": { "width": 900, "height": 1200 },
  "layers": [
    {
      "type": "background",
      "fill": { "kind": "gradient", "c1": "#0f172a", "c2": "#14532d", "c3": "#020617" }
    },
    {
      "type": "text",
      "id": "title",
      "frame": { "x": 72, "y": 100, "w": 560, "h": 240 },
      "text": "找投资人\n本质上是在招聘",
      "font": { "family": "Source Han Serif SC", "size": 88, "weight": 700 },
      "color": "#ffffff"
    }
  ]
}
```

这样可以做到：

- 编辑器预览消费 render tree
- Playwright 渲染消费 render tree
- SVG 导出消费 render tree

---

# 10. Output Manifest Schema

每次批量生成都应该输出 manifest，便于 skill / CI / agent 消费。

```json
{
  "projectId": "fundraising-2026-03-19",
  "generatedAt": "2026-03-19T12:00:00Z",
  "outputs": [
    {
      "target": "wechat-cover",
      "path": "dist/wechat-cover.png",
      "width": 900,
      "height": 383,
      "status": "ok"
    },
    {
      "target": "wechat-article",
      "path": "dist/wechat-article.html",
      "status": "ok"
    }
  ],
  "warnings": [
    "x-post subtitle was truncated to fit max line count"
  ]
}
```

---

# 11. 校验模型

`validate` 命令需要输出结构化结果。

```json
{
  "ok": false,
  "errors": [
    {
      "code": "TEXT_OVERFLOW",
      "target": "xhs-cover",
      "slot": "title",
      "message": "Title exceeds max 3 lines"
    }
  ],
  "warnings": [
    {
      "code": "FONT_FALLBACK",
      "message": "Playfair Display unavailable; fell back to Source Han Serif SC"
    }
  ]
}
```

必须做到：

- 可阻塞 CI
- 可提示编辑器
- 可被 skill 判断是否需要重试/换模板

---

# 12. 最小可用 schema 子集（V1）

第一版不用一步全上，先支持：

- `source.title`
- `source.subtitle`
- `source.summary`
- `assets.images`
- `style.theme`
- `targets[]`
- 纯文本 block: `paragraph` / `quote` / `list`
- 平台：`wechat-cover` / `xhs-cover` / `x-post` / `wechat-article`
- 模板：`editorial-minimal` / `editorial-cover` / `comic-explainer` / `wechat-article-clean`

这就足够先打通链路。

---

# 13. 关键原则总结

- **spec 是唯一事实来源**
- **平台 pack 决定尺寸与安全区**
- **模板决定布局结构**
- **typography profile 决定字体与层级**
- **render tree 决定最终渲染**
- **manifest 决定流水线可追踪性**
