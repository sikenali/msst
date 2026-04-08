# 妙手神透

> 彩票号码生成 H5 应用，融合传统八卦文化与现代随机算法

## 项目简介

妙手神透是一款基于 Vue 3 开发的彩票号码生成器 H5 应用，支持双色球和大乐透两种玩法。结合传统八卦时辰文化，提供独特的随机选号体验。

## 功能特性

- **双玩法支持**：双色球 / 大乐透自由切换
- **多种模式**：单式 / 复式 / 胆拖投注
- **注数配置**：支持 1-99 注灵活选择
- **八卦时辰算法**：融合传统文化的独特随机算法
- **结果展示**：精美的号码球可视化展示
- **保存图片**：一键生成并保存结果图片
- **响应式设计**：完美适配移动端设备

## 技术栈

| 类型 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript |
| 构建工具 | Vite |
| 路由管理 | Vue Router |
| 样式方案 | Tailwind CSS v4 |
| 图标库 | @remixicon/vue |
| 图片生成 | html2canvas |
| 测试框架 | Vitest + jsdom |

## 项目结构

```
msst/
├── src/
│   ├── assets/        # 静态资源
│   ├── components/    # 公共组件
│   ├── composables/   # 组合式函数
│   ├── router/        # 路由配置
│   ├── views/         # 页面视图
│   ├── App.vue        # 根组件
│   └── main.ts        # 入口文件
├── public/            # 公共资源
├── index.html         # HTML 模板
├── vite.config.ts     # Vite 配置
├── tailwind.config.ts # Tailwind 配置
└── package.json       # 项目配置
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd msst

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 类型检查 + 生产构建
npm run build

# 构建产物在 dist/ 目录
```

### 预览

```bash
# 预览生产构建
npm run preview
```

### 测试

```bash
# 运行测试
npm run test
```

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查并构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行单元测试 |

## 部署

### GitHub Pages

```bash
npm run build
# 将 dist/ 目录内容推送到 gh-pages 分支
```

### Vercel / Netlify

1. 连接 Git 仓库
2. 自动检测 Vite 项目
3. 构建命令: `npm run build`
4. 输出目录: `dist`

### 国内云平台

- **阿里云 OSS**: 上传 `dist/` 目录，开启静态网站托管
- **腾讯云 COS**: 同上
- **Cloudflare Pages**: 连接 Git 仓库自动构建

## 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名采用 PascalCase
- 使用 Tailwind CSS 原子类编写样式

## 许可证

MIT License
