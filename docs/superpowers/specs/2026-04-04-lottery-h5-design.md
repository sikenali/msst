# 妙投神透 H5 设计文档

## 概览

构建一个彩票号码生成 H5 应用，包含双色球和大乐透两种玩法。采用 Vue 3 + Vite + Tailwind CSS 技术栈，构建为纯静态文件，可部署到任意静态托管平台。

## 页面结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 主页面 | 配置注数、模式、彩种，点击生成号码 |
| `/result` | 结果页 | 展示生成的号码、祝福语、保存/返回操作 |

路由参数：`?type=ssq`（双色球）或 `?type=dlt`（大乐透）

## 视觉主题

| 彩种 | 主题色 | 标语 |
|------|--------|------|
| 双色球 | 红橙系 `#EF4444` / `#F97316` | 八卦生财 · 好运自来 |
| 大乐透 | 蓝紫系 `#3B82F6` / `#6366F1` | 天机有道 · 命中注定 |

## 组件架构

### 共享组件

| 组件 | 职责 | Props |
|------|------|-------|
| `TabSwitcher` | 彩种切换 Tab | `v-model: type` |
| `BaguaDiagram` | 八卦 SVG 视觉组件 | `theme: 'ssq' \| 'dlt'` |
| `NoteCounter` | 注数加减（1-99） | `v-model: value` |
| `ModeSelector` | 单式/复式/胆拖切换 | `v-model: mode` |
| `NumberBall` | 号码球 | `number`, `color: 'red' \| 'blue'` |

### 视图组件

| 视图 | 职责 |
|------|------|
| `HomePage` | 组合共享组件，处理生成逻辑和路由跳转 |
| `ResultPage` | 展示结果卡片、祝福语、操作按钮 |

## 号码生成算法

### 基础规则

- **双色球**：红球 6 个（1-33 不重复）+ 蓝球 1 个（1-16）
- **大乐透**：前区 5 个（1-35 不重复）+ 后区 2 个（1-12 不重复）
- 号码按升序排列

### 八卦时辰随机方案

```typescript
function randomWithBagua(min: number, max: number, count: number): number[] {
  const range = max - min + 1;
  const hour = new Date().getHours();
  const baguaOffset = Math.floor(hour / 3) % 8;

  const result = new Set<number>();
  while (result.size < count) {
    const rand = Math.floor(Math.random() * range) + min;
    const shifted = ((rand + baguaOffset - 1) % range) + min;
    result.add(shifted);
  }
  return Array.from(result).sort((a, b) => a - b);
}
```

核心逻辑：`Math.random()` 提供基础随机性 + 八卦时辰偏移增加"玄学感"。

## 错误处理

| 场景 | 处理 |
|------|------|
| 直接访问结果页无数据 | 自动跳转回主页 |
| 注数超出范围 | 限制 1-99，边界禁用按钮 |
| 浏览器不支持 html2canvas | 降级提示"长按截图" |
| 路由参数非法 | fallback 到双色球 |

## 数据存储

- 生成结果通过 `sessionStorage` 传递到结果页
- 不依赖后端，纯静态部署

## 项目结构

```
src/
├── components/
│   ├── BaguaDiagram.vue
│   ├── NumberBall.vue
│   ├── ModeSelector.vue
│   ├── NoteCounter.vue
│   ├── TabSwitcher.vue
│   └── ResultCard.vue
├── composables/
│   └── useLottery.ts
├── views/
│   ├── HomePage.vue
│   └── ResultPage.vue
├── router/
│   └── index.ts
├── App.vue
└── main.ts
```

## 技术栈

- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- Vue Router
- html2canvas（图片保存）
