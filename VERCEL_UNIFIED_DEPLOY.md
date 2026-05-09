# Vercel 统一部署配置说明

## 当前项目状态

✅ **GitHub 仓库**: https://github.com/sikenali/msst
✅ **分支**: main
✅ **最新提交**: 已同步
✅ **部署方式**: Vercel 统一部署（前端 + API）

## Vercel 自动部署机制

Vercel 会自动检测项目结构并统一部署：

### 自动检测

1. **前端静态文件** - 通过 `npm run build` 构建到 `dist` 目录
2. **Serverless 函数** - 自动检测 `pages/api/` 目录中的 `.ts` 文件
3. **统一部署** - 一次构建，同时部署前端和 API

### 无需复杂配置

`vercel.json` 只需指定基本构建命令：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

Vercel 会自动：
- ✅ 安装依赖
- ✅ 构建前端（Vite → dist/）
- ✅ 编译 Serverless 函数（pages/api/*.ts → /api/*）
- ✅ 部署到全球 CDN

## 项目结构

```
msst/
├── pages/
│   └── api/
│       └── lottery.ts    # Serverless 函数（自动部署到 /api/lottery）
├── src/                  # Vue 3 前端代码
├── dist/                 # 构建输出（Vite 生成）
├── vercel.json          # 基本配置
└── package.json         # 项目依赖
```

## 部署后的访问路径

部署完成后：

- **前端页面**: `https://your-project.vercel.app/`
- **API 端点**: `https://your-project.vercel.app/api/lottery`

## API 路由规则

Vercel 自动映射：

```
pages/api/lottery.ts  →  /api/lottery
pages/api/[name].ts   →  /api/[name]
```

## 查询参数

API 支持查询参数：

```
GET /api/lottery?type=ssq
GET /api/lottery?type=dlt
GET /api/lottery?type=refresh
```

## 部署流程

```bash
# 1. 本地推送代码
git push origin main

# ↓ Vercel 自动检测并执行：

# 2. 安装依赖
npm install

# 3. 构建前端
npm run build  # 输出到 dist/

# 4. 编译 Serverless 函数
pages/api/lottery.ts → /api/lottery

# 5. 部署到 Vercel CDN
# - 静态文件 → 全球 CDN 节点
# - Serverless 函数 → 边缘函数节点

# 6. 完成（约 2-5 分钟）
```

## 当前配置说明

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

**说明**：
- `buildCommand`: 构建命令（Vite 编译）
- `outputDirectory`: 构建输出目录（dist/）
- `installCommand`: 安装依赖命令

**无需配置**：
- ❌ 不需要指定 `pages/api` 构建（Vercel 自动检测）
- ❌ 不需要配置路由规则（Vercel 自动映射）
- ❌ 不需要指定 Serverless 运行时（Vercel 自动处理）

## 环境变量

在 Vercel Dashboard 配置：

```
VITE_API_BASE_URL = /api/lottery
```

## 测试部署

部署完成后等待 3-5 分钟：

### 1. 测试前端
```
https://lottery.10012049.xyz/
```

### 2. 测试 API
```
https://lottery.10012049.xyz/api/lottery?type=ssq
```

### 3. 预期响应

```json
{
  "success": true,
  "data": [
    {
      "issue": "2024001",
      "red": [1, 2, 3, 4, 5, 6],
      "blue": 7
    }
  ],
  "count": 30,
  "lastUpdated": "2024-01-01 22:00:00"
}
```

## 查看部署状态

### Vercel Dashboard

1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 找到 `msst-lottery` 项目
3. 查看最新 Deployment
4. 点击 "View Logs" 查看详细日志

### 部署阶段

- **Building** - 正在构建
- **Assigning Custom Domains** - 分配域名
- **Ready** - 部署完成 ✅

## 故障排查

### API 404

**可能原因**：
1. Vercel 还在部署中（等待 3-5 分钟）
2. `pages/api/lottery.ts` 不存在
3. TypeScript 编译错误

**解决方法**：
1. 查看 Vercel 部署日志
2. 检查 Functions 标签页
3. 本地运行 `npm run build` 测试

### 构建失败

**可能原因**：
1. TypeScript 错误
2. 依赖缺失
3. 构建配置错误

**解决方法**：
1. 本地运行 `npm run build`
2. 查看构建错误日志
3. 修复后重新推送

## 自动部署

每次推送到 main 分支都会自动触发：

```bash
git add -A
git commit -m "feat: 新功能"
git push origin main

# ⚡ Vercel 自动部署（无需手动操作）
```

## 总结

✅ **统一部署**: 前端和 API 一次推送，自动部署
✅ **自动检测**: Vercel 自动识别 pages/api 目录
✅ **简单配置**: 只需指定基本构建命令
✅ **全球 CDN**: 自动部署到 Vercel 全球边缘网络

现在等待 Vercel 完成部署即可！🚀
