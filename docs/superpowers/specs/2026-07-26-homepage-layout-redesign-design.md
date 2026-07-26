# 主界面布局重写设计

## 概述

重写 HomePage 三栏布局，不改变现有功能。采用方案二（Flexbox + 百分比宽度），主题色通过 class 切换实现双色球/大乐透全局联动。

---

## 1. 布局结构

### 1.1 三栏比例

| 栏位 | 占比 | Flex | 内容 |
|------|------|------|------|
| 左栏 | 40% | `flex: 0.4` | 红佛女、蓝若寺、运数、运式 |
| 中栏 | 35% | `flex: 0.35` | 八卦图卡片（含生财按钮） |
| 右栏 | 25% | `flex: 0.25` | 运势图标行 |

### 1.2 容器层级

```
main-inner (max-width: 960px, margin: 0 auto)
├── layout-col--left (flex: 0.4, flex-direction: column)
│   ├── inline-section (红佛女)
│   ├── inline-section (蓝若寺)
│   ├── inline-section (运数)
│   └── inline-section (运式)
├── layout-col--center (flex: 0.35, flex-direction: column, align-items: center)
│   └── bagua-card (八卦图 + 生财按钮整体卡片)
└── layout-col--right (flex: 0.25, display: flex, align-items: center)
    └── rule-icon-row (运势图标行)
        └── 5 个规则图标按钮
```

---

## 2. 主题色切换机制

### 2.1 控制方式

父容器添加 class：
- `theme-ssq` → 红色/金色系 (`#EF4444`, `#F59E0B`)
- `theme-dlt` → 蓝色/靛色系 (`#3B82F6`, `#1D4ED8`)

class 跟随 `lotteryType` 变量动态切换。

### 2.2 跟随主题的组件

- 运数计数器（注数标签和边框）
- 运式按钮（单复式/胆拖切换）
- 八卦图光环、时辰提示文字、运势标语
- 生成按钮（生财/有道）渐变背景
- 弹窗标题色、确认按钮色
- 导航 Tab 选中态高亮

### 2.3 不受主题影响的组件（固定品牌色）

- **红佛女**：始终使用红色 `#EF4444`
- **蓝若寺**：始终使用蓝色 `#3B82F6`
- 运势图标行中的图标颜色固定不变

---

## 3. 导航栏

### 3.1 布局

```
header-content (display: flex, justify-content: space-between)
├── left (logo-area)
│   ├── Logo 图标
│   └── "妙手神透" 文字
├── center (tab-switcher)
│   └── 彩种切换 Tab 组件
└── right (icon-buttons)
    └── 历史记录图标按钮
```

### 3.2 样式细节

- **无背景** — 直接显示在页面上，透明底色
- **分隔线** — `border-bottom: 1px solid rgba(0,0,0,0.05)`，极浅
- **Tab 样式** — 胶囊式按钮，选中态高亮，切换动画 0.3s ease
- **图标按钮** — 无背景，纯图标，hover 时有轻微缩放效果

---

## 4. Footer

### 4.1 样式

- 页面底部直接显示文字
- **透明背景** — 无卡片、无边框、无毛玻璃效果
- 三行文字：左对齐版权信息 / 居中 "Powered by LightOS" / 右对齐 slogan

### 4.2 布局

```
footer-text (display: flex, justify-content: space-between)
├── footer-left: © 2026 妙手神透
├── footer-center: Powered by LightOS
└── footer-right: 主任的机制不如机智的我
```

---

## 5. 侧滑抽屉面板

### 5.1 触发方式

点击右栏的运势图标（杀号/选号/定胆/过滤/矩阵）触发对应抽屉。

### 5.2 动画

- 从右向左滑入
- 初始位置：`transform: translateX(100%)`
- 打开后：`transform: translateX(0)`
- 过渡：`transition: transform 0.3s ease-out`
- 宽度：占满视口约 60%（或固定最大宽度 400px）

### 5.3 关闭方式

- 点击右上角关闭按钮
- 点击抽屉外部遮罩层也可关闭

---

## 6. 弹窗统一样式

### 6.1 遮罩层

```css
background: rgba(0, 0, 0, 0.35);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
position: fixed;
inset: 0;
z-index: 200;
```

### 6.2 内容卡片

- 白色半透明背景 `rgba(255, 255, 255, 0.9)`
- 圆角 `border-radius: 16px`
- 边框 `border: 1px solid rgba(255, 255, 255, 0.5)`
- 阴影 `box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15)`
- 内边距 `padding: 16-24px`
- 主题色仅影响卡片内的强调元素（标题色、按钮色）

---

## 7. 响应式适配

### 7.1 移动端 (< 768px)

- 三栏合并为单栏垂直堆叠
- 顺序：选号区 → 卦图区 → 规则入口
- 抽屉改为全屏弹出

### 7.2 平板 (768 - 1023px)

- 比例调整为 35% / 35% / 30%

### 7.3 桌面 (> 1024px)

- 保持 40% / 35% / 25%

---

## 8. 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/views/HomePage.vue` | 修改 | 三栏布局模板、CSS、主题 class 绑定 |
| `src/components/PageHeader.vue` | 修改 | 导航栏布局、Tab 胶囊样式、分隔线 |
| `src/components/BaguaDiagram.vue` | 微调 | 生财按钮集成到组件内部或作为子区域 |
| 新增 `src/components/RuleDrawer.vue` | 新建 | 通用侧滑抽屉组件 |
| `src/styles/theme.css` (可选) | 新建或修改 | 主题色 CSS 变量定义 |

---

## 9. 注意事项

1. 红佛女和蓝若寺的颜色硬编码，不参与主题切换
2. 所有跟随主题的组件需通过 class 选择器继承颜色
3. 抽屉面板复用逻辑，不同图标打开不同内容的面板
4. 现有功能逻辑（号码生成、路由跳转）保持不变
5. 背景雨动画、九字真言弹窗等非布局组件不受影响
