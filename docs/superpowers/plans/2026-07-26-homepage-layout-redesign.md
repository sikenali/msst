# 主界面布局重写实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将 HomePage 从当前两栏布局重写为三栏布局（左40%/中35%/右25%），优化导航栏和 Footer，新增侧滑抽屉组件。

**Architecture:** 沿用 Flexbox + class 切换方案。通过父容器 `.theme-ssq` / `.theme-dlt` class 控制主题色继承；红佛女/蓝若寺硬编码品牌色不受主题影响。侧滑抽屉复用现有弹窗组件。

**Tech Stack:** Vue 3 (Composition API), Vite, CSS Flexbox, RemixIcon Vue

---

## Task 1: 新建 RuleDrawer.vue 通用侧滑抽屉组件

**Files:**
- Create: `src/components/RuleDrawer.vue`

该组件用于运势规则面板的侧滑显示，复用所有 5 个弹窗。

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { RiCloseLine } from '@remixicon/vue'

interface Props {
  visible: boolean
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: ''
})

defineEmits<{ (e: 'close'): void }>()

const ariaLabel = computed(() => `规则设置 - ${props.title}`)
</script>

<template>
  <!-- 遮罩层 -->
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="visible" class="rule-drawer-overlay" @click="$emit('close')">
        <Transition name="drawer-slide">
          <div v-if="visible" class="rule-drawer-panel" @click.stop>
            <div class="drawer-header">
              <span class="drawer-title">{{ title }}</span>
              <button class="drawer-close-btn" @click="$emit('close')" :aria-label="ariaLabel">
                <RiCloseLine />
              </button>
            </div>
            <div class="drawer-body">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层：毛玻璃 */
.rule-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 面板：白色半透明圆角卡片 */
.rule-drawer-panel {
  width: min(60vw, 400px);
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.drawer-title {
  font-size: 16px;
  font-weight: 700;
  color: #92400E;
  font-family: 'SourceHanSans-Bold';
}

.drawer-close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #92400E;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.drawer-close-btn:hover {
  opacity: 1;
}

.drawer-body {
  padding: 16px 20px 20px;
}

/* 遮罩淡入淡出 */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

/* 抽屉从右侧滑入（覆盖中栏区域） */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease-out;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(40px);
}
</style>
```

- [ ] **Step 1: 创建 RuleDrawer.vue 组件文件** — 将上述代码写入 `src/components/RuleDrawer.vue`
- [ ] **Step 2: 验证构建** — 运行 `npx vite build` 确认无报错

---

## Task 2: 重写 HomePage.vue 三栏模板结构

**Files:**
- Modify: `src/views/HomePage.vue:407-498`（main-inner 区域）

替换现有的 `<main class="home-main">` 内部结构为三栏布局。

```vue
<!-- 主内容区：三栏布局 -->
<main class="home-main">
  <div class="main-inner" :class="'theme-' + lotteryType">
    <!-- 左栏 40%：选号 + 参数 -->
    <div class="layout-col layout-col--left">
      <!-- 红佛女 -->
      <div class="inline-section">
        <div class="inline-section__title" style="color:#EF4444">红佛女</div>
        <WuxingNumberGrid
          v-model="userRedNumbers"
          :lottery-type="lotteryType"
          :total-numbers="lotteryType === 'ssq' ? 33 : 35"
          :max-count="lotteryType === 'ssq' ? 6 : 5"
          @select="setRedNumbers"
        />
      </div>
      <!-- 蓝若寺 -->
      <div class="inline-section">
        <div class="inline-section__title" style="color:#3B82F6">蓝若寺</div>
        <BackZoneGrid
          v-model="userBlueNumbers"
          :lottery-type="lotteryType"
          :total-numbers="lotteryType === 'ssq' ? 16 : 12"
          :max-count="lotteryType === 'ssq' ? 1 : 2"
          @select="setBlueNumbers"
        />
      </div>
      <!-- 运数 -->
      <div class="inline-section">
        <div class="inline-section__title">运数</div>
        <div class="counter-row">
          <div class="counter-item">
            <span class="counter-item__title" style="color:#EF4444">红佛女</span>
            <NoteCounter v-model="redCount" :theme="lotteryType" compact />
          </div>
          <div class="counter-item">
            <span class="counter-item__title" style="color:#3B82F6">蓝若寺</span>
            <NoteCounter v-model="blueCount" :theme="lotteryType" compact />
          </div>
          <div class="counter-item">
            <span class="counter-item__title">注数</span>
            <NoteCounter v-model="multiplierCount" :theme="lotteryType" compact />
          </div>
        </div>
      </div>
      <!-- 运式 -->
      <div class="inline-section">
        <div class="inline-section__title">运式</div>
        <div class="mode-row">
          <div class="mode-item">
            <span class="mode-item__label">单式</span>
            <button class="mode-selector-btn theme-btn" :class="{ active: mode === 'single' }" @click="mode = 'single'">
              <span class="die die--1">⚀</span>
            </button>
          </div>
          <div class="mode-item">
            <span class="mode-item__label">复式</span>
            <button class="mode-selector-btn theme-btn" :class="{ active: mode === 'multiple' }" @click="mode = 'multiple'">
              <span class="die die--2">⚁</span>
            </button>
          </div>
          <div class="mode-item">
            <span class="mode-item__label">胆拖</span>
            <button class="mode-selector-btn theme-btn" :class="{ active: mode === 'dantuo' }" @click="mode = 'dantuo'">
              <span class="die die--3">⚂</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 中栏 35%：八卦图卡片 -->
    <div class="layout-col layout-col--center">
      <div class="bagua-card-wrapper">
        <BaguaDiagram :theme="lotteryType" :spinning="isSpinning" :notes="notes" />
        <div class="generate-btn-wrapper">
          <button 
            class="generate-btn theme-btn" 
            :style="buttonGradientObj" 
            @click="handleGenerate"
            :aria-label="lotteryType === 'ssq' ? '生成双色球号码' : '生成大乐透号码'"
          >
            <RiMoneyCnyCircleFill v-if="lotteryType === 'ssq'" class="generate-icon" />
            <CopperCoinIcon v-else class="generate-icon" />
            <div class="generate-spacer"></div>
            <span class="generate-text">{{ buttonText }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 右栏 25%：规则入口 -->
    <div class="layout-col layout-col--right">
      <div class="rule-entry-section">
        <div class="inline-section__title">运势</div>
        <div class="rule-icon-row">
          <button v-for="r in rulesIcons" :key="r.type" class="rule-icon" @click="handleOpenModal(r.type)">
            <span class="rule-icon-emoji">
              <component :is="r.icon" class="rule-icon-svg" />
            </span>
            <span class="rule-icon-label">{{ r.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</main>
```

注意：`buttonGradientObj` 需要改为 computed 属性返回渐变字符串，以便在 style 中使用：

在 script setup 中添加：
```typescript
const buttonGradientObj = computed(() => 
  lotteryType.value === 'ssq'
    ? 'linear-gradient(180deg, rgb(220,38,38) 0%, rgb(245,158,11) 100%)'
    : 'linear-gradient(180deg, rgb(59,130,246) 0%, rgb(99,102,241) 100%)'
)
```

- [ ] **Step 1: 修改 template 区域** — 用上述三栏结构替换现有 `<main>` 内部
- [ ] **Step 2: 添加 buttonGradientObj computed** — 在 script setup 中添加
- [ ] **Step 3: 验证构建** — `npx vite build`

---

## Task 3: 更新 CSS 样式

**Files:**
- Modify: `src/views/HomePage.vue`（`<style scoped>` 区域）

### 3.1 替换 .main-inner 主题 class 绑定和 .layout-col 样式

找到现有 `.main-inner` 样式，添加 `.theme-ssq` / `.theme-dlt` 子选择器的颜色继承：

```css
.main-inner {
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  max-width: 960px;
  margin: 0 auto;
  gap: 0;
  position: relative;
}

.layout-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 左栏 40% */
.layout-col--left {
  flex: 0.4;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

/* 中栏 35% */
.layout-col--center {
  flex: 0.35;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

/* 右栏 25% */
.layout-col--right {
  flex: 0.25;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 20px;
}
```

### 3.2 新增主题色 CSS 变量绑定

```css
/* 主题色通过父容器 class 控制 */
.theme-ssq :deep(.theme-btn) {
  /* 双色球主题色 */
  --accent-primary: #EF4444;
  --accent-secondary: #F59E0B;
  --accent-glow: rgba(220, 38, 38, 0.15);
}

.theme-dlt :deep(.theme-btn) {
  /* 大乐透主题色 */
  --accent-primary: #3B82F6;
  --accent-secondary: #6366F1;
  --accent-glow: rgba(59, 130, 246, 0.15);
}
```

### 3.3 更新 .bagua-card-wrapper 样式

```css
.bagua-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.generate-btn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
```

### 3.4 更新 .rule-entry-section 样式

```css
.rule-entry-section {
  width: 100%;
}

.inline-section__title {
  font-size: 13px;
  font-weight: 700;
  font-family: 'SourceHanSans-Bold';
  margin-bottom: 8px;
  text-align: center;
}
```

### 3.5 更新 .rule-icon 不跟随主题的颜色

运气的图标行固定颜色不变：
```css
.rule-icon {
  /* 保持现有样式，不添加主题色继承 */
  color: #92400E;
}
```

### 3.6 更新响应式媒体查询

**移动端 (< 768px)** — 合并为单栏：

```css
@media screen and (max-width: 767px) {
  .main-inner {
    flex-direction: column;
    padding: 16px 12px;
  }

  .layout-col--left,
  .layout-col--center,
  .layout-col--right {
    flex: none;
    width: 100%;
  }

  .layout-col--center {
    order: -1; /* 八卦图在移动端放到最上面 */
  }
}
```

**平板 (768-1023px)** — 调整为 35/35/30：

```css
@media screen and (min-width: 768px) and (max-width: 1023px) {
  .layout-col--left { flex: 0.35; }
  .layout-col--center { flex: 0.35; }
  .layout-col--right { flex: 0.3; }
}
```

- [ ] **Step 1: 重写 .layout-col 相关 CSS** — 按上述值修改
- [ ] **Step 2: 新增 .bagua-card-wrapper 和 .rule-entry-section**
- [ ] **Step 3: 添加移动端响应式（单栏合并）**
- [ ] **Step 4: 添加平板适配（35/35/30）**
- [ ] **Step 5: 验证构建** — `npx vite build`

---

## Task 4: 重写 PageHeader.vue 导航栏

**Files:**
- Modify: `src/components/PageHeader.vue`

### 4.1 移除背景卡片效果

替换 `.header-content` 样式：

```css
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 10px 0;
  /* 移除 background、backdrop-filter、border-radius、box-shadow */
}

/* 极浅分隔线 */
.header-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
}
```

### 4.2 Tab 胶囊式按钮增强

TabSwitcher 组件需要通过 CSS 注入来修改选中态样式。在 PageHeader 中添加：

```css
/* TabSwitcher 胶囊高亮样式 */
.tab-wrapper :deep(.tab-container .tab-item.active) {
  border-radius: 9999px;
  padding: 6px 20px;
  font-weight: 700;
  transition: all 0.3s ease;
  transform: scale(1.05);
}

/* 双色球主题 Tab */
.theme-ssq .tab-wrapper :deep(.tab-container .tab-item.active) {
  background: linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(245,158,11,1) 100%);
  color: white;
}

/* 大乐透主题 Tab */
.theme-dlt .tab-wrapper :deep(.tab-container .tab-item.active) {
  background: linear-gradient(90deg, rgba(59,130,246,1) 0%, rgba(99,102,241,1) 100%);
  color: white;
}
```

注意：需要在 PageHeader 的 `<div class="header-content">` 上绑定 `:class="'theme-' + modelValue"`。

### 4.3 图标按钮去背景

```css
.history-btn,
.trend-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  /* 移除 background、border、box-shadow */
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  z-index: 1;
  transition: transform 0.2s ease;
}

.history-btn:hover,
.trend-btn:hover {
  transform: scale(1.1);
}
```

### 4.4 Logo 区域保持不变（已在左上角）

### 4.5 移除外层 `.home-header` 和 `.header-inner` 的背景

```css
.home-header {
  width: 100%;
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.header-inner {
  padding: 0;
  /* 移除 max-width 限制 */
}
```

- [ ] **Step 1: 修改 .header-content 移除背景，添加 ::after 分隔线**
- [ ] **Step 2: 给 header-content 添加 :class 绑定主题**
- [ ] **Step 3: 修改 .history-btn/.trend-btn 去背景**
- [ ] **Step 4: 更新 .home-header 和 .header-inner 为透明**
- [ ] **Step 5: 验证构建 + 手动检查 Tab 样式**

---

## Task 5: 重写 Footer 样式

**Files:**
- Modify: `src/views/HomePage.vue`（底部 `<footer>` 的 CSS）

替换 `.home-footer` 和 `.footer-inner` 样式：

```css
/* Footer - 透明背景直接贴文字 */
.home-footer {
  width: 100%;
  background: transparent;
  padding: 16px 24px;
  position: relative;
  z-index: 10;
}

.footer-inner {
  padding: 0;
  max-width: none;
  margin: 0;
  width: 100%;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  box-sizing: border-box;
}

.footer-text {
  width: 100%;
  font-size: 12px;
  line-height: 1.4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(146, 64, 14, 0.5);
  font-family: 'SourceHanSans-Regular';
  margin: 0;
}

.footer-left,
.footer-right {
  white-space: nowrap;
}

.footer-center {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}
```

- [ ] **Step 1: 替换 .home-footer / .footer-inner / .footer-text 样式**
- [ ] **Step 2: 验证视觉效果**

---

## Task 6: 集成 RuleDrawer 到 HomePage

**Files:**
- Modify: `src/views/HomePage.vue`

### 6.1 导入 RuleDrawer

```typescript
import RuleDrawer from '@/components/RuleDrawer.vue'
```

### 6.2 添加抽屉状态

```typescript
const showRuleDrawer = ref(false)
const currentRuleTitle = ref('')

// 替换 handleOpenModal，改为打开抽屉
function handleOpenModal(type: string) {
  const icons = {
    shahao: { title: '杀号', component: KillRulesModal },
    xuanhao: { title: '选号', component: SelectModal },
    dingdan: { title: '定胆', component: BoldModal },
    guolv: { title: '过滤', component: FilterModal },
    juzhen: { title: '矩阵', component: MatrixModal },
  }
  
  const info = icons[type as keyof typeof icons]
  if (!info) return
  
  currentRuleTitle.value = info.title
  showRuleDrawer.value = true
  
  // 将具体内容由 slot 传入，这里简化为显示占位
  console.log('打开规则:', type)
}
```

### 6.3 在模板中添加 RuleDrawer

在弹窗组件列表前添加：

```vue
<RuleDrawer
  :visible="showRuleDrawer"
  :title="currentRuleTitle"
  @close="showRuleDrawer = false"
>
  <!-- 根据当前规则类型渲染对应子组件 -->
  <KillRulesModal
    v-if="showRuleDrawer && currentModalType === 'shahao'"
    :visible="true"
    :lottery-type="lotteryType"
    @close="handleDrawerClose"
    @apply="handleDrawerClose"
  />
  <!-- 其他规则类似... -->
</RuleDrawer>
```

由于原有各个 Modal 已有独立 visible 状态，更简洁的做法是：在 RuleDrawer 的 slot 中传入路由参数，让子组件判断是否渲染。

或者，更简单的方案：不改 draw 的 slot，而是让 handleOpenModal 设置一个 `activeRuleType`，然后在 RuleDrawer 内用 v-if 切换不同 modal：

```vue
<RuleDrawer :visible="showRuleDrawer" :title="currentRuleTitle" @close="handleDrawerClose">
  <KillRulesModal
    v-if="showRuleDrawer && activeRuleType === 'shahao'"
    :visible="true"
    :lottery-type="lotteryType"
    @close="handleDrawerClose"
  />
  <SelectModal
    v-else-if="showRuleDrawer && activeRuleType === 'xuanhao'"
    :visible="true"
    :lottery-type="lotteryType"
    @close="handleDrawerClose"
  />
  <!-- 其余类似 -->
</RuleDrawer>
```

```typescript
const activeRuleType = ref('')

function handleOpenModal(type: string) {
  const titles: Record<string, string> = {
    shahao: '杀号', xuanhao: '选号', dingdan: '定胆',
    guolv: '过滤', juzhen: '矩阵'
  }
  activeRuleType.value = type
  currentRuleTitle.value = titles[type] || '规则'
  showRuleDrawer.value = true
}

function handleDrawerClose() {
  showRuleDrawer.value = false
  activeRuleType.value = ''
}
```

- [ ] **Step 1: 导入 RuleDrawer**
- [ ] **Step 2: 添加 activeRuleType / handleOpenModal 重写**
- [ ] **Step 3: 在模板中添加 RuleDrawer 包裹原有 modals**
- [ ] **Step 4: 验证各规则打开/关闭交互**

---

## Task 7: 全局测试与微调

**Files:**
- Modify: 按需

### 7.1 功能回归测试

运行开发服务器：
```bash
npm run dev
```

逐项测试：
1. 双色球 / 大乐透切换 → 主题色是否正确联动
2. 红佛女选号 → 颜色固定红色，不受主题影响
3. 蓝若寺选号 → 颜色固定蓝色，不受主题影响
4. 运数计数器 → 主题色跟随
5. 运式按钮 → 选中态主题色跟随
6. 八卦图旋转 + 生财按钮 → 主题色跟随
7. 点击运势图标 → 抽屉滑入动画正常
8. 抽屉内各规则弹窗 → 正常工作
9. 导航栏 Tab 切换 → 胶囊高亮正确
10. 关闭抽屉 → 恢复正常
11. 移动端 viewport 测试 → 单栏布局正确

### 7.2 清理未使用代码

删除 HomePage.vue 中不再使用的旧 CSS：
- `.layout-col--right` （旧版浮动面板，如有残留）
- 旧的 footer 卡片样式

- [ ] **Step 1: 启动 npm run dev 逐项测试**
- [ ] **Step 2: 修复发现的 bug**
- [ ] **Step 3: 清理未使用的 CSS**
- [ ] **Step 4: 最终构建验证 `npx vite build`**

---

## 文件变更清单总览

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/RuleDrawer.vue` | **新建** | 通用侧滑抽屉组件 |
| `src/views/HomePage.vue` | **修改** | 三栏布局模板 + CSS + 抽屉集成 |
| `src/components/PageHeader.vue` | **修改** | 导航栏去背景 + Tab 胶囊样式 |
| 无 | **新增文件** | 无其他需要新建的文件 |
