# Vercel 部署指南

## 概述

本方案将前后端统一部署到 Vercel：
- **前端**：静态文件部署到 Vercel CDN
- **后端**：改造为 Serverless Functions（无服务器函数）

## 优势

✅ **免费部署** - Vercel 个人版完全免费
✅ **自动 HTTPS** - 自动配置 SSL 证书
✅ **全球 CDN** - 前端资源全球加速
✅ **自动部署** - 推送 GitHub 自动构建部署
✅ **无需服务器** - Serverless 架构，按使用付费（免费额度够用）

## 已完成改造

### 1. API 改造为 Serverless Function

- ✅ 创建 `api/lottery.ts` - Vercel Serverless 函数
- ✅ 支持查询参数：`/api?type=ssq` 或 `/api?type=dlt`
- ✅ 启用 CORS，支持跨域请求
- ✅ 24 小时缓存机制，减少爬取频率

### 2. 项目配置

- ✅ `vercel.json` - Vercel 配置文件
- ✅ `package.json` - 添加 Vercel 依赖和构建脚本
- ✅ `api/lottery.json` - Serverless 函数配置

### 3. 前端适配

- ✅ 修改 `useHistoryData.ts` - 适配单接口查询参数模式
- ✅ 支持环境变量配置 API 地址

## 部署步骤

### 方法一：使用 Vercel CLI（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

选择 GitHub 登录。

#### 3. 部署项目

```bash
vercel
```

首次部署会提示：
- **Set up and deploy?** → Yes
- **Which scope?** → 选择你的账号
- **Link to existing project?** → No
- **What's your project's name?** → msst-lottery（或自定义）
- **In which directory is your code located?** → ./
- **Want to override the settings?** → No

#### 4. 部署到生产环境

```bash
vercel --prod
```

### 方法二：Vercel 官网部署

#### 1. 访问 Vercel

打开 [vercel.com](https://vercel.com)

#### 2. 登录

使用 GitHub 账号登录。

#### 3. 导入项目

- 点击 "Add New..." → "Project"
- 选择 GitHub 仓库 `sikenali/msst`
- 点击 "Import"

#### 4. 配置构建

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 5. 部署

点击 "Deploy"

## 环境变量配置

### 本地开发

创建 `.env.local`：

```env
# 开发环境使用 Vite 代理，留空即可
VITE_API_BASE_URL=
```

### 生产环境

在 Vercel 控制台配置：

1. 进入项目 → Settings → Environment Variables
2. 添加变量：
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `/api`（Vercel 部署）或 `https://your-api.com/api`（外部 API）
   - **Environment**: Production

## API 端点

部署后可通过以下方式访问 API：

```
# 双色球历史数据
https://your-project.vercel.app/api?type=ssq

# 大乐透历史数据
https://your-project.vercel.app/api?type=dlt

# 刷新缓存
https://your-project.vercel.app/api?type=refresh
```

## 本地测试

### 测试 Serverless 函数

```bash
# 安装 Vercel CLI
npm install -g vercel

# 本地运行 Serverless 函数
vercel dev
```

访问 `http://localhost:3000/api?type=ssq` 测试。

### 测试前端

```bash
npm run dev
```

## 注意事项

### 1. Serverless 限制

- **最大执行时间**: 10 秒（免费版）
- **内存限制**: 1024 MB
- **响应大小**: 6 MB

### 2. 爬虫限制

- 500.com 可能会限制频繁爬取
- 已实现 24 小时缓存，减少请求频率
- 建议每天同步一次数据即可

### 3. 首次访问延迟

Serverless 函数在冷启动时可能有 1-2 秒延迟，后续请求会很快。

### 4. 构建失败处理

如果遇到构建失败：

```bash
# 清除缓存重新构建
vercel --build-cache=false
```

## 故障排查

### API 返回 500 错误

检查 Vercel 函数日志：

```bash
vercel logs
```

### 跨域错误

确认 `api/lottery.ts` 中的 CORS 配置正确。

### 数据为空

- 检查 500.com 网站是否可访问
- 查看缓存是否过期
- 尝试刷新：`/api?type=refresh`

## 升级建议

### 付费计划（可选）

如果流量增加，考虑升级到 Pro 计划：
- **价格**: $20/月
- **优势**: 更长的执行时间、更多内存、优先支持

### 独立 API 服务

如果 Serverless 不够用，可以：
1. 将 API 部署到 Render/Railway
2. 前端通过环境变量配置 API 地址
3. 使用 `VITE_API_BASE_URL=https://your-api.com/api`

## 总结

✅ 已完成 Vercel Serverless 改造
✅ 支持一键部署
✅ 免费额度内无需付费
✅ 自动 HTTPS 和 CDN 加速

现在可以执行 `vercel` 命令开始部署！
