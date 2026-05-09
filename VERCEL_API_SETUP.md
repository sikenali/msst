# Vercel API 部署说明

## 当前问题

API 返回 404 错误，原因可能是 Vercel 没有正确识别 `api/` 目录中的 Serverless 函数。

## 解决方案

### 方案 1: 使用 Vercel 默认约定（推荐）

Vercel 会自动将 `api/` 目录中的文件作为 Serverless 函数部署，无需额外配置。

**步骤**：
1. 确保 `api/lottery.ts` 文件存在且导出默认函数
2. 移除 `vercel.json` 中的复杂路由配置
3. 推送到 GitHub，Vercel 会自动部署

**访问方式**：
- `/api/lottery?type=ssq` - 双色球数据
- `/api/lottery?type=dlt` - 大乐透数据
- `/api?type=ssq` - 需要路由重写

### 方案 2: 使用 API 路由重写

在 Vercel 项目设置中配置 Rewrite 规则：

1. 访问 Vercel Dashboard → Project → Settings → Rewrites
2. 添加规则：
   - Source: `/api`
   - Destination: `/api/lottery`

### 方案 3: 修改前端 API 调用

将前端的 API 调用改为：
```typescript
const LOTTERY_API_URL = '/api/lottery'
```

然后查询参数：`?type=ssq`

## 当前配置

`vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## 测试部署

推送后等待 2-3 分钟，然后测试：

```bash
# 测试基本 API
curl https://lottery.10012049.xyz/api

# 测试双色球
curl https://lottery.10012049.xyz/api?type=ssq

# 测试大乐透
curl https://lottery.10012049.xyz/api?type=dlt
```

## 查看部署日志

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击项目 `msst-lottery`
3. 查看最新 Deployment
4. 点击 "View Logs" → "Functions" 查看函数日志

## 常见问题

### 404 Not Found
- 检查 `api/` 目录是否在根目录
- 确保函数导出默认 export
- 等待 Vercel 完成部署（2-5 分钟）

### 500 Internal Server Error
- 查看函数日志了解错误详情
- 检查 500.com 是否可访问
- 检查依赖是否已安装

### 部署卡住
- 清除构建缓存：`vercel --build-cache=false`
- 重新部署：`vercel --prod`
